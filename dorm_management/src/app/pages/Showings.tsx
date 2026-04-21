import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, User, Home, FileText, Move
} from "lucide-react";
import { showingAppointments, ShowingAppointment } from "../data/mockData";

const SALESPERSONS = ["Tất cả", "Minh Tuấn", "Thu Hương", "Quang Vinh"];
const ROOM_TYPES = ["Single", "Double", "Triple"];
const COLOR_OPTIONS = ["indigo", "emerald", "amber", "rose", "cyan"];

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 19; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 19) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

function getWeekDates(baseDate: Date) {
  const d = new Date(baseDate);
  const day = d.getDay(); // 0 = Sun
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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: "bg-indigo-500", text: "text-white", border: "border-indigo-600", light: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  emerald: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600", light: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  amber: { bg: "bg-amber-500", text: "text-white", border: "border-amber-600", light: "bg-amber-50 text-amber-700 border-amber-200" },
  rose: { bg: "bg-rose-500", text: "text-white", border: "border-rose-600", light: "bg-rose-50 text-rose-700 border-rose-200" },
  cyan: { bg: "bg-cyan-500", text: "text-white", border: "border-cyan-600", light: "bg-cyan-50 text-cyan-700 border-cyan-200" },
};

const ITEM_TYPE = "SHOWING";

// ── Draggable Appointment Card ──
function AppointmentCard({ appt, onClick }: { appt: ShowingAppointment; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: appt.id },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  drag(ref);

  const cfg = COLOR_MAP[appt.color] || COLOR_MAP.indigo;
  const durationSlots = appt.duration / 30;
  const height = durationSlots * 30 - 4; // 30px per slot, 4px gap

  return (
    <div
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`absolute left-0 right-0 mx-0.5 rounded-lg px-2 py-1 cursor-pointer overflow-hidden border ${cfg.bg} ${cfg.border} ${isDragging ? "opacity-40 scale-95" : "hover:brightness-95"} transition-all duration-100`}
      style={{ height: `${height}px`, top: "2px", zIndex: 10 }}
    >
      <div className={`text-xs ${cfg.text} leading-tight`} style={{ fontWeight: 600 }}>
        {appt.guest}
      </div>
      <div className={`text-xs ${cfg.text} opacity-80 leading-tight`}>
        {appt.time} · {appt.roomType}
      </div>
      {height > 50 && (
        <div className={`text-xs ${cfg.text} opacity-70 leading-tight mt-0.5`}>
          {appt.salesperson}
        </div>
      )}
      <Move size={8} className={`absolute top-1 right-1 ${cfg.text} opacity-40`} />
    </div>
  );
}

// ── Droppable Time Slot ──
function TimeSlotCell({
  date, time, appointments, onDrop, onCellClick, onApptClick
}: {
  date: string;
  time: string;
  appointments: ShowingAppointment[];
  onDrop: (id: string, date: string, time: string) => void;
  onCellClick: (date: string, time: string) => void;
  onApptClick: (appt: ShowingAppointment) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string }) => onDrop(item.id, date, time),
    collect: m => ({ isOver: m.isOver() }),
  });
  drop(ref);

  return (
    <div
      ref={ref}
      className={`relative h-[30px] border-b border-slate-100 hover:bg-indigo-50/30 transition cursor-pointer ${isOver ? "bg-indigo-100/50" : ""}`}
      onClick={() => onCellClick(date, time)}
    >
      {appointments.map(appt => (
        <AppointmentCard key={appt.id} appt={appt} onClick={() => onApptClick(appt)} />
      ))}
    </div>
  );
}

// ── New Appointment Modal ──
function NewAppointmentModal({ prefill, onClose, onSave }: {
  prefill?: { date: string; time: string };
  onClose: () => void;
  onSave: (appt: ShowingAppointment) => void;
}) {
  const [form, setForm] = useState({
    guest: "",
    roomType: "Single",
    salesperson: "Minh Tuấn",
    date: prefill?.date || "",
    time: prefill?.time || "09:00",
    duration: 60,
    notes: "",
    color: "indigo",
  });

  const handleSave = () => {
    if (!form.guest || !form.date) return;
    const newAppt: ShowingAppointment = {
      id: `SA${Date.now()}`,
      ...form,
    };
    onSave(newAppt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3>Tạo lịch xem phòng</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Tên khách *</label>
            <input
              value={form.guest}
              onChange={e => setForm(p => ({ ...p, guest: e.target.value }))}
              placeholder="Nguyễn Văn A"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Loại phòng</label>
              <select value={form.roomType} onChange={e => setForm(p => ({ ...p, roomType: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Nhân viên sale</label>
              <select value={form.salesperson} onChange={e => setForm(p => ({ ...p, salesperson: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {SALESPERSONS.slice(1).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Ngày *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Giờ</label>
              <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Thời lượng</label>
            <div className="flex gap-2">
              {[30, 60, 90].map(d => (
                <button key={d} onClick={() => setForm(p => ({ ...p, duration: d }))}
                  className={`flex-1 py-2 rounded-lg text-sm border transition ${form.duration === d ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
                >
                  {d} phút
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Màu hiển thị</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-7 h-7 rounded-full ${COLOR_MAP[c].bg} transition ${form.color === c ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Ghi chú thêm..." />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button onClick={handleSave} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition">Tạo lịch hẹn</button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──
function AppointmentDetailModal({ appt, onClose, onDelete }: {
  appt: ShowingAppointment;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const cfg = COLOR_MAP[appt.color] || COLOR_MAP.indigo;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className={`${cfg.bg} px-5 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="text-base" style={{ fontWeight: 600 }}>{appt.guest}</div>
              <div className="text-xs opacity-80">{appt.date} · {appt.time}</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"><X size={15} /></button>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Home size={14} className="text-slate-400" /> Loại phòng: <strong>{appt.roomType}</strong>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <User size={14} className="text-slate-400" /> Nhân viên: <strong>{appt.salesperson}</strong>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Clock size={14} className="text-slate-400" /> Thời lượng: <strong>{appt.duration} phút</strong>
          </div>
          {appt.notes && (
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{appt.notes}</span>
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={() => { onDelete(appt.id); onClose(); }} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm hover:bg-red-100">Xóa</button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700">Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Calendar Page ──
export default function Showings() {
  const [baseDate, setBaseDate] = useState(new Date("2025-04-21"));
  const [appointments, setAppointments] = useState<ShowingAppointment[]>(showingAppointments);
  const [salespersonFilter, setSalespersonFilter] = useState("Tất cả");
  const [newModal, setNewModal] = useState<{ date: string; time: string } | undefined>(undefined);
  const [showNewModal, setShowNewModal] = useState(false);
  const [detailAppt, setDetailAppt] = useState<ShowingAppointment | null>(null);

  const weekDates = getWeekDates(baseDate);

  const prevWeek = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - 7);
    setBaseDate(d);
  };

  const nextWeek = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    setBaseDate(d);
  };

  const handleDrop = (id: string, date: string, time: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, date, time } : a));
  };

  const handleCellClick = (date: string, time: string) => {
    setNewModal({ date, time });
    setShowNewModal(true);
  };

  const handleSave = (appt: ShowingAppointment) => {
    setAppointments(prev => [...prev, appt]);
  };

  const handleDelete = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const filteredAppts = appointments.filter(a =>
    salespersonFilter === "Tất cả" || a.salesperson === salespersonFilter
  );

  // Get appointments for a specific date/time slot
  const getAppts = (date: string, time: string) => {
    return filteredAppts.filter(a => a.date === date && a.time === time);
  };

  const todayStr = formatDateStr(new Date());
  const weekLabel = `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} – ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}/${weekDates[6].getFullYear()}`;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Header Controls */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={prevWeek} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-700" style={{ fontWeight: 600 }}>{weekLabel}</span>
            <button onClick={nextWeek} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
              <ChevronRight size={16} />
            </button>
            <button onClick={() => setBaseDate(new Date())} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition">
              Tuần này
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Salesperson filter */}
            <div className="flex gap-1">
              {SALESPERSONS.map(s => (
                <button key={s} onClick={() => setSalespersonFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition ${salespersonFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setNewModal(undefined); setShowNewModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              <Plus size={14} /> Tạo lịch hẹn
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {SALESPERSONS.slice(1).map(s => {
            const count = filteredAppts.filter(a => a.salesperson === s).length;
            return (
              <div key={s} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>{s[0]}</div>
                <div>
                  <div className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{s}</div>
                  <div className="text-xs text-slate-400">{count} lịch hẹn tuần này</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <table className="w-full border-collapse" style={{ minWidth: "700px" }}>
              <thead className="sticky top-0 z-20 bg-white">
                <tr>
                  {/* Time col header */}
                  <th className="w-16 border-b border-r border-slate-200 bg-slate-50" />
                  {weekDates.map((date, i) => {
                    const dateStr = formatDateStr(date);
                    const isToday = dateStr === todayStr;
                    const apptCount = filteredAppts.filter(a => a.date === dateStr).length;
                    return (
                      <th key={i} className={`border-b border-r border-slate-200 px-2 py-2.5 ${isToday ? "bg-indigo-50" : "bg-slate-50"}`}>
                        <div className="text-xs text-slate-500">{DAY_LABELS[i]}</div>
                        <div className={`text-sm ${isToday ? "text-indigo-600" : "text-slate-800"}`} style={{ fontWeight: 600 }}>
                          {date.getDate()}/{date.getMonth() + 1}
                        </div>
                        {apptCount > 0 && (
                          <div className="w-4 h-4 bg-indigo-500 text-white rounded-full text-xs flex items-center justify-center mx-auto mt-0.5">
                            {apptCount}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, ti) => (
                  <tr key={time}>
                    {/* Time label */}
                    <td className={`w-16 text-right pr-2 border-r border-slate-200 text-xs text-slate-400 align-top pt-0 ${time.endsWith(":00") ? "border-b border-slate-200" : "border-b border-slate-50"}`}
                      style={{ height: "30px" }}>
                      {time.endsWith(":00") ? time : ""}
                    </td>
                    {weekDates.map((date, di) => {
                      const dateStr = formatDateStr(date);
                      const isToday = dateStr === todayStr;
                      const cellAppts = getAppts(dateStr, time);
                      return (
                        <td key={di} className={`border-r border-slate-200 relative p-0 ${time.endsWith(":00") ? "border-b border-slate-200" : "border-b border-slate-50"} ${isToday ? "bg-indigo-50/20" : ""}`}
                          style={{ height: "30px" }}>
                          <TimeSlotCell
                            date={dateStr}
                            time={time}
                            appointments={cellAppts}
                            onDrop={handleDrop}
                            onCellClick={handleCellClick}
                            onApptClick={setDetailAppt}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(COLOR_MAP).map(([color, cfg]) => (
            <div key={color} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${cfg.bg}`} />
              <span className="text-xs text-slate-500 capitalize">{color}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <Move size={12} />
            Kéo để dời lịch hẹn
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewAppointmentModal
          prefill={newModal}
          onClose={() => setShowNewModal(false)}
          onSave={handleSave}
        />
      )}
      {detailAppt && (
        <AppointmentDetailModal
          appt={detailAppt}
          onClose={() => setDetailAppt(null)}
          onDelete={handleDelete}
        />
      )}
    </DndProvider>
  );
}