import { useState } from "react";
import {
  Plus, Search, Filter, ChevronRight, Home, MapPin, DollarSign,
  Calendar, CheckCircle, Clock, AlertTriangle, X, ArrowRight,
  Flame, BedDouble, SlidersHorizontal, User, Phone, Mail,
} from "lucide-react";

const O  = "#EA580C"; // orange accent
const OL = "#FB923C";

// ── Types ──────────────────────────────────────────────────────────────────
type ReqStatus =
  | "Yêu cầu mới"
  | "Đã lên lịch xem"
  | "Đã xem phòng"
  | "Chờ phê duyệt"
  | "Đặt cọc thành công";

interface RentalRequest {
  id: string; customer: string; avatar: string; phone: string;
  roomType: string; area: string; budget: string;
  status: ReqStatus; created: string;
  room: string | null; showingDate: string | null;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INIT_REQUESTS: RentalRequest[] = [
  { id:"rq1", customer:"Trần Minh Khôi",  avatar:"MK", phone:"0912 345 678", roomType:"Ghép giường", area:"Q.7",  budget:"1.5 – 2.0M",  status:"Đã xem phòng",       created:"24/04/2026", room:"A102", showingDate:"26/04/2026" },
  { id:"rq2", customer:"Nguyễn Thị Hoa",  avatar:"TH", phone:"0918 765 432", roomType:"Toàn phòng",  area:"Q.1",  budget:"3.0 – 4.0M",  status:"Đã lên lịch xem",   created:"25/04/2026", room:"B203", showingDate:"29/04/2026" },
  { id:"rq3", customer:"Lê Văn Phú",      avatar:"VP", phone:"0905 123 456", roomType:"Ghép giường", area:"Q.7",  budget:"1.2 – 1.8M",  status:"Yêu cầu mới",        created:"27/04/2026", room:null,   showingDate:null        },
  { id:"rq4", customer:"Phạm Thị Ngân",   avatar:"TN", phone:"0901 234 567", roomType:"Toàn phòng",  area:"Q.3",  budget:"2.5 – 3.5M",  status:"Đã xem phòng",       created:"22/04/2026", room:"A103", showingDate:"25/04/2026" },
  { id:"rq5", customer:"Hoàng Văn Dũng",  avatar:"VD", phone:"0908 654 321", roomType:"Ghép giường", area:"Q.7",  budget:"1.0 – 1.5M",  status:"Chờ phê duyệt",      created:"20/04/2026", room:"C301", showingDate:"23/04/2026" },
  { id:"rq6", customer:"Vũ Minh Anh",     avatar:"MA", phone:"0916 789 012", roomType:"Toàn phòng",  area:"Q.1",  budget:"3.5 – 4.5M",  status:"Đặt cọc thành công", created:"18/04/2026", room:"B201", showingDate:"21/04/2026" },
  { id:"rq7", customer:"Đỗ Thị Thanh",    avatar:"TT", phone:"0903 456 789", roomType:"Ghép giường", area:"Q.7",  budget:"1.2 – 1.6M",  status:"Yêu cầu mới",        created:"28/04/2026", room:null,   showingDate:null        },
];

const AVAILABLE_ROOMS = [
  { code:"A102", type:"Ghép giường", floor:1, price:"1,800,000", area:"22m²", status:"Trống" },
  { code:"B204", type:"Ghép giường", floor:2, price:"1,600,000", area:"20m²", status:"Trống" },
  { code:"C301", type:"Toàn phòng",  floor:3, price:"3,200,000", area:"28m²", status:"Trống" },
  { code:"A105", type:"Toàn phòng",  floor:1, price:"2,900,000", area:"25m²", status:"Trống" },
];

const STATUS_CFG: Record<ReqStatus, { bg:string; color:string; dot:string; border:string }> = {
  "Yêu cầu mới":        { bg:"#EEF2FF", color:"#4338CA", dot:"#6366F1", border:"#C7D2FE" },
  "Đã lên lịch xem":    { bg:"#F5F3FF", color:"#7C3AED", dot:"#8B5CF6", border:"#DDD6FE" },
  "Đã xem phòng":       { bg:"#FFF7ED", color:"#C2410C", dot:"#F97316", border:"#FED7AA" },
  "Chờ phê duyệt":      { bg:"#FFFBEB", color:"#D97706", dot:"#F59E0B", border:"#FDE68A" },
  "Đặt cọc thành công": { bg:"#ECFDF5", color:"#065F46", dot:"#10B981", border:"#6EE7B7" },
};

const STATUS_STEPS: ReqStatus[] = ["Yêu cầu mới","Đã lên lịch xem","Đã xem phòng","Chờ phê duyệt","Đặt cọc thành công"];

function Avatar({ initials, size=9 }: { initials:string; size?:number }) {
  const s = `${size/4}rem`;
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ width:s, height:s, background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.72rem" }}>
      {initials}
    </div>
  );
}

// ── New Request Modal ──────────────────────────────────────────────────────
function NewRequestModal({ onClose, onCreated }: { onClose:()=>void; onCreated:(r:RentalRequest)=>void }) {
  const [step, setStep] = useState<1|2|3>(1);
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [roomType, setRoomType] = useState("Ghép giường");
  const [area, setArea]       = useState("Q.7");
  const [budget, setBudget]   = useState("1.5 – 2.0M");
  const [selectedRoom, setSelectedRoom] = useState<typeof AVAILABLE_ROOMS[number]|null>(null);
  const [searched, setSearched] = useState(false);

  const filteredRooms = AVAILABLE_ROOMS.filter(r => r.type === roomType);

  const handleCreate = () => {
    if (!name.trim() || !selectedRoom) return;
    const initials = name.trim().split(" ").map((w:string)=>w[0]).slice(0,2).join("").toUpperCase();
    onCreated({
      id:`rq${Date.now()}`, customer:name.trim(), avatar:initials, phone:phone.trim()||"—",
      roomType, area, budget, status:"Yêu cầu mới", created:"29/04/2026",
      room:selectedRoom.code, showingDate:null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(15,23,42,0.6)", backdropFilter:"blur(6px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ border:"1px solid #E2E8F0" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}>
          <div>
            <div className="text-white" style={{ fontWeight:900, fontSize:"1rem" }}>Lập yêu cầu thuê phòng mới</div>
            <div className="text-orange-200 mt-0.5" style={{ fontSize:"0.75rem" }}>
              Bước {step}/3 – {step===1?"Thông tin khách":step===2?"Tìm phòng trống":"Xác nhận"}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-200 hover:text-white hover:bg-white/10 transition">
            <X size={16}/>
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center px-6 py-3" style={{ background:"#FFF7ED", borderBottom:"1px solid #FED7AA" }}>
          {[1,2,3].map(s=>(
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: step >= s ? O : "#CBD5E1", fontSize:"0.7rem", fontWeight:800 }}>
                  {step > s ? <CheckCircle size={12}/> : s}
                </div>
                <span style={{ fontSize:"0.72rem", fontWeight: step===s?700:400, color: step>=s?"#C2410C":"#94A3B8" }}>
                  {s===1?"Khách hàng":s===2?"Tìm phòng":"Xác nhận"}
                </span>
              </div>
              {s<3 && <div className="flex-1 mx-3 h-px" style={{ background: step>s?"#FED7AA":"#E2E8F0" }}/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Họ và tên khách *</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="VD: Nguyễn Văn B"
                  className="w-full px-3 rounded-xl outline-none"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:`1.5px solid ${name.trim()?"#E2E8F0":"#FECACA"}`, background:"#FAFAFA", fontSize:"0.85rem" }}/>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Số điện thoại</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09xx xxx xxx"
                  className="w-full px-3 rounded-xl outline-none"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Loại phòng mong muốn</label>
                  <select value={roomType} onChange={e=>setRoomType(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                    <option>Ghép giường</option><option>Toàn phòng</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Khu vực</label>
                  <select value={area} onChange={e=>setArea(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                    {["Q.1","Q.3","Q.7","Q.Bình Thạnh","Q.Tân Bình"].map(q=><option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Ngân sách / tháng</label>
                <select value={budget} onChange={e=>setBudget(e.target.value)}
                  className="w-full px-3 rounded-xl outline-none"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                  {["< 1.5M","1.5 – 2.0M","2.0 – 3.0M","3.0 – 4.0M","> 4.0M"].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background:"#FFF7ED", border:"1px solid #FED7AA" }}>
                <SlidersHorizontal size={13} style={{ color:O }}/>
                <span style={{ fontSize:"0.78rem", color:"#92400E" }}>
                  Tìm kiếm: <strong>{roomType}</strong> · {area} · {budget}
                </span>
                {!searched && (
                  <button onClick={()=>setSearched(true)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-white"
                    style={{ background:O, fontSize:"0.72rem", fontWeight:700 }}>
                    <Search size={11}/> Tìm phòng trống
                  </button>
                )}
              </div>
              {searched && (
                <div className="space-y-2">
                  {filteredRooms.length === 0 && (
                    <div className="text-center py-8 text-slate-400" style={{ fontSize:"0.85rem" }}>Không có phòng phù hợp</div>
                  )}
                  {filteredRooms.map(room=>(
                    <div key={room.code} onClick={()=>setSelectedRoom(room)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition"
                      style={{
                        border:`1.5px solid ${selectedRoom?.code===room.code ? O : "#E2E8F0"}`,
                        background: selectedRoom?.code===room.code ? "#FFF7ED" : "white",
                      }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: selectedRoom?.code===room.code ? `${O}20` : "#F8FAFC" }}>
                        <Home size={14} style={{ color: selectedRoom?.code===room.code ? O : "#94A3B8" }}/>
                      </div>
                      <div className="flex-1">
                        <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>Phòng {room.code}</div>
                        <div style={{ fontSize:"0.72rem", color:"#64748B" }}>{room.type} · Tầng {room.floor} · {room.area}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight:800, fontSize:"0.88rem", color: O }}>₫{room.price}/tháng</div>
                        <div className="text-right" style={{ fontSize:"0.65rem" }}>
                          <span className="px-1.5 py-0.5 rounded-full" style={{ background:"#ECFDF5", color:"#059669", fontWeight:700 }}>Trống</span>
                        </div>
                      </div>
                      {selectedRoom?.code===room.code && <CheckCircle size={16} style={{ color:O, flexShrink:0 }}/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && selectedRoom && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl" style={{ background:"#F8FAFC", border:"1px solid #E2E8F0" }}>
                <div style={{ fontWeight:800, fontSize:"0.85rem", color:"#374151", marginBottom:8 }}>Xác nhận thông tin yêu cầu</div>
                {[
                  { label:"Khách hàng", value:`${name} · ${phone}` },
                  { label:"Phòng chọn",  value:`${selectedRoom.code} – ${selectedRoom.type} · ₫${selectedRoom.price}/tháng` },
                  { label:"Khu vực",    value:area },
                  { label:"Ngân sách",  value:budget },
                ].map(r=>(
                  <div key={r.label} className="flex items-start gap-3 py-1.5" style={{ borderBottom:"1px solid #F1F5F9" }}>
                    <span style={{ fontSize:"0.75rem", color:"#94A3B8", minWidth:90 }}>{r.label}</span>
                    <span style={{ fontSize:"0.82rem", fontWeight:600, color:"#1E293B" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-5">
          <button onClick={()=>step>1?setStep((step-1) as 1|2|3):onClose()}
            className="flex-1 py-2.5 rounded-xl transition"
            style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
            {step>1?"Quay lại":"Hủy"}
          </button>
          {step < 3 ? (
            <button
              onClick={()=>setStep((step+1) as 2|3)}
              disabled={step===1?!name.trim():step===2?!selectedRoom:false}
              className="flex-1 py-2.5 rounded-xl text-white transition"
              style={{
                background: (step===1&&!name.trim())||(step===2&&!selectedRoom) ? "#CBD5E1" : `linear-gradient(135deg,${O},#DC2626)`,
                fontSize:"0.85rem", fontWeight:800, cursor:(step===1&&!name.trim())||(step===2&&!selectedRoom)?"not-allowed":"pointer",
              }}>
              Tiếp theo <ArrowRight size={14} className="inline ml-1"/>
            </button>
          ) : (
            <button onClick={handleCreate}
              className="flex-1 py-2.5 rounded-xl text-white transition"
              style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.85rem", fontWeight:800, boxShadow:`0 3px 12px ${O}40` }}>
              Tạo yêu cầu ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleRequests() {
  const [requests, setRequests] = useState<RentalRequest[]>(INIT_REQUESTS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [search, setSearch] = useState("");
  const [tooltipId, setTooltipId] = useState<string|null>(null);
  const [chotDoneId, setChotDoneId] = useState<string|null>(null);

  const filtered = requests.filter(r =>
    r.customer.toLowerCase().includes(search.toLowerCase()) ||
    (r.room??'').toLowerCase().includes(search.toLowerCase())
  );

  const handleChot = (id:string) => {
    setChotDoneId(id);
    setRequests(prev=>prev.map(r=>r.id===id?{...r,status:"Chờ phê duyệt"}:r));
    setTimeout(()=>setChotDoneId(null),2000);
  };

  const statusCounts = STATUS_STEPS.map(s=>({ status:s, count:requests.filter(r=>r.status===s).length }));

  return (
    <div>
      {showNewModal && (
        <NewRequestModal
          onClose={()=>setShowNewModal(false)}
          onCreated={r=>setRequests(prev=>[r,...prev])}
        />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
              <Home size={14} style={{ color:O }}/>
            </div>
            <h2 style={{ fontWeight:900, fontSize:"1.35rem", color:"#1E293B", letterSpacing:"-0.02em" }}>
              Yêu cầu & Chốt phòng
            </h2>
          </div>
          <p style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
            Pipeline xử lý yêu cầu từ khách hàng tiềm năng đến ký hợp đồng
          </p>
        </div>
        <button onClick={()=>setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white transition"
          style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.85rem", boxShadow:`0 4px 16px ${O}40` }}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
          <Plus size={16}/> Lập yêu cầu mới
        </button>
      </div>

      {/* Pipeline status strip */}
      <div className="grid gap-2 mb-5" style={{ gridTemplateColumns:"repeat(5,1fr)" }}>
        {statusCounts.map((s,i)=>{
          const cfg = STATUS_CFG[s.status];
          const arrows = ["→","→","→","→"];
          return (
            <div key={s.status} className="relative">
              <div className="px-3 py-2.5 rounded-xl" style={{ background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                <div style={{ fontSize:"0.65rem", fontWeight:700, color:cfg.color, textTransform:"uppercase", letterSpacing:"0.05em" }}>{s.status}</div>
                <div style={{ fontSize:"1.4rem", fontWeight:900, color:"#1E293B", lineHeight:1.1, marginTop:2 }}>{s.count}</div>
              </div>
              {i < 4 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 text-slate-300" style={{ fontSize:"0.9rem" }}>›</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Tìm theo tên khách, mã phòng..."
          className="w-full pl-10 pr-4 rounded-xl outline-none transition"
          style={{ paddingTop:"0.65rem", paddingBottom:"0.65rem", background:"white", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}
          onFocus={e=>{ e.currentTarget.style.borderColor=O; e.currentTarget.style.boxShadow=`0 0 0 3px ${O}15`; }}
          onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
              {["Khách hàng","Yêu cầu","Phòng & Lịch xem","Trạng thái","Hành động"].map(h=>(
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((req,i)=>{
              const cfg = STATUS_CFG[req.status];
              const canChot = req.status === "Đã xem phòng";
              const isDone  = chotDoneId === req.id;
              return (
                <tr key={req.id}
                  style={{ background: i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                  className="hover:bg-orange-50/20 transition-colors">
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={req.avatar}/>
                      <div>
                        <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>{req.customer}</div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={10} style={{ color:"#94A3B8" }}/>
                          <span style={{ fontSize:"0.72rem", color:"#64748B" }}>{req.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Request details */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BedDouble size={11} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.78rem", color:"#374151", fontWeight:600 }}>{req.roomType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.75rem", color:"#64748B" }}>{req.area} · {req.budget}</span>
                    </div>
                    <div style={{ fontSize:"0.68rem", color:"#94A3B8", marginTop:2 }}>Tạo: {req.created}</div>
                  </td>
                  {/* Room & showing */}
                  <td className="px-4 py-3">
                    {req.room ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Home size={11} style={{ color:O }}/>
                          <span style={{ fontWeight:700, fontSize:"0.82rem", color:"#1E293B" }}>Phòng {req.room}</span>
                        </div>
                        {req.showingDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={10} style={{ color:"#94A3B8" }}/>
                            <span style={{ fontSize:"0.72rem", color:"#64748B" }}>Xem: {req.showingDate}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize:"0.75rem", color:"#CBD5E1", fontStyle:"italic" }}>Chưa phân phòng</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, fontSize:"0.72rem", fontWeight:700 }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background:cfg.dot }}/>
                      {req.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {canChot && (
                        <div className="relative"
                          onMouseEnter={()=>setTooltipId(req.id)}
                          onMouseLeave={()=>setTooltipId(null)}>
                          <button onClick={()=>handleChot(req.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition"
                            style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.78rem", fontWeight:800, boxShadow:`0 2px 10px ${O}40` }}
                            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                            <Flame size={13}/> Chốt phòng
                          </button>
                          {/* Tooltip */}
                          {tooltipId===req.id && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-white z-20 pointer-events-none whitespace-nowrap"
                              style={{ background:"#1E293B", fontSize:"0.72rem", fontWeight:600 }}>
                              📋 Chuyển Kế toán thu cọc
                              <div className="absolute top-full left-1/2 -translate-x-1/2" style={{ borderLeft:"5px solid transparent", borderRight:"5px solid transparent", borderTop:"5px solid #1E293B" }}/>
                            </div>
                          )}
                        </div>
                      )}
                      {isDone && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background:"#ECFDF5" }}>
                          <CheckCircle size={12} style={{ color:"#059669" }}/>
                          <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#059669" }}>Đã chuyển</span>
                        </div>
                      )}
                      {!canChot && !isDone && (
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                          style={{ background:"#F1F5F9", fontSize:"0.78rem", color:"#64748B", fontWeight:600 }}>
                          <ChevronRight size={12}/> Chi tiết
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0 && (
          <div className="flex flex-col items-center py-12">
            <Search size={28} style={{ color:"#CBD5E1" }} className="mb-2"/>
            <div style={{ color:"#64748B", fontSize:"0.88rem" }}>Không tìm thấy yêu cầu nào</div>
          </div>
        )}
      </div>
    </div>
  );
}
