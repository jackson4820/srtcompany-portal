// Company content: edit here
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
  // WhatsApp number: include the country code, with no "+" or spaces. Currently the same as the company phone.
  whatsapp: "919311764338",
  emails: ["srtquotation6@gmail.com", "srtsent@gmail.com"],
};

export const team = [
  {
    name: "Mr. Sukhmeet",
    role: "Director / Company Head",
    photo: "/images/team/sukhmeet.jpg", // file: client/public/images/team/sukhmeet.jpg
  },
  {
    name: "Ms. Kavita Mahapatra",
    role: "Sourcing Department",
    phone: "+91 9311764338",
    photo: "/images/team/kavita.jpg", // file: client/public/images/team/kavita.jpg
  },
];

export const clients = [
  // "NTPC",
  // "BHEL",
  "SolarWorld",
  "Gentari",
  "Aditya Birla",
  "Siemens",
  "Secure",
  "Mahindra",
  "Delhi Metro Rail Corporation",
  "ENGIE",
  "Crompton Greaves",
  "Schneider Electric",
  "Vikram Solar",
  "Kalpa-Taru",
  "Sekura",
];

// Client logos for the marquee. To add a client: put the logo in /public/images/clients/ and add a line here.
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
  {
    name: "Schneider Electric",
    logo: "/images/clients/schneider-electric.png",
  },
  { name: "Vikram Solar", logo: "/images/clients/vikram-solar.png" },
  { name: "Kalpa-Taru", logo: "/images/clients/kalpa-taru.png" },
  { name: "Sekura", logo: "/images/clients/sekura.png" },
];

// Search engine / social share text. Keep titles around 60 characters and descriptions around 155.
export const seo = {
  home: {
    title:
      "S.R. Trading Company | Electrical Material Supplier for Solar & EPC",
    description:
      "New Delhi-based supplier of electrical equipment, cables, instruments, safety products and earthing materials to solar and EPC project sites across India.",
  },
  products: {
    title: "Electrical, Cable, Safety & Earthing Products | S.R.T. Company",
  },
};

// ===== CREDENTIALS =====
// Only list details that are accurate and documented.
// facts: small label/value cards. certificates: name, issuer, cover image and page images.
// profilePdf: link to the company profile PDF (file lives in client/public/docs/).
export const credentials = {
  facts: [
    { label: "GST Number", value: "07AAEPT6321M1ZD" },
    { label: "Legal Name", value: "SUKHMEET SINGH TALWAR" },
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
