import { useState } from "react";
import { ChevronLeft, ChevronRight, User, MapPin, Clock, ChevronDown, MessageSquarePlus, X, CalendarDays } from "lucide-react";
import { showingAppointments as initialApts, ShowingAppointment, AppointmentStatus, staffList } from "../../data/saleMockData";

const statusColors: Record<AppointmentStatus, string> = {
  Pending: "bg-blue-100 text-blue-700",
  Shown: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-500",
};
const statusLabels: Record<AppointmentStatus, string> = { Pending: "Chờ xem", Shown: "Đã xem", Cancelled: "Đã huỷ" };

// Generate calendar days for April 2025
function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Mon-start
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function NotesModal({ apt, onClose, onSave }: { apt: ShowingAppointment; onClose: () => void; onSave: (id: string, notes: string) => void }) {
  const [notes, setNotes] = useState(apt.notes || "");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Ghi chú kết quả xem phòng</h2>
            <p className="text-xs text-slate-400 mt-0.5">{apt.clientName} · {apt.date} {apt.time}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
            placeholder="Nhập kết quả buổi xem phòng... (Phản hồi của khách, tình trạng phòng, hành động tiếp theo...)" />
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition" style={{ fontWeight: 500 }}>Huỷ</button>
          <button onClick={() => { onSave(apt.id, notes); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition" style={{ fontWeight: 500 }}>
            Lưu ghi chú
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SaleAppointments() {
  const [appointments, setApts] = useState(initialApts);
  const [selectedDate, setSelectedDate] = useState("2025-04-20");
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [notesApt, setNotesApt] = useState<ShowingAppointment | null>(null);

  const year = 2025; const month = 3; // April
  const cells = buildCalendar(year, month);
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const aptsByDate = (dateStr: string) =>
    appointments.filter(a => a.date === dateStr);

  const selectedApts = aptsByDate(selectedDate);

  const hasApt = (d: number) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return appointments.filter(a => a.date === ds && a.status !== "Cancelled").length;
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setApts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setOpenStatusId(null);
  };

  const handleSaveNotes = (id: string, notes: string) => {
    setApts(prev => prev.map(a => a.id === id ? { ...a, notes } : a));
  };

  return (
    <div className="grid grid-cols-5 gap-5 h-full">
      {/* Calendar */}
      <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden self-start">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Tháng 4, 2025</h2>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
              <ChevronLeft size={14} className="text-slate-500" />
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
              <ChevronRight size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {days.map(d => (
              <div key={d} className="text-center text-xs text-slate-400 py-1" style={{ fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const count = hasApt(d);
              const isSelected = ds === selectedDate;
              const isToday = ds === "2025-04-20";
              return (
                <button key={i} onClick={() => setSelectedDate(ds)}
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-all ${
                    isSelected ? "bg-emerald-600 text-white shadow-md" :
                    isToday ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    "text-slate-700 hover:bg-slate-100"
                  }`} style={{ fontWeight: isSelected || isToday ? 600 : 400 }}>
                  {d}
                  {count > 0 && (
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : "bg-emerald-400"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 pb-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Có lịch
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Hôm nay
          </div>
        </div>

        {/* Weekly summary */}
        <div className="border-t border-slate-100 p-4">
          <div className="text-xs text-slate-500 mb-3" style={{ fontWeight: 600 }}>Tuần này</div>
          {["2025-04-20","2025-04-21","2025-04-22","2025-04-23","2025-04-24"].map(d => {
            const count = aptsByDate(d).length;
            const label = new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" });
            return (
              <button key={d} onClick={() => setSelectedDate(d)}
                className={`w-full flex items-center justify-between py-2 px-2 rounded-lg text-xs transition mb-0.5 ${d === selectedDate ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`}>
                <span style={{ fontWeight: d === selectedDate ? 600 : 400 }}>{label}</span>
                {count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs ${d === selectedDate ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`} style={{ fontWeight: 600 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agenda */}
      <div className="col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden self-start">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
              Lịch ngày {new Date(selectedDate).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{selectedApts.length} cuộc hẹn</p>
          </div>
          <CalendarDays size={16} className="text-emerald-500" />
        </div>

        <div className="p-5 space-y-3">
          {selectedApts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CalendarDays size={32} className="mx-auto mb-2 text-slate-200" />
              <p className="text-sm">Không có lịch xem phòng ngày này</p>
            </div>
          ) : (
            selectedApts.sort((a, b) => a.time.localeCompare(b.time)).map(apt => (
              <div key={apt.id} className={`rounded-xl border p-4 transition-all ${
                apt.status === "Shown" ? "border-emerald-200 bg-emerald-50/30" :
                apt.status === "Cancelled" ? "border-slate-200 bg-slate-50 opacity-70" :
                "border-slate-200 hover:border-blue-200 hover:bg-blue-50/20"
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                      {apt.clientName.split(" ").slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{apt.clientName}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} /> {apt.time}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={11} /> Phòng {apt.roomId}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500"><User size={11} /> {apt.staffName}</span>
                      </div>
                    </div>
                  </div>
                  {/* Status dropdown */}
                  <div className="relative flex-shrink-0">
                    <button onClick={() => setOpenStatusId(openStatusId === apt.id ? null : apt.id)}
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ${statusColors[apt.status]}`}
                      style={{ fontWeight: 500 }}>
                      {statusLabels[apt.status]} <ChevronDown size={10} />
                    </button>
                    {openStatusId === apt.id && (
                      <div className="absolute top-full right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-32">
                        {(["Pending","Shown","Cancelled"] as AppointmentStatus[]).map(s => (
                          <button key={s} onClick={() => handleStatusChange(apt.id, s)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition"
                            style={{ fontWeight: apt.status === s ? 600 : 400 }}>
                            {statusLabels[s]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {apt.notes && (
                  <div className="mt-3 ml-13 pl-13 text-xs text-slate-500 bg-white/60 rounded-lg p-2.5 border border-slate-100 italic" style={{ marginLeft: "3.25rem" }}>
                    "{apt.notes}"
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between" style={{ marginLeft: "3.25rem" }}>
                  <button onClick={() => setNotesApt(apt)}
                    className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition"
                    style={{ fontWeight: 500 }}>
                    <MessageSquarePlus size={13} />
                    {apt.notes ? "Sửa ghi chú" : "Thêm kết quả xem phòng"}
                  </button>
                  <span className="text-xs text-slate-300">{apt.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {notesApt && <NotesModal apt={notesApt} onClose={() => setNotesApt(null)} onSave={handleSaveNotes} />}
    </div>
  );
}
