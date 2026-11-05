import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company } from "../data/content";

// Head tags ko upsert karta hai (index.html ke static tags ke saath duplicate nahi banate).
// Har page apna <Seo /> lagata hai, isliye route badalte hi title/description/canonical badal jaate hain.
const upsert = (tag, attr, key, attrs) => {
  let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
};
const meta = (attr, key, content) => upsert("meta", attr, key, { content });

export default function Seo({ title, description, path, image = company.ogImage, noindex = false, jsonLd }) {
  const { pathname } = useLocation();
  const route = path ?? pathname;

  useEffect(() => {
    const url = company.url + (route === "/" ? "/" : route);
    const img = /^https?:/.test(image) ? image : company.url + image;

    document.title = title;
    meta("name", "description", description);
    meta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsert("link", "rel", "canonical", { href: url });

    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("property", "og:url", url);
    meta("property", "og:image", img);
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", description);
    meta("name", "twitter:image", img);
  }, [title, description, route, image, noindex]);

  // Page-wise structured data (jaise breadcrumbs). Page se hatne par script hat jaata hai.
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    if (!ld) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.seo = "page";
    el.textContent = ld;
    document.head.appendChild(el);
    return () => el.remove();
  }, [ld]);

  return null;
}
