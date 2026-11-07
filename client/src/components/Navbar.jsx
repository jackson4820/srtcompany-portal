import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home", id: "home" },
  { to: "/products", label: "Products", id: "products" },
  { to: "/#about", label: "About", id: "about" },
  { to: "/credentials", label: "Credentials", id: "credentials" },
  { to: "/#contact", label: "Contact", id: "contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [section, setSection] = useState(null); // home page ka active section
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled && !open;

  // Scroll: background change + progress bar
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 24);
      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Scroll-spy: Home par About / Contact highlight
  useEffect(() => {
    setSection(null);
    if (!isHome) return;
    const targets = ["about", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setSection(e.target.id)),
      { rootMargin: "-40% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    const onTop = () => window.scrollY < 200 && setSection(null);
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [isHome, pathname]);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (l) => {
    if (l.id === "home") return isHome && !section;
    if (l.id === "products") return pathname.startsWith("/products");
    if (l.id === "credentials") return pathname.startsWith("/credentials");
    return isHome && section === l.id;
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const textColor = transparent ? "text-white" : "text-slate-700";
  const btn =
    "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";
  const outline = transparent
    ? `${btn} border border-white/70 text-white hover:bg-white/15`
    : `${btn} border border-blue-700 text-blue-700 hover:bg-blue-50`;
  const solid = transparent
    ? `${btn} bg-white text-blue-800 hover:bg-blue-50`
    : `${btn} bg-blue-700 text-white hover:bg-blue-800 hover:shadow-md`;

  const AuthButtons = ({ onClick }) => {
    if (loading) return null;
    return isAuthenticated ? (
      <>
        <Link to="/dashboard" onClick={onClick} className={outline}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <button onClick={handleLogout} className={solid}>
          <LogOut size={16} /> Logout
        </button>
      </>
    ) : (
      <>
        <Link to="/login" onClick={onClick} className={outline}>
          <LogIn size={16} /> Login
        </Link>
        <Link to="/register" onClick={onClick} className={solid}>
          <UserPlus size={16} /> Register
        </Link>
      </>
    );
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-gradient-to-b from-black/40 to-transparent"
          : "bg-white/95 shadow-md backdrop-blur"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/images/logo.png"
            alt="S.R. Trading Company logo"
            className="h-11 w-11 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
          />
          <span
            className={`text-base font-extrabold tracking-tight transition-colors sm:text-lg ${transparent ? "text-white" : "text-blue-800"}`}
          >
            S.R. Trading Company
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.id}
              to={l.to}
              end
              className={`group relative px-3 py-2 text-sm font-medium transition-colors ${textColor} ${isActive(l) ? "font-semibold" : "opacity-90 hover:opacity-100"}`}
            >
              {l.label}
              <span
                className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded bg-accent-500 transition-transform duration-300 ${
                  isActive(l)
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </NavLink>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && (
            <span
              className={`mr-1 flex items-center gap-2 text-sm ${transparent ? "text-white/90" : "text-slate-500"}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                {user.name?.[0]?.toUpperCase()}
              </span>
              {user.name.split(" ")[0]}
            </span>
          )}
          <AuthButtons />
        </div>

        {/* Mobile toggle */}
        <button
          className={`rounded-lg p-2 transition md:hidden ${transparent ? "text-white" : "text-slate-800"}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile panel (slide animation) */}
      <div
        className={`grid transition-all duration-300 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden bg-white">
          <div className="space-y-1 border-t px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.id}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2.5 font-medium ${isActive(l) ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 pt-3">
              <AuthButtons onClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll progress */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-transparent">
        <div
          className="h-full bg-accent-500 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
