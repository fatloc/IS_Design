import { useState, useRef, useEffect, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  X, CheckSquare, Square, AlertCircle, CheckCircle2, AlertTriangle,
  Bell, Key, FileSignature, Plus, Eye, ChevronRight, Calendar,
  DollarSign, Home, User, ArrowRight, MoreHorizontal,
  Phone, Clock, Upload, CreditCard, FileText, AlertOctagon,
  CheckCircle, ChevronDown, RotateCcw,
} from "lucide-react";
import { KanbanCard, KanbanColumnId } from "../data/mockData";
import {
  getAppointments, getDeposits, getContracts, getTransactions,
  getCustomers, getUsers,
} from "../services/api";
import type { Appointment, Customer, Employee } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — map API data → KanbanCard
// ─────────────────────────────────────────────────────────────────────────────
function guessPriority(date: string | null | undefined): "High" | "Medium" | "Low" {
  if (!date) return "Medium";
  const diff = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diff < 2) return "High";
  if (diff < 7) return "Medium";
  return "Low";
}

function customerName(
  id: string | null | undefined,
  customerMap: Map<string, Customer>,
  employeeMap: Map<string, Employee>,
): string {
  if (!id) return "Khách hàng";
  return customerMap.get(id)?.hoTen ?? employeeMap.get(id)?.hoTen ?? id;
}

function customerPhone(
  id: string | null | undefined,
  customerMap: Map<string, Customer>,
): string {
  if (!id) return "";
  return customerMap.get(id)?.soDienThoai ?? "";
}

function employeeName(
  id: string | null | undefined,
  employeeMap: Map<string, Employee>,
): string {
  if (!id) return "—";
  return employeeMap.get(id)?.hoTen ?? id;
}

async function loadKanbanData(
  customerMap: Map<string, Customer>,
  employeeMap: Map<string, Employee>,
): Promise<Record<KanbanColumnId, KanbanCard[]>> {
  const [apptRes, depositRes, contractRes, txRes] = await Promise.all([
    getAppointments({ page: 0, size: 200 }),
    getDeposits({ page: 0, size: 200 }),
    getContracts({ page: 0, size: 200 }),
    getTransactions({ page: 0, size: 200 }),
  ]);

  // showing — appointments with status Pending / Scheduled / Shown
  const showing: KanbanCard[] = (apptRes.data ?? [])
    .filter(a => ["Chờ xác nhận", "Đã lên lịch", "Đã xem", "Pending", "Scheduled", "Shown"].includes(a.trangThaiHen ?? ""))
    .map(a => ({
      id: a.maLichHen,
      guestName: customerName(a.khachHangXem, customerMap, employeeMap),
      room: "—",
      amount: 0,
      priority: guessPriority(a.ngayHen),
      status: a.trangThaiHen ?? "Chờ xác nhận",
      date: a.ngayHen ?? new Date().toISOString().slice(0, 10),
      salesperson: employeeName(a.nhanVienPhuTrach, employeeMap),
      phone: customerPhone(a.khachHangXem, customerMap),
    }));

  // deposit — hồ sơ đặt cọc chưa duyệt
  const deposit: KanbanCard[] = (depositRes.data ?? [])
    .map(d => ({
      id: d.maHoSoDatCoc ?? d.maVanBan,
      guestName: customerName(d.khachHangSoHuu, customerMap, employeeMap),
      room: "—",
      amount: Number(d.mucTienCoc ?? 0),
      priority: guessPriority(d.ngayLap),
      status: "Chờ duyệt",
      date: d.ngayLap ?? new Date().toISOString().slice(0, 10),
      salesperson: employeeName(d.nhanVienLap, employeeMap),
      phone: customerPhone(d.khachHangSoHuu, customerMap),
    }));

  // lease — hợp đồng đang hiệu lực
  const lease: KanbanCard[] = (contractRes.data ?? [])
    .map(c => ({
      id: c.maHopDongThue ?? c.maVanBan,
      guestName: customerName(c.khachHangSoHuu, customerMap, employeeMap),
      room: "—",
      amount: 0,
      priority: guessPriority(c.ngayLap),
      status: c.hinhThucThue ?? "Đang ký",
      date: c.ngayLap ?? new Date().toISOString().slice(0, 10),
      salesperson: employeeName(c.nhanVienLap, employeeMap),
      phone: customerPhone(c.khachHangSoHuu, customerMap),
    }));

  // payment — phiếu thanh toán chờ xử lý
  const payment: KanbanCard[] = (txRes.data ?? [])
    .filter(t => ["Cho xu ly", "Chờ xử lý", "Pending"].includes(t.trangThai ?? ""))
    .map(t => ({
      id: t.maPhieuThanhToan,
      guestName: "Khách hàng",
      room: "—",
      amount: 0,
      priority: guessPriority(t.ngayGiaoDich),
      status: t.trangThai ?? "Chờ TT",
      date: t.ngayGiaoDich ?? new Date().toISOString().slice(0, 10),
      salesperson: employeeName(t.keToanLapPhieu, employeeMap),
      phone: "",
    }));

  // checkout — phiếu thanh toán hoàn trả / thanh lý
  const checkout: KanbanCard[] = (txRes.data ?? [])
    .filter(t => ["Hoan tra", "Thanh ly", "Checkout"].includes(t.loaiGiaoDich ?? ""))
    .map(t => ({
      id: `co-${t.maPhieuThanhToan}`,
      guestName: "Khách hàng",
      room: "—",
      amount: 0,
      priority: guessPriority(t.ngayGiaoDich),
      status: "Chờ CK",
      date: t.ngayGiaoDich ?? new Date().toISOString().slice(0, 10),
      salesperson: employeeName(t.keToanLapPhieu, employeeMap),
      phone: "",
    }));

  return { showing, deposit, lease, payment, checkout };
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
            <div className="text-xs text-slate-400 mt-0.5">{card.guestName} · Phòng {card.room}</div>
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
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="rounded" defaultChecked />
            <Bell size={12} /> Gửi thông báo cho Kế toán
          </label>
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
            <div className="text-xs text-slate-400 mt-0.5">{card.guestName} · Phòng {card.room}</div>
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
          <div className="grid grid-cols-2 gap-3 pt-1">
            {["Chỉ số điện", "Chỉ số nước"].map(l => (
              <div key={l}><label className="text-xs text-slate-500 mb-1 block">{l}</label>
                <input defaultValue="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div>
            ))}
          </div>
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

function CheckoutModal({ card, onClose }: { card: KanbanCard; onClose: () => void }) {
  const [damages, setDamages] = useState<Record<string, string>>({});
  const [keyReturned, setKeyReturned] = useState(false);
  const [signed, setSigned] = useState(false);
  const [vacant, setVacant] = useState(false);
  if (vacant) return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={36} className="text-emerald-500" /></div>
        <div className="text-emerald-700 mb-2" style={{ fontWeight: 700 }}>Check-out hoàn tất!</div>
        <p className="text-sm text-slate-500 mb-6">Phòng {card.room} đã được cập nhật thành "Phòng trống"</p>
        <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800">Đóng</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-slate-900" style={{ fontWeight: 700 }}>Check-out & Thanh lý</div>
            <div className="text-xs text-slate-400 mt-0.5">{card.guestName} · Phòng {card.room}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {CHECKIN_ITEMS.map(item => (
              <div key={item} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200">
                <span className="text-sm text-slate-700 w-28 flex-shrink-0">{item}</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-lg">Tốt</span>
                <input placeholder="Ghi chú hư hỏng..." value={damages[item] || ""} onChange={e => setDamages(p => ({ ...p, [item]: e.target.value }))}
                  className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-300" />
              </div>
            ))}
          </div>
          {Object.values(damages).some(d => d.trim()) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><AlertTriangle size={13} className="text-amber-600" /><span className="text-sm text-amber-700" style={{ fontWeight: 600 }}>Hư hỏng cần báo Kế toán</span></div>
              {Object.entries(damages).filter(([, v]) => v.trim()).map(([k, v]) => <div key={k} className="text-xs text-amber-600">• {k}: {v}</div>)}
            </div>
          )}
          <button onClick={() => setKeyReturned(p => !p)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition ${keyReturned ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
            <Key size={15} className={keyReturned ? "text-emerald-600" : "text-slate-400"} />
            <span className="text-sm text-slate-700">Đã thu hồi chìa khóa / thẻ từ</span>
            {keyReturned ? <CheckSquare size={15} className="ml-auto text-emerald-500" /> : <Square size={15} className="ml-auto text-slate-300" />}
          </button>
          <button disabled={!keyReturned} onClick={() => setSigned(true)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm transition ${signed ? "border-indigo-300 bg-indigo-50 text-indigo-700" : keyReturned ? "border-indigo-300 hover:bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-300 cursor-not-allowed"}`}>
            <FileSignature size={15} />{signed ? "✓ Đã ký biên bản thanh lý" : "Ký biên bản thanh lý"}
          </button>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button disabled={!keyReturned || !signed} onClick={() => setVacant(true)}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontWeight: 600 }}>
            Cập nhật: Phòng trống
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────
function ToastNotification({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  return (
    <div className="fixed top-5 left-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg,#064E3B 0%,#065F46 100%)",
        minWidth: 360,
        boxShadow: "0 20px 60px rgba(6,78,59,0.35),0 0 0 1px rgba(255,255,255,0.08)",
        animation: "slideDownToast 0.35s cubic-bezier(.21,1.02,.73,1) forwards",
      }}>
      <style>{`@keyframes slideDownToast{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.13)" }}>
        <CheckCircle2 size={18} className="text-emerald-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Check-in thành công!</div>
        <div className="text-emerald-300 truncate" style={{ fontSize: "0.74rem" }}>
          Phiếu thanh toán đã được tạo cho&nbsp;
          <span style={{ fontWeight: 700, color: "#A7F3D0" }}>{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: "rgba(255,255,255,0.10)" }}>
          <DollarSign size={11} className="text-emerald-300" />
          <span className="text-emerald-200" style={{ fontSize: "0.7rem", fontWeight: 600 }}>Phiếu TT</span>
        </div>
        <button onClick={onDismiss} className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <X size={12} className="text-emerald-300" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT INVOICE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PaymentInvoiceModal({ card, isNew, onClose, onConfirm }: {
  card: KanbanCard; isNew: boolean; onClose: () => void; onConfirm: () => void;
}) {
  const payCol = COLUMNS.find(c => c.id === "payment")!;
  const monthlyRent = card.amount;
  const deposit     = monthlyRent * 2;
  const serviceFee  = 200_000;
  const total       = deposit + monthlyRent + serviceFee;
  const [confirming, setConfirming] = useState(false);
  const [confirmed,  setConfirmed]  = useState(false);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => { setConfirmed(true); setTimeout(() => { onConfirm(); onClose(); }, 900); }, 600);
  };

  const LineItem = ({ label, amount, sub, accent }: { label: string; amount: number; sub?: string; accent?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-slate-700" style={{ fontSize: "0.83rem", fontWeight: 500 }}>{label}</div>
        {sub && <div className="text-slate-400" style={{ fontSize: "0.7rem" }}>{sub}</div>}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: accent || "#1E293B" }}>
        {amount.toLocaleString("vi-VN")}đ
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full flex flex-col relative overflow-hidden"
        style={{ maxWidth: 480, boxShadow: "0 32px 80px rgba(0,0,0,0.28),0 0 0 1px rgba(0,0,0,0.06)" }}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: payCol.light, borderBottom: `2px solid ${payCol.accent}28` }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: payCol.accent }}>
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-900" style={{ fontWeight: 800, fontSize: "1rem" }}>Chi tiết hóa đơn</span>
                {isNew && (
                  <span className="px-2 py-0.5 rounded-full text-white"
                    style={{ background: payCol.accent, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                    MỚI
                  </span>
                )}
              </div>
              <div className="text-slate-500 mt-0.5" style={{ fontSize: "0.75rem" }}>
                Phiếu thanh toán ban đầu · Phòng {card.room}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.06)" }}>
            <X size={15} className="text-slate-500" />
          </button>
        </div>

        {/* Resident strip */}
        <div className="px-6 py-3.5 flex items-center gap-3 border-b border-slate-100 flex-shrink-0"
          style={{ background: "#FAFAFA" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: payCol.accent, fontWeight: 700, fontSize: "0.75rem" }}>
            {card.guestName.trim().split(" ").slice(-2).map((w: string) => w[0]).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-900 truncate" style={{ fontWeight: 700, fontSize: "0.88rem" }}>{card.guestName}</div>
            <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: "0.72rem" }}>
              <Home size={10} />&nbsp;Phòng {card.room}
              {card.phone && <><span>·</span><Phone size={10} />&nbsp;{card.phone}</>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-slate-400" style={{ fontSize: "0.68rem" }}>Ngày check-in</div>
            <div className="text-slate-700" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{card.date}</div>
          </div>
        </div>

        {/* Invoice lines */}
        <div className="px-6 py-4 flex-shrink-0">
          <div className="text-slate-400 mb-0.5" style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Chi tiết khoản thanh toán
          </div>
          <LineItem label="Tiền đặt cọc" amount={deposit}
            sub={`2 tháng × ${monthlyRent.toLocaleString("vi-VN")}đ`} />
          <LineItem label="Tiền thuê tháng đầu" amount={monthlyRent}
            sub={`Kỳ: ${card.date.slice(0, 7).replace("-", "/")}`} />
          <LineItem label="Phí dịch vụ & quản lý" amount={serviceFee}
            sub="Điện · Nước · Internet · Bảo vệ" accent="#64748B" />
          {/* Total */}
          <div className="mt-4 rounded-2xl p-4 flex items-center justify-between"
            style={{ background: payCol.light, border: `1.5px solid ${payCol.accent}30` }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: payCol.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Tổng thanh toán ban đầu
              </div>
              <div className="text-slate-400 mt-0.5" style={{ fontSize: "0.68rem" }}>Đặt cọc + Tháng đầu + Phí DV</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.3rem", color: payCol.accent }}>
              {total.toLocaleString("vi-VN")}đ
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
            <CreditCard size={13} className="text-slate-400 flex-shrink-0" />
            <span className="text-slate-500" style={{ fontSize: "0.75rem" }}>
              Hình thức TT:&nbsp;<span style={{ fontWeight: 600, color: "#1E293B" }}>Chuyển khoản / Tiền mặt</span>
            </span>
          </div>
        </div>

        {/* Success overlay */}
        {confirmed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(255,255,255,0.97)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: payCol.light }}>
              <CheckCircle2 size={34} style={{ color: payCol.accent }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1E293B" }}>Đã xác nhận thanh toán!</div>
            <div className="text-slate-500 mt-1" style={{ fontSize: "0.82rem" }}>{total.toLocaleString("vi-VN")}đ · {card.guestName}</div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0" style={{ background: "#FAFAFA" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-white transition"
            style={{ fontWeight: 500, color: "#475569" }}>Đóng</button>
          <button onClick={handleConfirm} disabled={confirming}
            className="flex-1 py-2.5 rounded-xl text-sm text-white flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition"
            style={{ background: confirming ? "#6EE7B7" : payCol.accent, fontWeight: 700 }}
            onMouseEnter={e => !confirming && ((e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.filter = "")}>
            {confirming
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />&nbsp;Đang xử lý...</>
              : <><CheckCircle2 size={14} />&nbsp;Xác nhận thanh toán</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER DETAIL SLIDE-OVER PANEL
// ─────────────────────────────────────────────────────────────────────────────
type DetailTab = "info" | "history" | "docs";

function InfoRow({ icon, label, value, highlight, mono }: {
  icon: React.ReactNode; label: string; value: string; highlight?: string; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="w-5 flex-shrink-0" style={{ color: "#94A3B8" }}>{icon}</div>
      <div style={{ fontSize: "0.74rem", fontWeight: 500, color: "#94A3B8", minWidth: 104, flexShrink: 0 }}>{label}</div>
      <div className="flex-1 text-right truncate"
        style={{
          fontSize: "0.8rem", fontWeight: highlight ? 700 : 600,
          color: highlight || "#1E293B",
          fontFamily: mono ? "monospace" : "inherit",
          letterSpacing: mono ? "0.05em" : "inherit",
        }}>
        {value}
      </div>
    </div>
  );
}

function DetailSection({ label, accent, children }: { label: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div className="px-4 py-2.5 flex items-center gap-2 border-b border-slate-50" style={{ background: "#FAFAFA" }}>
        <div className="w-1 h-3.5 rounded-full flex-shrink-0" style={{ background: accent }} />
        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>{label}</span>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

function CustomerDetailSlideOver({ card, col, onClose }: { card: KanbanCard; col: ColCfg; onClose: () => void }) {
  const [tab, setTab] = useState<DetailTab>("info");
  const p        = PRIORITY_CFG[card.priority];
  const initials = card.guestName.trim().split(" ").slice(-2).map((w: string) => w[0]).join("").toUpperCase();

  const femaleMarkers = ["Thị","Phương","Lan","Hoa","Mai","Loan","Hà","Linh","Anh","Oanh","Như","Châu","Mỹ","Vy","Kiều","Yến"];
  const isFemale  = femaleMarkers.some(m => card.guestName.includes(m));
  const gender    = isFemale ? "Nữ" : "Nam";
  const deposit   = card.amount * 2;
  const total     = deposit + card.amount + 200_000;
  const contractEnd = (() => { const d = new Date(card.date); d.setMonth(d.getMonth() + 6); return d.toISOString().slice(0, 10); })();
  const cccd = `07${card.id.replace(/\D/g, "").padEnd(10, "0").slice(0, 10)}`;

  const HISTORY = [
    { date: card.date, icon: "🟢", action: `Tạo hồ sơ tại cột "${col.label}"`,            person: card.salesperson },
    { date: card.date, icon: "📞", action: "Liên hệ qua điện thoại — khách đã xác nhận",   person: card.salesperson },
    { date: card.date, icon: "📝", action: "Cập nhật thông tin phòng & yêu cầu đặc biệt",  person: "Hệ thống"       },
  ];
  const DOCS = [
    { name: "CCCD Mặt trước.jpg", size: "1.2 MB", status: "ok"      },
    { name: "CCCD Mặt sau.jpg",   size: "980 KB",  status: "ok"      },
    { name: "Hợp đồng thuê.pdf",  size: "—",       status: "missing" },
  ];

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-[70]"
        style={{ background: "rgba(15,23,42,0.42)", backdropFilter: "blur(3px)" }}
        onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[75] flex flex-col bg-white"
        style={{ width: 380, boxShadow: "-24px 0 60px rgba(0,0,0,0.18)", animation: "slideInRight 0.22s cubic-bezier(.21,1.02,.73,1) forwards" }}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

        {/* Header */}
        <div className="flex-shrink-0 px-5 py-5" style={{ background: col.light, borderBottom: `2px solid ${col.accent}20` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg,${col.accent}E0,${col.accent})`, fontSize: "1.1rem", fontWeight: 800, boxShadow: `0 8px 20px ${col.accent}40` }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1E293B", lineHeight: 1.2 }}>{card.guestName}</div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md"
                    style={{ background: "white", border: `1px solid ${col.accent}30`, fontSize: "0.72rem", fontWeight: 700, color: col.text }}>
                    <Home size={10} /> {card.room}
                  </span>
                  <span className="px-2 py-0.5 rounded-md"
                    style={{ background: p.bg, color: p.text, border: `1px solid ${p.dot}30`, fontSize: "0.7rem", fontWeight: 700 }}>
                    {p.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-white"
                    style={{ background: col.accent, fontSize: "0.68rem", fontWeight: 700 }}>
                    {col.sublabel}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition"
              style={{ background: "rgba(0,0,0,0.07)" }}>
              <X size={14} className="text-slate-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.65)" }}>
            {([{ id: "info", label: "Thông tin" }, { id: "history", label: "Lịch sử" }, { id: "docs", label: "Tài liệu" }] as { id: DetailTab; label: string }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-1.5 rounded-lg transition text-center"
                style={{ background: tab === t.id ? col.accent : "transparent", color: tab === t.id ? "white" : "#64748B", fontWeight: tab === t.id ? 700 : 500, fontSize: "0.75rem" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-4 space-y-3" style={{ scrollbarWidth: "none" }}>
          {tab === "info" && (
            <>
              <DetailSection label="Liên hệ" accent={col.accent}>
                <InfoRow icon={<Phone size={13} />}    label="Điện thoại"  value={card.phone || "Chưa cập nhật"} />
                <InfoRow icon={<User size={13} />}     label="Giới tính"   value={gender} />
                <InfoRow icon={<FileText size={13} />} label="Số CCCD"     value={cccd} mono />
              </DetailSection>
              <DetailSection label="Tài chính" accent={col.accent}>
                <InfoRow icon={<DollarSign size={13} />} label="Tiền thuê/tháng" value={`${card.amount.toLocaleString("vi-VN")}đ`} highlight={col.accent} />
                <InfoRow icon={<DollarSign size={13} />} label="Đặt cọc (2T)"    value={`${deposit.toLocaleString("vi-VN")}đ`} />
                <InfoRow icon={<DollarSign size={13} />} label="Tổng ban đầu"    value={`${total.toLocaleString("vi-VN")}đ`} highlight={col.accent} />
              </DetailSection>
              <DetailSection label="Hợp đồng" accent={col.accent}>
                <InfoRow icon={<Calendar size={13} />} label="Ngày bắt đầu"  value={card.date} />
                <InfoRow icon={<Calendar size={13} />} label="Ngày kết thúc" value={contractEnd} />
                <InfoRow icon={<Clock size={13} />}    label="Thời hạn"      value="6 tháng" />
              </DetailSection>
              <DetailSection label="Phân công" accent={col.accent}>
                <InfoRow icon={<User size={13} />} label="Nhân viên Sale" value={card.salesperson} />
                <InfoRow icon={<Home size={13} />} label="Trạng thái"     value={card.status} />
              </DetailSection>
            </>
          )}

          {tab === "history" && (
            <div className="space-y-0.5">
              {HISTORY.map((h, i) => (
                <div key={i} className="flex gap-3 py-3.5 px-1"
                  style={{ borderBottom: i < HISTORY.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "#F8FAFC" }}>{h.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E293B", lineHeight: 1.3 }}>{h.action}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>{h.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                      <span style={{ fontSize: "0.7rem", color: col.text, fontWeight: 600 }}>{h.person}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 text-center" style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>— Hết lịch sử —</div>
            </div>
          )}

          {tab === "docs" && (
            <div className="space-y-2.5">
              {DOCS.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border"
                  style={{ borderColor: doc.status === "ok" ? "#D1FAE5" : "#FED7D7", background: doc.status === "ok" ? "#F0FDF4" : "#FFF5F5" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: doc.status === "ok" ? "#D1FAE5" : "#FEE2E2" }}>
                    <FileText size={15} style={{ color: doc.status === "ok" ? "#059669" : "#DC2626" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E293B" }}>{doc.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>{doc.size}</div>
                  </div>
                  {doc.status === "ok"
                    ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                    : <button className="px-2 py-1 rounded-lg flex items-center gap-1"
                        style={{ background: "#FECACA", color: "#DC2626", fontWeight: 600, fontSize: "0.7rem" }}>
                        <Upload size={10} /> Tải lên
                      </button>
                  }
                </div>
              ))}
              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed mt-1 transition hover:bg-slate-50"
                style={{ borderColor: col.accent + "50", color: col.text, fontSize: "0.8rem", fontWeight: 600 }}>
                <Upload size={13} /> Tải thêm tài liệu
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-white transition"
              style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569" }}>Đóng</button>
            <button className="flex-1 py-2.5 rounded-xl text-white transition"
              style={{ background: col.accent, fontSize: "0.82rem", fontWeight: 700 }}>Chỉnh sửa</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIM CARD — compact format, avatar click → detail slide-over
// ─────────────────────────────────────────────────────────────────────────────
function SlimCard({
  card, col, onDepositApprove, onCheckin, onCheckout, isNew,
  onViewInvoice, onConfirmPayment, onAvatarClick,
}: {
  card: KanbanCard; col: ColCfg;
  onDepositApprove: (c: KanbanCard) => void;
  onCheckin: (c: KanbanCard) => void;
  onCheckout: (c: KanbanCard) => void;
  isNew?: boolean;
  onViewInvoice?: (c: KanbanCard) => void;
  onConfirmPayment?: (c: KanbanCard) => void;
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
  const invoiceTotal = card.amount * 2 + card.amount + 200_000;

  return (
    <div
      ref={ref}
      className="bg-white rounded-xl select-none cursor-grab active:cursor-grabbing"
      style={{
        opacity: isDragging ? 0.28 : 1,
        transform: isDragging ? "scale(0.95) rotate(1.5deg)" : "",
        border: isNew ? `1.5px solid ${col.accent}` : "1px solid #E8EDF3",
        boxShadow: isNew
          ? `0 0 0 3px ${col.accent}18, 0 4px 16px rgba(0,0,0,0.09)`
          : "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, transform 0.12s",
      }}
      onMouseEnter={e => { if (!isDragging) (e.currentTarget as HTMLDivElement).style.boxShadow = isNew ? `0 0 0 3px ${col.accent}25, 0 8px 24px rgba(0,0,0,0.13)` : "0 4px 8px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.10)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = isNew ? `0 0 0 3px ${col.accent}18, 0 4px 16px rgba(0,0,0,0.09)` : "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)"; }}
    >
      {/* "New" pulse banner */}
      {isNew && col.id === "payment" && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-xl"
          style={{ background: col.light, borderBottom: `1px solid ${col.accent}20` }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: col.accent }} />
          <span style={{ fontSize: "0.67rem", fontWeight: 700, color: col.text, letterSpacing: "0.04em" }}>MỚI — Chờ xác nhận thanh toán</span>
        </div>
      )}

      {/* Main body */}
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex items-start gap-2.5">
          {/* Clickable Avatar — primary interaction element */}
          <button
            onClick={e => { e.stopPropagation(); onAvatarClick(card); }}
            className="flex-shrink-0 relative group/av"
            title="Xem hồ sơ khách"
            style={{ outline: "none" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all"
              style={{
                background: `linear-gradient(135deg,${col.accent}D0,${col.accent})`,
                fontWeight: 800, fontSize: "0.75rem",
                boxShadow: `0 3px 8px ${col.accent}35`,
              }}>
              {initials}
            </div>
            {/* Focus ring on hover */}
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover/av:opacity-100 transition-opacity"
              style={{ boxShadow: `0 0 0 2.5px ${col.accent}` }} />
            {/* Eye hint badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full items-center justify-center hidden group-hover/av:flex"
              style={{ background: col.accent }}>
              <Eye size={7} className="text-white" />
            </div>
          </button>

          {/* Name + Room + Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <div className="text-slate-900 truncate" style={{ fontWeight: 700, fontSize: "0.83rem", lineHeight: 1.2 }}>
                {card.guestName}
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: p.dot }} title={p.label} />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5"
                style={{ background: "#F1F5F9", fontSize: "0.7rem", fontWeight: 700, color: "#475569" }}>
                <Home size={9} className="text-slate-400" />{card.room}
              </span>
              <span className="rounded-md px-1.5 py-0.5"
                style={{ background: col.light, color: col.text, fontSize: "0.68rem", fontWeight: 700 }}>
                {card.status}
              </span>
            </div>
          </div>
        </div>

        {/* Payment new card: invoice summary */}
        {col.id === "payment" && isNew && (
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
            <span style={{ fontSize: "0.69rem", color: "#94A3B8" }}>Cọc + T1 + Phí DV</span>
            <span style={{ fontSize: "0.76rem", fontWeight: 800, color: col.accent }}>{invoiceTotal.toLocaleString("vi-VN")}đ</span>
          </div>
        )}
      </div>

      {/* Action strip */}
      <div className="px-3 pb-3 pt-2 flex items-center justify-between"
        style={{ borderTop: "1px solid #F8FAFC" }}>
        <span className="flex items-center gap-1" style={{ fontSize: "0.68rem", color: "#CBD5E1" }}>
          <Calendar size={9} />{card.date.slice(5).replace("-", "/")}
        </span>

        {col.id === "deposit" && (
          <button onClick={e => { e.stopPropagation(); onDepositApprove(card); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white cursor-pointer hover:opacity-90 transition"
            style={{ background: col.accent, fontSize: "0.7rem", fontWeight: 700 }}>
            <AlertCircle size={9} /> Duyệt cọc
          </button>
        )}
        {col.id === "lease" && (
          <button onClick={e => { e.stopPropagation(); onCheckin(card); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white cursor-pointer hover:opacity-90 transition"
            style={{ background: col.accent, fontSize: "0.7rem", fontWeight: 700 }}>
            <CheckSquare size={9} /> Check-in
          </button>
        )}
        {col.id === "checkout" && (
          <button onClick={e => { e.stopPropagation(); onCheckout(card); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white cursor-pointer hover:opacity-90 transition"
            style={{ background: col.accent, fontSize: "0.7rem", fontWeight: 700 }}>
            <Key size={9} /> Check-out
          </button>
        )}
        {col.id === "showing" && (
          <span className="px-2 py-0.5 rounded-md" style={{ background: col.light, color: col.text, fontSize: "0.68rem", fontWeight: 600 }}>
            {card.salesperson.split(" ").pop()}
          </span>
        )}
        {col.id === "payment" && (
          <div className="flex items-center gap-1.5">
            <button onClick={e => { e.stopPropagation(); onViewInvoice?.(card); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border cursor-pointer hover:opacity-80 transition"
              style={{ borderColor: col.accent + "40", color: col.text, background: col.light, fontSize: "0.68rem", fontWeight: 600 }}>
              <Eye size={9} /> Hóa đơn
            </button>
            <button onClick={e => { e.stopPropagation(); onConfirmPayment?.(card); }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white cursor-pointer hover:opacity-90 transition"
              style={{ background: col.accent, fontSize: "0.68rem", fontWeight: 700 }}>
              <CheckCircle2 size={9} /> Xác nhận TT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TASK MODAL
// ─────────────────────────────────────────────────────────────────────────────
const ROOM_OPTIONS = ["A101","A102","A103","A104","A201","A205","A302","A304","A401","A405",
  "B102","B103","B202","B301","B304","B401","C102","C104","C201","C303","C302"];
const SALESPERSON_OPTIONS = ["Minh Tuấn","Thu Hương","Quang Vinh","Bảo Linh","Đức Anh"];
const PAYMENT_METHODS = ["Chuyển khoản ngân hàng","Tiền mặt","Ví điện tử (MoMo)","Thẻ tín dụng"];

type FieldError = Record<string, string>;

function FormLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function FormInput({ placeholder, value, onChange, error, type = "text", icon }: {
  placeholder?: string; value: string; onChange: (v: string) => void;
  error?: string; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          className="w-full border rounded-xl py-2.5 text-sm focus:outline-none transition"
          style={{
            paddingLeft: icon ? "2.25rem" : "0.75rem", paddingRight: "0.75rem",
            borderColor: error ? "#EF4444" : "#E2E8F0",
            background: error ? "#FFF5F5" : "white",
            boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
            color: "#1E293B",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = error ? "#EF4444" : "#6366F1"; e.currentTarget.style.boxShadow = error ? "0 0 0 3px rgba(239,68,68,0.12)" : "0 0 0 3px rgba(99,102,241,0.12)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = error ? "#EF4444" : "#E2E8F0"; e.currentTarget.style.boxShadow = error ? "0 0 0 3px rgba(239,68,68,0.08)" : "none"; }}
        />
      </div>
      {error && <p className="mt-1 text-red-500 flex items-center gap-1" style={{ fontSize: "0.72rem" }}><AlertOctagon size={11} />{error}</p>}
    </div>
  );
}

function FormSelect({ options, value, onChange, error, placeholder }: {
  options: string[]; value: string; onChange: (v: string) => void; error?: string; placeholder?: string;
}) {
  return (
    <div>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none transition pr-8"
          style={{
            borderColor: error ? "#EF4444" : "#E2E8F0",
            background: error ? "#FFF5F5" : "white",
            boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
            color: value ? "#1E293B" : "#94A3B8",
          }}>
          <option value="" disabled>{placeholder || "Chọn..."}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-red-500 flex items-center gap-1" style={{ fontSize: "0.72rem" }}><AlertOctagon size={11} />{error}</p>}
    </div>
  );
}

function GenderRadio({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const hasError = !!error && !value;
  const genderOpts = [{ id: "male", label: "Nam" }, { id: "female", label: "Nữ" }];
  return (
    <div>
      <div
        className="flex rounded-xl overflow-hidden"
        style={{
          border: `1.5px solid ${hasError ? "#EF4444" : value ? "#4338CA" : "#E2E8F0"}`,
          boxShadow: hasError ? "0 0 0 3px rgba(239,68,68,0.10)" : value ? "0 0 0 3px rgba(67,56,202,0.10)" : "none",
          background: "#F8FAFC",
          transition: "box-shadow 0.15s, border-color 0.15s",
        }}
      >
        {genderOpts.map((o, i) => {
          const active = value === o.id;
          return (
            <button key={o.id} type="button" onClick={() => onChange(o.id)}
              className="flex-1 py-2.5 transition-all duration-150 relative select-none"
              style={{
                background: active ? "#4338CA" : "transparent",
                color: active ? "#FFFFFF" : hasError ? "#EF4444" : "#475569",
                fontWeight: active ? 700 : 500,
                fontSize: "0.9rem",
                letterSpacing: "0.03em",
                borderRight: i === 0 ? `1px solid ${hasError ? "#FECACA" : "#E2E8F0"}` : "none",
              }}>
              {o.label}
              {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.45)" }} />}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5" style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
        Theo thông tin ghi trên CCCD — chỉ có hai giá trị hợp lệ
      </p>
      {error && <p className="mt-0.5 text-red-500 flex items-center gap-1" style={{ fontSize: "0.72rem" }}><AlertOctagon size={11} />{error}</p>}
    </div>
  );
}

function PriorityRadio({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { id: "High",   label: "🔴 Cao",  clr: "#B91C1C", bg: "#FEF2F2", bd: "#FCA5A5" },
    { id: "Medium", label: "🟡 TB",   clr: "#92400E", bg: "#FFFBEB", bd: "#FCD34D" },
    { id: "Low",    label: "⚪ Thấp", clr: "#475569", bg: "#F8FAFC", bd: "#CBD5E1" },
  ];
  return (
    <div className="flex gap-2">
      {opts.map(o => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)}
          className="flex-1 py-2 rounded-xl border transition text-sm"
          style={{
            borderColor: value === o.id ? o.bd : "#E2E8F0",
            background: value === o.id ? o.bg : "white",
            color: value === o.id ? o.clr : "#94A3B8",
            fontWeight: value === o.id ? 700 : 400,
          }}>{o.label}
        </button>
      ))}
    </div>
  );
}

function FileUploadField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition hover:bg-slate-50"
        style={{ borderColor: error ? "#EF4444" : value ? "#6366F1" : "#CBD5E1", background: value ? "#EEF2FF" : error ? "#FFF5F5" : "transparent" }}>
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={e => onChange(e.target.files?.[0]?.name || "")} />
        {value ? (
          <div className="flex items-center justify-center gap-2 text-indigo-600">
            <CheckCircle size={15} />
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{value}</span>
            <button type="button" onClick={ev => { ev.stopPropagation(); onChange(""); }}
              className="ml-1 text-slate-400 hover:text-red-500"><X size={13} /></button>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-slate-300 mx-auto mb-1.5" />
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Click để tải ảnh / PDF minh chứng</p>
            <p style={{ fontSize: "0.7rem", color: "#94A3B8" }}>PNG, JPG, PDF · tối đa 5MB</p>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-red-500 flex items-center gap-1" style={{ fontSize: "0.72rem" }}><AlertOctagon size={11} />{error}</p>}
    </div>
  );
}

function SectionDivider({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: accent }} />
      <span className="text-slate-700" style={{ fontWeight: 700, fontSize: "0.82rem" }}>{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function AddTaskModal({ colId, onClose, onSave }: { colId: KanbanColumnId; onClose: () => void; onSave: (card: KanbanCard) => void }) {
  const col = COLUMNS.find(c => c.id === colId)!;

  const [guestName, setGuestName]     = useState("");
  const [phone, setPhone]             = useState("");
  const [room, setRoom]               = useState("");
  const [priority, setPriority]       = useState<"High"|"Medium"|"Low">("Medium");
  const [note, setNote]               = useState("");
  const [salesperson, setSalesperson] = useState("");

  // showing
  const [gender, setGender]           = useState("");
  const [roomType, setRoomType]       = useState("");
  const [apptDate, setApptDate]       = useState("");
  const [apptTime, setApptTime]       = useState("");

  // deposit
  const [amount, setAmount]           = useState("");
  const [payMethod, setPayMethod]     = useState("");
  const [proofFile, setProofFile]     = useState("");
  const [depositDate, setDepositDate] = useState("");

  // lease
  const [startDate, setStartDate]     = useState("");
  const [endDate, setEndDate]         = useState("");
  const [rentAmt, setRentAmt]         = useState("");
  const [depositAmt, setDepositAmt]   = useState("");

  // payment
  const [invoiceType, setInvoiceType] = useState("");
  const [payAmt, setPayAmt]           = useState("");
  const [payPeriod, setPayPeriod]     = useState("");

  // checkout
  const [checkoutDate, setCheckoutDate] = useState("");
  const [refundAmt, setRefundAmt]       = useState("");
  const [keyReturned, setKeyReturned]   = useState(false);

  const [errors, setErrors] = useState<FieldError>({});
  const [saved, setSaved]   = useState(false);

  const validate = (): boolean => {
    const e: FieldError = {};
    if (!guestName.trim()) e.guestName = "Vui lòng nhập tên khách";
    if (!room)             e.room      = "Vui lòng chọn phòng";
    if (colId === "showing") {
      if (!gender)      e.gender      = "Vui lòng chọn giới tính theo CCCD";
      if (!roomType)    e.roomType    = "Vui lòng chọn loại phòng";
      if (!apptDate)    e.apptDate    = "Vui lòng chọn ngày hẹn";
      if (!apptTime)    e.apptTime    = "Vui lòng chọn giờ hẹn";
      if (!salesperson) e.salesperson = "Vui lòng chọn nhân viên";
    }
    if (colId === "deposit") {
      if (!amount)    e.amount    = "Vui lòng nhập số tiền";
      if (!payMethod) e.payMethod = "Vui lòng chọn phương thức";
      if (payMethod === "Chuyển khoản ngân hàng" && !proofFile) e.proofFile = "Vui lòng tải minh chứng";
    }
    if (colId === "lease") {
      if (!startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
      if (!endDate)   e.endDate   = "Vui lòng chọn ngày kết thúc";
      if (!rentAmt)   e.rentAmt   = "Vui lòng nhập tiền thuê";
    }
    if (colId === "payment") {
      if (!invoiceType) e.invoiceType = "Vui lòng chọn loại phiếu";
      if (!payAmt)      e.payAmt      = "Vui lòng nhập số tiền";
    }
    if (colId === "checkout") {
      if (!checkoutDate) e.checkoutDate = "Vui lòng chọn ngày check-out";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const rawAmt = parseFloat((colId === "deposit" ? amount : colId === "lease" ? rentAmt : colId === "payment" ? payAmt : "0").replace(/[^0-9.]/g, "")) || 0;
    const newCard: KanbanCard = {
      id: `K${Date.now()}`,
      guestName: guestName.trim(), room, phone: phone.trim(),
      amount: rawAmt * (rawAmt < 1000 ? 1_000_000 : 1),
      priority,
      status: { showing: "Scheduled", deposit: "Chờ duyệt", lease: "Đang ký", payment: "Chờ TT", checkout: "Chờ CK" }[colId],
      date: (apptDate || startDate || checkoutDate || depositDate || new Date().toISOString().slice(0, 10)),
      salesperson: salesperson || "—",
    };
    setSaved(true);
    setTimeout(() => { onSave(newCard); onClose(); }, 900);
  };

  const META: Record<KanbanColumnId, { title: string; icon: React.ReactNode; desc: string }> = {
    showing:  { title: "Thêm lịch xem phòng mới",   icon: <Calendar size={17} />,   desc: "Tạo lịch hẹn xem phòng & phân công nhân viên Sales" },
    deposit:  { title: "Hồ sơ đặt cọc mới",        icon: <CreditCard size={17} />, desc: "Ghi nhận tiền cọc và minh chứng thanh toán" },
    lease:    { title: "Hợp đồng thuê mới",         icon: <FileText size={17} />,   desc: "Tạo hợp đồng cho khách thuê phòng" },
    payment:  { title: "Phiếu thanh toán mới",      icon: <DollarSign size={17} />, desc: "Phát hành phiếu thu / chi cho khách thuê" },
    checkout: { title: "Yêu cầu Check-out mới",     icon: <Key size={17} />,        desc: "Khởi tạo tiến trình trả phòng & thanh lý" },
  };
  const m = META[colId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="bg-white rounded-2xl w-full flex flex-col relative overflow-hidden"
        style={{ maxWidth: 700, maxHeight: "92vh", boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ background: col.light, borderBottom: `2px solid ${col.accent}28`, borderRadius: "1rem 1rem 0 0" }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: col.accent }}>
              {m.icon}
            </div>
            <div>
              <div className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.05rem" }}>{m.title}</div>
              <div className="text-slate-500 mt-0.5" style={{ fontSize: "0.76rem" }}>{m.desc}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white"
              style={{ borderColor: col.accent + "40" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: col.text }}>Bước {col.step} · {col.sublabel}</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition"
              style={{ background: "rgba(0,0,0,0.06)" }}>
              <X size={15} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar"
          style={{ scrollbarWidth: "none" }}>

          {/* Success overlay */}
          {saved && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.97)" }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-sm"
                style={{ background: col.light }}>
                <CheckCircle2 size={34} style={{ color: col.accent }} />
              </div>
              <div className="text-slate-900 mb-1" style={{ fontWeight: 800, fontSize: "1.05rem" }}>Tạo thành công!</div>
              <div className="text-slate-500" style={{ fontSize: "0.82rem" }}>Thẻ mới đã được thêm vào "{col.label}"</div>
              <div className="mt-3 flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.75rem" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: col.accent }} />
                Đang đóng...
              </div>
            </div>
          )}

          {/* ─ 1. Guest Info ─ */}
          <div>
            <SectionDivider label="Thông tin khách thuê" accent={col.accent} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel label="Họ và tên" required />
                <FormInput placeholder="Nguyễn Văn A" value={guestName} onChange={setGuestName}
                  error={errors.guestName} icon={<User size={13} />} />
              </div>
              <div>
                <FormLabel label="Số điện thoại" />
                <FormInput placeholder="0901 234 567" value={phone} onChange={setPhone}
                  type="tel" icon={<Phone size={13} />} />
              </div>
              {colId === "showing" && (
                <div className="col-span-2">
                  <FormLabel label="Giới tính (theo CCCD)" required />
                  <GenderRadio value={gender} onChange={setGender} error={errors.gender} />
                </div>
              )}
            </div>
          </div>

          {/* ─ 2. Column-specific fields ─ */}
          <div>
            <SectionDivider label={
              colId === "showing"  ? "Phòng mong muốn & Lịch hẹn" :
              colId === "deposit"  ? "Thông tin đặt cọc" :
              colId === "lease"    ? "Thông tin hợp đồng" :
              colId === "payment"  ? "Thông tin phiếu thanh toán" :
                                    "Thông tin check-out"
            } accent={col.accent} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel label={colId === "showing" ? "Phòng / Giường dự kiến" : "Phòng / Giường"} required />
                <FormSelect options={ROOM_OPTIONS} value={room} onChange={setRoom}
                  error={errors.room} placeholder="Chọn phòng..." />
              </div>

              {/* SHOWING */}
              {colId === "showing" && <>
                <div>
                  <FormLabel label="Loại phòng mong muốn" required />
                  <FormSelect
                    options={["Toàn phòng (Whole Room)", "Ghép giường (Bed Sharing)"]}
                    value={roomType} onChange={setRoomType}
                    error={errors.roomType} placeholder="Chọn loại phòng..." />
                </div>
                <div>
                  <FormLabel label="Nhân viên phụ trách" required />
                  <FormSelect options={SALESPERSON_OPTIONS} value={salesperson} onChange={setSalesperson}
                    error={errors.salesperson} placeholder="Chọn nhân viên..." />
                </div>
                <div>
                  <FormLabel label="Ngày hẹn xem phòng" required />
                  <FormInput type="date" value={apptDate} onChange={setApptDate}
                    error={errors.apptDate} icon={<Calendar size={13} />} />
                </div>
                <div>
                  <FormLabel label="Giờ hẹn" required />
                  <FormInput type="time" value={apptTime} onChange={setApptTime}
                    error={errors.apptTime} icon={<Clock size={13} />} />
                </div>
              </>}

              {/* DEPOSIT */}
              {colId === "deposit" && <>
                <div>
                  <FormLabel label="Ngày đặt cọc" />
                  <FormInput type="date" value={depositDate} onChange={setDepositDate}
                    icon={<Calendar size={13} />} />
                </div>
                <div>
                  <FormLabel label="Số tiền cọc (triệu đ)" required />
                  <FormInput placeholder="5" value={amount} onChange={setAmount}
                    error={errors.amount} icon={<DollarSign size={13} />} />
                </div>
                <div>
                  <FormLabel label="Phương thức thanh toán" required />
                  <FormSelect options={PAYMENT_METHODS} value={payMethod} onChange={setPayMethod}
                    error={errors.payMethod} placeholder="Chọn hình thức..." />
                </div>
                {payMethod === "Chuyển khoản ngân hàng" && (
                  <div className="col-span-2">
                    <FormLabel label="Minh chứng chuyển khoản" required />
                    <FileUploadField value={proofFile} onChange={setProofFile} error={errors.proofFile} />
                  </div>
                )}
              </>}

              {/* LEASE */}
              {colId === "lease" && <>
                <div>
                  <FormLabel label="Nhân viên phụ trách" />
                  <FormSelect options={SALESPERSON_OPTIONS} value={salesperson} onChange={setSalesperson}
                    placeholder="Chọn nhân viên..." />
                </div>
                <div>
                  <FormLabel label="Ngày bắt đầu" required />
                  <FormInput type="date" value={startDate} onChange={setStartDate}
                    error={errors.startDate} icon={<Calendar size={13} />} />
                </div>
                <div>
                  <FormLabel label="Ngày kết thúc" required />
                  <FormInput type="date" value={endDate} onChange={setEndDate}
                    error={errors.endDate} icon={<Calendar size={13} />} />
                </div>
                <div>
                  <FormLabel label="Tiền thuê / tháng (triệu đ)" required />
                  <FormInput placeholder="4.5" value={rentAmt} onChange={setRentAmt}
                    error={errors.rentAmt} icon={<DollarSign size={13} />} />
                </div>
                <div>
                  <FormLabel label="Tiền đặt cọc (triệu đ)" />
                  <FormInput placeholder="9" value={depositAmt} onChange={setDepositAmt}
                    icon={<DollarSign size={13} />} />
                </div>
              </>}

              {/* PAYMENT */}
              {colId === "payment" && <>
                <div>
                  <FormLabel label="Loại phiếu" required />
                  <FormSelect options={["Phiếu thu tiền thuê","Phiếu thu điện nước","Phiếu thu phí DV","Phiếu hoàn cọc","Phiếu thu khác"]}
                    value={invoiceType} onChange={setInvoiceType}
                    error={errors.invoiceType} placeholder="Chọn loại phiếu..." />
                </div>
                <div>
                  <FormLabel label="Số tiền (triệu đ)" required />
                  <FormInput placeholder="6" value={payAmt} onChange={setPayAmt}
                    error={errors.payAmt} icon={<DollarSign size={13} />} />
                </div>
                <div>
                  <FormLabel label="Kỳ thanh toán" />
                  <FormInput placeholder="Tháng 5/2025" value={payPeriod} onChange={setPayPeriod}
                    icon={<Clock size={13} />} />
                </div>
                <div>
                  <FormLabel label="Phương thức TT" />
                  <FormSelect options={PAYMENT_METHODS} value={payMethod} onChange={setPayMethod}
                    placeholder="Chọn hình thức..." />
                </div>
              </>}

              {/* CHECKOUT */}
              {colId === "checkout" && <>
                <div>
                  <FormLabel label="Ngày check-out" required />
                  <FormInput type="date" value={checkoutDate} onChange={setCheckoutDate}
                    error={errors.checkoutDate} icon={<Calendar size={13} />} />
                </div>
                <div>
                  <FormLabel label="Số tiền hoàn trả (đ)" />
                  <FormInput placeholder="0" value={refundAmt} onChange={setRefundAmt}
                    icon={<DollarSign size={13} />} />
                </div>
                <div className="col-span-2">
                  <button type="button" onClick={() => setKeyReturned(p => !p)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition"
                    style={{
                      borderColor: keyReturned ? "#059669" : "#E2E8F0",
                      background: keyReturned ? "#ECFDF5" : "white",
                    }}>
                    <Key size={15} style={{ color: keyReturned ? "#059669" : "#94A3B8" }} />
                    <span className="text-sm text-slate-700">Đã thu hồi chìa khóa / thẻ từ</span>
                    {keyReturned
                      ? <CheckSquare size={15} className="ml-auto text-emerald-500" />
                      : <Square size={15} className="ml-auto text-slate-300" />}
                  </button>
                </div>
              </>}
            </div>
          </div>

          {/* ─ 3. Priority + Salesperson + Note ─ */}
          <div>
            <SectionDivider label="Ưu tiên & Ghi chú" accent={col.accent} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel label="Mức ưu tiên" />
                <PriorityRadio value={priority} onChange={v => setPriority(v as "High"|"Medium"|"Low")} />
              </div>
              <div>
                <FormLabel label="Nhân viên phụ trách" />
                {colId !== "showing" && colId !== "lease" ? (
                  <FormSelect options={SALESPERSON_OPTIONS} value={salesperson} onChange={setSalesperson}
                    placeholder="Chọn nhân viên..." />
                ) : (
                  <div className="py-2.5 px-3 rounded-xl border border-slate-100 bg-slate-50 text-sm italic"
                    style={{ color: salesperson ? "#1E293B" : "#94A3B8" }}>
                    {salesperson || "Chưa phân công"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <FormLabel label="Ghi chú" />
                <textarea rows={3} placeholder="Nhập ghi chú về khách thuê hoặc yêu cầu đặc biệt..."
                  value={note} onChange={e => setNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none transition"
                  style={{ color: "#1E293B" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          </div>

          {/* ─ Validation summary ─ */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl border"
              style={{ background: "#FFF5F5", borderColor: "#FECACA" }}>
              <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-red-700 mb-0.5" style={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  {Object.keys(errors).length} trường bắt buộc chưa điền
                </div>
                <div className="text-red-400" style={{ fontSize: "0.73rem" }}>
                  Vui lòng điền đầy đủ các trường đánh dấu <span className="font-bold">*</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0 bg-slate-50/60"
          style={{ borderRadius: "0 0 1rem 1rem" }}>
          <div className="flex-1 flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.72rem" }}>
            <AlertOctagon size={11} className="text-slate-300" />
            Trường <span className="text-red-400 font-bold">*</span> là bắt buộc
          </div>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-white transition"
            style={{ fontWeight: 500, color: "#475569" }}>
            Hủy
          </button>
          <button onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm text-white transition flex items-center gap-2 shadow-sm"
            style={{ background: col.accent, fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ""}>
            <CheckCircle2 size={14} /> {colId === "showing" ? "Lưu thông tin" : "Lưu & Tạo thẻ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KANBAN COLUMN
// ─────────────────────────────────────────────────────────────────────────────
function KanbanColumn({
  col, cards, onDrop, onDepositApprove, onCheckin, onCheckout, onAddTask,
  newCardIds, onViewInvoice, onConfirmPayment, onAvatarClick,
}: {
  col: ColCfg; cards: KanbanCard[]; onDrop: (id: string, from: string) => void;
  onDepositApprove: (c: KanbanCard) => void;
  onCheckin: (c: KanbanCard) => void;
  onCheckout: (c: KanbanCard) => void;
  onAddTask: () => void;
  newCardIds?: string[];
  onViewInvoice?: (c: KanbanCard) => void;
  onConfirmPayment?: (c: KanbanCard) => void;
  onAvatarClick: (c: KanbanCard) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; fromColumn: string }) => { if (item.fromColumn !== col.id) onDrop(item.id, item.fromColumn); },
    collect: m => ({ isOver: m.isOver() }),
  });
  drop(ref);

  const highCount  = cards.filter(c => c.priority === "High").length;
  const newCount   = col.id === "payment" ? (newCardIds?.filter(id => cards.some(c => c.id === id)).length ?? 0) : 0;

  return (
    <div ref={ref} className="flex flex-col min-w-0 flex-1 rounded-2xl transition-all duration-200"
      style={{
        background: isOver ? "#EEF2FF" : "#F1F5F9",
        outline: isOver ? "2px solid #6366F1" : "none",
        outlineOffset: 2,
      }}>
      {/* Column Header */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
            <span className="text-slate-800" style={{ fontWeight: 700, fontSize: "0.8rem" }}>{col.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs px-2 py-0.5 rounded-full" style={{ background: col.accent, fontWeight: 700, fontSize: "0.7rem" }}>
              {cards.length}
            </span>
            <button className="w-6 h-6 rounded-lg hover:bg-white/70 flex items-center justify-center transition">
              <MoreHorizontal size={12} className="text-slate-400" />
            </button>
          </div>
        </div>
        {/* Accent divider + optional alert */}
        <div className="h-px rounded-full mb-1.5" style={{ background: col.accent, opacity: 0.2 }} />
        {highCount > 0 && (
          <div className="flex items-center gap-1 text-red-500 mb-1" style={{ fontSize: "0.67rem" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {highCount} ưu tiên cao
          </div>
        )}
        {newCount > 0 && (
          <div className="flex items-center gap-1 mb-1" style={{ fontSize: "0.67rem", color: col.text }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: col.accent }} />
            {newCount} thẻ mới · chờ xác nhận
          </div>
        )}
      </div>

      {/* Scrollable cards — invisible scrollbar */}
      <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", maxHeight: "calc(100vh - 310px)" }}>
        {cards.map(card => (
          <SlimCard key={card.id} card={card} col={col}
            onDepositApprove={onDepositApprove} onCheckin={onCheckin} onCheckout={onCheckout}
            isNew={newCardIds?.includes(card.id)}
            onViewInvoice={onViewInvoice}
            onConfirmPayment={onConfirmPayment}
            onAvatarClick={onAvatarClick} />
        ))}
        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ArrowRight size={18} className="text-slate-300 mb-1" />
            <span className="text-xs text-slate-400">Kéo thẻ vào đây</span>
          </div>
        )}
      </div>

      {/* Add footer */}
      <div className="px-2 pb-2 flex-shrink-0">
        <button onClick={onAddTask}
          className="w-full flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed hover:bg-white/80 transition group"
          style={{ borderColor: col.accent + "60", color: col.accent, fontSize: "0.72rem", fontWeight: 600 }}>
          <Plus size={11} /> Thêm thẻ
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE HEADER
// ─────────────────────────────────────────────────────────────────────────────
function PipelineHeader({
  columns, counts, activeStep, onStepClick,
}: {
  columns: ColCfg[];
  counts: Record<KanbanColumnId, number>;
  activeStep: KanbanColumnId | null;
  onStepClick: (id: KanbanColumnId) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex">
        {columns.map((col, i) => {
          const isActive = activeStep === col.id;
          const isLast = i === columns.length - 1;
          return (
            <button
              key={col.id}
              onClick={() => onStepClick(col.id)}
              className="relative flex-1 flex flex-col items-center py-4 px-2 transition-all duration-200 group"
              style={{ background: isActive ? col.light : "white" }}
            >
              {/* Step number circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mb-2 transition-all duration-200"
                style={{
                  background: isActive ? col.accent : "#F1F5F9",
                  color: isActive ? "white" : "#94A3B8",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {col.step}
              </div>
              {/* Label */}
              <div className="text-center" style={{ lineHeight: 1.2 }}>
                <div className="truncate px-1" style={{
                  fontSize: "0.72rem", fontWeight: isActive ? 700 : 500,
                  color: isActive ? col.text : "#64748B",
                  maxWidth: 100,
                }}>
                  {col.label}
                </div>
              </div>
              {/* Count badge */}
              <div
                className="mt-1.5 px-2.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? col.accent : "#F1F5F9",
                  color: isActive ? "white" : "#64748B",
                  fontSize: "0.68rem", fontWeight: 700,
                }}
              >
                {counts[col.id]} pending
              </div>

              {/* Connector arrow (not on last) */}
              {!isLast && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  style={{ transform: "translateY(-50%) translateX(50%)" }}>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              )}

              {/* Active bottom accent bar */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: col.accent }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  const opts: { id: ViewMode; label: string; sub: string }[] = [
    { id: "all",  label: "Tất cả",         sub: "5 giai đoạn" },
    { id: "pre",  label: "Tiền Check-in",  sub: "GĐ 1–3" },
    { id: "ops",  label: "Vận hành",       sub: "GĐ 4–5" },
  ];
  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
      {opts.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          className="flex flex-col items-center px-4 py-1.5 rounded-lg transition-all"
          style={{
            background: view === o.id ? "#1E293B" : "transparent",
            color: view === o.id ? "white" : "#64748B",
          }}>
          <span style={{ fontSize: "0.78rem", fontWeight: view === o.id ? 700 : 500 }}>{o.label}</span>
          <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>{o.sub}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP LABEL
// ─────────────────────────────────────────────────────────────────────────────
function GroupLabel({ label, color, count }: { label: string; color: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px flex-1 bg-slate-200" />
      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569" }}>{label}</span>
        <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full" style={{ fontSize: "0.65rem", fontWeight: 600 }}>{count}</span>
      </div>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_KANBAN: Record<KanbanColumnId, KanbanCard[]> = {
  showing: [], deposit: [], lease: [], payment: [], checkout: [],
};

export default function Workflows() {
  const [columns, setColumns] = useState<Record<KanbanColumnId, KanbanCard[]>>(EMPTY_KANBAN);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("all");
  const [activeStep, setActiveStep] = useState<KanbanColumnId | null>(null);
  const [depositModal, setDepositModal]   = useState<KanbanCard | null>(null);
  const [checkinModal, setCheckinModal]   = useState<KanbanCard | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<KanbanCard | null>(null);
  const [addTaskModal, setAddTaskModal]   = useState<KanbanColumnId | null>(null);
  const [invoiceModal, setInvoiceModal]   = useState<KanbanCard | null>(null);
  const [newCardIds, setNewCardIds]       = useState<string[]>([]);
  const [toast, setToast]                 = useState<string | null>(null);
  const [detailCard, setDetailCard]       = useState<KanbanCard | null>(null);

  // ── Load real data from API ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [customersRes, usersRes] = await Promise.all([
        getCustomers({ page: 0, size: 500 }),
        getUsers({ page: 0, size: 500 }),
      ]);
      const customerMap = new Map<string, Customer>(
        (customersRes.data ?? []).map(c => [(c as Customer).maKhachHang, c as Customer])
      );
      const employeeMap = new Map<string, Employee>(
        (usersRes.data ?? [])
          .filter((u): u is Employee => "maNhanVien" in u)
          .map(e => [e.maNhanVien, e])
      );
      const data = await loadKanbanData(customerMap, employeeMap);
      setColumns(data);
    } catch (err: any) {
      setLoadError(err?.message ?? "Không thể tải dữ liệu Kanban");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addCardToCol = (colId: KanbanColumnId, card: KanbanCard) => {
    setColumns(prev => ({ ...prev, [colId]: [card, ...prev[colId]] }));
  };

  const handleCheckinSuccess = (card: KanbanCard) => {
    // Move card from lease → payment
    moveCard(card.id, "lease");
    // Mark card as "new" in payment
    setNewCardIds(prev => [...prev, card.id]);
    // Show toast for 4 s
    setToast(card.guestName);
    setTimeout(() => setToast(null), 4500);
  };

  const handleConfirmPayment = (card: KanbanCard) => {
    setNewCardIds(prev => prev.filter(id => id !== card.id));
    setColumns(prev => ({
      ...prev,
      payment: prev.payment.map(c => c.id === card.id ? { ...c, status: "Đã TT" } : c),
    }));
  };

  const moveCardToCol = (cardId: string, fromCol: KanbanColumnId, toCol: KanbanColumnId) => {
    setColumns(prev => {
      const card = prev[fromCol].find(c => c.id === cardId);
      if (!card) return prev;
      return { ...prev, [fromCol]: prev[fromCol].filter(c => c.id !== cardId), [toCol]: [card, ...prev[toCol]] };
    });
  };

  const moveCard = (cardId: string, fromCol: string) => {
    const colIds = COLUMNS.map(c => c.id);
    const fromIdx = colIds.indexOf(fromCol as KanbanColumnId);
    const toCol = colIds[fromIdx + 1] as KanbanColumnId;
    if (toCol) moveCardToCol(cardId, fromCol as KanbanColumnId, toCol);
  };

  const handleStepClick = (id: KanbanColumnId) => {
    setActiveStep(prev => prev === id ? null : id);
  };

  // Visible columns based on view + activeStep filter
  const visibleCols: ColCfg[] = (() => {
    let base = COLUMNS;
    if (view === "pre") base = COLUMNS.filter(c => c.group === "pre");
    if (view === "ops") base = COLUMNS.filter(c => c.group === "ops");
    if (activeStep) base = base.filter(c => c.id === activeStep);
    return base;
  })();

  const counts = Object.fromEntries(COLUMNS.map(c => [c.id, columns[c.id].length])) as Record<KanbanColumnId, number>;
  const totalCards = COLUMNS.reduce((s, c) => s + columns[c.id].length, 0);

  const preCols = visibleCols.filter(c => c.group === "pre");
  const opsCols = visibleCols.filter(c => c.group === "ops");
  const showBothGroups = view === "all" && !activeStep && preCols.length > 0 && opsCols.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RotateCcw size={32} className="animate-spin text-indigo-500" />
        <div className="text-slate-500 font-medium">Đang tải dữ liệu Kanban từ hệ thống...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <div className="text-red-700 font-bold">Không thể tải dữ liệu</div>
        <div className="text-slate-500 text-sm">{loadError}</div>
        <button onClick={fetchData}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

      <div className="flex flex-col gap-4 h-full">

        {/* ── 1. Pipeline Header ── */}
        <PipelineHeader
          columns={COLUMNS}
          counts={counts}
          activeStep={activeStep}
          onStepClick={handleStepClick}
        />

        {/* ── 2. Toolbar row ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onChange={v => { setView(v); setActiveStep(null); }} />
            {activeStep && (
              <button onClick={() => setActiveStep(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs hover:bg-indigo-100 transition" style={{ fontWeight: 600 }}>
                <X size={11} /> Bỏ lọc
              </button>
            )}
            <button onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 transition" style={{ fontWeight: 600 }}>
              <RotateCcw size={11} /> Làm mới
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Tổng <span className="text-slate-700" style={{ fontWeight: 700 }}>{totalCards}</span> công việc · kéo thẻ để di chuyển
            </span>
            <button onClick={() => setAddTaskModal("showing")}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm" style={{ fontWeight: 600 }}>
              <Plus size={13} /> Thêm công việc
            </button>
          </div>
        </div>

        {/* ── 3. Kanban board ── */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {showBothGroups ? (
            <>
              {/* Pre-Check-in Group */}
              <div>
                <GroupLabel
                  label="Tiền Check-in"
                  color="#7C3AED"
                  count={preCols.reduce((s, c) => s + columns[c.id].length, 0)}
                />
                <div className="flex gap-3 h-full">
                  {preCols.map(col => (
                    <KanbanColumn key={col.id} col={col} cards={columns[col.id]}
                      onDrop={(id, from) => moveCardToCol(id, from as KanbanColumnId, col.id)}
                      onDepositApprove={c => setDepositModal(c)}
                      onCheckin={c => setCheckinModal(c)}
                      onCheckout={c => setCheckoutModal(c)}
                      onAddTask={() => setAddTaskModal(col.id)}
                      newCardIds={newCardIds}
                      onViewInvoice={c => setInvoiceModal(c)}
                      onConfirmPayment={handleConfirmPayment}
                      onAvatarClick={c => setDetailCard(c)} />
                  ))}
                </div>
              </div>

              {/* Operations Group */}
              <div>
                <GroupLabel
                  label="Vận hành & Thanh lý"
                  color="#059669"
                  count={opsCols.reduce((s, c) => s + columns[c.id].length, 0)}
                />
                <div className="flex gap-3">
                  {opsCols.map(col => (
                    <KanbanColumn key={col.id} col={col} cards={columns[col.id]}
                      onDrop={(id, from) => moveCardToCol(id, from as KanbanColumnId, col.id)}
                      onDepositApprove={c => setDepositModal(c)}
                      onCheckin={c => setCheckinModal(c)}
                      onCheckout={c => setCheckoutModal(c)}
                      onAddTask={() => setAddTaskModal(col.id)}
                      newCardIds={newCardIds}
                      onViewInvoice={c => setInvoiceModal(c)}
                      onConfirmPayment={handleConfirmPayment}
                      onAvatarClick={c => setDetailCard(c)} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Single flat layout (filtered view or active step) */
            <div className="flex gap-3 flex-1">
              {visibleCols.map(col => (
                <KanbanColumn key={col.id} col={col} cards={columns[col.id]}
                  onDrop={(id, from) => moveCardToCol(id, from as KanbanColumnId, col.id)}
                  onDepositApprove={c => setDepositModal(c)}
                  onCheckin={c => setCheckinModal(c)}
                  onCheckout={c => setCheckoutModal(c)}
                  onAddTask={() => setAddTaskModal(col.id)}
                  newCardIds={newCardIds}
                  onViewInvoice={c => setInvoiceModal(c)}
                  onConfirmPayment={handleConfirmPayment}
                  onAvatarClick={c => setDetailCard(c)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {depositModal && (
        <DepositModal card={depositModal} onClose={() => setDepositModal(null)}
          onApprove={() => moveCard(depositModal.id, "deposit")} />
      )}
      {checkinModal && (
        <CheckinModal card={checkinModal} onClose={() => setCheckinModal(null)}
          onSuccess={handleCheckinSuccess} />
      )}
      {checkoutModal && <CheckoutModal card={checkoutModal} onClose={() => setCheckoutModal(null)} />}

      {/* Add Task Modal */}
      {addTaskModal && (
        <AddTaskModal
          colId={addTaskModal}
          onClose={() => setAddTaskModal(null)}
          onSave={card => addCardToCol(addTaskModal, card)}
        />
      )}

      {/* Invoice Modal */}
      {invoiceModal && (
        <PaymentInvoiceModal
          card={invoiceModal}
          isNew={newCardIds.includes(invoiceModal.id)}
          onClose={() => setInvoiceModal(null)}
          onConfirm={() => handleConfirmPayment(invoiceModal)}
        />
      )}

      {/* Customer Detail Slide-Over */}
      {detailCard && (() => {
        const detailCol = COLUMNS.find(c => Object.entries(columns).some(([colId, cards]) => colId === c.id && cards.some(card => card.id === detailCard.id))) || COLUMNS[0];
        return (
          <CustomerDetailSlideOver
            card={detailCard}
            col={detailCol}
            onClose={() => setDetailCard(null)}
          />
        );
      })()}

      {/* Toast */}
      {toast && <ToastNotification name={toast} onDismiss={() => setToast(null)} />}
    </DndProvider>
  );
}
