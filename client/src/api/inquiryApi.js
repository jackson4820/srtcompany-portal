import axiosClient from "./axiosClient";

// data: form fields
// files: RFQ/BOQ files array (old single File format bhi supported)
// items: [{ name, quantity, file }]

export const createInquiry = (data, files = [], items = []) => {
  const fd = new FormData();

  // Form fields: name, email, phone, company, cc, bcc, etc.
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      fd.append(key, value);
    }
  });

  // Single File ya multiple Files dono support honge.
  const attachments = Array.isArray(files) ? files : files ? [files] : [];

  // Backend multer field name: attachments
  attachments.forEach((file) => {
    fd.append("attachments", file);
  });

  // Har item ki photo itemPhotos field me jayegi.
  // items JSON me photoIndex se photo identify hogi.
  const photos = [];

  const payload = (items || []).map((item) => {
    let photoIndex = null;

    if (item.file) {
      photoIndex = photos.length;
      photos.push(item.file);
    }

    return {
      name: (item.name || "").trim(),
      quantity: (item.quantity || "").trim(),
      photoIndex,
    };
  });

  if (payload.length) {
    fd.append("items", JSON.stringify(payload));
  }

  photos.forEach((photo) => {
    fd.append("itemPhotos", photo);
  });

  return axiosClient
    .post("/inquiries", fd, {
      timeout: 90000,
      // axiosClient ka default JSON header FormData ko JSON bana deta hai (files gayab ho jati hain).
      // multipart set karne par browser khud boundary lagata hai aur files server tak jaati hain.
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => response.data);
};
