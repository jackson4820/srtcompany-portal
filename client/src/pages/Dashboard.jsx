import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getInquiries,
  updateInquiryStatus,
  updateInquiryNotes,
  deleteInquiry,
  downloadAttachment,
  exportInquiriesCsv,
} from "../api/adminApi";
import { errMsg } from "../api/axiosClient";
import { company } from "../data/content";
import Loader from "../components/Loader";
import ItemPhoto from "../components/ItemPhoto";
import Seo from "../components/Seo";

const STATUSES = ["new", "contacted", "quoted", "closed"];
const LIMIT = 20;
const STATUS_STYLE = {
  new: "border-blue-300 bg-blue-50 text-blue-800",
  contacted: "border-amber-300 bg-amber-50 text-amber-800",
  quoted: "border-purple-300 bg-purple-50 text-purple-800",
  closed: "border-green-300 bg-green-50 text-green-800",
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function NotesCell({ inquiry, onSaved, onError }) {
  const saved = inquiry.notes || "";
  const [value, setValue] = useState(saved);
  const [saving, setSaving] = useState(false);
  const dirty = value.trim() !== saved;

  const save = async () => {
    setSaving(true);
    try {
      const { item } = await updateInquiryNotes(inquiry._id, value.trim());
      onSaved(inquiry._id, item.notes || "");
      setValue(item.notes || "");
    } catch (e) {
      onError(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <textarea
        rows={3}
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a note for your team..."
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-600"
      />
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="mt-1 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save note"}
        </button>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </p>
  );
}

function Field({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-0.5 break-words text-sm text-slate-800">
        {children}
      </div>
    </div>
  );
}

function InquiryCard({ inq, onStatus, onRemove, onNoteSaved, onError }) {
  const hasItems = inq.items?.length > 0;

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Header: kaun, kab, status, actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-900">
            {inq.name}
          </h3>
          <p className="text-xs text-slate-500">
            {inq.company && <>{inq.company} · </>}Received {fmt(inq.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={inq.status}
            onChange={(e) => onStatus(inq._id, e.target.value)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLE[inq.status] || ""}`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {inq.attachment?.path && (
            <button
              onClick={() =>
                downloadAttachment(inq._id, inq.attachment.originalName).catch(
                  (e) => onError(errMsg(e)),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              title={inq.attachment.originalName}
            >
              <Download size={14} /> BOQ / File
            </button>
          )}
          <button
            onClick={() => onRemove(inq._id)}
            className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        {/* 3 columns: contact | project | note */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-3">
            <Field label="Email">
              <a
                href={`mailto:${inq.email}`}
                className="text-blue-700 hover:underline"
              >
                {inq.email}
              </a>
            </Field>
            <Field label="Phone">
              {inq.phone && (
                <a
                  href={`tel:${inq.phone.replace(/\s/g, "")}`}
                  className="text-blue-700 hover:underline"
                >
                  {inq.phone}
                </a>
              )}
            </Field>
          </div>

          <div className="space-y-3">
            <Field label="Project">{inq.projectName}</Field>
            <Field label="Total quantity">{inq.quantity}</Field>
            <Field label="Delivery location">{inq.deliveryLocation}</Field>
            <Field label="Required by">
              {inq.requiredBy && fmt(inq.requiredBy)}
            </Field>
          </div>

          <div>
            <Label>Internal note (only you see this)</Label>
            <div className="mt-1">
              <NotesCell
                inquiry={inq}
                onSaved={onNoteSaved}
                onError={onError}
              />
            </div>
          </div>
        </div>

        {/* Items: ek-ek karke */}
        <div>
          <p className="mb-2">
            <Label>
              Items requested{hasItems ? ` (${inq.items.length})` : ""}
            </Label>
          </p>
          {hasItems ? (
            <ol className="space-y-2">
              {inq.items.map((it, n) => (
                <li
                  key={n}
                  className="flex items-center gap-3 rounded-lg border bg-slate-50/60 p-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                    {n + 1}
                  </span>
                  {it.photo?.path && (
                    <ItemPhoto inquiryId={inq._id} index={n} name={it.name} />
                  )}
                  <p className="min-w-0 flex-1 break-words text-sm font-semibold text-slate-900">
                    {it.name}
                  </p>
                  {it.quantity && (
                    <span className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                      Qty: {it.quantity}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg border bg-slate-50/60 p-2.5 text-sm text-slate-700">
              {inq.productName || "No items listed"}
            </p>
          )}
        </div>

        {/* Message: lamba ho to apne andar scroll hoga, card lamba nahi hoga */}
        {inq.message && (
          <div>
            <p className="mb-1">
              <Label>Customer message</Label>
            </p>
            <p className="max-h-44 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border bg-amber-50/50 p-3 text-sm text-slate-800">
              {inq.message}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    contacted: 0,
    quoted: 0,
    closed: 0,
  });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const reqId = useRef(0);

  // Search: type rukne ke 400ms baad hi server ko poochho
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++reqId.current; // purane (der se aaye) response ignore karne ke liye
      if (!silent) setLoading(true);
      setError("");
      try {
        const d = await getInquiries({
          status: status || undefined,
          search: search || undefined,
          page,
          limit: LIMIT,
        });
        if (id !== reqId.current) return;
        setItems(d.items);
        setTotal(d.total);
        setPages(d.pages);
        setCounts(d.counts);
        if (page > d.pages) setPage(d.pages);
      } catch (e) {
        if (id === reqId.current) setError(errMsg(e));
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [status, search, page],
  );

  useEffect(() => {
    load();
  }, [load]);

  const pickStatus = (s) => {
    setStatus(s);
    setPage(1);
  };

  const changeStatus = async (id, next) => {
    try {
      await updateInquiryStatus(id, next);
      setItems((p) =>
        p.map((i) => (i._id === id ? { ...i, status: next } : i)),
      );
      load({ silent: true }); // counts aur filter dobara sahi ho jayein
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this inquiry? Its files will also be deleted."))
      return;
    try {
      await deleteInquiry(id);
      load({ silent: true });
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const noteSaved = (id, notes) =>
    setItems((p) => p.map((i) => (i._id === id ? { ...i, notes } : i)));

  const exportCsv = async () => {
    setExporting(true);
    try {
      await exportInquiriesCsv({
        status: status || undefined,
        search: search || undefined,
      });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setExporting(false);
    }
  };

  const cards = [
    { key: "", label: "All", n: counts.all },
    ...STATUSES.map((s) => ({ key: s, label: s, n: counts[s] })),
  ];
  const from = total ? (page - 1) * LIMIT + 1 : 0;
  const to = Math.min(page * LIMIT, total);

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">
          Inquiries ({total})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={exporting || total === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <Download size={14} /> {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Status summary: click karke filter */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => pickStatus(c.key)}
            className={`rounded-xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              status === c.key
                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                : "bg-white hover:border-blue-400"
            }`}
          >
            <p className="text-2xl font-extrabold text-slate-900">{c.n}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {c.label}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email, phone, company, item, project..."
          className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600"
        />
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-slate-500">
          {search || status
            ? "No inquiries match your search or filter."
            : "No inquiries yet."}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((i) => (
              <InquiryCard
                key={i._id}
                inq={i}
                onStatus={changeStatus}
                onRemove={remove}
                onNoteSaved={noteSaved}
                onError={setError}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              Showing {from}–{to} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span>
                Page {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Seo
        title={`Dashboard | ${company.name}`}
        description={`Your ${company.name} dashboard.`}
        noindex
      />
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome, {user.name}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {user.email} | {user.role}
      </p>
      {user.role === "admin" ? (
        <AdminInquiries />
      ) : (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <p className="text-slate-700">
            Browse our products and send a quotation request directly.
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}
