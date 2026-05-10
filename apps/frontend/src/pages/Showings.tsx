import { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, User, Home,
  Phone, FileText, Move, Calendar, CheckCircle2, AlertCircle,
  XCircle, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { showingAppointments, ShowingAppointment } from "../data/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SLOT_H   = 32; // px per 30-min slot
const ITEM_TYPE = "SHOWING";
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const SALESPERSONS = ["Tất cả", "Minh Tuấn", "Thu Hương", "Quang Vinh"];
const ROOM_TYPES   = ["Single", "Double", "Triple"];
const SALESPERSON_COLORS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  "Minh Tuấn":  { border: "#6366F1", bg: "#EEF2FF", text: "#4338CA", dot: "#6366F1" },
  "Thu Hương":  { border: "#10B981", bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  "Quang Vinh": { border: "#F59E0B", bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  "default":    { border: "#8B5CF6", bg: "#F5F3FF", text: "#5B21B6", dot: "#8B5CF6" },
};

const STATUS_CFG: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  Confirmed:  { label: "Đã xác nhận", icon: <CheckCircle2 size={11} />, bg: "#ECFDF5", text: "#065F46" },
  Pending:    { label: "Chờ xác nhận", icon: <AlertCircle  size={11} />, bg: "#FFFBEB", text: "#92400E" },
  Completed:  { label: "Hoàn thành",   icon: <CheckCircle2 size={11} />, bg: "#EEF2FF", text: "#4338CA" },
  Cancelled:  { label: "Đã hủy",       icon: <XCircle      size={11} />, bg: "#FFF1F2", text: "#9F1239" },
};

const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 19; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 19) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getWeekDates(base: Date) {
  const d = new Date(base);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function formatDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function salespersonColor(name: string) {
  return SALESPERSON_COLORS[name] || SALESPERSON_COLORS.default;
}

function getInitials(name: string) {
  return name.trim().split(" ").slice(-2).map(w => w[0]).join("").toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT CARD (minimal, clean)
// ─────────────────────────────────────────────────────────────────────────────
function AppointmentCard({
  appt, slotIndex, onClick,
}: {
  appt: ShowingAppointment;
  slotIndex: number;
  onClick: (appt: ShowingAppointment, e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: appt.id },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  drag(ref);

  const slotsSpanned = appt.duration / 30;
  const heightPx     = slotsSpanned * SLOT_H - 3; // 3px gap
  const clr          = salespersonColor(appt.salesperson);
  const isCancelled  = appt.status === "Cancelled";

  return (
    <div
      ref={ref}
      onClick={e => { e.stopPropagation(); onClick(appt, e); }}
      className="absolute left-0 right-0 mx-px cursor-pointer select-none rounded-md overflow-hidden"
      style={{
        top: 2,
        height: heightPx,
        zIndex: 10,
        opacity: isDragging ? 0.25 : isCancelled ? 0.55 : 1,
        transform: isDragging ? "scale(0.94) rotate(1deg)" : "",
        background: clr.bg,
        borderLeft: `3px solid ${clr.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        transition: "opacity 0.12s, box-shadow 0.12s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
    >
      {/* Single line: time · name — always minimal */}
      <div
        className="px-1.5 flex items-center gap-1 h-full overflow-hidden"
        style={{ paddingTop: 2, paddingBottom: 2 }}
      >
        <span
          className="truncate flex-1 min-w-0"
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: clr.text,
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            textDecoration: isCancelled ? "line-through" : "none",
          }}
        >
          {appt.time}&nbsp;<span style={{ opacity: 0.5, fontWeight: 400 }}>·</span>&nbsp;{appt.guest}
        </span>
        {/* Drag handle dot */}
        <Move
          size={7}
          style={{ color: clr.border, opacity: 0.35, flexShrink: 0 }}
          className="hidden group-hover:block"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DROPPABLE CELL
// ─────────────────────────────────────────────────────────────────────────────
function TimeSlotCell({
  date, time, slotIndex, appointments, onDrop, onCellClick, onApptClick,
}: {
  date: string; time: string; slotIndex: number;
  appointments: ShowingAppointment[];
  onDrop: (id: string, date: string, time: string) => void;
  onCellClick: (date: string, time: string) => void;
  onApptClick: (appt: ShowingAppointment, e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string }) => onDrop(item.id, date, time),
    collect: m => ({ isOver: m.isOver() }),
  });
  drop(ref);

  const isHour = time.endsWith(":00");

  return (
    <div
      ref={ref}
      className="relative transition-colors duration-75"
      style={{
        height: SLOT_H,
        borderBottom: isHour ? "1px solid #E2E8F0" : "1px solid #F1F5F9",
        background: isOver ? "rgba(99,102,241,0.06)" : "transparent",
        cursor: "crosshair",
      }}
      onClick={() => onCellClick(date, time)}
    >
      {appointments.map(appt => (
        <AppointmentCard
          key={appt.id}
          appt={appt}
          slotIndex={slotIndex}
          onClick={onApptClick}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL QUICK-VIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DetailModal({
  appt, anchorPos, onClose, onDelete,
}: {
  appt: ShowingAppointment;
  anchorPos: { x: number; y: number };
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clr = salespersonColor(appt.salesperson);
  const statusCfg = STATUS_CFG[appt.status] || STATUS_CFG.Pending;

  // Smart positioning: avoid going off-screen
  const [pos, setPos] = useState({ left: anchorPos.x + 12, top: anchorPos.y - 20 });
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let { left, top } = pos;
    if (left + rect.width > vw - 16) left = anchorPos.x - rect.width - 12;
    if (top + rect.height > vh - 16) top = vh - rect.height - 16;
    if (top < 8) top = 8;
    if (left < 8) left = 8;
    setPos({ left, top });
  }, []);

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5" style={{ color: clr.border }}>{icon}</div>
      <div>
        <div style={{ fontSize: "0.67rem", color: "#94A3B8", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E293B" }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className="fixed z-[80]"
      style={{
        left: pos.left,
        top: pos.top,
        width: 300,
        animation: "fadeScaleIn 0.15s cubic-bezier(.21,1.02,.73,1) forwards",
      }}
    >
      <style>{`@keyframes fadeScaleIn{from{opacity:0;transform:scale(0.93) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
      >
        {/* Colored header */}
        <div className="px-4 py-3.5 flex items-start justify-between"
          style={{ background: clr.bg, borderBottom: `2px solid ${clr.border}20` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: clr.border, fontSize: "0.75rem", fontWeight: 700 }}>
              {getInitials(appt.guest)}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>{appt.guest}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: statusCfg.bg, color: statusCfg.text, fontSize: "0.65rem", fontWeight: 700 }}>
                  {statusCfg.icon}{statusCfg.label}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition"
            style={{ background: "rgba(0,0,0,0.06)" }}>
            <X size={13} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5">
          <Row icon={<Phone size={13} />}   label="Điện thoại"        value={appt.phone} />
          <Row icon={<Home size={13} />}    label="Phòng mục tiêu"    value={`${appt.targetRoom} · ${appt.roomType}`} />
          <Row icon={<User size={13} />}    label="Nhân viên phụ trách" value={appt.salesperson} />
          <Row icon={<Calendar size={13} />} label="Lịch hẹn"         value={`${appt.date} · ${appt.time}`} />
          <Row icon={<Clock size={13} />}   label="Thời lượng"        value={`${appt.duration} phút`} />
          {appt.notes && (
            <Row icon={<FileText size={13} />} label="Ghi chú"        value={appt.notes} />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => { onDelete(appt.id); onClose(); }}
            className="flex-1 py-2 rounded-xl text-sm transition"
            style={{ background: "#FFF1F2", color: "#9F1239", fontWeight: 600, fontSize: "0.78rem" }}>
            Xóa lịch
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-white transition"
            style={{ background: clr.border, fontWeight: 600, fontSize: "0.78rem" }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW APPOINTMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function NewAppointmentModal({
  prefill, onClose, onSave,
}: {
  prefill?: { date: string; time: string };
  onClose: () => void;
  onSave: (appt: ShowingAppointment) => void;
}) {
  const [form, setForm] = useState({
    guest: "", phone: "", roomType: "Single", targetRoom: "A201",
    salesperson: "Minh Tuấn",
    date: prefill?.date || "", time: prefill?.time || "09:00",
    duration: 60, notes: "", status: "Confirmed" as const,
  });

  const handleSave = () => {
    if (!form.guest.trim() || !form.date) return;
    const colorMap: Record<string, string> = {
      "Minh Tuấn": "indigo", "Thu Hương": "emerald", "Quang Vinh": "amber",
    };
    onSave({
      id: `SA${Date.now()}`,
      ...form,
      color: colorMap[form.salesperson] || "indigo",
    });
    onClose();
  };

  const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{label}</label>
      {children}
    </div>
  );

  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "#EEF2FF", borderBottom: "2px solid #6366F120" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Calendar size={17} />
            </div>
            <div>
              <div className="text-slate-900" style={{ fontWeight: 800, fontSize: "1rem" }}>Tạo lịch xem phòng</div>
              <div className="text-slate-500" style={{ fontSize: "0.74rem" }}>Điền thông tin khách hẹn xem</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.06)" }}>
            <X size={14} className="text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <FL label="Họ và tên khách *">
                <input value={form.guest} onChange={e => setForm(p => ({ ...p, guest: e.target.value }))}
                  placeholder="Nguyễn Văn A" className={inputCls} />
              </FL>
            </div>
            <FL label="Số điện thoại">
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="0901 234 567" type="tel" className={inputCls} />
            </FL>
            <FL label="Loại phòng">
              <select value={form.roomType} onChange={e => setForm(p => ({ ...p, roomType: e.target.value }))} className={inputCls}>
                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FL>
            <FL label="Phòng mục tiêu">
              <input value={form.targetRoom} onChange={e => setForm(p => ({ ...p, targetRoom: e.target.value }))}
                placeholder="A201" className={inputCls} />
            </FL>
            <FL label="Nhân viên phụ trách">
              <select value={form.salesperson} onChange={e => setForm(p => ({ ...p, salesperson: e.target.value }))} className={inputCls}>
                {SALESPERSONS.slice(1).map(s => <option key={s}>{s}</option>)}
              </select>
            </FL>
            <FL label="Ngày hẹn *">
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputCls} />
            </FL>
            <FL label="Giờ hẹn">
              <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputCls}>
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </FL>
          </div>

          <FL label="Thời lượng">
            <div className="flex gap-2">
              {[30, 60, 90].map(d => (
                <button key={d} onClick={() => setForm(p => ({ ...p, duration: d }))}
                  className="flex-1 py-2.5 rounded-xl text-sm border transition"
                  style={{
                    background: form.duration === d ? "#4338CA" : "white",
                    color: form.duration === d ? "white" : "#64748B",
                    borderColor: form.duration === d ? "#4338CA" : "#E2E8F0",
                    fontWeight: form.duration === d ? 700 : 400,
                  }}>
                  {d} phút
                </button>
              ))}
            </div>
          </FL>

          <FL label="Ghi chú">
            <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className={`${inputCls} resize-none`} placeholder="Thông tin thêm về khách..." />
          </FL>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50 transition"
            style={{ fontWeight: 500, color: "#475569" }}>
            Hủy
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition"
            style={{ fontWeight: 700 }}>
            Tạo lịch hẹn
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JUMP-TO-DATE PICKER
// ─────────────────────────────────────────────────────────────────────────────
const VI_MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                   "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const VI_DAYS_SHORT = ["T2","T3","T4","T5","T6","T7","CN"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
function getMonday(d: Date) {
  const c = new Date(d);
  const day = c.getDay();
  c.setDate(c.getDate() - (day === 0 ? 6 : day - 1));
  c.setHours(0, 0, 0, 0);
  return c;
}
function getSunday(d: Date) {
  const mon = getMonday(d);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return sun;
}
function isInSameWeek(day: Date, base: Date) {
  const mon = getMonday(base);
  const sun = getSunday(base);
  return day >= mon && day <= sun;
}
// Returns 6-week grid (42 days) starting from first Monday on/before the 1st of the month
function getMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const firstDay = first.getDay(); // 0=Sun…6=Sat
  const startOffset = firstDay === 0 ? -6 : 1 - firstDay;
  const start = new Date(year, month, 1 + startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

type PickerView = "day" | "month" | "year";

function JumpToDatePicker({
  baseDate,
  onSelect,
}: {
  baseDate: Date;
  onSelect: (d: Date) => void;
}) {
  const [open,        setOpen]        = useState(false);
  const [view,        setView]        = useState<PickerView>("day");
  const [cursor,      setCursor]      = useState(new Date(baseDate));
  const [hoverDay,    setHoverDay]    = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const today        = new Date();
  today.setHours(0,0,0,0);

  // Sync cursor when baseDate changes externally
  useEffect(() => { setCursor(new Date(baseDate)); }, [baseDate.getTime()]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setView("day");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const monday = getMonday(baseDate);
  const sunday = getSunday(baseDate);
  const triggerLabel = (() => {
    const m = monday.getMonth() === sunday.getMonth()
      ? `${VI_MONTHS[monday.getMonth()].replace("Tháng ","T")}`
      : `${VI_MONTHS[monday.getMonth()].replace("Tháng ","T")}–${VI_MONTHS[sunday.getMonth()].replace("Tháng ","T")}`;
    return `${m} ${monday.getFullYear()}`;
  })();

  // ── Day view grid ──
  const grid = getMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const activeHover = hoverDay;

  const renderDayView = () => (
    <div>
      {/* Month/Year nav */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-0.5">
          <button onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
        </div>
        <button
          onClick={() => setView("month")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition group"
        >
          <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1E293B" }}>
            {VI_MONTHS[cursor.getMonth()]}
          </span>
          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#6366F1" }}>
            {cursor.getFullYear()}
          </span>
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {VI_DAYS_SHORT.map(d => (
          <div key={d} className="text-center" style={{ fontSize: "0.67rem", fontWeight: 700, color: "#94A3B8", padding: "2px 0" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {grid.map((day, i) => {
          const isCurrentMonth = day.getMonth() === cursor.getMonth();
          const isToday        = isSameDay(day, today);
          const isSelected     = isInSameWeek(day, baseDate);
          const isHovered      = activeHover ? isInSameWeek(day, activeHover) : false;
          const isWeekStart    = day.getDay() === 1 || i % 7 === 0;
          const isWeekEnd      = day.getDay() === 0 || i % 7 === 6;
          const isFirstOfRange = isSelected && (isSameDay(day, getMonday(baseDate)) || i % 7 === 0);
          const isLastOfRange  = isSelected && (isSameDay(day, getSunday(baseDate)) || i % 7 === 6);
          const isHoverFirst   = isHovered && activeHover && (isSameDay(day, getMonday(activeHover)) || i % 7 === 0);
          const isHoverLast    = isHovered && activeHover && (isSameDay(day, getSunday(activeHover)) || i % 7 === 6);

          return (
            <div
              key={i}
              className="relative"
              style={{
                // Range strip background
                background: isSelected
                  ? (isFirstOfRange || isLastOfRange ? "transparent" : "#EEF2FF")
                  : isHovered && !isSelected
                    ? (isHoverFirst || isHoverLast ? "transparent" : "#F8FAFF")
                    : "transparent",
                borderRadius: isFirstOfRange ? "8px 0 0 8px"
                             : isLastOfRange  ? "0 8px 8px 0"
                             : 0,
              }}
            >
              <button
                onClick={() => {
                  onSelect(day);
                  setOpen(false); setView("day");
                }}
                onMouseEnter={() => setHoverDay(day)}
                onMouseLeave={() => setHoverDay(null)}
                className="w-full flex items-center justify-center transition"
                style={{
                  height: 30,
                  fontSize: "0.78rem",
                  fontWeight: isToday ? 800 : isSelected ? 700 : 400,
                  color: !isCurrentMonth
                    ? "#CBD5E1"
                    : isSelected
                      ? (isSameDay(day, getMonday(baseDate)) || isSameDay(day, getSunday(baseDate))) ? "#fff" : "#4338CA"
                      : isToday ? "#6366F1" : "#1E293B",
                  background: isSelected && (isSameDay(day, getMonday(baseDate)) || isSameDay(day, getSunday(baseDate)))
                    ? "#6366F1"
                    : isToday && !isSelected ? "transparent" : "transparent",
                  borderRadius: "8px",
                  position: "relative",
                  zIndex: 1,
                  outline: isToday && !isSelected ? "2px solid #6366F140" : "none",
                }}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick jumps */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => { onSelect(today); setOpen(false); setView("day"); }}
          className="px-3 py-1.5 rounded-xl text-xs transition hover:bg-indigo-50"
          style={{ fontWeight: 600, color: "#6366F1" }}
        >
          Hôm nay
        </button>
        <button
          onClick={() => { setOpen(false); setView("day"); }}
          className="px-3 py-1.5 rounded-xl text-xs transition hover:bg-slate-100"
          style={{ fontWeight: 500, color: "#64748B" }}
        >
          Đóng
        </button>
      </div>
    </div>
  );

  // ── Month view ──
  const renderMonthView = () => (
    <div>
      <div className="flex items-center justify-between px-1 mb-3">
        <button onClick={() => setCursor(d => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
          <ChevronLeft size={14} className="text-slate-500" />
        </button>
        <button onClick={() => setView("year")}
          className="px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition"
          style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1E293B" }}>
          {cursor.getFullYear()}
        </button>
        <button onClick={() => setCursor(d => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
          <ChevronRight size={14} className="text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {VI_MONTHS.map((name, mi) => {
          const isActive = mi === baseDate.getMonth() && cursor.getFullYear() === baseDate.getFullYear();
          const isCurrent = mi === today.getMonth() && cursor.getFullYear() === today.getFullYear();
          return (
            <button
              key={mi}
              onClick={() => { setCursor(new Date(cursor.getFullYear(), mi, 1)); setView("day"); }}
              className="py-2 rounded-xl text-sm transition"
              style={{
                fontWeight: isActive ? 800 : 500,
                background: isActive ? "#6366F1" : isCurrent ? "#EEF2FF" : "transparent",
                color: isActive ? "#fff" : isCurrent ? "#4338CA" : "#1E293B",
                fontSize: "0.78rem",
                outline: isCurrent && !isActive ? "1.5px solid #6366F140" : "none",
              }}
            >
              {name.replace("Tháng ", "T")}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Year view ──
  const startYear = Math.floor(cursor.getFullYear() / 12) * 12;
  const renderYearView = () => (
    <div>
      <div className="flex items-center justify-between px-1 mb-3">
        <button onClick={() => setCursor(d => new Date(d.getFullYear() - 12, d.getMonth(), 1))}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
          <ChevronLeft size={14} className="text-slate-500" />
        </button>
        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1E293B" }}>
          {startYear} – {startYear + 11}
        </span>
        <button onClick={() => setCursor(d => new Date(d.getFullYear() + 12, d.getMonth(), 1))}
          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
          <ChevronRight size={14} className="text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => startYear + i).map(yr => {
          const isActive  = yr === baseDate.getFullYear();
          const isCurrent = yr === today.getFullYear();
          return (
            <button
              key={yr}
              onClick={() => { setCursor(new Date(yr, cursor.getMonth(), 1)); setView("month"); }}
              className="py-2 rounded-xl text-sm transition"
              style={{
                fontWeight: isActive ? 800 : 500,
                background: isActive ? "#6366F1" : isCurrent ? "#EEF2FF" : "transparent",
                color: isActive ? "#fff" : isCurrent ? "#4338CA" : "#1E293B",
                fontSize: "0.82rem",
                outline: isCurrent && !isActive ? "1.5px solid #6366F140" : "none",
              }}
            >
              {yr}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger input-style button */}
      <button
        onClick={() => { setOpen(o => !o); setView("day"); setCursor(new Date(baseDate)); }}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition group"
        style={{
          background: open ? "#EEF2FF" : "white",
          borderColor: open ? "#6366F1" : "#E2E8F0",
          boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.12)" : "0 1px 3px rgba(0,0,0,0.06)",
          minWidth: 148,
        }}
      >
        {/* Left: date text */}
        <div className="flex flex-col items-start leading-tight">
          <span style={{
            fontSize: "0.65rem", fontWeight: 600,
            color: open ? "#6366F1" : "#94A3B8",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            Tuần {open ? "▲" : "▼"}
          </span>
          <span style={{
            fontSize: "0.85rem", fontWeight: 800,
            color: open ? "#4338CA" : "#1E293B",
            letterSpacing: "-0.01em",
          }}>
            {triggerLabel}
          </span>
        </div>
        {/* Right: calendar icon */}
        <div
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition"
          style={{ background: open ? "#6366F1" : "#F1F5F9" }}
        >
          <Calendar size={13} style={{ color: open ? "#fff" : "#6366F1" }} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 rounded-2xl bg-white"
          style={{
            left: 0,
            top: "100%",
            width: 272,
            padding: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
            animation: "pickerDrop 0.18s cubic-bezier(.21,1.02,.73,1) forwards",
          }}
        >
          <style>{`@keyframes pickerDrop{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

          {/* Breadcrumb view tabs */}
          <div className="flex items-center gap-1 mb-3 pb-3 border-b border-slate-100">
            {(["day","month","year"] as PickerView[]).map((v, vi) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex-1 py-1.5 rounded-lg text-center transition"
                style={{
                  fontSize: "0.68rem",
                  fontWeight: view === v ? 700 : 500,
                  background: view === v ? "#6366F1" : "transparent",
                  color: view === v ? "#fff" : "#94A3B8",
                }}
              >
                {v === "day" ? "Ngày" : v === "month" ? "Tháng" : "Năm"}
              </button>
            ))}
          </div>

          {view === "day"   && renderDayView()}
          {view === "month" && renderMonthView()}
          {view === "year"  && renderYearView()}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALENDAR PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Showings() {
  const [baseDate, setBaseDate]         = useState(new Date("2025-04-21"));
  const [appointments, setAppointments] = useState<ShowingAppointment[]>(showingAppointments);
  const [filter, setFilter]             = useState("Tất cả");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPrefill, setNewPrefill]     = useState<{ date: string; time: string } | undefined>();
  const [detail, setDetail]             = useState<{ appt: ShowingAppointment; pos: { x: number; y: number } } | null>(null);

  const weekDates = getWeekDates(baseDate);
  const todayStr  = formatDateStr(new Date());

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  const filtered = appointments.filter(a => filter === "Tất cả" || a.salesperson === filter);

  const getAppts = (date: string, time: string) =>
    filtered.filter(a => a.date === date && a.time === time);

  const handleDrop = (id: string, date: string, time: string) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, date, time } : a));

  const handleCellClick = (date: string, time: string) => {
    setNewPrefill({ date, time });
    setShowNewModal(true);
  };

  const handleApptClick = (appt: ShowingAppointment, e: React.MouseEvent) => {
    setDetail({ appt, pos: { x: e.clientX, y: e.clientY } });
  };

  const handleDelete = (id: string) =>
    setAppointments(prev => prev.filter(a => a.id !== id));

  const handleSave = (appt: ShowingAppointment) =>
    setAppointments(prev => [...prev, appt]);

  const weekLabel = `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} – ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}/${weekDates[6].getFullYear()}`;

  // Stats per salesperson
  const salespersonStats = SALESPERSONS.slice(1).map(s => {
    const appts = filtered.filter(a => a.salesperson === s);
    const confirmed = appts.filter(a => a.status === "Confirmed").length;
    const pending   = appts.filter(a => a.status === "Pending").length;
    const clr       = salespersonColor(s);
    return { name: s, total: appts.length, confirmed, pending, clr };
  });

  const totalWeek = filtered.filter(a =>
    weekDates.some(d => formatDateStr(d) === a.date)
  ).length;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4 h-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: nav controls + date picker */}
          <div className="flex items-center gap-2">
            {/* Prev / Next arrows */}
            <div className="flex items-center gap-0.5">
              <button onClick={prevWeek}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                title="Tuần trước">
                <ChevronLeft size={15} className="text-slate-600" />
              </button>
              <button onClick={nextWeek}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition"
                title="Tuần sau">
                <ChevronRight size={15} className="text-slate-600" />
              </button>
            </div>

            {/* Jump-to-date picker — central focus */}
            <JumpToDatePicker
              baseDate={baseDate}
              onSelect={d => setBaseDate(d)}
            />

            {/* Week range label */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>{weekLabel}</span>
            </div>

            {/* Today pill */}
            <button
              onClick={() => setBaseDate(new Date())}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition"
              style={{ fontSize: "0.78rem", fontWeight: 600, color: "#475569" }}
            >
              Hôm nay
            </button>
          </div>

          {/* Right: filter + CTA */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              {SALESPERSONS.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className="px-3 py-1.5 rounded-lg text-xs transition"
                  style={{
                    background: filter === s ? "white" : "transparent",
                    color: filter === s ? "#1E293B" : "#64748B",
                    fontWeight: filter === s ? 700 : 400,
                    boxShadow: filter === s ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setNewPrefill(undefined); setShowNewModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm"
              style={{ fontWeight: 600 }}>
              <Plus size={13} /> Tạo lịch hẹn
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-4 gap-3">
          {/* Total */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#EEF2FF" }}>
              <Calendar size={15} style={{ color: "#6366F1" }} />
            </div>
            <div>
              <div className="text-slate-400" style={{ fontSize: "0.7rem", fontWeight: 500 }}>Tuần này</div>
              <div className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.15rem" }}>{totalWeek}</div>
              <div className="text-slate-400" style={{ fontSize: "0.67rem" }}>lịch hẹn</div>
            </div>
          </div>
          {/* Per salesperson */}
          {salespersonStats.map(s => (
            <div key={s.name} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0"
                style={{ background: s.clr.border, fontWeight: 700 }}>
                {getInitials(s.name)}
              </div>
              <div className="min-w-0">
                <div className="text-slate-700 truncate" style={{ fontWeight: 700, fontSize: "0.8rem" }}>{s.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span style={{ fontSize: "0.67rem", color: "#10B981", fontWeight: 600 }}>{s.confirmed} xác nhận</span>
                  {s.pending > 0 && <span style={{ fontSize: "0.67rem", color: "#F59E0B", fontWeight: 600 }}>· {s.pending} chờ</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Calendar Grid ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 overflow-hidden flex flex-col">
          {/* Day headers — sticky */}
          <div className="flex flex-shrink-0 border-b border-slate-200 bg-white" style={{ paddingLeft: 56 }}>
            {weekDates.map((date, i) => {
              const dateStr  = formatDateStr(date);
              const isToday  = dateStr === todayStr;
              const apptCount = filtered.filter(a => a.date === dateStr).length;
              return (
                <div key={i} className="flex-1 text-center py-3 border-l border-slate-100"
                  style={{ background: isToday ? "#EEF2FF" : "transparent" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: isToday ? "#6366F1" : "#94A3B8", letterSpacing: "0.04em" }}>
                    {DAY_LABELS[i]}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: 26, height: 26,
                        background: isToday ? "#6366F1" : "transparent",
                        color: isToday ? "white" : "#1E293B",
                        fontWeight: isToday ? 800 : 600,
                        fontSize: "0.82rem",
                      }}>
                      {date.getDate()}
                    </div>
                    {apptCount > 0 && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                        style={{ background: isToday ? "#4338CA" : "#94A3B8", fontSize: "0.6rem", fontWeight: 700 }}>
                        {apptCount}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollable time grid — no scrollbar */}
          <div className="flex-1 relative overflow-hidden">
            <div
              className="no-scrollbar overflow-y-auto absolute inset-0"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex">
                {/* Time gutter */}
                <div className="flex-shrink-0" style={{ width: 56 }}>
                  {TIME_SLOTS.map(time => {
                    const isHour = time.endsWith(":00");
                    return (
                      <div key={time}
                        className="relative flex items-start justify-end pr-2"
                        style={{
                          height: SLOT_H,
                          borderBottom: isHour ? "1px solid #E2E8F0" : "1px solid #F1F5F9",
                        }}>
                        {isHour && (
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 600,
                            color: "#94A3B8", lineHeight: 1, marginTop: -6,
                          }}>
                            {time}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Day columns */}
                {weekDates.map((date, di) => {
                  const dateStr = formatDateStr(date);
                  const isToday = dateStr === todayStr;
                  return (
                    <div key={di} className="flex-1 border-l border-slate-100"
                      style={{ background: isToday ? "rgba(99,102,241,0.015)" : "transparent" }}>
                      {TIME_SLOTS.map((time, ti) => {
                        const cellAppts = getAppts(dateStr, time);
                        return (
                          <TimeSlotCell
                            key={time}
                            date={dateStr}
                            time={time}
                            slotIndex={ti}
                            appointments={cellAppts}
                            onDrop={handleDrop}
                            onCellClick={handleCellClick}
                            onApptClick={handleApptClick}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom fade — visible cutoff indicator */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: 48,
                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))",
                zIndex: 20,
              }}
            />
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 flex-wrap pb-1">
          {SALESPERSONS.slice(1).map(s => {
            const clr = salespersonColor(s);
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: clr.bg, borderLeft: `3px solid ${clr.border}` }} />
                <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 500 }}>{s}</span>
              </div>
            );
          })}
          <div className="ml-auto flex items-center gap-4">
            {Object.entries(STATUS_CFG).slice(0, 3).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: v.text }} />
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>{v.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.7rem" }}>
              <Move size={11} /> Kéo để dời lịch
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showNewModal && (
        <NewAppointmentModal
          prefill={newPrefill}
          onClose={() => setShowNewModal(false)}
          onSave={handleSave}
        />
      )}
      {detail && (
        <DetailModal
          appt={detail.appt}
          anchorPos={detail.pos}
          onClose={() => setDetail(null)}
          onDelete={handleDelete}
        />
      )}
    </DndProvider>
  );
}