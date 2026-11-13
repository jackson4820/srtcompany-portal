const express = require("express");
const multer = require("multer");
const path = require("path");
const rateLimit = require("express-rate-limit");
const c = require("../controllers/inquiryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

const DOC_EXT = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".dwg",
]; // BOQ / drawing
const PHOTO_EXT = [".png", ".jpg", ".jpeg", ".webp"]; // item ki photo sirf image

// MulterError naam dene se errorMiddleware ise 400 + sahi message ke saath bhejta hai
const badFile = (msg) =>
  Object.assign(new Error(msg), {
    name: "MulterError",
    code: "LIMIT_UNEXPECTED_FILE",
  });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 11 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === "itemPhotos") {
      return PHOTO_EXT.includes(ext) && file.mimetype.startsWith("image/")
        ? cb(null, true)
        : cb(badFile("Item photo must be a JPG, PNG or WEBP image"));
    }
    if (file.fieldname === "attachment") {
      return DOC_EXT.includes(ext)
        ? cb(null, true)
        : cb(badFile("Only PDF, image, Excel, Word or DWG files are allowed"));
    }
    return cb(badFile("Unexpected file field"));
  },
});

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many inquiries sent. Please try again later.",
  },
});

router.post(
  "/",
  limiter,
  upload.fields([
    { name: "attachment", maxCount: 1 },
    { name: "itemPhotos", maxCount: 10 },
  ]),
  c.createInquiry,
);

router.use(protect, authorize("admin"));
router.get("/", c.listInquiries);
router.get("/export", c.exportInquiries);
router.patch("/:id/status", c.updateStatus);
router.patch("/:id/notes", c.updateNotes);
router.get("/:id/attachment", c.downloadAttachment);
router.get("/:id/items/:idx/photo", c.getItemPhoto);
router.delete("/:id", c.deleteInquiry);

module.exports = router;
