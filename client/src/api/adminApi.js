import axiosClient from "./axiosClient";

// params: { status, search, page, limit }
export const getInquiries = (params = {}) =>
  axiosClient.get("/inquiries", { params }).then((r) => r.data);

export const updateInquiryStatus = (id, status) =>
  axiosClient.patch(`/inquiries/${id}/status`, { status }).then((r) => r.data);

export const updateInquiryNotes = (id, notes) =>
  axiosClient.patch(`/inquiries/${id}/notes`, { notes }).then((r) => r.data);

export const deleteInquiry = (id) => axiosClient.delete(`/inquiries/${id}`).then((r) => r.data);

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Attachment auth header ke saath blob me download hota hai
export const downloadAttachment = async (id, filename = "attachment") => {
  const res = await axiosClient.get(`/inquiries/${id}/attachment`, { responseType: "blob" });
  saveBlob(res.data, filename);
};

// Current filter ke hisaab se CSV
export const exportInquiriesCsv = async (params = {}) => {
  const res = await axiosClient.get("/inquiries/export", { params, responseType: "blob" });
  saveBlob(res.data, `inquiries-${new Date().toISOString().slice(0, 10)}.csv`);
};

// Item ki photo (admin only) blob ke roop me aati hai, taaki <img> me dikha sakein
export const fetchItemPhoto = (id, index) =>
  axiosClient.get(`/inquiries/${id}/items/${index}/photo`, { responseType: "blob" }).then((r) => r.data);