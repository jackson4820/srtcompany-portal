import { useEffect, useRef, useState } from "react";
import {
  X,
  CheckCircle2,
  ImagePlus,
  Plus,
  Trash2,
  Paperclip,
} from "lucide-react";
import { createInquiry } from "../api/inquiryApi";
import { errMsg } from "../api/axiosClient";

const MAX_ITEMS = 10;
const MAX_FILE = 5 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".heic",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".csv",
  ".txt",
  ".ppt",
  ".pptx",
  ".dwg",
];

const empty = {
  name: "",
  email: "",
  phone: "",
  company: "",
  projectName: "",
  deliveryLocation: "",
  requiredBy: "",
  message: "",
  cc: "",
  bcc: "",
};

let uid = 0;

const newItem = (name = "") => ({
  id: ++uid,
  name,
  quantity: "",
  file: null,
  preview: "",
});

const revoke = (list) =>
  list.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));

const getExtension = (filename) => {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
};

// Mobile ki badi photos ko 1600px JPEG me chhota karte hain.
async function shrinkImage(file) {
  try {
    if (file.size < 1.2 * 1024 * 1024 && file.type !== "image/png") {
      return file;
    }

    const bmp = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", 0.85),
    );

    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

export default function InquiryModal({ open, onClose, productName = "" }) {
  const [form, setForm] = useState(empty);
  const [items, setItems] = useState([newItem()]);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (open) {
      revoke(itemsRef.current);
      setForm(empty);
      setFiles([]);
      setError("");
      setDone(false);
      setItems([newItem(productName)]);
    }
  }, [open, productName]);

  useEffect(() => () => revoke(itemsRef.current), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const input =
    "w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-600";

  // Multiple RFQ files select karna
  const onFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";

    if (!selected.length) return;

    const remaining = MAX_ATTACHMENTS - files.length;

    if (selected.length > remaining) {
      setError(`You can upload a maximum of ${MAX_ATTACHMENTS} RFQ files.`);
      return;
    }

    for (const f of selected) {
      const ext = getExtension(f.name);

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(
          `${f.name}: Unsupported file type. Please select PDF, image, Word, Excel, PowerPoint, CSV, TXT or DWG files.`,
        );
        return;
      }

      if (f.size > MAX_FILE) {
        setError(`${f.name}: File must not be larger than 5MB.`);
        return;
      }
    }

    setError("");
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError("");
  };

  const updateItem = (id, patch) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const addItem = () =>
    setItems((prev) =>
      prev.length >= MAX_ITEMS ? prev : [...prev, newItem()],
    );

  const removeItem = (id) =>
    setItems((prev) => {
      revoke(prev.filter((i) => i.id === id));

      const rest = prev.filter((i) => i.id !== id);
      return rest.length ? rest : [newItem()];
    });

  const pickPhoto = async (id, e) => {
    const picked = e.target.files?.[0];
    e.target.value = "";

    if (!picked) return;

    const allowedPhotoExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const photoExtension = getExtension(picked.name);

    if (
      !picked.type.startsWith("image/") ||
      !allowedPhotoExtensions.includes(photoExtension)
    ) {
      setError("Item photo must be JPG, JPEG, PNG or WEBP format.");
      return;
    }

    const f = await shrinkImage(picked);

    if (f.size > MAX_FILE) {
      setError("Photo must not be larger than 5MB.");
      return;
    }

    setError("");

    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;

        if (i.preview) URL.revokeObjectURL(i.preview);

        return {
          ...i,
          file: f,
          preview: URL.createObjectURL(f),
        };
      }),
    );
  };

  const clearPhoto = (id) =>
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;

        if (i.preview) URL.revokeObjectURL(i.preview);

        return { ...i, file: null, preview: "" };
      }),
    );

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const rows = items.filter(
      (i) => i.name.trim() || i.quantity.trim() || i.file,
    );

    if (rows.some((r) => !r.name.trim())) {
      setError(
        "Please enter a name for every item that has a quantity or photo.",
      );
      return;
    }

    if (!rows.length && !files.length && !form.message.trim()) {
      setError(
        "Please add at least one item, attach an RFQ file, or write a message.",
      );
      return;
    }

    // Check combined size of all RFQ files and item photos
    const totalUploadSize =
      files.reduce((total, file) => total + file.size, 0) +
      items.reduce((total, item) => total + (item.file?.size || 0), 0);

    if (totalUploadSize > 18 * 1024 * 1024) {
      setError(
        "Total size of all RFQ files and item photos must not exceed 18MB.",
      );
      return;
    }

    setBusy(true);

    try {
      await createInquiry(form, files, rows);
      setDone(true);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative my-8 w-full max-w-2xl rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-slate-900"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto text-green-600" size={48} />

            <h3 className="mt-3 text-xl font-bold">Inquiry sent</h3>

            <p className="mt-1 text-slate-600">
              Thank you. Our sourcing team will contact you shortly.
            </p>

            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-900">
              Request for Quotation
            </h3>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Your name *"
                value={form.name}
                onChange={set("name")}
                className={input}
              />

              <input
                required
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={set("email")}
                className={input}
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={set("phone")}
                className={input}
              />

              <input
                placeholder="Company"
                value={form.company}
                onChange={set("company")}
                className={input}
              />

              {/* CC and BCC */}
              <div className="sm:col-span-2 rounded-xl border bg-slate-50 p-3">
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Additional Email Recipients (Optional)
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-slate-600">
                    CC Email Addresses
                    <input
                      type="text"
                      placeholder="example@email.com, another@email.com"
                      value={form.cc}
                      onChange={set("cc")}
                      className={`${input} mt-1`}
                    />
                  </label>

                  <label className="text-xs text-slate-600">
                    BCC Email Addresses
                    <input
                      type="text"
                      placeholder="example@email.com"
                      value={form.bcc}
                      onChange={set("bcc")}
                      className={`${input} mt-1`}
                    />
                  </label>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  You can enter multiple email addresses separated by commas.
                </p>
              </div>

              {/* Items */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 sm:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    Items / Materials
                  </p>

                  <span className="text-xs text-slate-500">
                    {items.length}/{MAX_ITEMS} · photo optional
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="flex items-start gap-2 rounded-lg border bg-white p-2"
                    >
                      <div className="relative h-16 w-16 shrink-0">
                        {it.preview ? (
                          <>
                            <img
                              src={it.preview}
                              alt=""
                              className="h-16 w-16 rounded-lg border object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => clearPhoto(it.id)}
                              className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-800 p-0.5 text-white"
                              aria-label="Remove photo"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-blue-500 hover:text-blue-600">
                            <ImagePlus size={20} />

                            <span className="text-[10px] font-medium">
                              Photo
                            </span>

                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.webp"
                              onChange={(e) => pickPhoto(it.id, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_8rem]">
                        <input
                          placeholder={`Item ${idx + 1} name (e.g. 4 core 16 sqmm cable)`}
                          value={it.name}
                          maxLength={200}
                          onChange={(e) =>
                            updateItem(it.id, {
                              name: e.target.value,
                            })
                          }
                          className={input}
                        />

                        <input
                          placeholder="Quantity"
                          value={it.quantity}
                          maxLength={100}
                          onChange={(e) =>
                            updateItem(it.id, {
                              quantity: e.target.value,
                            })
                          }
                          className={input}
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          className="mt-2 text-slate-400 hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={items.length >= MAX_ITEMS}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-40"
                >
                  <Plus size={16} />
                  Add another item
                </button>
              </div>

              <input
                placeholder="Project name"
                value={form.projectName}
                onChange={set("projectName")}
                className={input}
              />

              <input
                placeholder="Delivery location"
                value={form.deliveryLocation}
                onChange={set("deliveryLocation")}
                className={input}
              />

              <label className="text-xs text-slate-500">
                Required by
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.requiredBy}
                  onChange={set("requiredBy")}
                  className={`${input} mt-1`}
                />
              </label>

              <textarea
                rows={3}
                placeholder="Specifications / message"
                value={form.message}
                onChange={set("message")}
                className={`${input} sm:col-span-2`}
              />

              {/* Multiple RFQ attachments */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 sm:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-slate-800">
                    <Paperclip size={15} className="mr-1 inline" />
                    Attach RFQ / BOQ Files
                  </label>

                  <span className="text-xs text-slate-500">
                    {files.length}/{MAX_ATTACHMENTS}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  PDF, images, Word, Excel, PowerPoint, CSV, TXT and DWG.
                  Maximum 5MB per file.
                </p>

                <input
                  type="file"
                  multiple
                  disabled={files.length >= MAX_ATTACHMENTS}
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  onChange={onFiles}
                  className="mt-3 block w-full text-sm disabled:opacity-50"
                />

                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((f, index) => (
                      <div
                        key={`${f.name}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {f.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {(f.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove ${f.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={busy}
                className="rounded-lg bg-blue-700 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:col-span-2"
              >
                {busy ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
