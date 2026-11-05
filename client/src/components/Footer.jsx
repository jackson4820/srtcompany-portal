import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight, MessageCircle } from "lucide-react";
import { company } from "../data/content";
import { categories } from "../data/catalog";
import { useAuth } from "../context/AuthContext";
import { waLink } from "../utils/whatsapp";

const linkCls = "inline-flex items-center gap-1 transition hover:translate-x-0.5 hover:text-white";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const tel = company.phone.replace(/\s/g, "");

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-blue-700 via-blue-500 to-accent-500" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-xl font-bold text-white">S.R.T. Company</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {company.tagline}. Supplying electrical equipment, cables, instruments, safety, earthing and hardware to project sites across India.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className={linkCls}>Home</Link></li>
            <li><Link to="/products" className={linkCls}>Products</Link></li>
            <li><Link to="/#about" className={linkCls}>About</Link></li>
            <li><Link to="/#contact" className={linkCls}>Contact</Link></li>
            <li>
              {isAuthenticated
                ? <Link to="/dashboard" className={linkCls}>Dashboard</Link>
                : <Link to="/login" className={linkCls}>Login</Link>}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Product Categories</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/products?category=${c.id}`} className={linkCls}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-blue-400" /> <span>{company.address}</span></li>
            <li className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-blue-400" /> <a href={`tel:${tel}`} className="hover:text-white">{company.phone}</a></li>
            <li className="flex gap-3"><MessageCircle size={16} className="mt-0.5 shrink-0 text-blue-400" /> <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white">Chat on WhatsApp</a></li>
            {company.emails.map((e) => (
              <li key={e} className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-blue-400" /> <a href={`mailto:${e}`} className="break-all hover:text-white">{e}</a></li>
            ))}
          </ul>
          <Link to="/#contact" className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">
            Get a Quote <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} S.R.T. Company. All rights reserved.
      </div>
    </footer>
  );
}
