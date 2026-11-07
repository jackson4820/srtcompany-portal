import axiosClient from "./axiosClient";

// data: plain object | file: BOQ File ya null | items: [{ name, quantity, file }]
export const createInquiry = (data, file, items = []) => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v) fd.append(k, v);
  });
  if (file) fd.append("attachment", file);

  // Har item ki photo "itemPhotos" me jaati hai; items JSON me photoIndex se pata chalta hai kis item ki kaun si photo hai
  const photos = [];
  const payload = items.map((it) => {
    let photoIndex = null;
    if (it.file) {
      photoIndex = photos.length;
      photos.push(it.file);
    }
    return {
      name: it.name.trim(),
      quantity: (it.quantity || "").trim(),
      photoIndex,
    };
  });
  if (payload.length) fd.append("items", JSON.stringify(payload));
  photos.forEach((p) => fd.append("itemPhotos", p));

  return axiosClient
    .post("/inquiries", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 90000,
    })
    .then((r) => r.data);
};
