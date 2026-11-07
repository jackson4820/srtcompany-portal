import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { productPath } from "../data/catalog";

export function ProductImage({ src, alt, className = "", contain = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed)
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-slate-100 text-slate-400 ${className}`}
      >
        <ImageOff size={28} />
        <span className="text-xs">Image coming soon</span>
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${contain ? "object-contain" : "object-cover"}`}
    />
  );
}

// Card ab product ke apne page par le jaata hai (/products/<category>/<slug>)
export default function ProductCard({ item, categoryId, showCategory }) {
  return (
    <Link
      to={productPath(categoryId, item)}
      className="group overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="overflow-hidden">
        <ProductImage
          src={item.image}
          alt={item.name}
          className="h-40 w-full transition group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
        {showCategory && (
          <p className="mt-0.5 text-xs text-slate-500">{item.category}</p>
        )}
      </div>
    </Link>
  );
}
