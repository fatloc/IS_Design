import { useState, useRef } from "react";
import {
  CalendarDays, Plus, User, ChevronLeft, ChevronRight, Home, X,
  Check, Phone, Users, ChevronDown, MessageSquare, Save, Clock,
  BedDouble, Smile, Meh, ThumbsDown, Zap, CalendarCheck, Filter,
} from "lucide-react";

// ── Theme ──────────────────────────────────────────────────────────────────
const O  = "#EA580C";
const OL = "#FB923C";

// ── Types ──────────────────────────────────────────────────────────────────
type AppStatus  = "Chờ xem" | "Đã xem" | "Đã hủy";
type Reaction   = "" | "Quan tâm cao" | "Cân nhắc" | "Không phù hợp" | "Muốn đặt cọc";

interface Appointment {
  id: string; customer: string; avatar: string; phone: string;
  room: string; roomType: string;
  day: number; month: number; year: number; // month 0-indexed
  time: string; duration: number; // minutes
  staff: string; status: AppStatus; notes: string; reaction: Reaction;
}

interface PendingReq {
  id: string; customer: string; avatar: string;
  phone: string; roomType: string; area: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const STAFF_LIST = ["Nguyễn Văn A", "Trần Thị C", "Phạm Văn D", "Lê Thị E"];
const TIME_SLOTS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00",
                    "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

const INIT_APPTS: Appointment[] = [
  { id:"a1", customer:"Trần Minh Khôi",  avatar:"MK", phone:"0912 345 678", room:"A102", roomType:"Ghép giường", day:26, month:3, year:2026, time:"10:00", duration:30, staff:"Nguyễn Văn A", status:"Đã xem",  notes:"Khách thích phòng, sẽ suy nghĩ thêm", reaction:"Cân nhắc"    },
  { id:"a2", customer:"Nguyễn Thị Hoa",  avatar:"TH", phone:"0918 765 432", room:"B203", roomType:"Toàn phòng",  day:29, month:3, year:2026, time:"14:00", duration:45, staff:"Nguyễn Văn A", status:"Chờ xem", notes:"",                                   reaction:""             },
  { id:"a3", customer:"Phạm Thị Ngân",   avatar:"TN", phone:"0901 234 567", room:"A103", roomType:"Toàn phòng",  day:29, month:3, year:2026, time:"09:30", duration:30, staff:"Trần Thị C",   status:"Chờ xem", notes:"",                                   reaction:""             },
  { id:"a4", customer:"Vũ Minh Hải",     avatar:"MH", phone:"0933 112 233", room:"C302", roomType:"Ghép giường", day:29, month:3, year:2026, time:"11:00", duration:30, staff:"Nguyễn Văn A", status:"Đã hủy",  notes:"Khách bận đột xuất",                 reaction:""             },
  { id:"a5", customer:"Lê Văn Phú",      avatar:"VP", phone:"0905 123 456", room:"C301", roomType:"Ghép giường", day:30, month:3, year:2026, time:"11:00", duration:30, staff:"Nguyễn Văn A", status:"Chờ xem", notes:"",                                   reaction:""             },
  { id:"a6", customer:"Đỗ Thị Thanh",    avatar:"TT", phone:"0903 456 789", room:"B204", roomType:"Ghép giường", day:2,  month:4, year:2026, time:"09:00", duration:30, staff:"Trần Thị C",   status:"Chờ xem", notes:"",                                   reaction:""             },
  { id:"a7", customer:"Bùi Minh Quân",   avatar:"MQ", phone:"0911 222 333", room:"A105", roomType:"Toàn phòng",  day:6,  month:4, year:2026, time:"14:30", duration:45, staff:"Phạm Văn D",   status:"Chờ xem", notes:"",                                   reaction:""             },
  { id:"a8", customer:"Lý Thị Hương",    avatar:"TH", phone:"0977 654 321", room:"A102", roomType:"Ghép giường", day:26, month:3, year:2026, time:"14:00", duration:30, staff:"Trần Thị C",   status:"Đã xem",  notes:"Rất quan tâm, muốn gặp lần 2",       reaction:"Quan tâm cao" },
];

const INIT_PENDING: PendingReq[] = [
  { id:"p1", customer:"Hoàng Văn Dũng", avatar:"VD", phone:"0908 654 321", roomType:"Ghép giường", area:"Q.7"  },
  { id:"p2", customer:"Ngô Thị Bình",   avatar:"TB", phone:"0916 333 444", roomType:"Toàn phòng",  area:"Q.1"  },
  { id:"p3", customer:"Trịnh Văn Hào",  avatar:"VH", phone:"0924 555 666", roomType:"Ghép giường", area:"Q.7"  },
];

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<AppStatus, { bg:string; color:string; dot:string; border:string }> = {
  "Chờ xem": { bg:"#FFF7ED", color:"#C2410C", dot:O,         border:"#FED7AA" },
  "Đã xem":  { bg:"#ECFDF5", color:"#065F46", dot:"#10B981", border:"#6EE7B7" },
  "Đã hủy":  { bg:"#F8FAFC", color:"#64748B", dot:"#94A3B8", border:"#E2E8F0" },
};

const REACTION_CFG: Record<Exclude<Reaction,"">, { icon:typeof Smile; color:string; bg:string; label:string }> = {
  "Quan tâm cao":    { icon:Smile,      color:"#059669", bg:"#ECFDF5", label:"Quan tâm cao"   },
  "Cân nhắc":        { icon:Meh,        color:"#D97706", bg:"#FFFBEB", label:"Đang cân nhắc"  },
  "Không phù hợp":   { icon:ThumbsDown, color:"#64748B", bg:"#F1F5F9", label:"Không phù hợp"  },
  "Muốn đặt cọc":    { icon:Zap,        color:O,         bg:"#FFF7ED", label:"→ Muốn đặt cọc" },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                     "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const DAY_LABELS  = ["T2","T3","T4","T5","T6","T7","CN"];

function fmtTime(t:string, dur:number){
  const [h,m]=t.split(":").map(Number);
  const endMin=m+dur, endH=h+Math.floor(endMin/60), endM=endMin%60;
  return `${t} – ${String(endH).padStart(2,"0")}:${String(endM).padStart(2,"0")}`;
}

// ══════════════════════════════════════════════════════════════════════════
// MINI CALENDAR
// ══════════════════════════════════════════════════════════════════════════
function MiniCalendar({
  appointments, viewYear, viewMonth, selDay,
  onSelect, onPrev, onNext,
}: {
  appointments: Appointment[];
  viewYear: number; viewMonth: number; selDay: number;
  onSelect: (d:number)=>void; onPrev:()=>void; onNext:()=>void;
}) {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst    = new Date(viewYear, viewMonth, 1).getDay();
  const firstDay    = rawFirst === 0 ? 6 : rawFirst - 1;

  // Build dot map: day → count
  const dotMap: Record<number, number> = {};
  appointments.forEach(a => {
    if(a.month===viewMonth && a.year===viewYear && a.status !== "Đã hủy")
      dotMap[a.day] = (dotMap[a.day]??0) + 1;
  });

  const cells: (number|null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({length:daysInMonth},(_,i)=>i+1),
  ];
  while(cells.length%7!==0) cells.push(null);

  // April 29, 2026 is "today"
  const isToday = (d:number) => d===29 && viewMonth===3 && viewYear===2026;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background:"white", borderBottom:"1px solid #F8FAFC" }}>
        <button onClick={onPrev}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-slate-100">
          <ChevronLeft size={13} style={{ color:"#64748B" }}/>
        </button>
        <div style={{ fontWeight:800, fontSize:"0.88rem", color:"#1E293B" }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button onClick={onNext}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-slate-100">
          <ChevronRight size={13} style={{ color:"#64748B" }}/>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 px-2.5 pt-2" style={{ background:"white" }}>
        {DAY_LABELS.map(d=>(
          <div key={d} className="text-center pb-1.5"
            style={{ fontSize:"0.62rem", fontWeight:800, color:"#CBD5E1" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-2.5 pb-3 gap-y-0.5" style={{ background:"white" }}>
        {cells.map((day,i)=>(
          <div key={i} className="flex flex-col items-center">
            {day ? (
              <button onClick={()=>onSelect(day)}
                className="relative flex flex-col items-center justify-center w-8 h-8 rounded-xl transition-all"
                style={{
                  background: day===selDay
                    ? `linear-gradient(135deg,${O},#DC2626)`
                    : isToday(day)
                    ? `${O}12`
                    : "transparent",
                  boxShadow: day===selDay ? `0 2px 8px ${O}40` : "none",
                }}>
                <span style={{
                  fontSize:"0.78rem",
                  fontWeight: day===selDay||isToday(day)||(dotMap[day]??0)>0 ? 800 : 400,
                  color: day===selDay ? "white" : isToday(day) ? O : "#374151",
                }}>
                  {day}
                </span>
                {/* Dot indicators */}
                {(dotMap[day]??0) > 0 && day!==selDay && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {Array.from({length:Math.min(dotMap[day],3)}).map((_,di)=>(
                      <span key={di} className="w-1 h-1 rounded-full"
                        style={{ background: day===selDay?"rgba(255,255,255,0.7)":O }}/>
                    ))}
                  </div>
                )}
                {/* Today ring */}
                {isToday(day) && day!==selDay && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ border:`1.5px solid ${O}`, opacity:0.4 }}/>
                )}
              </button>
            ) : <div className="w-8 h-8"/>}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop:"1px solid #F8FAFC", background:"#FAFBFD" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background:O }}/>
          <span style={{ fontSize:"0.65rem", color:"#94A3B8" }}>Có lịch hẹn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3 rounded-md" style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}/>
          <span style={{ fontSize:"0.65rem", color:"#94A3B8" }}>Ngày chọn</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// NEW APPOINTMENT MODAL
// ══════════════════════════════════════════════════════════════════════════
function NewApptModal({
  defaultDay, defaultMonth, defaultYear, pending,
  onClose, onSaved,
}: {
  defaultDay:number; defaultMonth:number; defaultYear:number;
  pending: PendingReq[];
  onClose:()=>void;
  onSaved:(a:Appointment)=>void;
}) {
  const pad = (n:number) => String(n).padStart(2,"0");
  const [custName, setCustName] = useState("");
  const [phone,    setPhone]    = useState("");
  const [room,     setRoom]     = useState("B204");
  const [roomType, setRoomType] = useState("Toàn phòng");
  const [date,     setDate]     = useState(`${defaultYear}-${pad(defaultMonth+1)}-${pad(defaultDay)}`);
  const [time,     setTime]     = useState("10:00");
  const [duration, setDuration] = useState(30);
  const [staff,    setStaff]    = useState("Nguyễn Văn A");
  const [saved,    setSaved]    = useState(false);

  const handleSave = () => {
    if(!custName.trim()) return;
    const [y,m,d] = date.split("-").map(Number);
    const initials = custName.trim().split(" ").map((w:string)=>w[0]).slice(0,2).join("").toUpperCase();
    setSaved(true);
    setTimeout(()=>{
      onSaved({
        id:`a${Date.now()}`, customer:custName.trim(), avatar:initials, phone,
        room, roomType, day:d, month:m-1, year:y, time, duration,
        staff, status:"Chờ xem", notes:"", reaction:"",
      });
      onClose();
    },1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:"rgba(15,23,42,0.6)", backdropFilter:"blur(6px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ border:"1px solid #E2E8F0" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}>
          <div>
            <div className="text-white" style={{ fontWeight:900, fontSize:"1rem" }}>Lên lịch hẹn mới</div>
            <div className="text-orange-200 mt-0.5" style={{ fontSize:"0.72rem" }}>Điền thông tin & phân công nhân viên</div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-orange-200 hover:text-white hover:bg-white/10 transition">
            <X size={14}/>
          </button>
        </div>

        <div className="px-6 py-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Tên khách hàng *</label>
              <input value={custName} onChange={e=>setCustName(e.target.value)}
                placeholder="Họ và tên đầy đủ"
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:`1.5px solid ${custName.trim()?"#E2E8F0":"#FECACA"}`, background:"#FAFAFA", fontSize:"0.85rem" }}/>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Số điện thoại</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09xx xxx xxx"
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}/>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Mã phòng xem</label>
              <input value={room} onChange={e=>setRoom(e.target.value)}
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}/>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Ngày hẹn</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem" }}/>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Giờ hẹn</label>
              <select value={time} onChange={e=>setTime(e.target.value)}
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                {TIME_SLOTS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Thời lượng</label>
              <select value={duration} onChange={e=>setDuration(Number(e.target.value))}
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                {[15,30,45,60].map(d=><option key={d} value={d}>{d} phút</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>
                <Users size={10} className="inline mr-1" style={{ color:"#94A3B8" }}/>
                Phân công nhân viên
              </label>
              <select value={staff} onChange={e=>setStaff(e.target.value)}
                className="w-full px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                {STAFF_LIST.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl transition"
            style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
            Hủy
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-white transition flex items-center justify-center gap-2"
            style={{ background:saved?"#059669":`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.85rem", fontWeight:800, boxShadow:`0 3px 12px ${O}35` }}>
            {saved ? <><Check size={14}/> Đã lưu!</> : "Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// APPOINTMENT CARD (Timeline item)
// ══════════════════════════════════════════════════════════════════════════
function ApptCard({
  appt, isFirst, isLast, onUpdate,
}: {
  appt: Appointment; isFirst:boolean; isLast:boolean;
  onUpdate: (id:string, changes:Partial<Appointment>)=>void;
}) {
  const [expanded,  setExpanded]  = useState(false);
  const [localNote, setLocalNote] = useState(appt.notes);
  const [localRxn,  setLocalRxn]  = useState<Reaction>(appt.reaction);
  const [saving,    setSaving]    = useState(false);

  const cfg = STATUS_CFG[appt.status];

  const handleSave = () => {
    setSaving(true);
    setTimeout(()=>{
      onUpdate(appt.id, { notes:localNote, reaction:localRxn, status: localRxn==="Muốn đặt cọc"?"Đã xem":appt.status });
      setSaving(false);
      setExpanded(false);
    },800);
  };

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width:40 }}>
        <div className="w-8 text-right flex-shrink-0">
          <span style={{ fontSize:"0.72rem", fontWeight:800, color:O, whiteSpace:"nowrap" }}>{appt.time}</span>
        </div>
      </div>

      {/* Connector dot + line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width:16 }}>
        <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ background: appt.status==="Đã hủy"?"#CBD5E1":appt.status==="Đã xem"?"#10B981":O, marginTop:10 }}/>
        {!isLast && (
          <div className="flex-1 w-px" style={{ background:"#E2E8F0", minHeight:24, marginTop:4 }}/>
        )}
      </div>

      {/* Card */}
      <div className="flex-1 mb-3 rounded-2xl overflow-hidden"
        style={{ border:`1.5px solid ${expanded?O+"50":cfg.border}`, boxShadow: expanded?`0 2px 12px ${O}15`:"0 1px 3px rgba(0,0,0,0.04)", transition:"all 0.15s" }}>
        {/* Card header */}
        <div className="flex items-start gap-3 px-4 py-3"
          style={{ background: appt.status==="Đã hủy"?"#F8FAFC":"white" }}>
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0 ${appt.status==="Đã hủy"?"opacity-40":""}`}
            style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.72rem" }}>
            {appt.avatar}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontWeight:800, fontSize:"0.92rem", color: appt.status==="Đã hủy"?"#94A3B8":"#1E293B",
                textDecoration: appt.status==="Đã hủy"?"line-through":"none" }}>
                {appt.customer}
              </span>
              {appt.reaction && appt.reaction !== "" && (
                (() => {
                  const r = REACTION_CFG[appt.reaction as Exclude<Reaction,"">];
                  return (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                      style={{ background:r.bg, color:r.color, fontSize:"0.65rem", fontWeight:700 }}>
                      <r.icon size={9}/> {r.label}
                    </span>
                  );
                })()
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Home size={10} style={{ color:"#CBD5E1" }}/>
                <span style={{ fontSize:"0.75rem", color:"#64748B", fontWeight:600 }}>Phòng {appt.room}</span>
                <span className="px-1.5 py-0.5 rounded-md ml-1"
                  style={{ background:`${O}12`, color:O, fontSize:"0.62rem", fontWeight:700 }}>{appt.roomType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color:"#CBD5E1" }}/>
                <span style={{ fontSize:"0.72rem", color:"#94A3B8" }}>{fmtTime(appt.time,appt.duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <User size={10} style={{ color:"#CBD5E1" }}/>
              <span style={{ fontSize:"0.72rem", color:"#94A3B8" }}>Nhân viên: {appt.staff}</span>
            </div>
            {appt.notes && (
              <div className="flex items-start gap-1.5 mt-1.5 px-2.5 py-1.5 rounded-lg"
                style={{ background:"#F8FAFC" }}>
                <MessageSquare size={10} style={{ color:"#CBD5E1", marginTop:1 }}/>
                <span style={{ fontSize:"0.72rem", color:"#64748B", fontStyle:"italic" }}>"{appt.notes}"</span>
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Status dropdown */}
            <div className="relative">
              <select
                value={appt.status}
                onChange={e=>onUpdate(appt.id,{status:e.target.value as AppStatus})}
                className="appearance-none pl-2.5 pr-6 py-1.5 rounded-xl outline-none cursor-pointer"
                style={{
                  background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
                  fontSize:"0.72rem", fontWeight:700, minWidth:96,
                }}>
                <option>Chờ xem</option>
                <option>Đã xem</option>
                <option>Đã hủy</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color:cfg.color }}/>
            </div>
            {/* Toggle result */}
            {appt.status !== "Đã hủy" && (
              <button onClick={()=>setExpanded(p=>!p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition"
                style={{
                  background: expanded?`${O}15`:"#F8FAFC",
                  border:`1px solid ${expanded?O+"40":"#E2E8F0"}`,
                  color: expanded?O:"#64748B", fontSize:"0.72rem", fontWeight:700,
                }}>
                <MessageSquare size={10}/>
                {expanded?"Đóng":"Cập nhật kết quả"}
              </button>
            )}
          </div>
        </div>

        {/* Expanded result form */}
        {expanded && (
          <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop:`1px solid ${O}20`, background:`${O}04` }}>
            <div style={{ fontSize:"0.75rem", fontWeight:800, color:"#374151" }}>Cập nhật kết quả xem phòng</div>

            {/* Reaction chips */}
            <div>
              <div style={{ fontSize:"0.7rem", fontWeight:600, color:"#94A3B8", marginBottom:6 }}>Phản hồi của khách</div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(REACTION_CFG) as Exclude<Reaction,"">[]).map(r=>{
                  const rc = REACTION_CFG[r];
                  const sel = localRxn===r;
                  return (
                    <button key={r} onClick={()=>setLocalRxn(sel?"":r)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition"
                      style={{
                        background: sel?rc.bg:"#F8FAFC",
                        border:`1.5px solid ${sel?rc.color+"50":"#E2E8F0"}`,
                        color: sel?rc.color:"#64748B", fontSize:"0.72rem", fontWeight:700,
                      }}>
                      <rc.icon size={11}/> {rc.label}
                      {sel && <Check size={9} style={{ color:rc.color }}/>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize:"0.7rem", fontWeight:600, color:"#94A3B8", marginBottom:4 }}>Ghi chú chi tiết</div>
              <textarea value={localNote} onChange={e=>setLocalNote(e.target.value)}
                rows={2} placeholder="VD: Khách thích tầng cao, hỏi về chỗ để xe..."
                className="w-full rounded-xl resize-none outline-none"
                style={{ padding:"0.6rem 0.8rem", background:"white", border:"1.5px solid #E2E8F0", fontSize:"0.8rem" }}/>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button onClick={()=>{setExpanded(false);setLocalNote(appt.notes);setLocalRxn(appt.reaction);}}
                className="px-3 py-2 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", fontSize:"0.78rem", color:"#64748B", fontWeight:600 }}>
                Hủy
              </button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition"
                style={{ background:saving?"#059669":`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.78rem", fontWeight:800 }}>
                {saving ? <><Check size={12}/> Đã lưu</> : <><Save size={12}/> Lưu kết quả</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
export default function SaleAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(INIT_APPTS);
  const [pending,      setPending]      = useState<PendingReq[]>(INIT_PENDING);
  const [viewYear,     setViewYear]     = useState(2026);
  const [viewMonth,    setViewMonth]    = useState(3); // April
  const [selDay,       setSelDay]       = useState(29); // Today
  const [showModal,    setShowModal]    = useState(false);
  const [jumpDate,     setJumpDate]     = useState("2026-04-29");
  const jumpRef = useRef<HTMLInputElement>(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const dayAppts = appointments
    .filter(a => a.day===selDay && a.month===viewMonth && a.year===viewYear)
    .sort((a,b) => a.time.localeCompare(b.time));

  const pendingCount = pending.length;
  const dayTotal  = dayAppts.length;
  const dayChorxem = dayAppts.filter(a=>a.status==="Chờ xem").length;
  const dayDaxem  = dayAppts.filter(a=>a.status==="Đã xem").length;
  const dayHuy    = dayAppts.filter(a=>a.status==="Đã hủy").length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if(viewMonth===0){ setViewMonth(11); setViewYear(y=>y-1); }
    else setViewMonth(m=>m-1);
  };
  const nextMonth = () => {
    if(viewMonth===11){ setViewMonth(0); setViewYear(y=>y+1); }
    else setViewMonth(m=>m+1);
  };

  const handleDaySelect = (d:number) => {
    setSelDay(d);
  };

  const handleJumpDate = (val:string) => {
    setJumpDate(val);
    if(!val) return;
    const [y,m,d] = val.split("-").map(Number);
    setViewYear(y); setViewMonth(m-1); setSelDay(d);
  };

  const handleUpdate = (id:string, changes:Partial<Appointment>) => {
    setAppointments(prev=>prev.map(a=>a.id===id?{...a,...changes}:a));
  };

  const handleNewSaved = (a:Appointment) => {
    setAppointments(prev=>[...prev,a]);
    setViewYear(a.year); setViewMonth(a.month); setSelDay(a.day);
  };

  const handleSchedulePending = (req:PendingReq) => {
    setShowModal(true);
    // Pre-select this req name
  };

  const formattedSelDay = `${String(selDay).padStart(2,"0")} ${MONTH_NAMES[viewMonth]}, ${viewYear}`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      {showModal && (
        <NewApptModal
          defaultDay={selDay} defaultMonth={viewMonth} defaultYear={viewYear}
          pending={pending}
          onClose={()=>setShowModal(false)}
          onSaved={handleNewSaved}
        />
      )}

      {/* ── Top Action Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
              <CalendarCheck size={14} style={{ color:O }}/>
            </div>
            <h2 style={{ fontWeight:900, fontSize:"1.3rem", color:"#1E293B", letterSpacing:"-0.02em" }}>
              Lịch xem phòng & Phân công
            </h2>
          </div>
          <p style={{ fontSize:"0.82rem", color:"#64748B", paddingLeft:"2.25rem" }}>
            {appointments.filter(a=>a.status!=="Đã hủy").length} lịch hẹn hoạt động · {pendingCount} yêu cầu chờ xếp lịch
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Jump-to-date */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition"
            style={{ background:"white", border:"1.5px solid #E2E8F0", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}
            onClick={()=>jumpRef.current?.showPicker?.()}>
            <CalendarDays size={14} style={{ color:O }}/>
            <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#374151", whiteSpace:"nowrap" }}>
              {jumpDate
                ? new Date(jumpDate).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"})
                : "Chọn ngày"}
            </span>
            <input
              ref={jumpRef}
              type="date" value={jumpDate}
              onChange={e=>handleJumpDate(e.target.value)}
              className="w-0 h-0 opacity-0 absolute pointer-events-none"
              style={{ position:"absolute" }}
            />
            <span style={{ fontSize:"0.8rem" }}>📅</span>
          </div>

          {/* New appointment button */}
          <button onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white transition"
            style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.85rem", boxShadow:`0 4px 16px ${O}40` }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
            <Plus size={15}/> Lên lịch hẹn mới
          </button>
        </div>
      </div>

      {/* ── Dual-Panel Layout ───────────────────────────────────────────── */}
      <div className="grid gap-5" style={{ gridTemplateColumns:"280px 1fr" }}>

        {/* ═══ LEFT PANEL ════════════════════════════════════════════════ */}
        <div className="space-y-4">

          {/* Mini Calendar */}
          <MiniCalendar
            appointments={appointments}
            viewYear={viewYear} viewMonth={viewMonth} selDay={selDay}
            onSelect={handleDaySelect} onPrev={prevMonth} onNext={nextMonth}
          />

          {/* Pending Requests */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background:"#FFF7ED", borderBottom:"1px solid #FED7AA" }}>
              <div>
                <div style={{ fontWeight:800, fontSize:"0.85rem", color:"#1E293B" }}>Chờ xếp lịch</div>
                <div style={{ fontSize:"0.68rem", color:"#92400E", marginTop:1 }}>Yêu cầu chưa có lịch hẹn</div>
              </div>
              {pendingCount > 0 && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background:O, fontSize:"0.68rem", fontWeight:900 }}>{pendingCount}</span>
              )}
            </div>

            <div className="bg-white divide-y divide-slate-50">
              {pending.map(req=>(
                <div key={req.id} className="flex items-start gap-3 px-4 py-3 group hover:bg-orange-50/30 transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.68rem" }}>
                    {req.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight:700, fontSize:"0.82rem", color:"#1E293B" }}>{req.customer}</div>
                    <div style={{ fontSize:"0.68rem", color:"#64748B" }}>{req.roomType} · {req.area}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={9} style={{ color:"#CBD5E1" }}/>
                      <span style={{ fontSize:"0.65rem", color:"#94A3B8" }}>{req.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={()=>handleSchedulePending(req)}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white transition opacity-0 group-hover:opacity-100"
                    style={{ background:O, fontSize:"0.65rem", fontWeight:800 }}>
                    <Plus size={9}/> Xếp lịch
                  </button>
                </div>
              ))}
              {pending.length===0 && (
                <div className="flex flex-col items-center py-6">
                  <CalendarCheck size={22} style={{ color:"#CBD5E1" }} className="mb-1.5"/>
                  <div style={{ fontSize:"0.78rem", color:"#94A3B8" }}>Tất cả đã có lịch hẹn</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT PANEL – Daily Agenda ════════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>

          {/* Agenda header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background:"white", borderBottom:"1px solid #F1F5F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}>
                <CalendarCheck size={16} className="text-white"/>
              </div>
              <div>
                <div style={{ fontWeight:900, fontSize:"0.95rem", color:"#1E293B" }}>
                  Lịch trình ngày: {formattedSelDay}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {[
                    { label:`${dayTotal} cuộc hẹn`, color:"#1E293B" },
                    { label:`${dayChorxem} chờ xem`, color:O         },
                    { label:`${dayDaxem} đã xem`,   color:"#059669"  },
                    { label:`${dayHuy} hủy`,         color:"#94A3B8"  },
                  ].map((s,i)=>(
                    <span key={i} className="flex items-center gap-1.5" style={{ fontSize:"0.72rem" }}>
                      {i>0&&<span style={{ color:"#E2E8F0" }}>·</span>}
                      <span style={{ fontWeight:i===0?700:600, color:s.color }}>{s.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={()=>setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
              style={{ background:`${O}12`, border:`1px solid ${O}25`, color:O, fontSize:"0.75rem", fontWeight:700 }}>
              <Plus size={12}/> Thêm lịch
            </button>
          </div>

          {/* Timeline */}
          <div className="px-5 py-5 bg-white">
            {dayAppts.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <CalendarDays size={36} style={{ color:"#CBD5E1" }} className="mb-3"/>
                <div style={{ fontWeight:700, fontSize:"0.95rem", color:"#94A3B8" }}>Chưa có lịch hẹn nào</div>
                <div style={{ fontSize:"0.82rem", color:"#CBD5E1", marginTop:4 }}>
                  Nhấn "Lên lịch hẹn mới" hoặc chọn ngày khác trên lịch
                </div>
                <button onClick={()=>setShowModal(true)}
                  className="flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-white"
                  style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.82rem", fontWeight:700 }}>
                  <Plus size={13}/> Lên lịch hẹn mới
                </button>
              </div>
            ) : (
              <div>
                {dayAppts.map((appt, idx) => (
                  <ApptCard
                    key={appt.id} appt={appt}
                    isFirst={idx===0} isLast={idx===dayAppts.length-1}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer summary */}
          {dayAppts.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
              <span style={{ fontSize:"0.75rem", color:"#94A3B8" }}>
                Cập nhật lần cuối: 29/04/2026 – 08:45
              </span>
              <div className="flex items-center gap-2">
                {[
                  { label:"Chờ xem", count:dayChorxem, bg:`${O}12`, color:O       },
                  { label:"Đã xem",  count:dayDaxem,   bg:"#ECFDF5",color:"#059669"},
                  { label:"Đã hủy",  count:dayHuy,     bg:"#F1F5F9", color:"#94A3B8"},
                ].filter(s=>s.count>0).map(s=>(
                  <span key={s.label} className="px-2.5 py-1 rounded-full"
                    style={{ background:s.bg, color:s.color, fontSize:"0.7rem", fontWeight:700 }}>
                    {s.count} {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
