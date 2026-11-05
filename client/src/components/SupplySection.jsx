import { Link } from "react-router-dom";
import { ArrowRight, Zap, Plug, Gauge, HardHat, ShieldCheck, Link2, Wrench } from "lucide-react";
import { categories } from "../data/catalog";
import Reveal from "./Reveal";

const icons = {
  "electrical-equipment": Zap,
  "wires-cables": Plug,
  "measuring-testing": Gauge,
  "safety-products": HardHat,
  "earthing-materials": ShieldCheck,
  lugs: Link2,
  hardware: Wrench,
};

export default function SupplySection() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Products</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">What We Supply</h2>
            </div>
            <Link to="/products" className="group inline-flex items-center gap-2 font-semibold text-blue-700">
              View all products <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const Icon = icons[c.id] || Wrench;
            const preview = c.items.slice(0, 3).map((x) => x.name).join(", ");
            const more = c.items.length - 3;
            return (
              <Reveal key={c.id} delay={(i % 3) * 100}>
                <Link to={`/products?category=${c.id}`}
                  className="group relative block h-full overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-600 to-accent-500 transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition duration-300 group-hover:rotate-6 group-hover:bg-blue-700 group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{c.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{c.tagline}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {preview}{more > 0 && ` +${more} more`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                    Explore <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
