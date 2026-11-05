import { MapPin, Phone, Mail, Send, ExternalLink, MessageCircle, Download } from "lucide-react";
import { company, credentials } from "../data/content";
import { waLink } from "../utils/whatsapp";
import Reveal from "./Reveal";

const mapQuery = encodeURIComponent(company.address);

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <div className="mt-0.5 break-words font-medium text-slate-800">{children}</div>
      </div>
    </div>
  );
}

export default function ContactSection({ onRfq }) {
  const tel = company.phone.replace(/\s/g, "");
  return (
    <section id="contact" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">Contact</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Contact Us</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Send us your project requirement, BOQ or drawing. Our sourcing team will get back to you with a quotation shortly.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Left: details + buttons */}
          <Reveal>
            <div className="space-y-4">
              <InfoRow icon={MapPin} label="Address">{company.address}</InfoRow>

              <InfoRow icon={Phone} label="Phone">
                <a href={`tel:${tel}`} className="hover:text-blue-700">{company.phone}</a>
                <span className="block text-sm font-normal text-slate-500">Ms. Kavita Mahapatra</span>
              </InfoRow>

              <InfoRow icon={Mail} label="Email">
                {company.emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="block hover:text-blue-700">{e}</a>
                ))}
              </InfoRow>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={onRfq}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  <Send size={18} /> Send RFQ
                </button>
                <a
                  href={`tel:${tel}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-7 py-3.5 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-600 hover:text-blue-700"
                >
                  <Phone size={18} /> Call Now
                </a>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1ebe5b]"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
                {credentials.profilePdf && (
                  <a
                    href={credentials.profilePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-7 py-3.5 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-600 hover:text-blue-700"
                  >
                    <Download size={18} /> Company Profile
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          {/* Right: map */}
          <Reveal delay={150}>
            <div className="relative h-full min-h-[340px] overflow-hidden rounded-2xl border shadow-sm">
              <iframe
                title="S.R.T. Company location"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-md hover:bg-blue-50"
              >
                Open in Google Maps <ExternalLink size={14} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
