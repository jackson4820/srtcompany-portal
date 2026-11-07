import { BadgeCheck, Download, ExternalLink } from "lucide-react";
import { credentials } from "../data/content";
import Reveal from "./Reveal";

// content.js ke `credentials` se bharta hai. Kuch bhi bhara na ho to poora section hide rehta hai.
export default function TrustSection() {
  const { facts, certificates, profilePdf } = credentials;
  if (!facts.length && !certificates.length && !profilePdf) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Credentials
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Registrations &amp; Certifications
          </h2>
        </Reveal>

        {facts.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f, i) => (
              <Reveal key={f.label} delay={i * 80}>
                <div className="h-full rounded-2xl border bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {f.label}
                  </p>
                  <p className="mt-1 break-words text-lg font-bold text-blue-900">
                    {f.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {certificates.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certificates.map((c, i) => {
              const card = (
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="h-44 w-full bg-slate-50 object-contain p-2"
                    />
                  )}
                  <div className="flex items-start gap-3 p-4">
                    <BadgeCheck
                      size={20}
                      className="mt-0.5 shrink-0 text-accent-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      {c.issuer && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {c.issuer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
              return (
                <Reveal key={c.name} delay={i * 80}>
                  {c.image ? (
                    <a
                      href={c.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </div>
        )}

        {profilePdf && (
          <div className="mt-8">
            <a
              href={profilePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-700 px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              <Download size={18} /> Download Company Profile{" "}
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
