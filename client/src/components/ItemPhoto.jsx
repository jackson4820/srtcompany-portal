import { useEffect, useRef, useState } from "react";
import { ImageOff, X, Download } from "lucide-react";
import { fetchItemPhoto } from "../api/adminApi";

// Dashboard me item ki photo: chhota thumbnail (screen par aane par hi load hota hai), click par badi photo
export default function ItemPhoto({ inquiryId, index, name }) {
  const boxRef = useRef(null);
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        fetchItemPhoto(inquiryId, index)
          .then((blob) => {
            if (cancelled) return;
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
          })
          .catch(() => {
            if (!cancelled) setFailed(true);
          });
      },
      { rootMargin: "200px" },
    );
    if (boxRef.current) io.observe(boxRef.current);
    return () => {
      cancelled = true;
      io.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [inquiryId, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={boxRef}
        type="button"
        onClick={() => url && setOpen(true)}
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-100 text-slate-400 hover:ring-2 hover:ring-blue-500"
        title={url ? "View larger photo" : "Loading photo..."}
      >
        {url ? (
          <img src={url} alt={name} className="h-full w-full object-cover" />
        ) : failed ? (
          <ImageOff size={16} />
        ) : (
          <span className="h-4 w-4 animate-pulse rounded-full bg-slate-300" />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={url}
              alt={name}
              className="max-h-[80vh] rounded-xl bg-white object-contain"
            />
            <div className="mt-3 flex items-center justify-between gap-3 text-white">
              <span className="truncate text-sm font-medium">{name}</span>
              <a
                href={url}
                download={`${name.replace(/[^\w\-]+/g, "_")}.jpg`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25"
              >
                <Download size={14} /> Download
              </a>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 text-slate-800 shadow"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
