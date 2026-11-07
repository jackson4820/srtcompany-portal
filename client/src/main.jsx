import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const el = document.getElementById("root");

const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Prerendered HTML tabhi hydrate hota hai jab wo isi URL ka ho (warna host ka fallback page galat content dikhata)
const here = window.location.pathname.length > 1 ? window.location.pathname.replace(/\/$/, "") : "/";
if (el.dataset.path && el.dataset.path === here) {
  hydrateRoot(el, app);
} else {
  el.innerHTML = "";
  createRoot(el).render(app);
}