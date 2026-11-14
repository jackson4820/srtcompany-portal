const path = require("path");
const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");
const asyncHandler = require("../middleware/asyncHandler");
const sendInquiryMail = require("../utils/sendMail");
const storage = require("../utils/storage");

const MAX_ITEMS = 10;
const MAX_TOTAL_FILE_SIZE = 18 * 1024 * 1024;
const MAX_EMAILS_PER_FIELD = 10;
const STATUSES = ["new", "contacted", "quoted", "closed"];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s()-]+$/.test(s)) {
    s = "'" + s;
  }
  return `"${s.replace(/"/g, '""')}"`;
};

const day = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      })
    : "";

// CC/BCC email addresses ko validate aur clean karta hai
const parseEmailList = (value) => {
  if (!value) return [];

  const entries = Array.isArray(value) ? value : String(value).split(/[;,]/);

  const emails = [
    ...new Set(
      entries
        .map((email) => String(email).trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  if (emails.length > MAX_EMAILS_PER_FIELD) {
    throw new Error(
      `Maximum ${MAX_EMAILS_PER_FIELD} email addresses are allowed in CC/BCC`,
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emails.some((email) => !emailRegex.test(email))) {
    throw new Error("Please enter valid CC/BCC email addresses");
  }

  return emails;
};

// Stored file (Local Disk ya R2) ko admin tak stream karta hai
const sendStored = async (res, key, { filename, inline = false } = {}) => {
  const file = key ? await storage.open(key) : null;

  if (!file) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.type(path.extname(String(filename || key)) || "application/octet-stream");

  if (!inline) {
    res.attachment(filename || String(key));
  }

  res.setHeader("Cache-Control", "private, no-store");

  file.stream.on("error", () => res.destroy());
  file.stream.pipe(res);
};

// POST /inquiries (public, multipart)
exports.createInquiry = asyncHandler(async (req, res) => {
  const b = req.body || {};
  const files = req.files || {};

  const photos = files.itemPhotos || [];

  const attachments = [
    ...(files.attachments || []),
    ...(files.attachment || []),
  ];

  const fail = (code, message) =>
    res.status(code).json({
      success: false,
      message,
    });

  // Total uploaded file size check
  const totalFileSize = [...photos, ...attachments].reduce(
    (total, file) => total + file.size,
    0,
  );

  if (totalFileSize > MAX_TOTAL_FILE_SIZE) {
    return fail(400, "Total uploaded files size cannot exceed 18 MB");
  }

  if (!b.name?.trim() || !b.email?.trim()) {
    return fail(400, "Name and email are required");
  }

  // CC/BCC validation
  let cc;
  let bcc;

  try {
    cc = parseEmailList(b.cc);
    bcc = parseEmailList(b.bcc);
  } catch (error) {
    return fail(400, error.message);
  }

  // Items parsing
  let rawItems = [];

  if (b.items) {
    try {
      rawItems = JSON.parse(b.items);
    } catch {
      return fail(400, "Invalid items format");
    }

    if (!Array.isArray(rawItems)) {
      return fail(400, "Invalid items format");
    }
  }

  if (rawItems.length > MAX_ITEMS) {
    return fail(400, `You can add up to ${MAX_ITEMS} items per inquiry`);
  }

  const saved = [];

  // Storage abstraction: Local Disk ya R2
  const put = async (file) => {
    const key = await storage.save(file);
    saved.push(key);
    return key;
  };

  try {
    // Save item photos
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
          path: await put(photos[idx]),
          originalName: photos[idx].originalname,
        };
      }

      items.push(item);
    }

    // Product name summary
    const productName =
      b.productName?.trim() ||
      items
        .map((item) => item.name)
        .join(", ")
        .slice(0, 200) ||
      undefined;

    // Save all RFQ attachments
    const attachmentDocs = [];

    for (const file of attachments) {
      attachmentDocs.push({
        path: await put(file),
        originalName: file.originalname,
      });
    }

    // Old single attachment compatibility
    const legacyFile = files.attachment?.[0];

    const attachmentDoc = legacyFile
      ? attachmentDocs[attachments.indexOf(legacyFile)]
      : undefined;

    // Save inquiry in MongoDB
    const inq = await Inquiry.create({
      name: b.name,
      email: b.email,
      phone: b.phone,
      company: b.company,
      cc,
      bcc,
      productName,
      items,
      projectName: b.projectName,
      quantity: b.quantity,
      deliveryLocation: b.deliveryLocation,
      requiredBy: b.requiredBy || undefined,
      message: b.message,
      attachment: attachmentDoc,
      attachments: attachmentDocs,
    });

    // Email sending should not block inquiry response
    sendInquiryMail(inq).catch((error) => {
      console.error("Inquiry email failed:", error.message);
    });

    return res.status(201).json({
      success: true,
      message: "Inquiry received. Our team will contact you shortly.",
      id: inq._id,
    });
  } catch (error) {
    // DB/storage failure par saved files cleanup
    await Promise.all(saved.map((key) => storage.remove(key)));
    throw error;
  }
});

// GET /inquiries?status=&search=&page=&limit= (admin)
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

    Inquiry.aggregate([
      {
        $group: {
          _id: "$status",
          n: { $sum: 1 },
        },
      },
    ]),
  ]);

  const counts = {
    new: 0,
    contacted: 0,
    quoted: 0,
    closed: 0,
  };

  grouped.forEach((g) => {
    if (g._id in counts) {
      counts[g._id] = g.n;
    }
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

// GET /inquiries/export (admin)
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
      i.attachment?.path || i.attachments?.length ? "Yes" : "No",
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = "\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="inquiries-${day(new Date())}.csv"`,
  );

  res.send(csv);
});

// PATCH /inquiries/:id/status (admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Inquiry not found",
    });
  }

  if (!STATUSES.includes(req.body?.status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${STATUSES.join(", ")}`,
    });
  }

  const inq = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );

  if (!inq) {
    return res.status(404).json({
      success: false,
      message: "Inquiry not found",
    });
  }

  res.json({
    success: true,
    item: inq,
  });
});

// PATCH /inquiries/:id/notes (admin)
exports.updateNotes = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Inquiry not found",
    });
  }

  const notes = String(req.body?.notes ?? "")
    .trim()
    .slice(0, 2000);

  const inq = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { notes },
    { new: true, runValidators: true },
  );

  if (!inq) {
    return res.status(404).json({
      success: false,
      message: "Inquiry not found",
    });
  }

  res.json({
    success: true,
    item: inq,
  });
});

// DELETE /inquiries/:id (admin)
exports.deleteInquiry = asyncHandler(async (req, res) => {
  const inq = await Inquiry.findByIdAndDelete(req.params.id);

  if (!inq) {
    return res.status(404).json({
      success: false,
      message: "Inquiry not found",
    });
  }

  const keys = [
    inq.attachment?.path,
    ...(inq.attachments || []).map((file) => file.path),
    ...(inq.items || []).map((item) => item.photo?.path),
  ].filter(Boolean);

  await Promise.all(keys.map((key) => storage.remove(key)));

  res.json({
    success: true,
  });
});

// GET /inquiries/:id/attachment (admin)
// Legacy single attachment download
exports.downloadAttachment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({
      success: false,
      message: "Attachment not found",
    });
  }

  const inq = await Inquiry.findById(req.params.id).select("attachment").lean();

  if (!inq?.attachment?.path) {
    return res.status(404).json({
      success: false,
      message: "Attachment not found",
    });
  }

  await sendStored(res, inq.attachment.path, {
    filename: inq.attachment.originalName,
  });
});

// GET /inquiries/:id/attachments/:idx (admin)
// Multiple attachment download
exports.downloadInquiryAttachment = asyncHandler(async (req, res) => {
  const notFound = () =>
    res.status(404).json({
      success: false,
      message: "Attachment not found",
    });

  if (!mongoose.isValidObjectId(req.params.id)) {
    return notFound();
  }

  const idx = Number(req.params.idx);

  if (!Number.isInteger(idx) || idx < 0) {
    return notFound();
  }

  const inq = await Inquiry.findById(req.params.id)
    .select("attachments")
    .lean();

  const attachment = inq?.attachments?.[idx];

  if (!attachment?.path) {
    return notFound();
  }

  await sendStored(res, attachment.path, {
    filename: attachment.originalName,
  });
});

// GET /inquiries/:id/items/:idx/photo (admin)
exports.getItemPhoto = asyncHandler(async (req, res) => {
  const notFound = () =>
    res.status(404).json({
      success: false,
      message: "Photo not found",
    });

  if (!mongoose.isValidObjectId(req.params.id)) {
    return notFound();
  }

  const idx = Number(req.params.idx);

  if (!Number.isInteger(idx) || idx < 0) {
    return notFound();
  }

  const inq = await Inquiry.findById(req.params.id).select("items").lean();

  const item = inq?.items?.[idx];

  if (!item?.photo?.path) {
    return notFound();
  }

  await sendStored(res, item.photo.path, {
    inline: true,
    filename: item.photo.originalName,
  });
});
