import axiosClient from "./axiosClient";

export const loginApi = (email, password) =>
  axiosClient.post("/auth/login", { email, password }).then((r) => r.data);

export const registerApi = (name, email, password) =>
  axiosClient.post("/auth/register", { name, email, password }).then((r) => r.data);

export const getMeApi = () => axiosClient.get("/auth/me").then((r) => r.data);
