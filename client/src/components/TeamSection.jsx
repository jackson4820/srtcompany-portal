import { useState } from "react";
import { Phone } from "lucide-react";
import { team } from "../data/content";
import Reveal from "./Reveal";

const initial = (name) => name.replace(/^(Mr|Ms|Mrs)\.?\s+/, "")[0];

function TeamCard({ m }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = m.photo && !imgFailed;

  return (
    <div className="group h-full overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Top: person ki photo (photo na mile to initial wala gradient dikhega) */}
      <div className="relative h-72 w-full overflow-hidden bg-gradient-to-br from-blue-700 to-blue-500">
        {showPhoto ? (
          <img
            src={m.photo}
            alt={m.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl font-bold text-white/90">
            {initial(m.name)}
          </div>
        )}
      </div>

      {/* Neeche: details */}
      <div className="border-t-4 border-accent-500 p-5 text-center">
        <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
        <p className="mt-1 text-sm font-medium text-blue-700">{m.role}</p>
        {m.note && (
          <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
            {m.note}
          </p>
        )}
        {m.phone && (
          <a
            href={`tel:${m.phone.replace(/\s/g, "")}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <Phone size={14} /> {m.phone}
          </a>
        )}
      </div>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
          Team
        </p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
          Our Team
        </h2>
      </Reveal>
      <div className="mt-8 flex flex-wrap gap-6">
        {team.map((m, i) => (
          <Reveal key={m.name} delay={i * 120} className="w-full sm:w-72">
            <TeamCard m={m} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
