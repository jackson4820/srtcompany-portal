import { FileText, SearchCheck, ReceiptText, Truck } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    icon: FileText,
    title: "Share your requirement",
    text: "Send your BOQ, drawing or item list through the quote form, WhatsApp or email.",
  },
  {
    icon: SearchCheck,
    title: "We source to specification",
    text: "Our sourcing team arranges the materials as per your project specifications.",
  },
  {
    icon: ReceiptText,
    title: "Receive your quotation",
    text: "You get a quotation for the listed items, with makes and quantities as requested.",
  },
  {
    icon: Truck,
    title: "Dispatch to your site",
    text: "Confirmed materials are dispatched to your project site across India.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
            Process
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            How It Works
          </h2>
        </Reveal>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 100}>
              <li className="relative h-full rounded-2xl border bg-slate-50 p-6">
                <span className="absolute right-5 top-4 text-4xl font-extrabold text-blue-100">
                  {i + 1}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                  <s.icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
