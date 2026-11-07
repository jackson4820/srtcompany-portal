// Company content: yahin se edit karein
export const company = {
  name: "S.R. Trading Company",
  shortName: "S.R.T.",
  legalName: "S.R. Trading Company",
  url: "https://srtcompany.in", // sitemap, canonical aur Open Graph links isi se bante hain
  ogImage: "/images/hero/factory-hd.jpg", // social share preview (ideal: 1200x630 ki image)
  tagline: "Material Supplier for Solar & EPC Industries",
  description:
    "S.R.T. Company is a project associate for EPC and solar industries. Through our trading division, S.R. Trading Company, we source and supply electrical equipment, cables, instruments, safety products, earthing materials and hardware to project sites across India.",
  address: "101, GF, Rani Jhansi Road, Model Basti, New Delhi-110005",
  phone: "+91 9311764338",
  // WhatsApp number: country code ke saath, bina + ya space ke. Abhi company phone wala hi number hai;
  // agar WhatsApp kisi aur number par chalta hai to yahan badal dein.
  whatsapp: "919311764338",
  emails: ["srtquotation6@gmail.com", "srtsent@gmail.com"],
};

export const team = [
  {
    name: "Mr. Sukhmeet",
    role: "Director / Company Head",
    photo: "/images/team/sukhmeet.jpg", // photo yahan: client/public/images/team/sukhmeet.jpg
  },
  {
    name: "Ms. Kavita Mahapatra",
    role: "Sourcing Department",
    // note: "Sourcing Department",
    phone: "+91 9311764338",
    photo: "/images/team/kavita.jpg", // photo yahan: client/public/images/team/kavita.jpg
  },
  
];

export const clients = [
  "NTPC", "BHEL", "SolarWorld", "Gentari", "Aditya Birla", "Siemens", "Secure", "Mahindra", "Delhi Metro Rail Corporation",
  "ENGIE", "Crompton Greaves", "Schneider Electric", "Vikram Solar", "Kalpa-Taru", "Sekura",
];

// Client logos (marquee ke liye). Naya client: logo /public/images/clients/ me daalo aur yaha ek line add karo.
export const clientLogos = [
  { name: "NTPC", logo: "/images/clients/ntpc.png" },
  { name: "BHEL", logo: "/images/clients/bhel.png" },
  { name: "SolarWorld", logo: "/images/clients/solarworld.png" },
  { name: "Gentari", logo: "/images/clients/gentari.png" },
  { name: "Aditya Birla", logo: "/images/clients/aditya-birla.png" },
  { name: "Siemens", logo: "/images/clients/siemens.png" },
  { name: "Secure", logo: "/images/clients/secure.png" },
  { name: "Mahindra", logo: "/images/clients/mahindra.png" },
  { name: "Delhi Metro Rail Corporation", logo: "/images/clients/dmrc.png" },
  { name: "ENGIE", logo: "/images/clients/engie.png" },
  { name: "Crompton Greaves", logo: "/images/clients/crompton-greaves.png" },
  { name: "Schneider Electric", logo: "/images/clients/schneider-electric.png" },
  { name: "Vikram Solar", logo: "/images/clients/vikram-solar.png" },
  { name: "Kalpa-Taru", logo: "/images/clients/kalpa-taru.png" },
  { name: "Sekura", logo: "/images/clients/sekura.png" },
];

// Search engine / social share text. Title ~60 aur description ~155 characters tak rakhein.
export const seo = {
  home: {
    title: "S.R. Trading Company | Electrical Material Supplier for Solar & EPC",
    description:
      "New Delhi-based supplier of electrical equipment, cables, instruments, safety products and earthing materials to solar and EPC project sites across India.",
  },
  products: {
    title: "Electrical, Cable, Safety & Earthing Products | S.R.T. Company",
  },
};

// ===== TRUST / CREDENTIALS =====
// Neeche sirf wahi bharein jo sach aur documented ho. Khali chhodne par website par woh item dikhega hi nahi.
// Poora "Credentials" section tabhi dikhta hai jab kam se kam ek item bhara ho.
// export const credentials = {
//   // Chhote fact cards (label + value). Example (apni asli details dalein):
//   //   { label: "GST Number", value: "07XXXXXXXXXXXXX" },
//   //   { label: "Established", value: "20XX" },
//   //   { label: "Udyam / MSME", value: "UDYAM-DL-XX-XXXXXXX" },
//   facts: [],

//   // Certificates / registrations. Image ya PDF /public/images/certificates/ ya /public/docs/ mein rakhein.
//   // Example:
//   //   { name: "ISO 9001:2015", issuer: "Certifying body ka naam", image: "/images/certificates/iso-9001.jpg" },
//   certificates: [],

//   // Company profile PDF ka link, jaise "/docs/srt-company-profile.pdf" (file client/public/docs/ mein rakhein).
//   // Bharne par product pages aur Contact mein "Download Company Profile" button aa jayega.
//   profilePdf: "",
// };


export const credentials = {
  facts: [
    { label: "GST Number", value: "07AAEPT6321M1ZD" },   // ← apna asli 15-digit GSTIN
    { label: "Legal Name", value: "SUKHMEET SINGH TALWAR" },
    { label: "Established", value: "20XX" },              // ← sach ho tabhi
  ],

  certificates: [
  {
    name: "GST Registration Certificate",
    issuer: "Government of India, GST Department",
    image: "/images/certificates/gst-certificate-1.jpg",
    pages: [
      "/images/certificates/gst-certificate-1.jpg",
      "/images/certificates/gst-certificate-2.jpg",
      "/images/certificates/gst-certificate-3.jpg",
    ],
  },
],

  profilePdf: "/docs/srt-company-profile.pdf",
};