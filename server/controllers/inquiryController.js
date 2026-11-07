const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../middleware/asyncHandler");
const sendInquiryMail = require("../utils/sendMail");

const UPLOADS = path.join(__dirname, "../uploads");
const MAX_ITEMS = 10;
const STATUSES = ["new", "contacted", "quoted", "closed"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// status + search filter (list aur CSV export dono yahi use karte hain)
const buildFilter = (q = {}) => {
  const filter = {};
  if (STATUSES.includes(q.status)) filter.status = q.status;
  const s = String(q.search || "")
    .trim()
    .slice(0, 100);
  if (s) {
    const re = new RegExp(escapeRegex(s), "i");
    filter.$or = [
      "name",
      "email",
      "phone",
      "company",
      "productName",
      "projectName",
      "deliveryLocation",
      "message",
      "items.name",
    ].map((f) => ({ [f]: re }));
  }
  return filter;
};

// CSV cell: Excel formula injection se bachav (public form ka text Excel me khulta hai)
const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s()-]+$/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};
const day = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
    : "";

const removeFile = (name) =>
  name && fs.unlink(path.join(UPLOADS, name), () => {});
const unlinkAll = (files) =>
  Object.values(files || {})
    .flat()
    .forEach((f) => fs.unlink(f.path, () => {}));

// POST /inquiries  (public, multipart)
// Fields: name, email, ... , items (JSON: [{name, quantity, photoIndex}]), itemPhotos (files), attachment (file)
exports.createInquiry = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const files = req.files || {};
  const photos = files.itemPhotos || [];
  const attachment = files.attachment?.[0];
  const fail = (code, message) => {
    unlinkAll(files);
    return res.status(code).json({ success: false, message });
  };

  if (!b.name?.trim() || !b.email?.trim())
    return fail(400, "Name and email are required");

  let rawItems = [];
  if (b.items) {
    try {
      rawItems = JSON.parse(b.items);
    } catch {
      return fail(400, "Invalid items format");
    }
    if (!Array.isArray(rawItems)) return fail(400, "Invalid items format");
  }
  if (rawItems.length > MAX_ITEMS)
    return fail(400, `You can add up to ${MAX_ITEMS} items per inquiry`);

  const items = [];
  const usedPhotos = new Set();
  for (const r of rawItems) {
    const name = String(r?.name || "").trim();
    if (!name) continue;
    const item = {
      name: name.slice(0, 200),
      quantity:
        String(r.quantity || "")
          .trim()
          .slice(0, 100) || undefined,
    };
    const idx = Number.isInteger(r.photoIndex) ? r.photoIndex : -1;
    if (photos[idx] && !usedPhotos.has(idx)) {
      usedPhotos.add(idx);
      item.photo = {
        path: photos[idx].filename,
        originalName: photos[idx].originalname,
      };
    }
    items.push(item);
  }
  photos.forEach((p, i) => {
    if (!usedPhotos.has(i)) fs.unlink(p.path, () => {});
  }); // kisi item se na jude photos hata do

  const productName =
    b.productName?.trim() ||
    items
      .map((i) => i.name)
      .join(", ")
      .slice(0, 200) ||
    undefined;

  let inq;
  try {
    inq = await Inquiry.create({
      name: b.name,
      email: b.email,
      phone: b.phone,
      company: b.company,
      productName,
      items,
      projectName: b.projectName,
      quantity: b.quantity,
      deliveryLocation: b.deliveryLocation,
      requiredBy: b.requiredBy || undefined,
      message: b.message,
      attachment: attachment
        ? { path: attachment.filename, originalName: attachment.originalname }
        : undefined,
    });
  } catch (e) {
    unlinkAll(files); // validation fail hone par orphan files na bachein
    throw e;
  }
  sendInquiryMail(inq); // fire-and-forget: mail fail hone se response nahi rukta
  res
    .status(201)
    .json({
      success: true,
      message: "Inquiry received. Our team will contact you shortly.",
      id: inq._id,
    });
});

// GET /inquiries?status=&search=&page=&limit=  (admin)
exports.listInquiries = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const [items, total, grouped] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Inquiry.countDocuments(filter),
    Inquiry.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  const counts = { new: 0, contacted: 0, quoted: 0, closed: 0 };
  grouped.forEach((g) => {
    if (g._id in counts) counts[g._id] = g.n;
  });
  counts.all = Object.values(counts).reduce((a, b) => a + b, 0);

  res.json({
    success: true,
    count: items.length,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts,
    items,
  });
});

// PATCH /inquiries/:id/notes  (admin)
exports.updateNotes = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  const notes = String(req.body?.notes ?? "")
    .trim()
    .slice(0, 2000);
  const inq = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { notes },
    { new: true, runValidators: true },
  );
  if (!inq)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  res.json({ success: true, item: inq });
});

// GET /inquiries/export?status=&search=  (admin) - current filter ke hisaab se CSV
exports.exportInquiries = asyncHandler(async (req, res) => {
  const rows = await Inquiry.find(buildFilter(req.query))
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();
  const head = [
    "Date",
    "Name",
    "Email",
    "Phone",
    "Company",
    "Items",
    "Project",
    "Quantity",
    "Delivery location",
    "Required by",
    "Message",
    "Status",
    "Notes",
    "Has attachment",
  ];
  const lines = rows.map((i) =>
    [
      day(i.createdAt),
      i.name,
      i.email,
      i.phone,
      i.company,
      i.items?.length
        ? i.items
            .map((it) => `${it.name}${it.quantity ? ` (${it.quantity})` : ""}`)
            .join("; ")
        : i.productName,
      i.projectName,
      i.quantity,
      i.deliveryLocation,
      day(i.requiredBy),
      i.message,
      i.status,
      i.notes,
      i.attachment?.path ? "Yes" : "No",
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = "\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\r\n"); // BOM: Excel me Hindi/UTF-8 sahi dikhe
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="inquiries-${day(new Date())}.csv"`,
  );
  res.send(csv);
});

// PATCH /inquiries/:id/status  (admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!inq)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  res.json({ success: true, item: inq });
});

// DELETE /inquiries/:id  (admin)
exports.deleteInquiry = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inq)
    return res
      .status(404)
      .json({ success: false, message: "Inquiry not found" });
  removeFile(inq.attachment?.path);
  (inq.items || []).forEach((it) => removeFile(it.photo?.path));
  res.json({ success: true });
});

// GET /inquiries/:id/attachment  (admin)
exports.downloadAttachment = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findById(req.params.id);
  if (!inq?.attachment?.path)
    return res
      .status(404)
      .json({ success: false, message: "Attachment not found" });
  res.download(
    path.join(UPLOADS, inq.attachment.path),
    inq.attachment.originalName,
  );
});

// GET /inquiries/:id/items/:idx/photo  (admin) - photo inline serve hoti hai (dashboard me dikhane ke liye)
exports.getItemPhoto = asyncHandler(async (req, res) => {
  const notFound = () =>
    res.status(404).json({ success: false, message: "Photo not found" });
  if (!mongoose.isValidObjectId(req.params.id)) return notFound();
  const inq = await Inquiry.findById(req.params.id).select("items").lean();
  const it = inq?.items?.[Number(req.params.idx)];
  if (!it?.photo?.path) return notFound();
  res.sendFile(path.join(UPLOADS, it.photo.path));
});
