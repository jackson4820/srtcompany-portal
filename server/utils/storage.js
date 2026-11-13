const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");

const UPLOADS = path.join(__dirname, "../uploads");
const useR2 = process.env.STORAGE_DRIVER === "r2";

const newKey = (file) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  return (
    crypto.randomBytes(16).toString("hex") +
    (/^\.[a-z0-9]{1,5}$/.test(ext) ? ext : "")
  );
};

// ---------- Local disk (dev) ----------
const localPath = (key) => path.join(UPLOADS, path.basename(String(key))); // path traversal se bachav

const local = {
  async save(file) {
    await fsp.mkdir(UPLOADS, { recursive: true }); // .gitignore me uploads/ hai, fresh clone par folder nahi hota
    const key = newKey(file);
    await fsp.writeFile(localPath(key), file.buffer);
    return key;
  },
  async remove(key) {
    if (key) await fsp.unlink(localPath(key)).catch(() => {});
  },
  async open(key) {
    const p = localPath(key);
    try {
      await fsp.access(p);
    } catch {
      return null;
    }
    return { stream: fs.createReadStream(p) };
  },
};

// ---------- Cloudflare R2 (production) ----------
let r2;
if (useR2) {
  const need = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
  ];
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length)
    throw new Error(
      `STORAGE_DRIVER=r2 hai lekin .env me ye set nahi: ${missing.join(", ")}`,
    );

  const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
  } = require("@aws-sdk/client-s3");
  const Bucket = process.env.R2_BUCKET;
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  r2 = {
    async save(file) {
      const key = newKey(file);
      await s3.send(
        new PutObjectCommand({
          Bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return key;
    },
    async remove(key) {
      if (!key) return;
      await s3
        .send(new DeleteObjectCommand({ Bucket, Key: String(key) }))
        .catch((e) => console.error("R2 delete failed:", e.message));
    },
    async open(key) {
      try {
        const r = await s3.send(
          new GetObjectCommand({ Bucket, Key: String(key) }),
        );
        return { stream: r.Body };
      } catch (e) {
        if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404)
          return null;
        throw e;
      }
    },
  };
}

const driver = useR2 ? r2 : local;

module.exports = {
  save: (file) => driver.save(file),
  remove: (key) => driver.remove(key),
  open: (key) => driver.open(key),
  async getBuffer(key) {
    const f = await driver.open(key);
    if (!f) throw new Error(`File not found: ${key}`);
    const chunks = [];
    for await (const c of f.stream) chunks.push(c);
    return Buffer.concat(chunks);
  },
};
