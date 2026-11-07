import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  Send,
  Phone,
  MessageCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { findProduct, productPath } from "../data/catalog";
import { company, credentials } from "../data/content";
import { waLink } from "../utils/whatsapp";
import { ProductImage } from "../components/ProductCard";
import InquiryModal from "../components/InquiryModal";
import Seo from "../components/Seo";
import NotFound from "./NotFound";

const toInclude = [
  "Specification, size or rating",
  "Quantity required",
  "Preferred make / brand, if any",
  "Delivery location and required date",
];

export default function ProductDetail() {
  const { category: categoryId, slug } = useParams();
  const [rfq, setRfq] = useState(false);
  const found = findProduct(categoryId, slug);
  if (!found) return <NotFound />;

  const { category, item } = found;
  const tel = company.phone.replace(/\s/g, "");
  const related = category.items.filter((i) => i.id !== item.id).slice(0, 4);

  const title = `${item.name} Supplier | S.R. Trading Company`;
  const description = `${item.name} (${category.name}) from S.R. Trading Company, New Delhi. Supplied to your specification for solar, EPC and industrial project sites across India. Request a quote.`;
  const path = productPath(category.id, item);

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: category.name, path: `/products?category=${category.id}` },
    { name: item.name, path },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: company.url + b.path,
    })),
  };

  return (
    <article className="mx-auto max-w-7xl px-4 py-8">
      <Seo
        title={title}
        description={description}
        path={path}
        image={item.image}
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500"
      >
        <Link to="/" className="hover:text-blue-700">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-blue-700">
          Products
        </Link>
        <ChevronRight size={14} />
        <Link
          to={`/products?category=${category.id}`}
          className="hover:text-blue-700"
        >
          {category.name}
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-slate-800">{item.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border bg-white p-4 shadow-sm">
          <ProductImage
            src={item.image}
            alt={item.name}
            contain
            className="h-80 w-full bg-white md:h-[26rem]"
          />
        </div>

        {/* Details */}
        <div>
          <Link
            to={`/products?category=${category.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-accent-600 hover:underline"
          >
            {category.name}
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 md:text-4xl">
            {item.name}
          </h1>
          <p className="mt-4 text-slate-600">
            S.R. Trading Company supplies {item.name.toLowerCase()} for solar,
            EPC and industrial project sites. {category.tagline}. Share your
            specification, quantity and drawing, and our sourcing team will
            arrange the material and send you a quotation.
          </p>

          {category.brands && (
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Makes available:
              </span>{" "}
              {category.brands.join(", ")}
            </p>
          )}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Include these details for a faster quotation
            </p>
            <ul className="mt-2 space-y-1.5">
              {toInclude.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-slate-700">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-accent-600"
                  />{" "}
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setRfq(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
            >
              <Send size={18} /> Request Quote
            </button>
            <a
              href={waLink(
                `Hello S.R. Trading Company, I am interested in ${item.name}. Please share a quotation.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1ebe5b]"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a
              href={`tel:${tel}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-600 hover:text-blue-700"
            >
              <Phone size={18} /> Call
            </a>
          </div>

          {credentials.profilePdf && (
            <a
              href={credentials.profilePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
            >
              <Download size={16} /> Download Company Profile
            </a>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900">
            More in {category.name}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                to={productPath(category.id, r)}
                className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="overflow-hidden">
                  <ProductImage
                    src={r.image}
                    alt={r.name}
                    className="h-36 w-full transition group-hover:scale-105"
                  />
                </div>
                <h3 className="p-3 text-sm font-semibold text-slate-900">
                  {r.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <InquiryModal
        open={rfq}
        onClose={() => setRfq(false)}
        productName={item.name}
      />
    </article>
  );
}
