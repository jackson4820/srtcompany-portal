import { useMemo, useState } from "react";
import { categories } from "../data/catalog";
import ProductCard from "./ProductCard";
import SearchBar from "./SearchBar";

export default function CategoryExplorer({ initialCategory }) {
  const [active, setActive] = useState(initialCategory || categories[0].id);
  const [query, setQuery] = useState("");

  const category = categories.find((c) => c.id === active) || categories[0];

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q)
      return categories.flatMap((c) =>
        c.items.filter((i) => i.name.toLowerCase().includes(q)).map((i) => ({ ...i, category: c.name, categoryId: c.id }))
      );
    return category.items.map((i) => ({ ...i, category: category.name, categoryId: category.id }));
  }, [query, category]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Our Products</h2>
        <SearchBar value={query} onChange={setQuery} placeholder="Search all products..." />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button key={c.id} onClick={() => { setActive(c.id); setQuery(""); }}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === c.id && !query ? "border-blue-700 bg-blue-700 text-white" : "bg-white text-slate-700 hover:border-blue-400"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {!query && (
        <div className="mb-6">
          <p className="text-slate-600">{category.tagline}</p>
          {category.brands && <p className="mt-2 text-sm text-slate-500"><span className="font-semibold">Makes:</span> {category.brands.join(", ")}</p>}
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No products found. Send us an RFQ and our team will source it for you.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => <ProductCard key={item.id} item={item} categoryId={item.categoryId} showCategory={!!query} />)}
        </div>
      )}
    </section>
  );
}
