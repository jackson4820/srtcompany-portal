import { useEffect, useState } from "react";
import { company, credentials } from "../data/content";
import Reveal from "../components/Reveal";
import InquiryModal from "../components/InquiryModal";
import Seo from "../components/Seo";
import { BadgeCheck, Download, Eye, FileText, MapPin, Phone, Mail, Send, X } from "lucide-react";

function Block({ title, children }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CertificateViewer({ cert, pages, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // peeche ka page scroll na ho
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/85" onClick={onClose}>
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="min-w-0">
          <p className="truncate font-semibold">{cert.name}</p>
          <p className="text-xs text-slate-300">{pages.length} page{pages.length > 1 ? "s" : ""} · scroll karke dekhein</p>
        </div>
        <button onClick={onClose} className="rounded-full bg-white p-2 text-slate-800 shadow hover:bg-slate-100" aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        <div className="mx-auto max-w-3xl space-y-6" onClick={(e) => e.stopPropagation()}>
          {pages.map((p, n) => (
            <figure key={p}>
              <img src={p} alt={`${cert.name} - page ${n + 1}`} className="w-full rounded-lg bg-white shadow-2xl" />
              {pages.length > 1 && (
                <figcaption className="mt-2 text-center text-xs text-slate-300">Page {n + 1} of {pages.length}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Credentials() {
  const [rfq, setRfq] = useState(false);
  const { facts, certificates, profilePdf } = credentials;
  const tel = company.phone.replace(/\s/g, "");
  const empty = !facts.length && !certificates.length && !profilePdf;
const [viewing, setViewing] = useState(null); 
  return (
    <>
      <Seo
        title="Company Credentials, GST & Profile | S.R. Trading Company"
        description="GST registration, certificates and company profile of S.R. Trading Company, New Delhi. Verify our details before you place your enquiry."
        path="/credentials"
      />

      {/* Header band */}
      <div className="bg-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-300">Credentials</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Registrations, Certificates &amp; Company Profile</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Verify who we are before you send your requirement. All details below are available for your records.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20">
        {empty && <p className="mt-12 text-slate-600">Our credentials will be available here shortly.</p>}

        {facts.length > 0 && (
          <Block title="Registration details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((f, i) => (
                <Reveal key={f.label} delay={i * 80}>
                  <div className="h-full rounded-2xl border bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{f.label}</p>
                    <p className="mt-1 break-words text-lg font-bold text-blue-900">{f.value}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Block>
        )}

     {certificates.length > 0 && (
  <Block title="Certificates">
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {certificates.map((c, i) => {
        const pages = c.pages?.length ? c.pages : c.image ? [c.image] : [];
        return (
          <Reveal key={c.name} delay={i * 80}>
            <div className="mx-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
              {pages[0] && (
                <button type="button" onClick={() => setViewing({ cert: c, pages })} className="group relative block bg-slate-100" aria-label={`View ${c.name}`}>
                  <img src={pages[0]} alt={c.name} loading="lazy" className="h-[28rem] w-full object-contain object-top p-3 transition group-hover:opacity-90" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8 text-left text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Click to view
                  </span>
                </button>
              )}
              <div className="flex items-start gap-3 p-4">
                <BadgeCheck size={20} className="mt-0.5 shrink-0 text-accent-600" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  {c.issuer && <p className="mt-0.5 text-xs text-slate-500">{c.issuer}</p>}
                  {pages.length > 0 && (
                    <button type="button" onClick={() => setViewing({ cert: c, pages })}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">
                      <Eye size={16} /> View certificate{pages.length > 1 ? ` (${pages.length} pages)` : ""}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  </Block>
)}

        {profilePdf && (
          <Block title="Company profile">
            <div className="flex flex-col items-start gap-4 rounded-2xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText size={24} /></div>
                <div>
                  <p className="font-semibold text-slate-900">S.R. Trading Company Profile (PDF)</p>
                  <p className="text-sm text-slate-500">Our products, clients and capabilities.</p>
                </div>
              </div>
              <a href={profilePdf} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800">
                <Download size={18} /> Download
              </a>
            </div>
          </Block>
        )}

        <Block title="Registered office &amp; contact">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5">
              <MapPin size={20} className="text-blue-700" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Address</p>
              <p className="mt-1 font-medium text-slate-800">{company.legalName}</p>
              <p className="text-slate-600">{company.address}</p>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <Phone size={20} className="text-blue-700" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</p>
              <a href={`tel:${tel}`} className="mt-1 block font-medium text-slate-800 hover:text-blue-700">{company.phone}</a>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <Mail size={20} className="text-blue-700" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
              {company.emails.map((e) => (
                <a key={e} href={`mailto:${e}`} className="mt-1 block break-words font-medium text-slate-800 hover:text-blue-700">{e}</a>
              ))}
            </div>
          </div>
        </Block>

        <div className="mt-14 rounded-2xl bg-slate-50 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Ready to share your requirement?</h2>
          <p className="mt-1 text-slate-600">Send your BOQ or item list and our sourcing team will respond with a quotation.</p>
          <button onClick={() => setRfq(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent-600 px-7 py-3 font-semibold text-white transition hover:bg-accent-500">
            <Send size={18} /> Request a Quote
          </button>
        </div>
      </div>

      <InquiryModal open={rfq} onClose={() => setRfq(false)} />
        {viewing && <CertificateViewer cert={viewing.cert} pages={viewing.pages} onClose={() => setViewing(null)} />}
    </>
  );
}