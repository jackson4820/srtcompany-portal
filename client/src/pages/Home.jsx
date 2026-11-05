import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Send, Truck } from "lucide-react";
import { categories } from "../data/catalog";
import { company, clients, seo } from "../data/content";
import AboutSection from "../components/AboutSection";
import SupplySection from "../components/SupplySection";
import TeamSection from "../components/TeamSection";
import ContactSection from "../components/ContactSection";
import ClientsMarquee from "../components/ClientsMarquee";
import HowItWorks from "../components/HowItWorks";
import TrustSection from "../components/TrustSection";
import Reveal from "../components/Reveal";
import InquiryModal from "../components/InquiryModal";
import Seo from "../components/Seo";

// Hero background images: public/images/hero/ me aur images daal kar yahan add karein
const heroSlides = ["/images/hero/factory-hd.jpg"];

const stats = [
  { value: `${clients.length}+`, label: "Trusted clients" },
  { value: `${categories.reduce((n, c) => n + c.items.length, 0)}+`, label: "Products" },
  { value: "Pan-India", label: "Delivery" },
];

export default function Home() {
  const [rfq, setRfq] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setInterval(() => setSlide((i) => (i + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Seo title={seo.home.title} description={seo.home.description} path="/" />

      {/* ===== HERO: full screen ===== */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-slate-950 text-white">
        {/* Background slides (zyada images ho to crossfade hota hai) */}
        {heroSlides.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={src} alt="" fetchPriority="high" className="h-full w-full object-cover" />
          </div>
        ))}

        {/* Overlays: sirf left side dark (text readable), right side ki photo vivid rehti hai */}
        <div className="absolute inset-0 bg-slate-950/55 lg:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-28 pt-28 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left: text */}
          <div>
            <p className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              {company.tagline}
            </p>

            <h1 className="fade-up delay-1 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Leading project associate for{" "}
              <span className="bg-gradient-to-r from-accent-200 to-accent-400 bg-clip-text text-transparent">EPC &amp; Solar</span>{" "}
              industries
            </h1>

            <p className="fade-up delay-2 mt-6 max-w-xl text-lg leading-relaxed text-slate-200 md:text-xl">
              Quality electrical, safety and earthing materials, sourced per your project BOQ and delivered to site.
            </p>

            <div className="fade-up delay-3 mt-9 flex flex-wrap gap-4">
              <button
                onClick={() => setRfq(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-accent-600/30 transition hover:-translate-y-0.5 hover:bg-accent-500"
              >
                <Send size={18} /> Request a Quote
              </button>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                View Products <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust stats (sab data site ke apne data se aata hai) */}
            <dl className="fade-up delay-4 mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-3xl font-extrabold text-white">{s.value}</dt>
                  <dd className="mt-1 text-xs uppercase tracking-wider text-slate-300">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: solar photo card */}
          <div className="fade-up delay-2 hidden justify-end lg:flex">
            <div className="floaty relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-accent-400/20 blur-3xl" />
              <img
                src="/images/hero/solar-panels.jpg"
                alt="Solar panels"
                className="relative h-[30rem] w-80 rounded-3xl object-cover shadow-2xl ring-1 ring-white/30"
              />
              <div className="absolute -bottom-6 -left-12 max-w-[16rem] rounded-2xl border border-white/40 bg-white/90 p-4 text-slate-800 shadow-2xl backdrop-blur-md">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-600">
                  <Truck size={14} /> Pan-India supply
                </p>
                <p className="mt-1.5 text-sm leading-snug">Materials for solar and EPC project sites, sourced to your BOQ.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product categories strip */}
        <div className="absolute inset-x-0 bottom-0 hidden border-t border-white/10 bg-slate-950/40 backdrop-blur-md md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 text-sm">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">We supply</span>
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.id}`} className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-slate-200 transition hover:border-accent-400 hover:text-accent-300">
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
          className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 text-white/70 transition hover:text-white md:block" aria-label="Scroll down">
          <ChevronDown size={30} className="animate-bounce" />
        </a>
      </section>

      <AboutSection />
      <SupplySection />
      <HowItWorks />
      <TrustSection />

      <TeamSection />

      <ClientsMarquee />

      <ContactSection onRfq={() => setRfq(true)} />

      <InquiryModal open={rfq} onClose={() => setRfq(false)} />
    </>
  );
}
