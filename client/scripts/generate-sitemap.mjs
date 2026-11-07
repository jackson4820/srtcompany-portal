// Run: node scripts/generate-sitemap.mjs   (npm run build se pehle apne-aap chalta hai: "prebuild")
// public/sitemap.xml aur public/robots.txt banata hai. Naya category catalog.js mein jodte hi sitemap mein aa jaata hai.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { company } from "../src/data/content.js";
import { categories, productPath } from "../src/data/catalog.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = company.url.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { loc: "/", priority: "1.0", freq: "weekly" },
  { loc: "/products", priority: "0.9", freq: "weekly" },
  { loc: "/credentials", priority: "0.7", freq: "monthly" },
  ...categories.map((c) => ({ loc: `/products?category=${c.id}`, priority: "0.8", freq: "monthly" })),
  ...categories.flatMap((c) => c.items.map((i) => ({ loc: productPath(c.id, i), priority: "0.6", freq: "monthly" }))),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${base}${p.loc.replace(/&/g, "&amp;")}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

// login/register/dashboard par robots.txt block nahi lagaya: unme "noindex" meta hai, aur Google ko woh
// tag dikhne ke liye page crawl hona zaroori hai.
const robots = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "sitemap.xml"), xml);
writeFileSync(join(root, "public", "robots.txt"), robots);
console.log(`sitemap.xml (${pages.length} URLs) aur robots.txt bane -> ${base}`);
