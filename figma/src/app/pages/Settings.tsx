import { useState } from "react";
import {
  Search, Plus, Pencil, Trash2, AlertTriangle, Check, X,
  BedDouble, Home, Users, CircleDollarSign, Zap, Droplets,
  Bike, Car, ChevronDown, ShieldCheck, UserCog, Clock,
  UserCheck, UserX, Mail, Phone, Eye, EyeOff,
  Info, Save, RotateCcw, Settings2, Lock,
} from "lucide-react";

// ── Accent ─────────────────────────────────────────────────────────────────
const A  = "#4F46E5";
const AL = "#818CF8";

// ═══════════════════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════
type RoomStatus = "Trống" | "Đang có người" | "Đang bảo trì" | "Đã đặt cọc";
type RoomType   = "Toàn phòng" | "Ghép giường";

interface Room {
  id: string; code: string; type: RoomType;
  capacity: number; occupied: number; status: RoomStatus; floor: number;
}

const INIT_ROOMS: Room[] = [
  { id:"r1",  code:"A101", type:"Toàn phòng",  capacity:2, occupied:2, status:"Đang có người", floor:1 },
  { id:"r2",  code:"A102", type:"Ghép giường", capacity:4, occupied:0, status:"Trống",         floor:1 },
  { id:"r3",  code:"A103", type:"Toàn phòng",  capacity:3, occupied:0, status:"Đang bảo trì",  floor:1 },
  { id:"r4",  code:"B201", type:"Ghép giường", capacity:6, occupied:3, status:"Đang có người", floor:2 },
  { id:"r5",  code:"B202", type:"Toàn phòng",  capacity:2, occupied:0, status:"Trống",         floor:2 },
  { id:"r6",  code:"B203", type:"Ghép giường", capacity:4, occupied:2, status:"Đang có người", floor:2 },
  { id:"r7",  code:"C301", type:"Toàn phòng",  capacity:2, occupied:1, status:"Đã đặt cọc",    floor:3 },
  { id:"r8",  code:"C302", type:"Ghép giường", capacity:6, occupied:0, status:"Trống",         floor:3 },
];

interface PriceState {
  wholePrimary: string; wholeDeluxe: string; bedBasic: string; bedPremium: string; floorSurcharge: string;
  electricity: string; water: string; motorbike: string; bicycle: string; car: string;
}
const INIT_PRICES: PriceState = {
  wholePrimary: "3,500,000",  wholeDeluxe: "4,800,000",
  bedBasic: "1,200,000",      bedPremium: "1,800,000",
  floorSurcharge: "200,000",
  electricity: "3,500",       water: "abc123",   // ← error state
  motorbike: "150,000",       bicycle: "50,000", car: "300,000",
};

type StaffRole   = "Nhân viên Sale" | "Kế toán" | "Manager";
type StaffStatus = "Hoạt động" | "Tạm dừng" | "Chờ duyệt";

interface StaffUser {
  id: string; name: string; email: string; phone: string;
  role: StaffRole; status: StaffStatus; joinedAt: string; avatar: string;
}
const STAFF_USERS: StaffUser[] = [
  { id:"u1", name:"Nguyễn Văn A",  email:"sale.nguyenvana@homestay.vn",  phone:"0901 234 567", role:"Nhân viên Sale", status:"Hoạt động",  joinedAt:"01/03/2025", avatar:"VA" },
  { id:"u2", name:"Trần Thị B",    email:"ketoan.thuquy@homestay.vn",    phone:"0912 345 678", role:"Kế toán",        status:"Hoạt động",  joinedAt:"15/01/2025", avatar:"TB" },
  { id:"u3", name:"Lê Thị Cẩm",   email:"sale.lecam@homestay.vn",       phone:"0923 456 789", role:"Nhân viên Sale", status:"Tạm dừng",   joinedAt:"20/06/2024", avatar:"LC" },
  { id:"u4", name:"Phạm Hải Yến",  email:"ketoan.haiven@homestay.vn",    phone:"0934 567 890", role:"Kế toán",        status:"Hoạt động",  joinedAt:"10/09/2024", avatar:"HY" },
];
interface PendingUser {
  id: string; name: string; email: string; phone: string;
  role: StaffRole; appliedAt: string; note: string; avatar: string;
}
const INIT_PENDING: PendingUser[] = [
  { id:"p1", name:"Hoàng Văn Đức", email:"sale.hoangduc@homestay.vn",   phone:"0945 678 901", role:"Nhân viên Sale", appliedAt:"28/04/2026", note:"Nhân viên mới – chi nhánh Q.7", avatar:"HĐ" },
  { id:"p2", name:"Vũ Thị Mai",    email:"ketoan.vutmai@homestay.vn",   phone:"0956 789 012", role:"Kế toán",        appliedAt:"27/04/2026", note:"Chuyển từ hệ thống cũ",         avatar:"VM" },
];

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════
function StatusBadge({ status }: { status: RoomStatus }) {
  const map: Record<RoomStatus, { bg: string; color: string; dot: string }> = {
    "Trống":          { bg:"#F0FDF4", color:"#15803D", dot:"#22C55E" },
    "Đang có người":  { bg:"#FFF7ED", color:"#C2410C", dot:"#F97316" },
    "Đang bảo trì":   { bg:"#FFFBEB", color:"#B45309", dot:"#F59E0B" },
    "Đã đặt cọc":     { bg:"#EFF6FF", color:"#1D4ED8", dot:"#3B82F6" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background:s.bg, fontSize:"0.72rem", fontWeight:700, color:s.color, border:`1px solid ${s.dot}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }} />
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: StaffRole }) {
  const map: Record<StaffRole, { bg:string; color:string }> = {
    "Nhân viên Sale": { bg:"#FFF7ED", color:"#EA580C" },
    "Kế toán":        { bg:"#ECFDF5", color:"#059669" },
    "Manager":        { bg:"#EEF2FF", color:"#4F46E5" },
  };
  const s = map[role];
  return (
    <span className="px-2 py-0.5 rounded-md" style={{ background:s.bg, color:s.color, fontSize:"0.7rem", fontWeight:700 }}>
      {role}
    </span>
  );
}

function StatusBadgeStaff({ status }: { status: StaffStatus }) {
  const map: Record<StaffStatus, { bg:string; color:string; dot:string }> = {
    "Hoạt động": { bg:"#F0FDF4", color:"#15803D", dot:"#22C55E" },
    "Tạm dừng":  { bg:"#FEF9C3", color:"#A16207", dot:"#EAB308" },
    "Chờ duyệt": { bg:"#EFF6FF", color:"#1D4ED8", dot:"#3B82F6" },
  };
  const s = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background:s.bg, fontSize:"0.7rem", fontWeight:700, color:s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }} />
      {status}
    </span>
  );
}

function fmt(v: string) {
  const n = v.replace(/\D/g, "");
  return n ? Number(n).toLocaleString("vi-VN") : "";
}
function isValidNum(v: string) { return /^[\d,\.]+$/.test(v.replace(/\s/g,"")); }

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 1 — Room Management
// ═══════════════════════════════════════════════════════════════════════════
function RoomTab() {
  const [rooms, setRooms]       = useState<Room[]>(INIT_ROOMS);
  const [search, setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"all"|"Toàn phòng"|"Ghép giường">("all");
  const [tooltip, setTooltip]   = useState<string|null>(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [editId, setEditId]     = useState<string|null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string|null>(null);

  // New room form state
  const [newCode, setNewCode]   = useState("");
  const [newType, setNewType]   = useState<RoomType>("Toàn phòng");
  const [newCap,  setNewCap]    = useState("2");
  const [newFloor,setNewFloor]  = useState("1");

  const filtered = rooms.filter(r => {
    const matchSearch = r.code.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    setDeleteConfirm(null);
  };

  const handleAdd = () => {
    if (!newCode.trim()) return;
    const room: Room = {
      id: `r${Date.now()}`, code: newCode.toUpperCase(), type: newType,
      capacity: Number(newCap) || 2, occupied: 0, status: "Trống", floor: Number(newFloor) || 1,
    };
    setRooms(prev => [...prev, room]);
    setShowAdd(false); setNewCode(""); setNewType("Toàn phòng"); setNewCap("2"); setNewFloor("1");
  };

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative" style={{ width: 260 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo mã phòng..."
              className="w-full pl-9 pr-3 rounded-xl text-slate-700 placeholder-slate-400 transition"
              style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", outline:"none" }}
              onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
              onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}
            />
          </div>
          {/* Type filter chips */}
          {(["all","Toàn phòng","Ghép giường"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg transition"
              style={{ fontSize:"0.78rem", fontWeight: typeFilter===t ? 700 : 500,
                background: typeFilter===t ? `${A}12` : "#F8FAFC",
                color: typeFilter===t ? A : "#64748B",
                border: `1.5px solid ${typeFilter===t ? `${A}40` : "#E2E8F0"}`,
              }}>
              {t === "all" ? "Tất cả" : t}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition"
          style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, boxShadow:`0 3px 10px ${A}40`, fontSize:"0.82rem", fontWeight:700 }}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
          <Plus size={15} /> Thêm Phòng/Giường Mới
        </button>
      </div>

      {/* Add Room Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ border:"1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid #F1F5F9" }}>
              <div>
                <div className="text-slate-900" style={{ fontWeight:800, fontSize:"1rem" }}>Thêm Phòng / Giường Mới</div>
                <div className="text-slate-500" style={{ fontSize:"0.75rem", marginTop:2 }}>Điền thông tin để tạo phòng mới</div>
              </div>
              <button onClick={()=>setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <X size={16}/>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>Mã phòng *</label>
                <input value={newCode} onChange={e=>setNewCode(e.target.value)}
                  placeholder="VD: A104, C305..."
                  className="w-full px-3 rounded-xl transition"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:`1.5px solid #E2E8F0`, background:"#FAFAFA", fontSize:"0.85rem", outline:"none" }}
                  onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                  onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>Loại phòng</label>
                  <div className="relative">
                    <select value={newType} onChange={e=>setNewType(e.target.value as RoomType)}
                      className="w-full px-3 pr-8 rounded-xl appearance-none transition"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem", outline:"none" }}>
                      <option>Toàn phòng</option>
                      <option>Ghép giường</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>Sức chứa</label>
                  <input value={newCap} onChange={e=>setNewCap(e.target.value)} type="number" min="1" max="12"
                    className="w-full px-3 rounded-xl transition"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem", outline:"none" }}
                    onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                    onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>Tầng</label>
                <input value={newFloor} onChange={e=>setNewFloor(e.target.value)} type="number" min="1" max="20"
                  className="w-full px-3 rounded-xl transition"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem", outline:"none" }}
                  onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                  onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#64748B", fontSize:"0.82rem", fontWeight:600 }}>
                Hủy
              </button>
              <button onClick={handleAdd}
                className="flex-1 py-2.5 rounded-xl text-white transition"
                style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:700 }}>
                Tạo phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"#FEF2F2" }}>
                <Trash2 size={18} style={{ color:"#DC2626" }}/>
              </div>
              <div>
                <div className="text-slate-900" style={{ fontWeight:800, fontSize:"0.95rem" }}>Xác nhận xoá phòng</div>
                <div className="text-slate-500" style={{ fontSize:"0.75rem", marginTop:1 }}>Hành động này không thể hoàn tác</div>
              </div>
            </div>
            <div className="rounded-xl p-3 mb-4" style={{ background:"#FFF7ED", border:"1px solid #FDE68A" }}>
              <p className="text-amber-700" style={{ fontSize:"0.8rem" }}>
                Phòng <strong>{rooms.find(r=>r.id===deleteConfirm)?.code}</strong> sẽ bị xoá vĩnh viễn khỏi hệ thống.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
                Hủy
              </button>
              <button onClick={()=>handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-white transition"
                style={{ background:"#DC2626", fontSize:"0.82rem", fontWeight:700 }}>
                Xoá phòng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label:"Tổng phòng",    value:rooms.length,                                      color:"#4F46E5", bg:"#EEF2FF", icon:Home },
          { label:"Đang có người", value:rooms.filter(r=>r.status==="Đang có người").length, color:"#EA580C", bg:"#FFF7ED", icon:Users },
          { label:"Phòng trống",   value:rooms.filter(r=>r.status==="Trống").length,         color:"#059669", bg:"#ECFDF5", icon:BedDouble },
          { label:"Bảo trì/Cọc",  value:rooms.filter(r=>r.status==="Đang bảo trì"||r.status==="Đã đặt cọc").length, color:"#D97706", bg:"#FFFBEB", icon:Settings2 },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:"white", border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:s.bg }}>
              <s.icon size={16} style={{ color:s.color }}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"1.2rem", color:"#1E293B", lineHeight:1.1 }}>{s.value}</div>
              <div style={{ fontSize:"0.7rem", color:"#94A3B8", marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
              {["Mã phòng","Loại phòng","Sức chứa","Tầng","Trạng thái","Hành động"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.72rem", fontWeight:800, color:"#64748B", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((room, i) => {
              const isOccupied = room.status === "Đang có người";
              const isEdit = editId === room.id;
              return (
                <tr key={room.id}
                  style={{ background: i%2===0 ? "white" : "#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                  className="group transition-colors hover:bg-indigo-50/30">
                  {/* Code */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: room.type==="Toàn phòng" ? "#EEF2FF" : "#FFF7ED" }}>
                        {room.type==="Toàn phòng"
                          ? <Home size={13} style={{ color:A }}/>
                          : <BedDouble size={13} style={{ color:"#EA580C" }}/>
                        }
                      </div>
                      <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>{room.code}</span>
                    </div>
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-md" style={{
                      background: room.type==="Toàn phòng" ? "#EEF2FF" : "#FFF7ED",
                      color: room.type==="Toàn phòng" ? A : "#C2410C",
                      fontSize:"0.72rem", fontWeight:700,
                    }}>
                      {room.type}
                    </span>
                  </td>
                  {/* Capacity */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>{room.occupied}</span>
                      <span style={{ color:"#CBD5E1", fontSize:"0.8rem" }}>/</span>
                      <span style={{ fontSize:"0.82rem", color:"#64748B" }}>{room.capacity}</span>
                      <span style={{ fontSize:"0.7rem", color:"#94A3B8" }}>người</span>
                    </div>
                  </td>
                  {/* Floor */}
                  <td className="px-4 py-3">
                    <span style={{ fontSize:"0.82rem", color:"#64748B", fontWeight:500 }}>Tầng {room.floor}</span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={room.status} />
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => setEditId(isEdit ? null : room.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                        style={{ background: isEdit ? `${A}15` : "#F1F5F9", color: isEdit ? A : "#64748B" }}
                        onMouseEnter={e=>{ if(!isEdit){ (e.currentTarget as HTMLButtonElement).style.background=`${A}12`; (e.currentTarget as HTMLButtonElement).style.color=A; } }}
                        onMouseLeave={e=>{ if(!isEdit){ (e.currentTarget as HTMLButtonElement).style.background="#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color="#64748B"; } }}
                        title="Chỉnh sửa phòng"
                      >
                        <Pencil size={13}/>
                      </button>

                      {/* Delete with tooltip wrapper */}
                      <div className="relative"
                        onMouseEnter={() => isOccupied && setTooltip(room.id)}
                        onMouseLeave={() => setTooltip(null)}>
                        <button
                          onClick={() => !isOccupied && setDeleteConfirm(room.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                          style={{
                            background: isOccupied ? "#F8FAFC" : "#FEF2F2",
                            color: isOccupied ? "#CBD5E1" : "#DC2626",
                            cursor: isOccupied ? "not-allowed" : "pointer",
                            opacity: isOccupied ? 0.5 : 1,
                          }}
                          onMouseEnter={e=>{ if(!isOccupied){ (e.currentTarget as HTMLButtonElement).style.background="#FEE2E2"; } }}
                          onMouseLeave={e=>{ if(!isOccupied){ (e.currentTarget as HTMLButtonElement).style.background="#FEF2F2"; } }}
                          title={isOccupied ? undefined : "Xóa phòng"}
                          disabled={isOccupied}
                        >
                          <Trash2 size={13}/>
                        </button>
                        {/* Tooltip */}
                        {tooltip === room.id && isOccupied && (
                          <div className="absolute right-0 bottom-full mb-2 z-20 pointer-events-none"
                            style={{ minWidth:200 }}>
                            <div className="px-3 py-2 rounded-lg text-white flex items-start gap-2"
                              style={{ background:"#1E293B", fontSize:"0.72rem", lineHeight:1.4, boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
                              <AlertTriangle size={11} className="flex-shrink-0 mt-0.5 text-amber-400"/>
                              Không thể xoá phòng đang có người sử dụng
                            </div>
                            <div className="flex justify-end pr-3">
                              <div style={{ width:8,height:6,background:"#1E293B",clipPath:"polygon(0 0,100% 0,50% 100%)" }}/>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Home size={32} className="text-slate-300 mb-3"/>
            <div className="text-slate-500" style={{ fontSize:"0.88rem", fontWeight:500 }}>Không tìm thấy phòng nào</div>
          </div>
        )}
        {/* Table footer */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
          <span style={{ fontSize:"0.75rem", color:"#94A3B8" }}>
            Hiển thị <strong style={{ color:"#475569" }}>{filtered.length}</strong> / {rooms.length} phòng
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 2 — Price Table
// ═══════════════════════════════════════════════════════════════════════════
function PriceTab() {
  const [prices, setPrices] = useState<PriceState>(INIT_PRICES);
  const [saved, setSaved] = useState(false);

  const setField = (k: keyof PriceState, v: string) => {
    setPrices(prev => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false), 3000); };
  const handleReset = () => { setPrices(INIT_PRICES); setSaved(false); };

  const PriceInput = ({
    fieldKey, label, icon: Icon, iconColor, iconBg, suffix = "/tháng", error = false,
  }: {
    fieldKey: keyof PriceState; label: string; icon: React.ElementType;
    iconColor: string; iconBg: string; suffix?: string; error?: boolean;
  }) => {
    const val = prices[fieldKey];
    const hasError = error && !isValidNum(val);
    return (
      <div>
        <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:600, color:"#374151" }}>
          {label}
        </label>
        <div className="flex items-center gap-0 rounded-xl overflow-hidden transition"
          style={{ border:`1.5px solid ${hasError ? "#F87171" : "#E2E8F0"}`, boxShadow: hasError ? "0 0 0 3px rgba(239,68,68,0.12)" : "none" }}>
          {/* Icon prefix */}
          <div className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0" style={{ background:iconBg, borderRight:`1px solid ${hasError?"#FECACA":"#E2E8F0"}` }}>
            <Icon size={13} style={{ color:iconColor }}/>
            <span style={{ fontSize:"0.82rem", fontWeight:700, color:iconColor }}>₫</span>
          </div>
          {/* Input */}
          <input
            value={val}
            onChange={e => setField(fieldKey, e.target.value)}
            className="flex-1 px-3 outline-none transition"
            style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background: hasError ? "#FFF5F5" : "white", fontSize:"0.88rem", color:"#1E293B", minWidth:0 }}
            onFocus={e => { if(!hasError){ e.currentTarget.style.background="#FAFAFE"; } }}
            onBlur={e => { e.currentTarget.style.background = hasError ? "#FFF5F5" : "white"; }}
            placeholder="0"
          />
          {/* Suffix */}
          <div className="px-3 flex-shrink-0" style={{ fontSize:"0.72rem", color:"#94A3B8", fontWeight:500, background: hasError ? "#FFF5F5" : "white" }}>
            {suffix}
          </div>
        </div>
        {hasError && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <AlertTriangle size={11} style={{ color:"#EF4444" }}/>
            <span style={{ fontSize:"0.72rem", color:"#EF4444", fontWeight:500 }}>Vui lòng chỉ nhập số hợp lệ</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Basic rent */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ background:"linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderBottom:"1px solid #E0E7FF" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${A}20` }}>
            <Home size={15} style={{ color:A }}/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Giá Thuê Cơ Bản</div>
            <div style={{ fontSize:"0.72rem", color:"#6366F1" }}>Áp dụng cho hợp đồng từ tháng tiếp theo</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background:"#EEF2FF", border:"1px solid #C7D2FE" }}>
            <Info size={10} style={{ color:A }}/>
            <span style={{ fontSize:"0.65rem", fontWeight:700, color:A }}>Áp dụng ngay khi lưu</span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4" style={{ background:"white" }}>
          <PriceInput fieldKey="wholePrimary" label="Phòng Toàn phòng – Cơ bản" icon={Home} iconColor={A} iconBg="#EEF2FF"/>
          <PriceInput fieldKey="wholeDeluxe"  label="Phòng Toàn phòng – Deluxe"  icon={Home} iconColor={A} iconBg="#EEF2FF"/>
          <PriceInput fieldKey="bedBasic"     label="Ghép giường – Cơ bản (mỗi giường)" icon={BedDouble} iconColor="#EA580C" iconBg="#FFF7ED"/>
          <PriceInput fieldKey="bedPremium"   label="Ghép giường – Premium (mỗi giường)" icon={BedDouble} iconColor="#EA580C" iconBg="#FFF7ED"/>
          <div className="col-span-2">
            <PriceInput fieldKey="floorSurcharge" label="Phụ phí theo tầng (mỗi tầng tăng thêm)" icon={Settings2} iconColor="#7C3AED" iconBg="#F5F3FF" suffix="/tầng"/>
          </div>
        </div>
      </div>

      {/* Section 2: Service fees */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ background:"linear-gradient(135deg,#ECFDF5,#F0FDFA)", borderBottom:"1px solid #A7F3D0" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"#D1FAE5" }}>
            <CircleDollarSign size={15} style={{ color:"#059669" }}/>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Phí Dịch vụ</div>
            <div style={{ fontSize:"0.72rem", color:"#059669" }}>Điện, Nước và Phí giữ xe hàng tháng</div>
          </div>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4" style={{ background:"white" }}>
          <PriceInput fieldKey="electricity" label="Tiền điện (mỗi kWh)" icon={Zap} iconColor="#D97706" iconBg="#FFFBEB" suffix="/kWh"/>
          {/* ERROR STATE for water */}
          <PriceInput fieldKey="water" label="Tiền nước (mỗi m³)" icon={Droplets} iconColor="#0891B2" iconBg="#ECFEFF" suffix="/m³" error={true}/>
          <PriceInput fieldKey="motorbike" label="Giữ xe máy" icon={Car}   iconColor="#64748B" iconBg="#F8FAFC"/>
          <PriceInput fieldKey="bicycle"   label="Giữ xe đạp" icon={Bike}  iconColor="#64748B" iconBg="#F8FAFC"/>
          <div className="col-span-2">
            <PriceInput fieldKey="car" label="Giữ ô tô" icon={Car} iconColor="#475569" iconBg="#F8FAFC"/>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between px-5 py-4 rounded-2xl"
        style={{ background: saved ? "#ECFDF5" : "white", border:`1px solid ${saved?"#6EE7B7":"#E2E8F0"}`, transition:"all .3s" }}>
        <div className="flex items-center gap-2.5">
          {saved
            ? <><Check size={16} style={{ color:"#059669" }}/><span style={{ fontSize:"0.85rem", fontWeight:600, color:"#059669" }}>Đã lưu thành công!</span></>
            : <><Info size={14} style={{ color:"#94A3B8" }}/><span style={{ fontSize:"0.82rem", color:"#64748B" }}>Thay đổi sẽ áp dụng từ chu kỳ hoá đơn tiếp theo.</span></>
          }
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition"
            style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor="#CBD5E1"; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor="#E2E8F0"; }}>
            <RotateCcw size={13}/> Đặt lại
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition"
            style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:700, boxShadow:`0 3px 10px ${A}40` }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
            <Save size={13}/> Lưu bảng giá
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 3 — Staff Accounts
// ═══════════════════════════════════════════════════════════════════════════
function StaffTab() {
  const [staff, setStaff]   = useState<StaffUser[]>(STAFF_USERS);
  const [pending, setPending] = useState<PendingUser[]>(INIT_PENDING);
  const [actionDone, setActionDone] = useState<{id:string;action:"approved"|"rejected"}|null>(null);
  const [lockedIds, setLockedIds]   = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail,    setNewEmail]    = useState("");
  const [newPhone,    setNewPhone]    = useState("");
  const [newRole,     setNewRole]     = useState<StaffRole>("Nhân viên Sale");
  const [newPass,     setNewPass]     = useState("Tmp@2026!");
  const [showPass,    setShowPass]    = useState(false);
  const [createDone,  setCreateDone]  = useState(false);

  const ROLE_OPTIONS: StaffRole[] = ["Nhân viên Sale","Kế toán","Manager"];

  const generatePass = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!";
    setNewPass(Array.from({length:10},()=>chars[Math.floor(Math.random()*chars.length)]).join(""));
  };

  const handleCreate = () => {
    if (!newUsername.trim() || !newEmail.trim()) return;
    const initials = newUsername.trim().split(" ").map((w: string)=>w[0]).slice(0,2).join("").toUpperCase();
    const newUser: StaffUser = {
      id:`u${Date.now()}`, name:newUsername.trim(), email:newEmail.trim(),
      phone:newPhone.trim()||"—", role:newRole, status:"Hoạt động",
      joinedAt: new Date().toLocaleDateString("vi-VN"), avatar:initials,
    };
    setStaff(prev=>[...prev,newUser]);
    setCreateDone(true);
    setTimeout(()=>{ setShowCreate(false); setCreateDone(false); setNewUsername(""); setNewEmail(""); setNewPhone(""); setNewRole("Nhân viên Sale"); setNewPass("Tmp@2026!"); },1600);
  };

  const toggleLock = (id:string) => setLockedIds(prev=>{ const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });

  const handleApprove = (id: string) => {
    setActionDone({ id, action:"approved" });
    setTimeout(() => { setPending(prev => prev.filter(p=>p.id!==id)); setActionDone(null); }, 1500);
  };
  const handleReject = (id: string) => {
    setActionDone({ id, action:"rejected" });
    setTimeout(() => { setPending(prev => prev.filter(p=>p.id!==id)); setActionDone(null); }, 1500);
  };

  const AVATAR_COLORS: Record<StaffRole, { bg:string; gradient:string }> = {
    "Nhân viên Sale": { bg:"#FFF7ED", gradient:"linear-gradient(135deg,#EA580C,#DC2626)" },
    "Kế toán":        { bg:"#ECFDF5", gradient:"linear-gradient(135deg,#059669,#0891B2)" },
    "Manager":        { bg:"#EEF2FF", gradient:`linear-gradient(135deg,${A},#7C3AED)` },
  };

  const ROLE_CFG: Record<StaffRole,{color:string;bg:string;activeBg:string}> = {
    "Nhân viên Sale": { color:"#EA580C", bg:"#FFF7ED", activeBg:"#EA580C" },
    "Kế toán":        { color:"#059669", bg:"#ECFDF5", activeBg:"#059669" },
    "Manager":        { color:A,         bg:"#EEF2FF", activeBg:A         },
  };

  return (
    <div className="space-y-6">
      {/* Create User Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ border:"1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ background:`linear-gradient(135deg,${A},#7C3AED)` }}>
              <div>
                <div className="text-white" style={{ fontWeight:900, fontSize:"1rem" }}>Tạo tài khoản mới</div>
                <div className="text-indigo-200" style={{ fontSize:"0.75rem", marginTop:2 }}>Điền thông tin và cấp quyền truy cập</div>
              </div>
              <button onClick={()=>setShowCreate(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-200 hover:text-white hover:bg-white/10 transition">
                <X size={16}/>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Họ và tên *</label>
                <input value={newUsername} onChange={e=>setNewUsername(e.target.value)}
                  placeholder="VD: Nguyễn Văn B"
                  className="w-full px-3 rounded-xl outline-none transition"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:`1.5px solid ${newUsername.trim()?"#E2E8F0":"#FECACA"}`, background:"#FAFAFA", fontSize:"0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Email (Username đăng nhập) *</label>
                <input value={newEmail} onChange={e=>setNewEmail(e.target.value)}
                  placeholder="ten.nhanvien@homestay.vn" type="email"
                  className="w-full px-3 rounded-xl outline-none transition"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Số điện thoại</label>
                <input value={newPhone} onChange={e=>setNewPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full px-3 rounded-xl outline-none transition"
                  style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Vai trò / Quyền hạn</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map(r=>{
                    const cfg = ROLE_CFG[r];
                    const isActive = newRole===r;
                    return (
                      <button key={r} onClick={()=>setNewRole(r)}
                        className="py-2.5 px-2 rounded-xl transition text-center"
                        style={{ background: isActive ? cfg.activeBg : cfg.bg, color: isActive ? "white" : cfg.color, border:`1.5px solid ${isActive ? cfg.activeBg : cfg.color+"30"}`, fontSize:"0.75rem", fontWeight: isActive ? 800 : 600 }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#374151" }}>Mật khẩu tạm thời</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input value={newPass} onChange={e=>setNewPass(e.target.value)}
                      type={showPass?"text":"password"}
                      className="w-full px-3 pr-9 rounded-xl outline-none transition"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.9rem", fontFamily:"monospace" }}
                    />
                    <button onClick={()=>setShowPass(p=>!p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                      {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                  <button onClick={generatePass}
                    className="px-3 py-2 rounded-xl transition flex-shrink-0"
                    style={{ background:`${A}10`, border:`1px solid ${A}30`, color:A, fontSize:"0.75rem", fontWeight:700 }}>
                    Tạo ngẫu nhiên
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Info size={10} style={{ color:"#94A3B8" }}/>
                  <span style={{ fontSize:"0.68rem", color:"#94A3B8" }}>Người dùng phải đổi mật khẩu sau lần đăng nhập đầu tiên</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
                Hủy
              </button>
              <button onClick={handleCreate}
                disabled={!newUsername.trim()||!newEmail.trim()}
                className="flex-1 py-2.5 rounded-xl text-white transition"
                style={{ background: createDone ? "#059669" : (!newUsername.trim()||!newEmail.trim()) ? "#CBD5E1" : `linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:800, cursor:(!newUsername.trim()||!newEmail.trim())?"not-allowed":"pointer" }}>
                {createDone ? "✓ Đã tạo!" : "Tạo tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Staff Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${A}15` }}>
              <UserCog size={15} style={{ color:A }}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Danh sách Nhân sự</div>
              <div style={{ fontSize:"0.72rem", color:"#94A3B8" }}>{staff.length} tài khoản trong hệ thống</div>
            </div>
          </div>
          <button onClick={()=>setShowCreate(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition text-white"
            style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.78rem", fontWeight:700, boxShadow:`0 2px 8px ${A}35` }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
            <Plus size={13}/> Tạo mới
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ background:"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}>
              {["Nhân viên","Vai trò","Liên hệ","Ngày vào","Trạng thái","Hành động"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((user, i) => {
              const colors = AVATAR_COLORS[user.role];
              const isLocked = lockedIds.has(user.id);
              return (
                <tr key={user.id}
                  style={{ background: isLocked ? "#FFFBEB" : i%2===0 ? "white" : "#FAFBFD", borderBottom:"1px solid #F1F5F9", opacity: isLocked ? 0.75 : 1 }}
                  className="group hover:bg-indigo-50/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                          style={{ background: isLocked ? "#CBD5E1" : colors.gradient, fontWeight:800, fontSize:"0.7rem" }}>
                          {user.avatar}
                        </div>
                        {!isLocked && user.status === "Hoạt động" && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background:"#22C55E" }}/>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:"0.85rem", color: isLocked ? "#94A3B8" : "#1E293B" }}>{user.name}</div>
                        <div style={{ fontSize:"0.72rem", color:"#94A3B8", marginTop:1 }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={user.role}/></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Mail size={10} style={{ color:"#94A3B8" }}/>
                        <span style={{ fontSize:"0.72rem", color:"#64748B" }}>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} style={{ color:"#94A3B8" }}/>
                        <span style={{ fontSize:"0.72rem", color:"#64748B" }}>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize:"0.78rem", color:"#64748B" }}>{user.joinedAt}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadgeStaff status={isLocked ? "Tạm dừng" : user.status}/></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                        style={{ background:"#F1F5F9", color:"#64748B" }}
                        title="Sửa thông tin"
                        onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background=`${A}12`; (e.currentTarget as HTMLButtonElement).style.color=A; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color="#64748B"; }}>
                        <Pencil size={13}/>
                      </button>
                      <button onClick={()=>toggleLock(user.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                        style={{ background: isLocked ? "#FEF3C7" : "#F1F5F9", color: isLocked ? "#D97706" : "#64748B" }}
                        title={isLocked?"Mở khóa tài khoản":"Khóa tài khoản"}
                        onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background="#FEF3C7"; (e.currentTarget as HTMLButtonElement).style.color="#D97706"; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background=isLocked?"#FEF3C7":"#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color=isLocked?"#D97706":"#64748B"; }}>
                        <Lock size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending Approvals */}
      <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid #FDE68A`, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ background:"linear-gradient(135deg,#FFFBEB,#FFF7ED)", borderBottom:"1px solid #FDE68A" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"#FEF3C7" }}>
              <Clock size={15} style={{ color:"#D97706" }}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Chờ Phê Duyệt</div>
              <div style={{ fontSize:"0.72rem", color:"#D97706" }}>
                {pending.length} tài khoản đăng ký từ hệ thống ngoài — cần xác nhận
              </div>
            </div>
          </div>
          {pending.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-white" style={{ background:"#D97706", fontSize:"0.72rem", fontWeight:800 }}>
              {pending.length} chờ xử lý
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10" style={{ background:"white" }}>
            <UserCheck size={28} style={{ color:"#BBF7D0" }} className="mb-2"/>
            <div style={{ fontSize:"0.88rem", fontWeight:600, color:"#64748B" }}>Không có yêu cầu nào đang chờ</div>
            <div style={{ fontSize:"0.75rem", color:"#94A3B8", marginTop:4 }}>Tất cả tài khoản đã được xử lý</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100" style={{ background:"white" }}>
            {pending.map(user => {
              const colors = AVATAR_COLORS[user.role];
              const isDone = actionDone?.id === user.id;
              const isApproved = isDone && actionDone?.action === "approved";
              const isRejected = isDone && actionDone?.action === "rejected";

              return (
                <div key={user.id} className="px-5 py-4 flex items-center gap-4"
                  style={{
                    background: isApproved ? "#ECFDF5" : isRejected ? "#FFF1F2" : "white",
                    transition:"background .3s",
                  }}>
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ background:colors.gradient, fontWeight:800, fontSize:"0.78rem" }}>
                      {user.avatar}
                    </div>
                    <div className="absolute inset-0 rounded-full" style={{ boxShadow:"0 0 0 2px #FDE68A" }}/>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>{user.name}</span>
                      <RoleBadge role={user.role}/>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Mail size={10} style={{ color:"#94A3B8" }}/>
                        <span style={{ fontSize:"0.72rem", color:"#64748B" }}>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} style={{ color:"#94A3B8" }}/>
                        <span style={{ fontSize:"0.72rem", color:"#64748B" }}>{user.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} style={{ color:"#F59E0B" }}/>
                      <span style={{ fontSize:"0.7rem", color:"#92400E" }}>{user.note} · Đăng ký: {user.appliedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {isApproved ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background:"#D1FAE5" }}>
                        <UserCheck size={14} style={{ color:"#059669" }}/>
                        <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#059669" }}>Đã phê duyệt</span>
                      </div>
                    ) : isRejected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background:"#FEE2E2" }}>
                        <UserX size={14} style={{ color:"#DC2626" }}/>
                        <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#DC2626" }}>Đã từ chối</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                          style={{ background:"#FFF1F2", border:"1.5px solid #FECDD3", color:"#DC2626", fontSize:"0.78rem", fontWeight:700 }}
                          onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background="#FEE2E2"; }}
                          onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="#FFF1F2"; }}>
                          <X size={13}/> Từ chối
                        </button>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition text-white"
                          style={{ background:"linear-gradient(135deg,#059669,#0891B2)", fontSize:"0.78rem", fontWeight:700, boxShadow:"0 2px 8px rgba(5,150,105,0.35)" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                          <ShieldCheck size={13}/> Phê duyệt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════
type Tab = "rooms" | "prices" | "staff";

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id:"rooms",  label:"Quản lý Phòng/Giường", icon:BedDouble },
  { id:"prices", label:"Bảng Đơn Giá",          icon:CircleDollarSign },
  { id:"staff",  label:"Tài khoản Nhân sự",     icon:Users, badge:"2" },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("rooms");

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${A}15` }}>
            <Settings2 size={14} style={{ color:A }}/>
          </div>
          <h2 className="text-slate-900" style={{ fontWeight:800, fontSize:"1.35rem", letterSpacing:"-0.02em" }}>
            Cài đặt & Quản trị hệ thống
          </h2>
        </div>
        <p style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
          Cấu hình phòng, bảng giá và quản lý tài khoản nhân sự
        </p>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl" style={{ background:"#F1F5F9", border:"1px solid #E2E8F0", display:"inline-flex" }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all relative"
              style={{
                fontSize:"0.82rem", fontWeight: isActive ? 700 : 500,
                color: isActive ? A : "#64748B",
                background: isActive ? "white" : "transparent",
                boxShadow: isActive ? "0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" : "none",
              }}
            >
              <tab.icon size={14}/>
              {tab.label}
              {tab.badge && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background:"#EF4444", fontSize:"0.6rem", fontWeight:800 }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "rooms"  && <RoomTab />}
        {activeTab === "prices" && <PriceTab />}
        {activeTab === "staff"  && <StaffTab />}
      </div>
    </div>
  );
}
