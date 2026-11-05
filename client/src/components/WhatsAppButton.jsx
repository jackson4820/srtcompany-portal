import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { waLink } from "../utils/whatsapp";

// Admin/login pages par nahi dikhta
const HIDDEN_ON = ["/dashboard", "/login", "/register"];

export default function WhatsAppButton() {
  const { pathname } = useLocation();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#1ebe5b]"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
