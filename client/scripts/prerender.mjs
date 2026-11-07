// Build ke baad chalta hai: har route ka HTML + meta tags dist/ me likhta hai
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { company } from "../src/data/content.js";
import { categories, productPath } from "../src/data/catalog.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");
const ROOT_TAG = '<div id="root"></div>';
if (!template.includes(ROOT_TAG)) throw new Error('dist/index.html me <div id="root"></div> nahi mila');

// Khali SPA shell: login/dashboard jaise un-prerendered routes ke fallback ke liye
copyFileSync(join(dist, "index.html"), join(dist, "200.html"));

const { render } = await import(pathToFileURL(join(root, "dist-server", "entry-server.js")).href);

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const swap = (html, re, tag) => (re.test(html) ? html.replace(re, () => tag) : html.replace("</head>", () => `  ${tag}\n  </head>`));

function applyHead(html, h, route) {
  const url = company.url + (route === "/" ? "/" : route);
  const img = /^https?:/.test(h.image) ? h.image : company.url + h.image;
  const m = (attr, key, content) => {
    html = swap(html, new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`), `<meta ${attr}="${key}" content="${esc(content)}" />`);
  };

  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(h.title)}</title>`);
  m("name", "description", h.description);
  m("name", "robots", h.noindex ? "noindex, nofollow" : "index, follow");
  m("property", "og:title", h.title);
  m("property", "og:description", h.description);
  m("property", "og:url", url);
  m("property", "og:image", img);
  m("name", "twitter:title", h.title);
  m("name", "twitter:description", h.description);
  m("name", "twitter:image", img);
  html = swap(html, /<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}" />`);

  if (h.jsonLd) {
    const json = JSON.stringify(h.jsonLd).replace(/</g, "\\u003c");
    html = html.replace("</head>", () => `  <script type="application/ld+json" data-seo="page">${json}</script>\n  </head>`);
  }
  return html;
}

const routes = [
  "/",
  "/products",
  "/credentials",
  ...categories.flatMap((c) => c.items.map((i) => productPath(c.id, i))),
];

for (const route of routes) {
  const { html: body, head } = render(route);
  let page = template.replace(ROOT_TAG, () => `<div id="root" data-path="${route}">${body}</div>`);
  if (head) page = applyHead(page, head, route);

  const file = route === "/" ? join(dist, "index.html") : join(dist, route, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}
console.log(`Prerendered ${routes.length} pages -> dist/`);