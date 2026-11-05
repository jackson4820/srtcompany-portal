import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full md:w-80">
      <Search size={16} className="absolute left-3 top-3 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border py-2.5 pl-9 pr-3 outline-none focus:border-blue-600" />
    </div>
  );
}
