import axiosClient from "./axiosClient";

export const getInquiries = (status) =>
  axiosClient.get("/inquiries", { params: status ? { status } : {} }).then((r) => r.data);

export const updateInquiryStatus = (id, status) =>
  axiosClient.patch(`/inquiries/${id}/status`, { status }).then((r) => r.data);

export const deleteInquiry = (id) => axiosClient.delete(`/inquiries/${id}`).then((r) => r.data);

// Attachment auth header ke saath blob me download hota hai
export const downloadAttachment = async (id, filename = "attachment") => {
  const res = await axiosClient.get(`/inquiries/${id}/attachment`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// Item ki photo (admin only) blob ke roop me aati hai, taaki <img> me dikha sakein
export const fetchItemPhoto = (id, index) =>
  axiosClient.get(`/inquiries/${id}/items/${index}/photo`, { responseType: "blob" }).then((r) => r.data);
