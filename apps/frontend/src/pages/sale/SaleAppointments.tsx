import { useState, useRef, useEffect } from "react";
import {
  CalendarDays, Plus, User, ChevronLeft, ChevronRight, Home, X,
  Check, CheckCircle, Phone, ChevronDown, MessageSquare, Save, Clock,
  Smile, Meh, ThumbsDown, Zap, CalendarCheck, AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { usePagedList } from "../../hooks/usePagedList";
import { Pagination } from "../../components/Pagination";
import { getAppointments, updateAppointment, createAppointment, getRequests, updateRequest, getUsers, getRooms } from "../../services/api";
import type { Appointment, Request, Employee, Room } from "../../types";

// ── Theme ──────────────────────────────────────────────────────────────────
const O  = "#EA580C";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg:string; color:string; dot:string; border:string }> = {
  "Chờ xem": { bg:"#FFF7ED", color:"#C2410C", dot:O,         border:"#FED7AA" },
  "Đã xem":  { bg:"#ECFDF5", color:"#065F46", dot:"#10B981", border:"#6EE7B7" },
  "Đã hủy":  { bg:"#F8FAFC", color:"#64748B", dot:"#94A3B8", border:"#E2E8F0" },
};
const DEFAULT_STATUS_CFG = { bg:"#F1F5F9", color:"#64748B", dot:"#94A3B8", border:"#E2E8F0" };

type Reaction = "" | "Quan tâm cao" | "Cân nhắc" | "Không phù hợp" | "Muốn đặt cọc";
const REACTION_CFG: Record<Exclude<Reaction,"">, { icon:typeof Smile; color:string; bg:string; label:string }> = {
  "Quan tâm cao":  { icon:Smile,      color:"#059669", bg:"#ECFDF5", label:"Quan tâm cao"   },
  "Cân nhắc":      { icon:Meh,        color:"#D97706", bg:"#FFFBEB", label:"Đang cân nhắc"  },
  "Không phù hợp": { icon:ThumbsDown, color:"#64748B", bg:"#F1F5F9", label:"Không phù hợp"  },
  "Muốn đặt cọc":  { icon:Zap,        color:O,         bg:"#FFF7ED", label:"→ Muốn đặt cọc" },
};

const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
                     "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const DAY_LABELS  = ["T2","T3","T4","T5","T6","T7","CN"];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseSqlDate(value: string | null | undefined) {
  if (!value) return null;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const vnMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (vnMatch) {
    const [, d, m, y] = vnMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateInputLabel(value: string) {
  const parsed = parseSqlDate(value);
  if (!parsed) return "Chọn ngày";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

// ── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? DEFAULT_STATUS_CFG;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontSize:"0.72rem", fontWeight:700 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:cfg.dot }}/>
      {status || "Không rõ"}
    </span>
  );
}

// ── Mini Calendar ──────────────────────────────────────────────────────────
function MiniCalendar({
  appointments, viewYear, viewMonth, selDay,
  onSelect, onPrev, onNext,
}: {
  appointments: Appointment[];
  viewYear: number; viewMonth: number; selDay: number;
  onSelect:(d:number)=>void; onPrev:()=>void; onNext:()=>void;
}) {
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirst    = new Date(viewYear, viewMonth, 1).getDay();
  const firstDay    = rawFirst === 0 ? 6 : rawFirst - 1;

  const dotMap: Record<number, number> = {};
  appointments.forEach(a => {
    if (!a.ngayHen) return;
    const d = parseSqlDate(a.ngayHen);
    if (!d) return;
    if (d.getFullYear()===viewYear && d.getMonth()===viewMonth && a.trangThaiHen!=="Đã hủy")
      dotMap[d.getDate()] = (dotMap[d.getDate()]??0) + 1;
  });

  const cells: (number|null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({length:daysInMonth},(_,i)=>i+1),
  ];
  while(cells.length%7!==0) cells.push(null);

  const today = new Date();
  const isToday = (d:number) => d===today.getDate() && viewMonth===today.getMonth() && viewYear===today.getFullYear();

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background:"white", borderBottom:"1px solid #F8FAFC" }}>
        <button onClick={onPrev} className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-slate-100">
          <ChevronLeft size={13} style={{ color:"#64748B" }}/>
        </button>
        <div style={{ fontWeight:800, fontSize:"0.88rem", color:"#1E293B" }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
        <button onClick={onNext} className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:bg-slate-100">
          <ChevronRight size={13} style={{ color:"#64748B" }}/>
        </button>
      </div>
      <div className="grid grid-cols-7 px-2.5 pt-2" style={{ background:"white" }}>
        {DAY_LABELS.map(d=>(
          <div key={d} className="text-center pb-1.5" style={{ fontSize:"0.62rem", fontWeight:800, color:"#CBD5E1" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 px-2.5 pb-3 gap-y-0.5" style={{ background:"white" }}>
        {cells.map((day,i)=>(
          <div key={i} className="flex flex-col items-center">
            {day ? (
              <button onClick={()=>onSelect(day)}
                className="relative flex flex-col items-center justify-center w-8 h-8 rounded-xl transition-all"
                style={{
                  background: day===selDay ? `linear-gradient(135deg,${O},#DC2626)` : isToday(day) ? `${O}12` : "transparent",
                  boxShadow: day===selDay ? `0 2px 8px ${O}40` : "none",
                }}>
                <span style={{ fontSize:"0.78rem", fontWeight: day===selDay||isToday(day)||(dotMap[day]??0)>0 ? 800:400, color: day===selDay ? "white" : isToday(day) ? O : "#374151" }}>
                  {day}
                </span>
                {(dotMap[day]??0) > 0 && day!==selDay && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {Array.from({length:Math.min(dotMap[day],3)}).map((_,di)=>(
                      <span key={di} className="w-1 h-1 rounded-full" style={{ background:O }}/>
                    ))}
                  </div>
                )}
                {isToday(day) && day!==selDay && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ border:`1.5px solid ${O}`, opacity:0.4 }}/>
                )}
              </button>
            ) : <div className="w-8 h-8"/>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 px-4 py-2.5" style={{ borderTop:"1px solid #F8FAFC", background:"#FAFBFD" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background:O }}/>
          <span style={{ fontSize:"0.65rem", color:"#94A3B8" }}>Có lịch hẹn</span>
        </div>
      </div>
    </div>
  );
}

// ── Appointment Row ────────────────────────────────────────────────────────
function ApptRow({ appt, onUpdate }: {
  appt: Appointment;
  onUpdate: (id: string, changes: Partial<Appointment>) => void;
}) {
  const [expanded,  setExpanded]  = useState(false);
  const [localNote, setLocalNote] = useState("");
  const [localRxn,  setLocalRxn]  = useState<Reaction>("");
  const [saving,    setSaving]    = useState(false);

  const status = appt.trangThaiHen ?? "Chờ xem";
  const cfg    = STATUS_CFG[status] ?? DEFAULT_STATUS_CFG;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAppointment(appt.maLichHen, { trangThaiHen: status });
      onUpdate(appt.maLichHen, { trangThaiHen: status });
      setExpanded(false);
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateAppointment(appt.maLichHen, { trangThaiHen: newStatus });
      // Khi chuyển sang "Đã xem", tự động cập nhật trạng thái yêu cầu thuê
      if (newStatus === "Đã xem" && appt.maYeuCau) {
        await updateRequest(appt.maYeuCau, { trangThaiYeuCau: "Đã xem phòng" });
      }
    } catch {}
    onUpdate(appt.maLichHen, { trangThaiHen: newStatus });
  };

  return (
    <div className="flex gap-3 mb-3">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width:56 }}>
        <span style={{ fontSize:"0.72rem", fontWeight:800, color:O, whiteSpace:"nowrap" }}>{appt.thoiGianHen?.slice(0,5) ?? "--:--"}</span>
      </div>
      <div className="flex flex-col items-center flex-shrink-0" style={{ width:16 }}>
        <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0"
          style={{ background: status==="Đã hủy"?"#CBD5E1":status==="Đã xem"?"#10B981":O, marginTop:8 }}/>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden" style={{ border:`1.5px solid ${cfg.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-start gap-3 px-4 py-3" style={{ background:status==="Đã hủy"?"#F8FAFC":"white" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.72rem" }}>
            {getInitials(appt.khachHangXem)}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>KH: {appt.khachHangXem ?? "--"}</div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color:"#CBD5E1" }}/>
                <span style={{ fontSize:"0.72rem", color:"#94A3B8" }}>{appt.ngayHen ?? "--"}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={10} style={{ color:"#CBD5E1" }}/>
                <span style={{ fontSize:"0.72rem", color:"#94A3B8" }}>NV: {appt.nhanVienPhuTrach ?? "--"}</span>
              </div>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background:`${O}12`, color:O, fontWeight:700, fontSize:"0.68rem" }}>{appt.maLichHen}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="relative">
              <select value={status} onChange={e=>handleStatusChange(e.target.value)}
                className="appearance-none pl-2.5 pr-6 py-1.5 rounded-xl outline-none cursor-pointer"
                style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontSize:"0.72rem", fontWeight:700, minWidth:96 }}>
                <option>Chờ xem</option>
                <option>Đã xem</option>
                <option>Đã hủy</option>
              </select>
              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:cfg.color }}/>
            </div>
            {status !== "Đã hủy" && (
              <button onClick={()=>setExpanded(p=>!p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition"
                style={{ background:expanded?`${O}15`:"#F8FAFC", border:`1px solid ${expanded?O+"40":"#E2E8F0"}`, color:expanded?O:"#64748B", fontSize:"0.72rem", fontWeight:700 }}>
                <MessageSquare size={10}/>{expanded?"Đóng":"Ghi chú"}
              </button>
            )}
          </div>
        </div>
        {expanded && (
          <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop:`1px solid ${O}20`, background:`${O}04` }}>
            <div style={{ fontSize:"0.75rem", fontWeight:800, color:"#374151" }}>Phản hồi khách hàng</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(REACTION_CFG) as Exclude<Reaction,"">[] ).map(r=>{
                const rc = REACTION_CFG[r];
                const sel = localRxn===r;
                return (
                  <button key={r} onClick={()=>setLocalRxn(sel?"":r)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                    style={{ background:sel?rc.bg:"#F8FAFC", border:`1.5px solid ${sel?rc.color+"50":"#E2E8F0"}`, color:sel?rc.color:"#64748B", fontSize:"0.72rem", fontWeight:700 }}>
                    <rc.icon size={11}/> {rc.label}
                    {sel && <Check size={9} style={{ color:rc.color }}/>}
                  </button>
                );
              })}
            </div>
            <textarea value={localNote} onChange={e=>setLocalNote(e.target.value)}
              rows={2} placeholder="Ghi chú kết quả xem phòng..."
              className="w-full rounded-xl resize-none outline-none"
              style={{ padding:"0.6rem 0.8rem", background:"white", border:"1.5px solid #E2E8F0", fontSize:"0.8rem" }}/>
            <div className="flex items-center gap-2">
              <button onClick={()=>setExpanded(false)}
                className="px-3 py-2 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", fontSize:"0.78rem", color:"#64748B", fontWeight:600 }}>Hủy</button>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.78rem", fontWeight:800 }}>
                {saving ? <><Check size={12}/> Đã lưu</> : <><Save size={12}/> Lưu</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pending Requests Tab ───────────────────────────────────────────────────
function PendingRequestsTab({ onScheduled }: { onScheduled: () => void }) {
  const { items: pendingRequests, loading, reload } = usePagedList<Request>(getRequests, 5000, {
    trangThaiYeuCau: "Mới tạo",
  });
  const { items: rawEmployees } = usePagedList<any>(getUsers, 500);
  const employees = rawEmployees as Employee[];
  
  const { items: rawRooms } = usePagedList<Room>(getRooms, 500);
  const rooms = rawRooms as Room[];
  
  const [selectedReq, setSelectedReq] = useState<Request | null>(null);
  const [search, setSearch] = useState("");
  
  const [localPage, setLocalPage] = useState(0);
  const [localSize, setLocalSize] = useState(10);

  const filteredRequests = pendingRequests.filter(req => 
    (req.khachHangYeuCau ?? "").toLowerCase().includes(search.toLowerCase()) || 
    req.maYeuCau.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalElements = filteredRequests.length;
  const totalPages = Math.ceil(totalElements / localSize);
  const paginatedRequests = filteredRequests.slice(localPage * localSize, (localPage + 1) * localSize);

  useEffect(() => {
    setLocalPage(0);
  }, [search]);
  
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [staff, setStaff] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSchedule = async () => {
    const nvId = staff.split(" - ")[0]?.trim() || staff;
    const roomId = selectedRoomId.split(" - ")[0]?.trim() || selectedRoomId;
    if (!selectedReq || !date || !time || !nvId || !roomId) return alert("Vui lòng điền đủ thông tin, bao gồm phòng cần xem");
    
    if (nvId.length > 4) {
      return alert("Mã nhân viên chỉ được chứa tối đa 4 ký tự (ví dụ: 0001). Vui lòng chọn đúng nhân viên từ danh sách!");
    }
    
    if (selectedReq.thoiGianBatDauThueDuKien) {
      const selectedDateObj = new Date(date);
      const rentalDateObj = new Date(selectedReq.thoiGianBatDauThueDuKien);
      selectedDateObj.setHours(0, 0, 0, 0);
      rentalDateObj.setHours(0, 0, 0, 0);
      
      if (selectedDateObj > rentalDateObj) {
        return alert(`Ngày hẹn xem phòng (${date.split("-").reverse().join("/")}) không được trễ hơn ngày thuê dự kiến (${selectedReq.thoiGianBatDauThueDuKien.split("-").reverse().join("/")}). Vui lòng chọn ngày khác!`);
      }
    }

    setSaving(true);
    try {
      await createAppointment({
        khachHangXem: selectedReq.khachHangYeuCau,
        maYeuCau: selectedReq.maYeuCau,
        nhanVienPhuTrach: nvId,
        maPhong: roomId,
        ngayHen: date,
        thoiGianHen: time + ":00", 
        trangThaiHen: "Chờ xem",
      } as any);
      await updateRequest(selectedReq.maYeuCau, {
        trangThaiYeuCau: "Đã lên lịch xem",
      });
      alert("Đã tạo lịch xem phòng!");
      setSelectedReq(null);
      setSelectedRoomId("");
      setStaff("");
      reload();
      onScheduled();
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
           <AlertTriangle size={18} className="text-orange-500"/> Danh sách yêu cầu cần lên lịch ({pendingRequests.length})
        </h3>
        <div className="mb-4">
           <input 
             type="text" 
             value={search} 
             onChange={e => setSearch(e.target.value)} 
             placeholder="Tìm kiếm theo mã KH, mã YC..." 
             className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition text-sm"
           />
        </div>
        {loading ? <div className="text-slate-500 text-sm">Đang tải dữ liệu...</div> : (
          <div className="space-y-3">
             {paginatedRequests.map(req => (
               <div key={req.maYeuCau} 
                 onClick={() => setSelectedReq(req)}
                 className={`p-4 rounded-xl border cursor-pointer transition ${selectedReq?.maYeuCau === req.maYeuCau ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200" : "border-slate-200 hover:border-orange-300 bg-slate-50"}`}>
                 <div className="font-bold text-slate-800 flex justify-between items-center">
                    <span>{req.maYeuCau}</span>
                    <span className="text-xs font-semibold px-2 py-1 bg-white border rounded-md text-slate-600">Khách: {req.khachHangYeuCau}</span>
                 </div>
                 <div className="text-sm text-slate-500 mt-2 flex gap-4">
                    <span>Khu vực: <strong className="text-slate-700">{req.khuVuc || "Bất kỳ"}</strong></span>
                    <span>Ngân sách: <strong className="text-slate-700">{req.mucGiaMongMuon?.toLocaleString()}đ</strong></span>
                 </div>
                 {req.cacTieuChiKhac && <div className="text-xs text-slate-400 mt-1 truncate">Ghi chú: {req.cacTieuChiKhac}</div>}
               </div>
             ))}
             {pendingRequests.length === 0 && (
               <div className="bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center mt-2">
                 <CalendarDays size={32} className="mb-3 text-slate-300"/>
                 <p className="font-medium text-slate-600">Hiện giờ không có yêu cầu mới cần lên lịch</p>
                 <p className="text-xs text-slate-400 mt-1">Các hồ sơ tạo mới từ mục Yêu cầu thuê sẽ hiển thị tại đây.</p>
               </div>
             )}
             {pendingRequests.length > 0 && filteredRequests.length === 0 && (
               <div className="text-slate-500 text-sm italic py-4 text-center">Không tìm thấy yêu cầu nào khớp với "{search}"</div>
             )}
             
             {filteredRequests.length > 0 && (
               <div className="pt-3 border-t border-slate-100">
                 <Pagination
                   currentPage={localPage}
                   totalPages={totalPages}
                   totalElements={totalElements}
                   pageSize={localSize}
                   onPageChange={setLocalPage}
                   onPageSizeChange={(newSize) => {
                     setLocalSize(newSize);
                     setLocalPage(0);
                   }}
                 />
               </div>
             )}
          </div>
        )}
      </div>
      
      <div>
        {selectedReq ? (
           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-6">
             <h3 className="font-bold text-slate-800 text-xl mb-1">Xếp lịch xem phòng</h3>
             <p className="text-sm text-slate-500 mb-2">Cho yêu cầu {selectedReq.maYeuCau} của khách {selectedReq.khachHangYeuCau}</p>
             <div className="mb-6 pb-4 border-b">
               {selectedReq.thoiGianBatDauThueDuKien && (
                 <p className="text-sm font-semibold text-orange-600 flex items-center gap-1.5">
                   <CalendarDays size={14}/> Lịch thuê dự kiến: {selectedReq.thoiGianBatDauThueDuKien.split("-").reverse().join("/")}
                 </p>
               )}
             </div>
             
             <div className="space-y-5">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày hẹn</label>
                 <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition"/>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Giờ hẹn</label>
                 <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition"/>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Phòng cần xem</label>
                 <input type="text" list="room-list" value={selectedRoomId} onChange={e=>setSelectedRoomId(e.target.value)} placeholder="Ví dụ: P001" className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition"/>
                 <datalist id="room-list">
                   {rooms.map(room => (
                     <option key={room.maPhong} value={`${room.maPhong} - ${room.loaiPhong} - ${room.dienTich}m2`} />
                   ))}
                 </datalist>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã NV phụ trách hướng dẫn (Sale)</label>
                 <input type="text" list="staff-list" value={staff} onChange={e=>setStaff(e.target.value)} placeholder="Ví dụ: 0001" className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-orange-500 transition"/>
                 <datalist id="staff-list">
                   {employees.map(nv => (
                     <option key={nv.maNhanVien} value={`${nv.maNhanVien} - ${nv.hoTen} - ${nv.soDienThoai}`} />
                   ))}
                 </datalist>
               </div>
               <button onClick={handleSchedule} disabled={saving} className="w-full py-3.5 mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-50">
                 {saving ? "Đang xử lý..." : <><CheckCircle size={18}/> Xác nhận tạo lịch xem phòng</>}
               </button>
             </div>
           </div>
        ) : (
           <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center h-full text-slate-500 min-h-[400px]">
              <CalendarCheck size={48} className="mb-4 text-slate-300"/>
              <p className="font-medium text-slate-600">Chọn một yêu cầu bên trái để bắt đầu lên lịch</p>
              <p className="text-sm mt-2">Hệ thống sẽ tự động chuyển yêu cầu sang trạng thái "Đã lên lịch xem".</p>
           </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleAppointments() {
  const [activeTab, setActiveTab] = useState<"pending" | "scheduled">("pending");


  const [viewYear,  setViewYear]  = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [selDay,    setSelDay]    = useState(() => new Date().getDate());
  const [search,    setSearch]    = useState("");
  const jumpRef = useRef<HTMLInputElement>(null);
  const [jumpDate, setJumpDate]   = useState(() => toDateInputValue(new Date()));

  // Fetch appointments for the currently viewed month from server
  const {
    items: appointments, loading, error,
    totalElements,
    reload,
  } = usePagedList<Appointment>(getAppointments, 200, {
    month: viewMonth + 1, // backend expects 1-indexed
    year:  viewYear,
  });

  // Client-side filter by selected day
  const dayAppts = appointments.filter(a => {
    if (!a.ngayHen) return false;
    const d = parseSqlDate(a.ngayHen);
    if (!d) return false;
    return d.getDate()===selDay && d.getMonth()===viewMonth && d.getFullYear()===viewYear;
  });

  const searchFiltered = search
    ? appointments.filter(a =>
        (a.maLichHen??'').toLowerCase().includes(search.toLowerCase()) ||
        (a.khachHangXem??'').toLowerCase().includes(search.toLowerCase()) ||
        (a.nhanVienPhuTrach??'').toLowerCase().includes(search.toLowerCase())
      )
    : dayAppts;

  const handleUpdate = (id: string, changes: Partial<Appointment>) => {
    // Optimistic update — will auto-reload on next page change
    reload();
  };

  const prevMonth = () => {
    if(viewMonth===0){ setViewMonth(11); setViewYear(y=>y-1); } else setViewMonth(m=>m-1);
  };
  const nextMonth = () => {
    if(viewMonth===11){ setViewMonth(0); setViewYear(y=>y+1); } else setViewMonth(m=>m+1);
  };

  const handleJumpDate = (val:string) => {
    setJumpDate(val);
    if(!val) return;
    const [y,m,d] = val.split("-").map(Number);
    setViewYear(y); setViewMonth(m-1); setSelDay(d);
  };

  const formattedSelDay = `${String(selDay).padStart(2,"0")} ${MONTH_NAMES[viewMonth]}, ${viewYear}`;
  const dayChorxem = dayAppts.filter(a=>a.trangThaiHen==="Chờ xem").length;
  const dayDaxem  = dayAppts.filter(a=>a.trangThaiHen==="Đã xem").length;
  const dayHuy    = dayAppts.filter(a=>a.trangThaiHen==="Đã hủy").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
              <CalendarCheck size={14} style={{ color:O }}/>
            </div>
            <h2 style={{ fontWeight:900, fontSize:"1.35rem", color:"#1E293B", letterSpacing:"-0.02em" }}>
              Quản lý Xem phòng
            </h2>
          </div>
          <p style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
            Tiếp nhận yêu cầu mới, phân công nhân viên và theo dõi lịch hẹn xem phòng của khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Tìm mã, khách hàng, NV..."
              className="pl-9 pr-3 rounded-xl outline-none"
              style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"white", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", width:230 }}/>
            <Home size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer"
            style={{ background:"white", border:"1.5px solid #E2E8F0" }}
            onClick={()=>jumpRef.current?.showPicker?.()}>
            <CalendarDays size={14} style={{ color:O }}/>
            <span style={{ fontSize:"0.82rem", fontWeight:700, color:"#374151", whiteSpace:"nowrap" }}>
              {jumpDate ? formatDateInputLabel(jumpDate) : "Chọn ngày"}
            </span>
            <input ref={jumpRef} type="date" value={jumpDate} onChange={e=>handleJumpDate(e.target.value)}
              className="w-0 h-0 opacity-0 absolute pointer-events-none" style={{ position:"absolute" }}/>
          </div>
          <button onClick={reload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background:`${O}10`, border:`1px solid ${O}20`, color:O, fontSize:"0.78rem", fontWeight:700 }}>
            <RotateCcw size={13}/> Làm mới
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "pending" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Yêu cầu chờ lên lịch
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "scheduled" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Lịch hẹn hiện tại
            <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{totalElements}</span>
          </button>
        </div>
      </div>

      {activeTab === "pending" ? (
        <PendingRequestsTab onScheduled={() => {
          reload();
          setActiveTab("scheduled");
        }} />
      ) : (
      <div className="grid gap-5" style={{ gridTemplateColumns:"280px 1fr" }}>
        {/* Left: Calendar */}
        <div>
          <MiniCalendar appointments={appointments}
            viewYear={viewYear} viewMonth={viewMonth} selDay={selDay}
            onSelect={setSelDay} onPrev={prevMonth} onNext={nextMonth}/>
        </div>

        {/* Right: Timeline */}
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background:"white", borderBottom:"1px solid #F1F5F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}>
                <CalendarCheck size={16} className="text-white"/>
              </div>
              <div>
                <div style={{ fontWeight:900, fontSize:"0.95rem", color:"#1E293B" }}>
                  {search ? `Kết quả tìm kiếm` : `Lịch trình: ${formattedSelDay}`}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {[
                    { label:`${search ? searchFiltered.length : dayAppts.length} cuộc hẹn`, color:"#1E293B" },
                    { label:`${dayChorxem} chờ xem`, color:O },
                    { label:`${dayDaxem} đã xem`, color:"#059669" },
                    { label:`${dayHuy} hủy`, color:"#94A3B8" },
                  ].map((s,i)=>(
                    <span key={i} className="flex items-center gap-1.5" style={{ fontSize:"0.72rem" }}>
                      {i>0&&<span style={{ color:"#E2E8F0" }}>·</span>}
                      <span style={{ fontWeight:i===0?700:600, color:s.color }}>{s.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-5 bg-white">
            {loading ? (
              <div className="space-y-3">
                {Array.from({length:5}).map((_,i)=>(
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background:"#F1F5F9" }}/>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <AlertTriangle size={28} style={{ color:"#DC2626", margin:"0 auto" }}/>
                <div className="mt-2 font-bold text-slate-700">Không tải được lịch hẹn</div>
                <div className="text-xs text-slate-500 mt-1">{error.message}</div>
                <button onClick={reload} className="mt-4 px-4 py-2 rounded-xl text-white text-sm font-bold"
                  style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}>Thử lại</button>
              </div>
            ) : searchFiltered.length === 0 ? (
              <div className="flex flex-col items-center py-14">
                <CalendarDays size={36} style={{ color:"#CBD5E1" }} className="mb-3"/>
                <div style={{ fontWeight:700, fontSize:"0.95rem", color:"#94A3B8" }}>
                  {search ? "Không tìm thấy lịch hẹn nào" : "Chưa có lịch hẹn trong ngày này"}
                </div>
                <div style={{ fontSize:"0.82rem", color:"#CBD5E1", marginTop:4 }}>
                  {search ? "Thử từ khoá khác" : "Chọn ngày khác trên lịch hoặc tạo lịch hẹn mới"}
                </div>
              </div>
            ) : (
              <div>
                {searchFiltered.map(appt => (
                  <ApptRow key={appt.maLichHen} appt={appt} onUpdate={handleUpdate}/>
                ))}
              </div>
            )}
          </div>

          {/* Month summary footer */}
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
            <span style={{ fontSize:"0.75rem", color:"#94A3B8" }}>
              Tháng {viewMonth + 1}/{viewYear}:
            </span>
            <strong style={{ fontSize:"0.75rem", color:"#475569" }}>{totalElements.toLocaleString()} lịch hẹn</strong>
            <span style={{ fontSize:"0.75rem", color:"#CBD5E1" }}>·</span>
            <span style={{ fontSize:"0.75rem", color:"#94A3B8" }}>Chọn ngày trên lịch để lọc</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
