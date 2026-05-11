import { type ElementType, useEffect, useMemo, useState } from "react";
import {
  ClipboardList, ArrowLeftRight, Home, Calendar, Check, X,
  CheckCircle, Send, FileSignature, Sparkles, BedDouble, Lock,
  BadgeCheck, Building2, SlidersHorizontal, Droplets, Wrench,
  AlertTriangle, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  getOperations, confirmHandover, confirmCheckout, finishCheckout,
  type OperationAsset, type OperationCheckinItem, type OperationCheckoutItem,
} from "../services/api";

// ── Theme ──────────────────────────────────────────────────────────────────
const INDIGO = "#4F46E5";
const ORANGE = "#EA580C";

// ── Types ──────────────────────────────────────────────────────────────────
type CheckinStatus  = "Chờ bàn giao" | "Đã bàn giao";
type CheckoutStatus = "Chờ thanh lý" | "Chờ đối soát" | "Đã đối soát" | "Đã đối soát và thanh lý" | "Đã trả phòng";
type ItemCondition  = OperationAsset["condition"];
type ChecklistItem  = OperationAsset;

// ── Status configs ─────────────────────────────────────────────────────────
const CHECKIN_STATUS: Record<CheckinStatus, { bg: string; dot: string; color: string }> = {
  "Chờ bàn giao": { bg: "#FFF7ED", dot: "#F97316", color: "#C2410C" },
  "Đã bàn giao":  { bg: "#F0FDF4", dot: "#22C55E", color: "#15803D" },
};

const CHECKOUT_STATUS: Record<CheckoutStatus, { bg: string; dot: string; color: string; label: string }> = {
  "Chờ thanh lý":            { bg: "#FFF7ED", dot: "#F97316", color: "#C2410C", label: "Chờ thanh lý" },
  "Chờ đối soát":            { bg: "#EEF2FF", dot: "#6366F1", color: "#4338CA", label: "Chờ đối soát" },
  "Đã đối soát":             { bg: "#F0FDF4", dot: "#059669", color: "#065F46", label: "Đã đối soát" },
  "Đã đối soát và thanh lý": { bg: "#F0FDF4", dot: "#059669", color: "#065F46", label: "Đã đối soát" },
  "Đã trả phòng":            { bg: "#F8FAFC", dot: "#94A3B8", color: "#475569", label: "Đã trả phòng" },
};

const ASSET_ICONS: Record<string, ElementType> = {
  "Giường": BedDouble, "Nệm": Sparkles,
  "Tủ đầu giường": Building2, "Chìa khóa/Thẻ từ": Lock,
};

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(v: number | null | undefined) {
  if (v == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
}

function fallbackAssets(): ChecklistItem[] {
  return [
    { asset: "Giường",          present: true, condition: "Tốt", notes: "" },
    { asset: "Nệm",             present: true, condition: "Tốt", notes: "" },
    { asset: "Tủ đầu giường",   present: true, condition: "Tốt", notes: "" },
    { asset: "Chìa khóa/Thẻ từ",present: true, condition: "Tốt", notes: "" },
  ];
}

function mapAssets(src: OperationAsset[] | null | undefined): ChecklistItem[] {
  return src && src.length > 0 ? src.map(a => ({ ...a })) : fallbackAssets();
}

// ── Shared UI ──────────────────────────────────────────────────────────────
function StatusBadge({ bg, dot, color, label }: { bg: string; dot: string; color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: bg, color, border: `1px solid ${dot}30` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
      {label}
    </span>
  );
}

function ConditionPill({ value, active, onClick }: { value: ItemCondition; active: boolean; onClick: () => void }) {
  const MAP: Record<ItemCondition, string> = { "Tốt": "#059669", "Bình thường": "#D97706", "Cần sửa chữa": "#DC2626" };
  const c = MAP[value];
  return (
    <button onClick={onClick} className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
      style={{ background: active ? c : "#F1F5F9", color: active ? "white" : "#94A3B8", border: `1.5px solid ${active ? c : "#E2E8F0"}` }}>
      {value}
    </button>
  );
}

function Pagination({ page, total, size, onChange }: { page: number; total: number; size: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60 text-xs text-slate-500">
      <span>{total} bản ghi · Trang {page}/{pages}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition">
          <ChevronLeft size={13} />
        </button>
        <button onClick={() => onChange(page + 1)} disabled={page >= pages}
          className="w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition">
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Check-in Tab ───────────────────────────────────────────────────────────
function CheckInTab({ rooms, onRefresh }: { rooms: OperationCheckinItem[]; onRefresh: () => void }) {
  const [open, setOpen]           = useState<OperationCheckinItem | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(fallbackAssets());
  const [note, setNote]           = useState("");
  const [done, setDone]           = useState(false);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | CheckinStatus>("Tất cả");
  const PAGE = 15;

  // Filter - áp dụng pattern từ SaleRequests (hoạt động tốt)
  const filtered = rooms.filter(r => {
    const matchesStatus = statusFilter === "Tất cả" ? true : r.status === statusFilter;
    const matchesSearch = 
      search === "" ||
      r.room.toLowerCase().includes(search.toLowerCase()) || 
      r.tenant.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const paged = filtered.slice((page - 1) * PAGE, page * PAGE);
  const allPresent = checklist.every(i => i.present);

  // Reset page khi filter thay đổi
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleStatus = (v: typeof statusFilter) => { setStatusFilter(v); setPage(1); };

  function openModal(r: OperationCheckinItem) {
    setOpen(r); setChecklist(mapAssets(r.assets)); setNote(""); setDone(false);
  }

  function updateItem(idx: number, field: keyof ChecklistItem, val: unknown) {
    setChecklist(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  async function handleConfirm() {
    if (!open) return;
    try {
      await confirmHandover({ id: open.id, room: open.room, assets: checklist, notes: note });
      setDone(true);
      setTimeout(() => { onRefresh(); setOpen(null); }, 1400);
    } catch (e: any) {
      const msg = e.response?.data?.message || "Lỗi khi lưu biên bản!";
      alert(msg);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Chờ bàn giao",  value: rooms.length,                                                                    color: INDIGO,   bg: "#EEF2FF" },
          { label: "Tổng cọc",      value: fmt(rooms.reduce((s, r) => s + (r.deposit ?? 0), 0)),                            color: "#059669", bg: "#ECFDF5" },
          { label: "Vào sớm nhất",  value: rooms[0]?.moveIn ?? "—",                                                         color: "#D97706", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Tìm phòng, khách thuê..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50 focus:bg-white" />
          </div>
          <select value={statusFilter} onChange={e => handleStatus(e.target.value as typeof statusFilter)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white text-slate-700 font-medium">
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Chờ bàn giao">Chờ bàn giao</option>
            <option value="Đã bàn giao">Đã bàn giao</option>
          </select>
          {(search || statusFilter !== "Tất cả") && (
            <button onClick={() => { handleSearch(""); handleStatus("Tất cả"); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition">
              Xóa lọc
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">{filtered.length} kết quả</span>
        </div>
        {filtered.length > 0 && <Pagination page={page} total={filtered.length} size={PAGE} onChange={setPage} />}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3 text-left">Phòng</th>
              <th className="px-5 py-3 text-left">Khách thuê</th>
              <th className="px-5 py-3 text-left">Loại</th>
              <th className="px-5 py-3 text-left">Ngày vào</th>
              <th className="px-5 py-3 text-left">Tiền cọc</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-800">{r.room}</td>
                <td className="px-5 py-3.5 text-slate-700">{r.tenant}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{r.roomType}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs">{r.moveIn}</td>
                <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(r.deposit)}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge {...CHECKIN_STATUS[r.status]} label={r.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => openModal(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                    style={{ background: INDIGO }}>
                    <ClipboardList size={12} /> Lập biên bản
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle size={28} className="mx-auto mb-2 text-emerald-300" />
            <p className="text-sm font-medium">Không có phòng nào chờ bàn giao</p>
          </div>
        )}
        {rooms.length > 0 && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm">Không tìm thấy kết quả phù hợp</p>
            <button onClick={() => { handleSearch(""); handleStatus("Tất cả"); }}
              className="mt-2 text-xs text-indigo-500 hover:underline">Xóa bộ lọc</button>
          </div>
        )}
      </div>

      {/* Modal bàn giao */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileSignature size={16} style={{ color: INDIGO }} /> Biên bản Bàn giao
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Phòng {open.room} · {open.tenant} · {open.moveIn}</p>
              </div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Info */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Loại phòng", value: open.roomType },
                  { label: "Ngày vào",   value: open.moveIn },
                  { label: "Tiền cọc",   value: fmt(open.deposit) },
                ].map(i => (
                  <div key={i.label} className="rounded-xl px-3 py-2.5 bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-400 mb-0.5">{i.label}</div>
                    <div className="text-sm font-bold text-slate-800">{i.value}</div>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Kiểm kê tài sản</p>
                <div className="space-y-2">
                  {checklist.map((item, idx) => {
                    const Icon = ASSET_ICONS[item.asset] || BedDouble;
                    return (
                      <div key={item.asset} className="rounded-xl border border-slate-100 bg-white overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3">
                          <button onClick={() => updateItem(idx, "present", !item.present)}
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition border-2"
                            style={{ background: item.present ? INDIGO : "white", borderColor: item.present ? INDIGO : "#CBD5E1" }}>
                            {item.present && <Check size={10} className="text-white" />}
                          </button>
                          <Icon size={14} className="flex-shrink-0 text-slate-400" />
                          <span className="flex-1 text-sm font-medium text-slate-700">{item.asset}</span>
                          {item.present ? (
                            <div className="flex gap-1">
                              {(["Tốt", "Bình thường", "Cần sửa chữa"] as ItemCondition[]).map(c => (
                                <ConditionPill key={c} value={c} active={item.condition === c} onClick={() => updateItem(idx, "condition", c)} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">Thiếu</span>
                          )}
                        </div>
                        {item.present && (
                          <div className="px-4 pb-3">
                            <input value={item.notes} onChange={e => updateItem(idx, "notes", e.target.value)}
                              placeholder="Ghi chú tình trạng..."
                              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 outline-none text-slate-600 placeholder-slate-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Ghi chú bổ sung</p>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="Ghi nhận thêm về tình trạng phòng..."
                  className="w-full text-sm px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none resize-none text-slate-700 placeholder-slate-300" />
              </div>

              {!allPresent && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                  <AlertTriangle size={13} className="flex-shrink-0" />
                  Có tài sản bị ghi nhận thiếu. Cần xử lý trước khi hoàn tất.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setOpen(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition">
                Hủy
              </button>
              <button onClick={handleConfirm} disabled={!allPresent || done}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: done ? "#059669" : INDIGO }}>
                {done ? <><CheckCircle size={14} /> Đã xác nhận</> : <><FileSignature size={14} /> Xác nhận bàn giao</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Check-out Tab ──────────────────────────────────────────────────────────
function CheckOutTab({ rooms, onRefresh }: { rooms: OperationCheckoutItem[]; onRefresh: () => void }) {
  const [open, setOpen]           = useState<OperationCheckoutItem | null>(null);
  const [assets, setAssets]       = useState<ChecklistItem[]>(fallbackAssets());
  const [clean, setClean]         = useState<"Tốt" | "Trung bình" | "Kém">("Tốt");
  const [damages, setDamages]     = useState("");
  const [penalty, setPenalty]     = useState(0);
  const [sent, setSent]           = useState(false);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | CheckoutStatus>("Tất cả");
  const PAGE = 15;

  // Filter - áp dụng pattern từ SaleRequests (hoạt động tốt)
  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const matchesStatus = statusFilter === "Tất cả" ? true : r.status === statusFilter;
      const matchesSearch = 
        search === "" ||
        r.room.toLowerCase().includes(search.toLowerCase()) || 
        r.tenant.toLowerCase().includes(search.toLowerCase()) || 
        r.id.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [rooms, search, statusFilter]);
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE, page * PAGE), [filtered, page]);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleStatus = (v: typeof statusFilter) => { setStatusFilter(v); setPage(1); };

  const depositAmt = open?.deposit ?? 0;
  const refundAmt  = Math.max(0, depositAmt - penalty);

  function openModal(r: OperationCheckoutItem) {
    setOpen(r);
    setAssets(mapAssets(r.assets));
    setClean("Tốt");
    setDamages("");
    setPenalty(0);
    setSent(r.status === "Chờ đối soát" || r.status === "Đã đối soát" || r.status === "Đã đối soát và thanh lý");
  }

  function updateAsset(idx: number, field: keyof ChecklistItem, val: unknown) {
    setAssets(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }

  async function handleSend() {
    if (!open) return;
    try {
      await confirmCheckout({ id: open.id, room: open.room, assets, cleanState: clean, damages, penalty });
      setSent(true);
      onRefresh();
    } catch (e: any) {
      const msg = e.response?.data?.message || "Lỗi khi gửi biên bản!";
      alert(msg);
    }
  }

  async function handleFinish(id: string) {
    if (!window.confirm("Xác nhận ký thanh lý và hoàn tất trả phòng?")) return;
    try {
      await finishCheckout(id);
      onRefresh();
      if (open?.id === id) setOpen(null);
    } catch { alert("Lỗi khi hoàn tất!"); }
  }

  const CLEAN_COLOR: Record<"Tốt" | "Trung bình" | "Kém", string> = {
    "Tốt": "#059669", "Trung bình": "#D97706", "Kém": "#DC2626",
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Chờ thanh lý",  value: rooms.filter(r => r.status === "Chờ thanh lý").length,                                                  color: ORANGE,   bg: "#FFF7ED" },
          { label: "Chờ đối soát",  value: rooms.filter(r => r.status === "Chờ đối soát").length,                                                  color: INDIGO,   bg: "#EEF2FF" },
          { label: "Đã đối soát",   value: rooms.filter(r => r.status === "Đã đối soát" || r.status === "Đã đối soát và thanh lý").length,         color: "#059669", bg: "#ECFDF5" },
          { label: "Tổng cọc",      value: fmt(rooms.reduce((s, r) => s + (r.deposit ?? 0), 0)),                                                    color: "#0891B2", bg: "#F0F9FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Tìm mã HĐ, phòng, khách thuê..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-slate-50 focus:bg-white" />
          </div>
          <select value={statusFilter} onChange={e => handleStatus(e.target.value as typeof statusFilter)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-orange-400 bg-slate-50 focus:bg-white text-slate-700 font-medium">
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Chờ thanh lý">Chờ thanh lý</option>
            <option value="Chờ đối soát">Chờ đối soát</option>
            <option value="Đã đối soát">Đã đối soát</option>
          </select>
          {(search || statusFilter !== "Tất cả") && (
            <button onClick={() => { handleSearch(""); handleStatus("Tất cả"); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition">
              Xóa lọc
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">{filtered.length} kết quả</span>
        </div>
        {filtered.length > 0 && <Pagination page={page} total={filtered.length} size={PAGE} onChange={setPage} />}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3 text-left">Hợp đồng</th>
              <th className="px-5 py-3 text-left">Khách thuê</th>
              <th className="px-5 py-3 text-left">Phòng / Loại</th>
              <th className="px-5 py-3 text-left">Ngày trả</th>
              <th className="px-5 py-3 text-left">Tiền cọc</th>
              <th className="px-5 py-3 text-left">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map((r, idx) => {
              const sc = CHECKOUT_STATUS[r.status] ?? CHECKOUT_STATUS["Chờ thanh lý"];
              const isDaDoiSoat = r.status === "Đã đối soát" || r.status === "Đã đối soát và thanh lý";
              const isChoDoiSoat = r.status === "Chờ đối soát";
              return (
                <tr key={`${r.id}-${r.room}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{r.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-700">{r.tenant}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-800">{r.room}</div>
                    <div className="text-xs text-slate-400">{r.roomType}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{r.moveOut}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(r.deposit)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge bg={sc.bg} dot={sc.dot} color={sc.color} label={sc.label} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isDaDoiSoat ? (
                      <button onClick={() => handleFinish(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ background: "#059669" }}>
                        <BadgeCheck size={12} /> Ký bàn giao
                      </button>
                    ) : isChoDoiSoat ? (
                      <span className="text-xs text-slate-400 italic">Đang đối soát...</span>
                    ) : (
                      <button onClick={() => openModal(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
                        style={{ background: "#FFF7ED", color: ORANGE, border: `1px solid #FED7AA` }}>
                        <SlidersHorizontal size={12} /> Lập biên bản
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <CheckCircle size={28} className="mx-auto mb-2 text-emerald-300" />
            <p className="text-sm font-medium">Không có hợp đồng nào cần thanh lý</p>
          </div>
        )}
        {rooms.length > 0 && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm">Không tìm thấy kết quả phù hợp</p>
            <button onClick={() => { handleSearch(""); handleStatus("Tất cả"); }}
              className="mt-2 text-xs text-orange-500 hover:underline">Xóa bộ lọc</button>
          </div>
        )}
      </div>

      {/* Modal thanh lý */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ArrowLeftRight size={16} style={{ color: ORANGE }} /> Biên bản Thanh lý
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">HĐ {open.id} · {open.tenant} · Trả {open.moveOut}</p>
              </div>
              <button onClick={() => setOpen(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Info */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Phòng",    value: open.room },
                  { label: "Ngày trả", value: open.moveOut },
                  { label: "Tiền cọc", value: fmt(open.deposit) },
                ].map(i => (
                  <div key={i.label} className="rounded-xl px-3 py-2.5 bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-400 mb-0.5">{i.label}</div>
                    <div className="text-sm font-bold text-slate-800">{i.value}</div>
                  </div>
                ))}
              </div>

              {/* Tài sản */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Tình trạng tài sản</p>
                <div className="space-y-2">
                  {assets.map((item, idx) => {
                    const Icon = ASSET_ICONS[item.asset] || BedDouble;
                    return (
                      <div key={item.asset} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Icon size={14} className="flex-shrink-0 text-slate-400" />
                        <span className="flex-1 text-sm font-medium text-slate-700">{item.asset}</span>
                        <div className="flex gap-1">
                          {(["Tốt", "Bình thường", "Cần sửa chữa"] as ItemCondition[]).map(c => (
                            <ConditionPill key={c} value={c} active={item.condition === c} onClick={() => updateAsset(idx, "condition", c)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vệ sinh */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Vệ sinh phòng</p>
                <div className="flex gap-2">
                  {(["Tốt", "Trung bình", "Kém"] as const).map(c => (
                    <button key={c} onClick={() => setClean(c)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition"
                      style={{
                        background: clean === c ? CLEAN_COLOR[c] : "#F8FAFC",
                        color: clean === c ? "white" : "#64748B",
                        border: `1.5px solid ${clean === c ? CLEAN_COLOR[c] : "#E2E8F0"}`,
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hư hỏng */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Hư hỏng / Mất mát</p>
                <textarea value={damages} onChange={e => setDamages(e.target.value)} rows={2}
                  placeholder="Mô tả hư hỏng, đồ thiếu..."
                  className="w-full text-sm px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 outline-none resize-none text-slate-700 placeholder-slate-300" />
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs font-medium text-slate-500 whitespace-nowrap">Phụ phí (₫):</label>
                  <input type="number" value={penalty} onChange={e => setPenalty(Number(e.target.value) || 0)}
                    className="flex-1 text-sm font-semibold px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 outline-none text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>

              {/* Tổng kết */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tổng kết tài chính
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-slate-500">Tiền cọc gốc</span>
                    <span className="font-semibold text-slate-800">{fmt(depositAmt)}</span>
                  </div>
                  {open.netAmount != null ? (
                    <div className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-slate-500">Kế toán chốt</span>
                      <span className="font-semibold text-blue-600">{fmt(open.netAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-slate-500">Khấu trừ dự kiến</span>
                      <span className="font-semibold text-red-500">− {fmt(penalty)}</span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-3 bg-emerald-50/50">
                    <span className="text-sm font-bold text-slate-700">
                      {(open.netAmount ?? refundAmt) < 0 ? "Khách cần nộp thêm" : "Hoàn lại khách"}
                    </span>
                    <span className="text-base font-bold" style={{ color: (open.netAmount ?? refundAmt) < 0 ? "#DC2626" : "#059669" }}>
                      {fmt(Math.abs(open.netAmount ?? refundAmt))}
                    </span>
                  </div>
                </div>
              </div>

              {sent && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                  <BadgeCheck size={13} className="flex-shrink-0" />
                  Đã chuyển kế toán xử lý. Đang chờ đối soát số liệu...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setOpen(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition">
                Đóng
              </button>
              <button onClick={handleSend} disabled={sent}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
                style={{ background: sent ? "#059669" : ORANGE }}>
                {sent ? <><BadgeCheck size={14} /> Đã chuyển kế toán</> : <><Send size={14} /> Chuyển kế toán đối soát</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Operations() {
  const [tab, setTab]           = useState<"checkin" | "checkout">("checkin");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [checkins, setCheckins] = useState<OperationCheckinItem[]>([]);
  const [checkouts, setCheckouts] = useState<OperationCheckoutItem[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getOperations();
      setCheckins(data.checkins ?? []);
      setCheckouts(data.checkouts ?? []);
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || "Không tải được dữ liệu";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const TABS = [
    { id: "checkin"  as const, label: "Bàn giao (Check-in)",  icon: ClipboardList,  count: checkins.length,  color: INDIGO },
    { id: "checkout" as const, label: "Thanh lý (Check-out)", icon: ArrowLeftRight, count: checkouts.length, color: ORANGE },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bàn giao & Thanh lý</h1>
          <p className="text-sm text-slate-400 mt-0.5">Quản lý biên bản bàn giao phòng và quy trình thanh lý hợp đồng</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.id ? "border-current" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            style={{ color: tab === t.id ? t.color : undefined, borderColor: tab === t.id ? t.color : undefined }}>
            <t.icon size={15} />
            {t.label}
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: tab === t.id ? `${t.color}15` : "#F1F5F9", color: tab === t.id ? t.color : "#94A3B8" }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw size={20} className="animate-spin mr-2" /> Đang tải dữ liệu...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600">
          <AlertTriangle size={16} className="flex-shrink-0" />
          {error}
          <button onClick={load} className="ml-auto text-xs font-semibold underline">Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {tab === "checkin"  && <CheckInTab  rooms={checkins}  onRefresh={load} />}
          {tab === "checkout" && <CheckOutTab rooms={checkouts} onRefresh={load} />}
        </>
      )}
    </div>
  );
}
