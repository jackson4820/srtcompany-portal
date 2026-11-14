const mongoose = require("mongoose");

// Ek inquiry me kai items ho sakte hain; har item ka naam, quantity aur optional photo
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: 200,
    },
    quantity: { type: String, trim: true, maxlength: 100 },
    photo: { path: String, originalName: String },
  },
  { _id: false },
);

// New RFQ attachments
const attachmentSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    originalName: { type: String, trim: true, maxlength: 255 },
  },
  { _id: false },
);

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: { type: String, trim: true, maxlength: 20 },
    company: { type: String, trim: true, maxlength: 150 },

    cc: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    bcc: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },

    productName: { type: String, trim: true, maxlength: 200 },
    items: { type: [itemSchema], default: [] },
    projectName: { type: String, trim: true, maxlength: 200 },
    quantity: { type: String, trim: true, maxlength: 100 },
    deliveryLocation: { type: String, trim: true, maxlength: 200 },
    requiredBy: { type: Date },
    message: { type: String, trim: true, maxlength: 3000 },

    // Legacy field: purane inquiries ke liye
    attachment: { path: String, originalName: String },

    // New field: multiple RFQ attachments
    attachments: { type: [attachmentSchema], default: [] },

    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "closed"],
      default: "new",
    },
    notes: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
