import { company } from "../data/content";

// wa.me link: number content.js ke company.whatsapp se, message pehle se likha hua khulta hai
export const waLink = (text = "Hello S.R. Trading Company, I would like to request a quote.") =>
  `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
