import React, { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  X, CheckSquare, Square, AlertCircle, CheckCircle2, AlertTriangle,
  Bell, Key, FileSignature, Plus, Eye, Calendar,
  DollarSign, Home, User, Phone, Clock, Upload, CreditCard, FileText,
  CheckCircle, ChevronDown, RefreshCw
} from "lucide-react";
import { 
  getAppointments, getDeposits, getOperations, getCustomers, getUsers,
  confirmHandover, confirmCheckout, finishCheckout, updateAppointment, updateDeposit
} from "../services/api";
import type { Appointment, Customer, Deposit, Employee, OperationCheckinItem, OperationCheckoutItem } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type KanbanColumnId = "showing" | "deposit" | "lease" | "payment" | "checkout";

interface KanbanCard {
  id: string;
  guestName: string;
  room: string;
  amount: number;
  priority: "High" | "Medium" | "Low";
  status: string;
  date: string;
  salesperson: string;
  phone: string;
  raw?: any; // To keep the original object for modal processing
}

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type ColCfg = {
  id: KanbanColumnId; step: number;
  label: string; sublabel: string;
  accent: string; light: string; text: string;
  group: "pre" | "ops";
};

const COLUMNS: ColCfg[] = [
  { id: "showing",  step: 1, label: "Lịch xem phòng",  sublabel: "Showing",  accent: "#7C3AED", light: "#F5F3FF", text: "#5B21B6", group: "pre" },
  { id: "deposit",  step: 2, label: "Đặt cọc",          sublabel: "Deposit",  accent: "#D97706", light: "#FFFBEB", text: "#92400E", group: "pre" },
  { id: "lease",    step: 3, label: "Hợp đồng thuê",    sublabel: "Lease",    accent: "#2563EB", light: "#EFF6FF", text: "#1E40AF", group: "pre" },
  { id: "payment",  step: 4, label: "Phiếu thanh toán", sublabel: "Payment",  accent: "#059669", light: "#ECFDF5", text: "#065F46", group: "ops" },
  { id: "checkout", step: 5, label: "Check-out",         sublabel: "Check-out",accent: "#DC2626", light: "#FEF2F2", text: "#991B1B", group: "ops" },
];

const PRIORITY_CFG = {
  High:   { dot: "#EF4444", label: "Cao",  bg: "#FEF2F2", text: "#B91C1C" },
  Medium: { dot: "#F59E0B", label: "TB",   bg: "#FFFBEB", text: "#92400E" },
  Low:    { dot: "#94A3B8", label: "Thấp", bg: "#F8FAFC", text: "#64748B" },
};

const ITEM_TYPE = "KANBAN_CARD";
type ViewMode = "all" | "pre" | "ops";

// ─────────────────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────────────────
function DepositModal({ card, onClose, onApprove }: { card: KanbanCard; onClose: () => void; onApprove: () => void }) {
  const [approved, setApproved] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-slate-900" style={{ fontWeight: 700 }}>Phê duyệt đặt cọc</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.guestName} · {card.room}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-500">Khách:</div><div style={{ fontWeight: 600 }}>{card.guestName}</div>
            <div className="text-slate-500">Phòng:</div><div style={{ fontWeight: 600 }}>{card.room}</div>
            <div className="text-slate-500">Số tiền:</div><div className="text-amber-700" style={{ fontWeight: 700 }}>{card.amount.toLocaleString()}đ</div>
            <div className="text-slate-500">Ngày:</div><div>{card.date}</div>
          </div>
          <textarea rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300" placeholder="Ghi chú phê duyệt..." />
          {approved && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 size={15} /> Đã phê duyệt!</div>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button onClick={() => { setApproved(true); setTimeout(() => { onApprove(); onClose(); }, 1200); }}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 flex items-center justify-center gap-1.5" style={{ fontWeight: 600 }}>
            <CheckCircle2 size={14} /> Phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
}

const CHECKIN_ITEMS = ["Giường ngủ", "Đệm / Gối", "Tủ quần áo", "Chìa khóa", "Điện kế", "Đồng hồ nước"];

function CheckinModal({ card, onClose, onSuccess }: { card: KanbanCard; onClose: () => void; onSuccess?: (c: KanbanCard) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const allChecked = CHECKIN_ITEMS.every(i => checked[i]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-slate-900" style={{ fontWeight: 700 }}>Bàn giao Check-in</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.guestName} · {card.room}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-3">
          {CHECKIN_ITEMS.map(item => (
            <button key={item} onClick={() => setChecked(p => ({ ...p, [item]: !p[item] }))}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${checked[item] ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:border-indigo-200"}`}>
              {checked[item] ? <CheckSquare size={16} className="text-emerald-500 flex-shrink-0" /> : <Square size={16} className="text-slate-300 flex-shrink-0" />}
              <span className={`text-sm ${checked[item] ? "line-through text-slate-400" : "text-slate-700"}`}>{item}</span>
            </button>
          ))}
          {done && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 size={15} /> Check-in thành công!</div>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button disabled={!allChecked} onClick={() => { setDone(true); setTimeout(() => { onSuccess?.(card); onClose(); }, 1200); }}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontWeight: 600 }}>
            Xác nhận Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KANBAN CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SlimCard({
  card, col, onAction, onAvatarClick
}: {
  card: KanbanCard; col: ColCfg;
  onAction: (c: KanbanCard) => void;
  onAvatarClick: (c: KanbanCard) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: card.id, fromColumn: col.id },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  drag(ref);

  const p        = PRIORITY_CFG[card.priority];
  const initials = card.guestName.trim().split(" ").slice(-2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl select-none cursor-grab active:cursor-grabbing p-3 mb-3 border border-slate-200 shadow-sm transition hover:shadow-md"
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      <div className="flex items-start gap-2.5">
        <button onClick={() => onAvatarClick(card)} className="flex-shrink-0 relative group/av">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: `linear-gradient(135deg,${col.accent}D0,${col.accent})`, fontWeight: 800, fontSize: "0.75rem" }}>
            {initials}
          </div>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="text-slate-900 truncate font-bold text-sm">{card.guestName}</div>
            <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: p.dot }} />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600">
              <Home size={9} />{card.room}
            </span>
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold" style={{ background: col.light, color: col.text }}>
              {card.status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
        <span className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar size={9} />{card.date}
        </span>
        <button onClick={() => onAction(card)}
          className="px-2 py-1 rounded-lg text-white text-[10px] font-bold"
          style={{ background: col.accent }}>
          Xử lý
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Workflows() {
  const [kanbanData, setKanbanData] = useState<Record<KanbanColumnId, KanbanCard[]>>({
    showing: [], deposit: [], lease: [], payment: [], checkout: []
  });
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [modalType, setModalType] = useState<"deposit" | "checkin" | "checkout" | "detail" | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, deps, ops, custs, users] = await Promise.all([
        getAppointments({ page: 0, size: 500 }),
        getDeposits({ page: 0, size: 500 }),
        getOperations(),
        getCustomers({ page: 0, size: 500 }),
        getUsers({ page: 0, size: 500 })
      ]);

      const customerMap = new Map(custs.data.map(c => [c.maKhachHang, c]));
      const userMap = new Map(users.data.map(u => [u.maNhanVien, u]));

      const newData: Record<KanbanColumnId, KanbanCard[]> = {
        showing: appts.data.map(a => ({
          id: a.maLichHen,
          guestName: customerMap.get(a.khachHangXem ?? "")?.hoTen ?? "Khách hàng",
          room: a.maPhong ?? "N/A",
          amount: 0,
          priority: "Medium",
          status: a.trangThaiHen ?? "Chờ",
          date: a.ngayHen ?? "",
          salesperson: userMap.get(a.nhanVienPhuTrach ?? "")?.hoTen ?? "N/A",
          phone: customerMap.get(a.khachHangXem ?? "")?.soDienThoai ?? "",
          raw: a
        })),
        deposit: deps.data.map(d => ({
          id: d.maHoSoDatCoc,
          guestName: customerMap.get(d.khachHangSoHuu ?? "")?.hoTen ?? "Khách hàng",
          room: "N/A",
          amount: Number(d.mucTienCoc ?? 0),
          priority: "High",
          status: "Chờ duyệt",
          date: d.ngayLap ?? "",
          salesperson: userMap.get(d.nhanVienLap ?? "")?.hoTen ?? "N/A",
          phone: customerMap.get(d.khachHangSoHuu ?? "")?.soDienThoai ?? "",
          raw: d
        })),
        lease: ops.checkins.filter(c => c.status === "Chờ bàn giao").map(c => ({
          id: c.id, guestName: c.tenant, room: c.room, amount: c.deposit, priority: "Medium",
          status: c.status, date: c.moveIn, salesperson: "N/A", phone: "", raw: c
        })),
        payment: ops.checkins.filter(c => c.status === "Đã bàn giao").map(c => ({
          id: c.id, guestName: c.tenant, room: c.room, amount: c.deposit, priority: "Low",
          status: "Đã bàn giao", date: c.moveIn, salesperson: "N/A", phone: "", raw: c
        })),
        checkout: ops.checkouts.map(c => ({
          id: c.id, guestName: c.tenant, room: c.room, amount: c.deposit, priority: "High",
          status: c.status, date: c.moveOut, salesperson: "N/A", phone: "", raw: c
        }))
      };

      setKanbanData(newData);
    } catch (err) {
      console.error("Failed to load kanban data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = (card: KanbanCard) => {
    setActiveCard(card);
    if (kanbanData.deposit.includes(card)) setModalType("deposit");
    else if (kanbanData.lease.includes(card)) setModalType("checkin");
    else setModalType("detail");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Quy trình vận hành</h1>
            <p className="text-sm text-slate-400 mt-0.5">Theo dõi luồng khách từ tìm kiếm đến Check-out</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => (
              <div key={col.id} className="w-72 flex flex-col bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between" style={{ background: col.light }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
                    <span className="font-bold text-sm" style={{ color: col.text }}>{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white/50 rounded-full text-[10px] font-bold" style={{ color: col.text }}>
                    {kanbanData[col.id].length}
                  </span>
                </div>
                <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
                  {loading ? (
                    <div className="text-center py-10 text-slate-300 text-xs italic">Đang tải...</div>
                  ) : (
                    kanbanData[col.id].map(card => (
                      <SlimCard key={card.id} card={card} col={col} onAction={handleAction} onAvatarClick={handleAction} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {modalType === "deposit" && activeCard && (
          <DepositModal card={activeCard} onClose={() => setModalType(null)} onApprove={loadData} />
        )}
        {modalType === "checkin" && activeCard && (
          <CheckinModal card={activeCard} onClose={() => setModalType(null)} onSuccess={loadData} />
        )}
      </div>
    </DndProvider>
  );
}
