import axios from "axios";

export const TOKEN_KEY = "srt_token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Har request ke saath login token bhejo
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (import.meta.env.DEV) {
      console.group("API Error");
      console.log("URL:", error.config?.baseURL + error.config?.url);
      console.log("Status:", error.response?.status, "| Code:", error.code);
      console.log("Response:", error.response?.data);
      console.groupEnd();
    }

    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The server took too long to respond. Please try again."
        : error.message) ||
      "Unable to connect to the server. Please try again.";

    const err = new Error(message);
    err.status = error.response?.status;
    err.code = error.code;
    return Promise.reject(err);
  },
);

export const errMsg = (e) =>
  e?.message || "Something went wrong. Please try again.";

export default axiosClient;
