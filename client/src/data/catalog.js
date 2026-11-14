// Saari items S.R.T. company profile PDF se li gayi hain.
// Images: client/public/images/catalog/<category-id>/<item-slug>.jpg me rakhein
// (cropped from the PDF photos). If an image is missing, a placeholder is shown.

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const make = (catId, names) =>
  names.map((n) => ({
    id: `${catId}-${slug(n)}`,
    slug: slug(n),
    name: n,
    image: `/images/catalog/${catId}/${slug(n)}.jpg`,
  }));

export const categories = [
  {
    id: "electrical-equipment",
    name: "Electrical Equipment",
    tagline:
      "Switchgear, starters, panels and power equipment for EPC and solar sites",
    items: make("electrical-equipment", [
      "Circuit Breakers",
      "Magnetic Starters",
      "Lightning / Explosion Proof Fittings",
      "Panel Board",
      "Transformers",
      "Generating Sets",
      "Contactors",
      "Enclosures",
      "Relays",
      "Fittings",
      "Conduit Fittings",
    ]),
  },
  {
    id: "wires-cables",
    name: "Wires & Cables",
    tagline: "Power, control and flexible cables from leading makes",
    brands: [
      "Polycab",
      "KEI",
      "Finolex Cable Ltd.",
      "RR Cables",
      "Kalinga",
      "National Wires & Cables",
      "RPG",
      "Uniflex Cables Ltd.",
      "Talbro",
    ],
    items: make("wires-cables", [
      "Flexible Wires",
      "Power & Control Cables",
      "Armoured Cables",
      "Shielded / Instrumentation Cables",
      "Coaxial & Data Cables",
    ]),
  },
  {
    id: "measuring-testing",
    name: "Measuring & Testing Instruments",
    tagline: "Calibration-ready meters and gauges",
    items: make("measuring-testing", [
      "Multimeter",
      "Digital Multimeter",
      "Digital Density Meter",
      "Vernier Caliper",
      "Steel Scale",
      "Dial Gauge",
      "Pressure Gauge",
      "Micrometer",
      "Ammeter",
      "Voltmeter",
      "Clamp Meter",
      "Insulation Tester",
      "Sound Level Meter",
      "Tachometer",
      "Phase Sequence Meter",
      "Data Logger",
    ]),
  },
  {
    id: "safety-products",
    name: "Safety Products",
    tagline: "PPE and site safety equipment",
    items: make("safety-products", [
      "Protective Clothing (Long Sleeves)",
      "Safety Helmet / Hard Hat",
      "Safety Goggles",
      "Safety Gloves",
      "Hearing Protectors",
      "Safety Footwear",
      "Face Shield",
      "Safety Glasses",
      "Insulation Equipment",
      "Gas Detection Devices",
      "Non-Conduction Rods",
      "Safety Signs",
      "Respirators",
      "Fire Extinguishers",
    ]),
  },
  {
    id: "earthing-materials",
    name: "Earthing Materials",
    tagline: "Complete earthing and bonding materials",
    items: make("earthing-materials", [
      "Earth Strips / Bars (GI / Aluminium / Copper)",
      "Solid Earth Plate (GI / Aluminium / Copper)",
      "Solid Copper Lattice Mats",
      "Earth Electrodes",
      "Bus Bars",
      "Glands",
      "Flexible Copper Braid Bonds",
      "GI Pipe",
      "GI Earth Wire",
      "GI Earth Plate",
      "Insulators",
      "Isolators",
    ]),
  },
  {
    id: "lugs",
    name: "Copper / Aluminium Lugs",
    tagline: "Cable termination lugs",
    items: make("lugs", ["Copper Lugs", "Aluminium Lugs"]),
  },
  {
    id: "hardware",
    name: "Hardware",
    tagline:
      "Plumbing, machinery, household, manufacturing, carpentry and electrical hardware",
    items: make("hardware", [
      "PVC Pipes",
      "Taps",
      "Paints",
      "Hand Pump",
      "Nuts, Bolts & Washers",
      "Locks",
      "Bulbs & Lights",
      "Drums",
      "Rope & Thread",
      "Screws",
      "Hammer",
      "Hanger",
      "Bearings & Seals",
      "Adhesives & Tapes",
    ]),
  },
];

// Product detail page ka URL: /products/<category-id>/<item-slug>
export const productPath = (categoryId, item) =>
  `/products/${categoryId}/${item.slug}`;

export const findProduct = (categoryId, itemSlug) => {
  const category = categories.find((c) => c.id === categoryId);
  const item = category?.items.find((i) => i.slug === itemSlug);
  return category && item ? { category, item } : null;
};
