const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const asyncHandler = require('../middleware/asyncHandler');
const sendInquiryMail = require('../utils/sendMail');

const UPLOADS = path.join(__dirname, '../uploads');
const MAX_ITEMS = 10;

const removeFile = (name) => name && fs.unlink(path.join(UPLOADS, name), () => {});
const unlinkAll = (files) => Object.values(files || {}).flat().forEach((f) => fs.unlink(f.path, () => {}));

// POST /inquiries  (public, multipart)
// Fields: name, email, ... , items (JSON: [{name, quantity, photoIndex}]), itemPhotos (files), attachment (file)
exports.createInquiry = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const files = req.files || {};
  const photos = files.itemPhotos || [];
  const attachment = files.attachment?.[0];
  const fail = (code, message) => { unlinkAll(files); return res.status(code).json({ success: false, message }); };

  if (!b.name?.trim() || !b.email?.trim()) return fail(400, 'Name and email are required');

  let rawItems = [];
  if (b.items) {
    try { rawItems = JSON.parse(b.items); } catch { return fail(400, 'Invalid items format'); }
    if (!Array.isArray(rawItems)) return fail(400, 'Invalid items format');
  }
  if (rawItems.length > MAX_ITEMS) return fail(400, `You can add up to ${MAX_ITEMS} items per inquiry`);

  const items = [];
  const usedPhotos = new Set();
  for (const r of rawItems) {
    const name = String(r?.name || '').trim();
    if (!name) continue;
    const item = { name: name.slice(0, 200), quantity: String(r.quantity || '').trim().slice(0, 100) || undefined };
    const idx = Number.isInteger(r.photoIndex) ? r.photoIndex : -1;
    if (photos[idx] && !usedPhotos.has(idx)) {
      usedPhotos.add(idx);
      item.photo = { path: photos[idx].filename, originalName: photos[idx].originalname };
    }
    items.push(item);
  }
  photos.forEach((p, i) => { if (!usedPhotos.has(i)) fs.unlink(p.path, () => {}); }); // kisi item se na jude photos hata do

  const productName = b.productName?.trim() || items.map((i) => i.name).join(', ').slice(0, 200) || undefined;

  let inq;
  try {
    inq = await Inquiry.create({
      name: b.name, email: b.email, phone: b.phone, company: b.company,
      productName, items, projectName: b.projectName, quantity: b.quantity,
      deliveryLocation: b.deliveryLocation, requiredBy: b.requiredBy || undefined, message: b.message,
      attachment: attachment ? { path: attachment.filename, originalName: attachment.originalname } : undefined,
    });
  } catch (e) {
    unlinkAll(files); // validation fail hone par orphan files na bachein
    throw e;
  }
  sendInquiryMail(inq); // fire-and-forget: mail fail hone se response nahi rukta
  res.status(201).json({ success: true, message: 'Inquiry received. Our team will contact you shortly.', id: inq._id });
});

// GET /inquiries  (admin)
exports.listInquiries = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const items = await Inquiry.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, count: items.length, items });
});

// PATCH /inquiries/:id/status  (admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found' });
  res.json({ success: true, item: inq });
});

// DELETE /inquiries/:id  (admin)
exports.deleteInquiry = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found' });
  removeFile(inq.attachment?.path);
  (inq.items || []).forEach((it) => removeFile(it.photo?.path));
  res.json({ success: true });
});

// GET /inquiries/:id/attachment  (admin)
exports.downloadAttachment = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findById(req.params.id);
  if (!inq?.attachment?.path) return res.status(404).json({ success: false, message: 'Attachment not found' });
  res.download(path.join(UPLOADS, inq.attachment.path), inq.attachment.originalName);
});

// GET /inquiries/:id/items/:idx/photo  (admin) - photo inline serve hoti hai (dashboard me dikhane ke liye)
exports.getItemPhoto = asyncHandler(async (req, res) => {
  const notFound = () => res.status(404).json({ success: false, message: 'Photo not found' });
  if (!mongoose.isValidObjectId(req.params.id)) return notFound();
  const inq = await Inquiry.findById(req.params.id).select('items').lean();
  const it = inq?.items?.[Number(req.params.idx)];
  if (!it?.photo?.path) return notFound();
  res.sendFile(path.join(UPLOADS, it.photo.path));
});
