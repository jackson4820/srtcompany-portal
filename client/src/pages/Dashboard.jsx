import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getInquiries, updateInquiryStatus, deleteInquiry, downloadAttachment } from "../api/adminApi";
import { errMsg } from "../api/axiosClient";
import Loader from "../components/Loader";
import ItemPhoto from "../components/ItemPhoto";
import Seo from "../components/Seo";

const STATUSES = ["new", "contacted", "quoted", "closed"];

function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems((await getInquiries(filter)).items); }
    catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    try { await updateInquiryStatus(id, status); setItems((p) => p.map((i) => (i._id === id ? { ...i, status } : i))); }
    catch (e) { setError(errMsg(e)); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try { await deleteInquiry(id); setItems((p) => p.filter((i) => i._id !== id)); }
    catch (e) { setError(errMsg(e)); }
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Inquiries ({items.length})</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <Loader /> : items.length === 0 ? <p className="py-10 text-center text-slate-500">No inquiries found.</p> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{["Date", "Contact", "Product / Project", "Qty / Location", "Required by", "Status", ""].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id} className="border-t align-top">
                  <td className="whitespace-nowrap px-3 py-3">{new Date(i.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-3 py-3"><div className="font-medium">{i.name}</div><div className="text-xs text-slate-500">{i.email}{i.phone && ` | ${i.phone}`}</div>{i.company && <div className="text-xs text-slate-500">{i.company}</div>}</td>
                  <td className="px-3 py-3">
                    {i.items?.length ? (
                      <ul className="space-y-2">
                        {i.items.map((it, n) => (
                          <li key={n} className="flex items-center gap-2">
                            {it.photo?.path && <ItemPhoto inquiryId={i._id} index={n} name={it.name} />}
                            <div className="min-w-0">
                              <div className="font-medium">{it.name}</div>
                              {it.quantity && <div className="text-xs text-slate-500">Qty: {it.quantity}</div>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div>{i.productName || "-"}</div>
                    )}
                    <div className="mt-1 text-xs text-slate-500">{i.projectName}</div>
                    {i.message && <div className="mt-1 max-w-xs text-xs text-slate-600">{i.message}</div>}
                  </td>
                  <td className="px-3 py-3">{i.quantity || "-"}<div className="text-xs text-slate-500">{i.deliveryLocation}</div></td>
                  <td className="whitespace-nowrap px-3 py-3">{i.requiredBy ? new Date(i.requiredBy).toLocaleDateString("en-IN") : "-"}</td>
                  <td className="px-3 py-3">
                    <select value={i.status} onChange={(e) => changeStatus(i._id, e.target.value)} className="rounded border px-2 py-1 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {i.attachment?.path && <button onClick={() => downloadAttachment(i._id, i.attachment.originalName).catch((e) => setError(errMsg(e)))} className="mr-2 text-blue-700" title="Attachment download"><Download size={16} /></button>}
                    <button onClick={() => remove(i._id)} className="text-red-600" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Seo title="Dashboard | S.R.T. Company" description="Your S.R.T. Company dashboard." noindex />
      <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
      <p className="mt-1 text-sm text-slate-500">{user.email} | {user.role}</p>
      {user.role === "admin" ? (
        <AdminInquiries />
      ) : (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <p className="text-slate-700">Browse our products and send a quotation request directly.</p>
          <Link to="/products" className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800">Browse Products</Link>
        </div>
      )}
    </div>
  );
}
