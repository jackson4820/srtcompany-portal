import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin } from "lucide-react";
import { categories } from "../data/catalog";
import { company, clients } from "../data/content";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

const tabs = [
  { id: "who", label: "Who We Are" },
  { id: "what", label: "What We Do" },
  { id: "why", label: "Why S.R.T." },
];

const why = [
  "One source for electrical, safety, earthing, instruments and hardware",
  "Materials sourced per your project BOQ",
  "Quotation on request, with BOQ or drawing attached",
  "Supply to solar and EPC project sites across India",
];

// Saare numbers apni hi catalog / content data se aate hain
const stats = [
  { label: "Product categories", value: categories.length },
  { label: "Product lines", value: categories.reduce((n, c) => n + c.items.length, 0) },
  { label: "Cable brands sourced", value: categories.find((c) => c.id === "wires-cables")?.brands?.length || 0 },
  { label: "Clients served", value: clients.length },
];

export default function AboutSection() {
  const [tab, setTab] = useState("who");

  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden py-20">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-2">
        {/* Images */}
        <Reveal>
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <img src="/images/hero/factory-hd.jpg" alt="Industrial plant"
              className="h-80 w-full rounded-3xl object-cover shadow-xl transition duration-500 hover:scale-[1.02] md:h-96" />
            <img src="/images/hero/solar-panels.jpg" alt="Solar panels"
              className="absolute -bottom-8 -right-4 h-48 w-36 rounded-2xl border-4 border-white object-cover shadow-xl transition duration-500 hover:-translate-y-1 md:h-56 md:w-40" />
            <div className="absolute -left-3 top-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 shadow-lg">
              <MapPin size={16} className="text-accent-600" /> New Delhi, India
            </div>
          </div>
        </Reveal>

        {/* Text + tabs */}
        <Reveal delay={150}>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">About Us</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Your sourcing partner for solar &amp; EPC projects
          </h2>

          <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  tab === t.id ? "bg-blue-700 text-white shadow" : "text-slate-600 hover:text-blue-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div key={tab} className="fade-up mt-6 min-h-[11rem]">
            {tab === "who" && (
              <div className="space-y-3 text-slate-600">
                <p>{company.description}</p>
                <p>Our office is in New Delhi, and we handle quotations, sourcing and dispatch for project requirements.</p>
              </div>
            )}
            {tab === "what" && (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link key={c.id} to={`/products?category=${c.id}`}
                    className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:text-white">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            {tab === "why" && (
              <ul className="space-y-3">
                {why.map((w) => (
                  <li key={w} className="flex gap-3 text-slate-700">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-accent-600" /> {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      </div>

      {/* Stats */}
      <div className="relative mx-auto mt-20 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 100}>
            <div className="rounded-2xl border bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-4xl font-extrabold text-blue-800"><CountUp to={s.value} suffix="+" /></p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
