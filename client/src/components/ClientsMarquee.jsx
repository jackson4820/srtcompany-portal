import { clientLogos } from "../data/content";
import Reveal from "./Reveal";

export default function ClientsMarquee() {
  const row = [...clientLogos, ...clientLogos]; // seamless loop ke liye double
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-base font-semibold uppercase tracking-wider text-accent-600 md:text-lg">
            Clients
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Trusted Clients / Project Suppliers
          </h2>
        </Reveal>

        <div className="marquee-mask mt-10 overflow-hidden">
          <div className="marquee flex w-max">
            {row.map((c, i) => (
              // mr-6 (gap nahi): -50% par loop seamless rehta hai
              <div
                key={`${c.name}-${i}`}
                title={c.name}
                className="group mr-6 flex h-28 w-56 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <img
                  src={c.logo}
                  alt={i < clientLogos.length ? c.name : ""}
                  loading="lazy"
                  draggable="false"
                  className="max-h-14 w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
