import React, { useState, useEffect } from "react";
import {
  Search, Plus, Pencil, Trash2, AlertTriangle, Check, X,
  BedDouble, Home, Users, CircleDollarSign, Zap, Droplets,
  Bike, Car, ChevronDown, ShieldCheck, UserCog, Clock,
  UserCheck, UserX, Mail, Phone, Eye, EyeOff,
  Info, Save, RotateCcw, Settings2, Lock, FileText, CalendarDays,
} from "lucide-react";
import { Pagination } from "../components/Pagination";
import { useToast } from "../components/ToastProvider";
import { usePagedList } from "../hooks/usePagedList";
import { getContracts, updateContract, type ApiContract,
  getRooms, createRoom, updateRoom, deleteRoom,
  getUsers, updateUser,
  type UpdateRoomPayload,
} from "../services/api";

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
  electricity: "3,500",       water: "20,000",  
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
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    "Trống":          { bg:"#F0FDF4", color:"#15803D", dot:"#22C55E" },
    "Đang có người":  { bg:"#FFF7ED", color:"#C2410C", dot:"#F97316" },
    "Đang bảo trì":   { bg:"#FFFBEB", color:"#B45309", dot:"#F59E0B" },
    "Đã đặt cọc":     { bg:"#EFF6FF", color:"#1D4ED8", dot:"#3B82F6" },
  };
  // Fallback to grey badge for any unknown status value from DB
  const s = map[status] ?? { bg:"#F1F5F9", color:"#64748B", dot:"#94A3B8" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background:s.bg, fontSize:"0.72rem", fontWeight:700, color:s.color, border:`1px solid ${s.dot}30` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }} />
      {status || "Không rõ"}
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

function formatDate(value: string | null | undefined) {
  if (!value) return "--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function formatCurrency(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "--";
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString("vi-VN");
}

function statusStyle(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("trong")) return { label: "Trống", bg: "#ECFDF5", color: "#059669" };
  if (normalized.includes("da dat")) return { label: "Đã đặt", bg: "#FFFBEB", color: "#D97706" };
  if (normalized.includes("dang thue")) return { label: "Đang thuê", bg: "#EFF6FF", color: "#2563EB" };
  if (normalized.includes("bao tri")) return { label: "Bảo trì", bg: "#F8FAFC", color: "#64748B" };
  return { label: status ?? "Không rõ", bg: "#F1F5F9", color: "#334155" };
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 1 — Room Management
// ═══════════════════════════════════════════════════════════════════════════
function RoomTab() {
  const { addToast } = useToast();
  const {
    items: rooms, loading, error,
    totalElements, totalPages,
    page, size, setPage, setSize,
    reload,
  } = usePagedList<Room>(getRooms, 10);

  const [search, setSearch]       = useState("");
  const [tooltip, setTooltip]     = useState<string|null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [editRoom, setEditRoom]   = useState<Room|null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Room|null>(null);
  const [saving, setSaving]       = useState(false);

  const [newCode,   setNewCode]   = useState("");
  const [newCap,    setNewCap]    = useState("2");
  const [newPrice,  setNewPrice]  = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [editForm,  setEditForm]  = useState<Partial<Room>>({});

  const filtered = rooms.filter(r =>
    (r.maPhong ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (r.chiNhanh ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const isOccupied = (r: Room) => r.trangThai === "Đang có người";

  const handleAdd = async () => {
    if (!newCode.trim()) return;
    setSaving(true);
    try {
      await createRoom({ maPhong: newCode.toUpperCase(), sucChuaToiDa: Number(newCap)||2, giaThuePhong: newPrice||null, trangThai: "Trống", chiNhanh: newBranch||null });
      await reload();
      setShowAdd(false); setNewCode(""); setNewCap("2"); setNewPrice(""); setNewBranch("");
    } catch (err: any) { addToast({ message: err?.response?.data?.message ?? "Lỗi khi thêm phòng", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editRoom) return;
    setSaving(true);
    try {
      await updateRoom(editRoom.maPhong, editForm as UpdateRoomPayload);
      await reload(); setEditRoom(null);
    } catch (err: any) { addToast({ message: err?.response?.data?.message ?? "Lỗi khi cập nhật phòng", type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (room: Room) => {
    setSaving(true);
    try {
      await deleteRoom(room.maPhong);
      await reload(); setDeleteConfirm(null);
    } catch (err: any) { addToast({ message: err?.response?.data?.message ?? "Lỗi khi xóa phòng", type: "error" }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative" style={{ width: 280 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã phòng, chi nhánh..."
              className="w-full pl-9 pr-3 rounded-xl text-slate-700 placeholder-slate-400 transition"
              style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", outline:"none" }}
              onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
              onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}/>
          </div>
          <button onClick={reload} className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
            style={{ background:`${A}10`, border:`1px solid ${A}20`, color:A, fontSize:"0.78rem", fontWeight:700 }}>
            <RotateCcw size={13}/> Làm mới
          </button>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition"
          style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, boxShadow:`0 3px 10px ${A}40`, fontSize:"0.82rem", fontWeight:700 }}
          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
          <Plus size={15}/> Thêm Phòng Mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label:"Tổng phòng",    value: totalElements,                                                                                                                    color:"#4F46E5", bg:"#EEF2FF", icon:Home },
          { label:"Đang có người", value: rooms.filter(r=>statusStyle(r.trangThai).label==="Đang thuê").length,                                                          color:"#EA580C", bg:"#FFF7ED", icon:Users },
          { label:"Phòng trống",   value: rooms.filter(r=>statusStyle(r.trangThai).label==="Trống").length,                                                              color:"#059669", bg:"#ECFDF5", icon:BedDouble },
          { label:"Bảo trì/Cọc",  value: rooms.filter(r=>statusStyle(r.trangThai).label==="Bảo trì"||statusStyle(r.trangThai).label==="Đã đặt").length,                 color:"#D97706", bg:"#FFFBEB", icon:Settings2 },
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

      <div className="mt-2 mb-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setSize(s); setPage(0); }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div className="p-6 space-y-3" style={{ background:"white" }}>
            {Array.from({length:5}).map((_,i)=><div key={i} className="h-12 rounded-xl animate-pulse" style={{ background:"#F1F5F9" }}/>)}
          </div>
        ) : error ? (
          <div className="p-10 text-center" style={{ background:"white" }}>
            <AlertTriangle size={28} style={{ color:"#DC2626", margin:"0 auto" }}/>
            <div className="mt-3" style={{ fontWeight:700, color:"#1E293B" }}>Không tải được danh sách phòng</div>
            <div style={{ fontSize:"0.78rem", color:"#64748B", marginTop:4 }}>{error.message}</div>
            <button onClick={reload} className="mt-4 px-4 py-2 rounded-xl text-white" style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:700 }}>Thử lại</button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
                  {["Mã phòng","Chi nhánh","Sức chứa","Giá thuê","Trạng thái","Hành động"].map(h=>(
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.72rem", fontWeight:800, color:"#64748B", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((room, i) => (
                  <tr key={room.maPhong}
                    style={{ background:i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                    className="group transition-colors hover:bg-indigo-50/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"#EEF2FF" }}>
                          <Home size={13} style={{ color:A }}/>
                        </div>
                        <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>{room.maPhong}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span style={{ fontSize:"0.82rem", color:"#64748B" }}>{room.chiNhanh ?? "--"}</span></td>
                    <td className="px-4 py-3"><span style={{ fontWeight:600, fontSize:"0.88rem", color:"#1E293B" }}>{room.sucChuaToiDa ?? "--"} người</span></td>
                    <td className="px-4 py-3"><span style={{ fontSize:"0.82rem", color:"#059669", fontWeight:600 }}>{room.giaThuePhong ? `${formatCurrency(Number(room.giaThuePhong))}đ` : "--"}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={(room.trangThai ?? "Trống") as any}/></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setEditRoom(room); setEditForm({...room}); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                          style={{ background:"#F1F5F9", color:"#64748B" }} title="Chỉnh sửa"
                          onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.background=`${A}12`; (e.currentTarget as HTMLButtonElement).style.color=A; }}
                          onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background="#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color="#64748B"; }}>
                          <Pencil size={13}/>
                        </button>
                        <div className="relative"
                          onMouseEnter={() => isOccupied(room) && setTooltip(room.maPhong)}
                          onMouseLeave={() => setTooltip(null)}>
                          <button onClick={() => !isOccupied(room) && setDeleteConfirm(room)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                            disabled={isOccupied(room)}
                            style={{ background:isOccupied(room)?"#F8FAFC":"#FEF2F2", color:isOccupied(room)?"#CBD5E1":"#DC2626", cursor:isOccupied(room)?"not-allowed":"pointer", opacity:isOccupied(room)?0.5:1 }}
                            onMouseEnter={e=>{ if(!isOccupied(room)) (e.currentTarget as HTMLButtonElement).style.background="#FEE2E2"; }}
                            onMouseLeave={e=>{ if(!isOccupied(room)) (e.currentTarget as HTMLButtonElement).style.background="#FEF2F2"; }}>
                            <Trash2 size={13}/>
                          </button>
                          {tooltip === room.maPhong && isOccupied(room) && (
                            <div className="absolute right-0 bottom-full mb-2 z-20 pointer-events-none" style={{ minWidth:200 }}>
                              <div className="px-3 py-2 rounded-lg text-white flex items-start gap-2" style={{ background:"#1E293B", fontSize:"0.72rem", lineHeight:1.4 }}>
                                <AlertTriangle size={11} className="flex-shrink-0 mt-0.5 text-amber-400"/>
                                Không thể xoá phòng đang có người sử dụng
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Home size={32} className="text-slate-300 mb-3"/>
                <div className="text-slate-500" style={{ fontSize:"0.88rem", fontWeight:500 }}>Không tìm thấy phòng nào</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)" }} onClick={()=>setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ border:"1px solid #E2E8F0" }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid #F1F5F9" }}>
              <div>
                <div className="text-slate-900" style={{ fontWeight:800, fontSize:"1rem" }}>Thêm Phòng Mới</div>
                <div className="text-slate-500" style={{ fontSize:"0.75rem", marginTop:2 }}>Sẽ được lưu vào database</div>
              </div>
              <button onClick={()=>setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"><X size={16}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label:"Mã phòng *", value:newCode, onChange:(v:string)=>setNewCode(v), placeholder:"VD: A104, C305..." },
                { label:"Chi nhánh",  value:newBranch, onChange:(v:string)=>setNewBranch(v), placeholder:"VD: Chi nhánh Q.1" },
              ].map(f=>(
                <div key={f.label}>
                  <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>{f.label}</label>
                  <input value={f.value} onChange={e=>f.onChange(e.target.value)} placeholder={f.placeholder}
                    className="w-full px-3 rounded-xl"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem", outline:"none" }}
                    onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                    onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}/>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>Sức chứa</label>
                  <input type="number" value={newCap} onChange={e=>setNewCap(e.target.value)} min="1" max="30"
                    className="w-full px-3 rounded-xl"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem", outline:"none" }}
                    onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                    onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}/>
                </div>
                <div>
                  <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>Giá thuê (đ)</label>
                  <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} placeholder="3500000"
                    className="w-full px-3 rounded-xl"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem", outline:"none" }}
                    onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                    onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}/>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-2.5 rounded-xl" style={{ border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#64748B", fontSize:"0.82rem", fontWeight:600 }}>Hủy</button>
              <button onClick={handleAdd} disabled={saving||!newCode.trim()} className="flex-1 py-2.5 rounded-xl text-white" style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:700, opacity:!newCode.trim()?0.6:1 }}>
                {saving ? "Đang lưu..." : "Tạo phòng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(15,23,42,0.5)", backdropFilter:"blur(4px)" }} onClick={()=>setEditRoom(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ border:"1px solid #E2E8F0" }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid #F1F5F9" }}>
              <div>
                <div className="text-slate-900" style={{ fontWeight:800, fontSize:"1rem" }}>Chỉnh sửa Phòng</div>
                <div className="text-slate-500" style={{ fontSize:"0.75rem", marginTop:2 }}>{editRoom.maPhong}</div>
              </div>
              <button onClick={()=>setEditRoom(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"><X size={16}/></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {([
                { key:"sucChuaToiDa", label:"Sức chứa", type:"number" },
                { key:"giaThuePhong", label:"Giá thuê (đ)", type:"text" },
                { key:"trangThai",    label:"Trạng thái", type:"select", options: ["Trống", "Đang có người", "Đang bảo trì", "Đã đặt cọc"] },
                { key:"chiNhanh",     label:"Chi nhánh",  type:"text" },
              ]).map(f=>(
                <div key={f.key}>
                  <label className="block mb-1.5 text-slate-700" style={{ fontSize:"0.78rem", fontWeight:600 }}>{f.label}</label>
                  {f.type === "select" ? (
                    <select 
                      value={String((editForm as any)[f.key] ?? "")}
                      onChange={e=>setEditForm(prev=>({...prev,[f.key]:e.target.value}))}
                      className="w-full px-3 rounded-xl appearance-none cursor-pointer"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem", outline:"none" }}
                      onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                      onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}
                    >
                      {f.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={f.type} value={String((editForm as any)[f.key] ?? "")}
                      onChange={e=>setEditForm(prev=>({...prev,[f.key]:f.type==="number"?Number(e.target.value):e.target.value}))}
                      className="w-full px-3 rounded-xl"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem", outline:"none" }}
                      onFocus={e=>{ e.currentTarget.style.borderColor=A; e.currentTarget.style.boxShadow=`0 0 0 3px ${A}12`; }}
                      onBlur={e=>{ e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.boxShadow="none"; }}/>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={()=>setEditRoom(null)} className="flex-1 py-2.5 rounded-xl" style={{ border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#64748B", fontSize:"0.82rem", fontWeight:600 }}>Hủy</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2" style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:700 }}>
                <Save size={14}/>{saving?"Đang lưu...":"Lưu thay đổi"}
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"#FEF2F2" }}><Trash2 size={18} style={{ color:"#DC2626" }}/></div>
              <div>
                <div className="text-slate-900" style={{ fontWeight:800, fontSize:"0.95rem" }}>Xác nhận xoá phòng</div>
                <div className="text-slate-500" style={{ fontSize:"0.75rem", marginTop:1 }}>Hành động này không thể hoàn tác</div>
              </div>
            </div>
            <div className="rounded-xl p-3 mb-4" style={{ background:"#FFF7ED", border:"1px solid #FDE68A" }}>
              <p className="text-amber-700" style={{ fontSize:"0.8rem" }}>Phòng <strong>{deleteConfirm.maPhong}</strong> sẽ bị xoá vĩnh viễn khỏi database.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteConfirm(null)} disabled={saving} className="flex-1 py-2.5 rounded-xl" style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>Hủy</button>
              <button onClick={()=>handleDelete(deleteConfirm)} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white" style={{ background:"#DC2626", fontSize:"0.82rem", fontWeight:700 }}>
                {saving?"Đang xóa...":"Xoá phòng"}
              </button>
            </div>
          </div>
        </div>
      )}
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
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border:`1px solid #FDE68A`, boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 px-5 py-4"
          style={{ background:"linear-gradient(135deg,#FFFBEB,#FFF7ED)", borderBottom:"1px solid #FDE68A" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"#FEF3C7" }}>
            <Clock size={15} style={{ color:"#D97706" }}/></div>
          <div>
            <div style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Phí Giữ Xe</div>
            <div style={{ fontSize:"0.72rem", color:"#D97706" }}>Tính theo tháng / phương tiện</div>
          </div>
        </div>
        <div className="p-5 grid grid-cols-3 gap-4" style={{ background:"white" }}>
          <PriceInput fieldKey="motorbike" label="Xe máy" icon={Bike} iconColor="#D97706" iconBg="#FFFBEB"/>
          <PriceInput fieldKey="bicycle"   label="Xe đạp" icon={Bike} iconColor="#059669" iconBg="#ECFDF5"/>
          <PriceInput fieldKey="car"       label="Ô tô"   icon={Car}  iconColor="#7C3AED" iconBg="#F5F3FF"/>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition"
          style={{ border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#64748B", fontSize:"0.82rem", fontWeight:600 }}>
          <RotateCcw size={14}/> Đặt lại mặc định
        </button>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition"
          style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.82rem", fontWeight:700, boxShadow:`0 4px 14px ${A}40` }}>
          {saved ? <><Check size={14}/> Đã lưu!</> : <><Save size={14}/> Lưu thay đổi</>}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 3 — Staff / Account Management
// ═══════════════════════════════════════════════════════════════════════════
const AVATAR_COLORS: Record<string, { gradient: string }> = {
  "Nhân viên Sale": { gradient: "linear-gradient(135deg,#F97316,#EA580C)" },
  "Kế toán":        { gradient: "linear-gradient(135deg,#059669,#0891B2)" },
  "Manager":        { gradient: "linear-gradient(135deg,#6366F1,#7C3AED)" },
};

function StaffTab() {
  const { addToast } = useToast();
  const {
    items: rawStaff,
    page,
    size,
    totalElements,
    totalPages,
    loading,
    error,
    setPage,
    setSize,
    reload,
  } = usePagedList<any>(getUsers, 10);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffRole>("all");

  const staff: StaffUser[] = rawStaff.map((emp) => {
    // loaiNhanVien trong DB: "Quan ly", "Tu van", "Ke toan"
    const loai = (emp.loaiNhanVien ?? "").toLowerCase().trim();
    let role: StaffRole;
    if (loai === "quan ly" || loai.includes("manager") || loai.includes("quản lý")) {
      role = "Manager";
    } else if (loai === "ke toan" || loai.includes("kế toán") || loai.includes("ketoan")) {
      role = "Kế toán";
    } else {
      // "Tu van", "Sale", mặc định → Nhân viên Sale
      role = "Nhân viên Sale";
    }
    return {
      id: emp.maNhanVien,
      name: emp.hoTen || "Chưa đặt tên",
      email: emp.email || "---",
      phone: emp.soDienThoai || "---",
      role,
      status: "Hoạt động" as StaffStatus,
      joinedAt: "Mới",
      avatar: (emp.hoTen || "??").split(" ").slice(-2).map((s: string) => s[0]).join("").toUpperCase(),
    };
  });

  const filteredStaff = staff.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative" style={{ width: 280 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên hoặc email..."
              className="w-full pl-9 pr-3 rounded-xl text-slate-700 placeholder-slate-400"
              style={{ paddingTop: "0.55rem", paddingBottom: "0.55rem", background: "#F8FAFC", border: "1.5px solid #E2E8F0", fontSize: "0.82rem", outline: "none" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = A; e.currentTarget.style.boxShadow = `0 0 0 3px ${A}12`; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          {(["all", "Nhân viên Sale", "Kế toán", "Manager"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-lg transition"
              style={{
                fontSize: "0.78rem",
                fontWeight: roleFilter === r ? 700 : 500,
                background: roleFilter === r ? `${A}12` : "#F8FAFC",
                color: roleFilter === r ? A : "#64748B",
                border: `1.5px solid ${roleFilter === r ? `${A}40` : "#E2E8F0"}`,
              }}
            >
              {r === "all" ? "Tất cả" : r}
            </button>
          ))}
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
          style={{ background: `${A}10`, border: `1px solid ${A}20`, color: A, fontSize: "0.78rem", fontWeight: 700 }}
        >
          <RotateCcw size={13} /> Tải lại
        </button>
      </div>

      {/* Active staff table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderBottom: "1px solid #E0E7FF" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Nhân sự từ hệ thống</div>
            <div style={{ fontSize: "0.72rem", color: "#6366F1" }}>Hiển thị {filteredStaff.length} / {totalElements} tài khoản</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
            <Users size={10} style={{ color: A }} />
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: A }}>Dữ liệu thực tế</span>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={size}
            onPageChange={setPage}
            onPageSizeChange={setSize}
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400" style={{ background: "white" }}>
            <RotateCcw size={24} className="animate-spin mx-auto mb-3" />
            <div style={{ fontSize: "0.85rem" }}>Đang tải danh sách nhân sự...</div>
          </div>
        ) : error ? (
          <div className="p-10 text-center" style={{ background: "white" }}>
            <AlertTriangle size={24} className="text-red-500 mx-auto mb-3" />
            <div style={{ fontSize: "0.85rem", color: "#EF4444", fontWeight: 600 }}>Lỗi tải dữ liệu</div>
            <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: 4 }}>{error.message}</div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}>
                {["Nhân viên", "Vai trò", "Liên hệ", "Mã số", "Trạng thái", "Hành động"].map((h) => (
                  <th key={h} className="text-left px-4 py-3" style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((user, i) => {
                const colors = AVATAR_COLORS[user.role] || AVATAR_COLORS["Nhân viên Sale"];
                return (
                  <tr key={user.id} style={{ background: i % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}
                    className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: colors.gradient, fontWeight: 800, fontSize: "0.75rem" }}>{user.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>{user.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 1 }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} style={{ color: "#94A3B8" }} />
                        <span style={{ fontSize: "0.78rem", color: "#64748B" }}>{user.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>{user.id}</span></td>
                    <td className="px-4 py-3"><StatusBadgeStaff status={user.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={async () => {
                            try {
                              // Example of toggle status if backend supported it
                              addToast({ message: "Tính năng cập nhật trạng thái nhân sự đang được phát triển", type: "info" });
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition"
                          style={{ background: user.status === "Hoạt động" ? "#FEF9C3" : "#ECFDF5", color: user.status === "Hoạt động" ? "#A16207" : "#059669", fontSize: "0.72rem", fontWeight: 700, border: "1px solid transparent" }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(0.95)"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ""}>
                          {user.status === "Hoạt động" ? <><EyeOff size={11} /> Tạm dừng</> : <><Eye size={11} /> Kích hoạt</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filteredStaff.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-10" style={{ background: "white" }}>
            <Users size={28} style={{ color: "#CBD5E1" }} className="mb-2" />
            <div style={{ fontSize: "0.88rem", fontWeight: 500, color: "#64748B" }}>Không tìm thấy nhân viên nào</div>
          </div>
        )}
      </div>

      {/* Pending section - simplified since no backend support yet */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center">
        <ShieldCheck size={32} className="text-slate-300 mx-auto mb-3" />
        <div style={{ fontWeight: 700, color: "#475569", fontSize: "0.9rem" }}>Tính năng Phê duyệt Tài khoản</div>
        <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: 6, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
          Hệ thống hiện đang tự động kích hoạt tài khoản ngay khi đăng ký. Các yêu cầu chờ phê duyệt (nếu có) sẽ xuất hiện tại đây trong bản cập nhật tới.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB 4 — Contract Management
// ═══════════════════════════════════════════════════════════════════════════
// Compact contract list component (extract for readability)
function ContractList({
  contracts,
  filteredContracts,
  selectedContract,
  onSelect,
  loading,
  error,
  page,
  size,
  totalElements,
  totalPages,
  setPage,
  setSize,
  reload,
}: {
  contracts: ApiContract[];
  filteredContracts: ApiContract[];
  selectedContract: ApiContract | null;
  onSelect: (c: ApiContract) => void;
  loading: boolean;
  error: any;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  setPage: (p: number) => void;
  setSize: (s: number) => void;
  reload: () => void;
}) {
  return (
    <div className="col-span-2 rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ background: "#F8FAFC", borderBottom: "1px solid #E8EEF4" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Danh sách Hợp đồng Thuê</div>
          <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{totalElements} hợp đồng từ backend</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
            style={{ background: `${A}10`, border: `1px solid ${A}20`, color: A, fontSize: "0.78rem", fontWeight: 700 }}
          >
            <RotateCcw size={13} /> Tải lại
          </button>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-slate-100">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      </div>

      {loading ? (
        <div className="p-5 space-y-3" style={{ background: "white" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center" style={{ background: "white" }}>
          <AlertTriangle size={28} style={{ color: "#DC2626", margin: "0 auto" }} />
          <div className="mt-3" style={{ fontWeight: 700, color: "#1E293B" }}>Không tải được danh sách hợp đồng</div>
          <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 4 }}>{error.message}</div>
          <button
            onClick={reload}
            className="mt-4 px-4 py-2 rounded-xl text-white"
            style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.82rem", fontWeight: 700 }}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}>
                {[
                  "Mã HĐ",
                  "Ngày lập",
                  "Khách hàng",
                  "Hình thức",
                  "Kỳ thanh toán",
                  "Số TV",
                  "Hành động",
                ].map(header => (
                  <th key={header} className="text-left px-4 py-3" style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract, index) => {
                const isSelected = selectedContract?.maHopDongThue === contract.maHopDongThue;
                return (
                  <tr
                    key={contract.maHopDongThue}
                    onClick={() => onSelect(contract)}
                    className="group transition-colors hover:bg-indigo-50/30"
                    style={{ background: isSelected ? "#EEF2FF" : index % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${A}12` }}>
                          <FileText size={13} style={{ color: A }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#1E293B" }}>{contract.maHopDongThue}</div>
                          <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{contract.maVanBan}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span style={{ fontSize: "0.82rem", color: "#64748B" }}>{formatDate(contract.ngayLap)}</span></td>
                    <td className="px-4 py-3"><div><div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1E293B" }}>{contract.khachHangSoHuu ?? "--"}</div><div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{contract.chiNhanh ?? "--"}</div></div></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-md" style={{ background: "#ECFDF5", color: "#059669", fontSize: "0.72rem", fontWeight: 700 }}>{contract.hinhThucThue ?? "--"}</span></td>
                    <td className="px-4 py-3"><span className="px-2 py-1 rounded-md" style={{ background: "#FFF7ED", color: "#C2410C", fontSize: "0.72rem", fontWeight: 700 }}>{contract.kyThanhToan ?? "--"}</span></td>
                    <td className="px-4 py-3"><span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>{formatCurrency(contract.soLuongThanhVien)}</span></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(contract); }}
                        className="px-3 py-1.5 rounded-lg transition"
                        style={{ background: isSelected ? `${A}15` : "#F1F5F9", color: isSelected ? A : "#64748B", fontSize: "0.75rem", fontWeight: 700 }}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredContracts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12" style={{ background: "white" }}>
              <FileText size={32} className="text-slate-300 mb-3" />
              <div className="text-slate-500" style={{ fontSize: "0.88rem", fontWeight: 500 }}>Không tìm thấy hợp đồng nào</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ContractDetailPane({
  selectedContract,
  editMode,
  setEditMode,
  form,
  setForm,
  saving,
  setSaving,
  reload,
}: {
  selectedContract: ApiContract | null;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  form: Partial<ApiContract>;
  setForm: (f: Partial<ApiContract>) => void;
  saving: boolean;
  setSaving: (s: boolean) => void;
  reload: () => void;
}) {
  return (
    <div className="col-span-1 rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderBottom: "1px solid #E0E7FF" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${A}18` }}>
          <ShieldCheck size={15} style={{ color: A }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Thông tin Hợp đồng</div>
          <div style={{ fontSize: "0.72rem", color: "#6366F1" }}>Xem nhanh dữ liệu chi tiết của hợp đồng đang chọn</div>
        </div>
      </div>

      {selectedContract ? (
        <div className="p-5 space-y-4" style={{ background: "white" }}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "maHopDongThue", label: "Mã hợp đồng", readonly: true },
              { key: "maVanBan", label: "Mã văn bản" },
              { key: "loaiVanBan", label: "Loại văn bản" },
              { key: "chiNhanh", label: "Chi nhánh" },
              { key: "nhanVienLap", label: "Nhân viên lập" },
              { key: "khachHangSoHuu", label: "Khách hàng sở hữu" },
              { key: "hinhThucThue", label: "Hình thức thuê" },
              { key: "kyThanhToan", label: "Kỳ thanh toán" },
              { key: "soLuongThanhVien", label: "Số lượng thành viên" },
            ].map(f => (
              <div key={f.key as string} className="rounded-xl p-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                <div style={{ marginTop: 6 }}>
                  {editMode && !f.readonly ? (
                    <input
                      value={String((form as any)[f.key] ?? "")}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg outline-none"
                      style={{ border: "1.5px solid #E2E8F0", background: "white", fontSize: "0.88rem" }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.84rem", color: "#1E293B", fontWeight: 700 }}>
                      {selectedContract
                        ? f.key === "soLuongThanhVien"
                          ? formatCurrency((selectedContract as any)[f.key])
                          : (selectedContract as any)[f.key] ?? "--"
                        : "--"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex-1 py-2.5 rounded-xl transition" style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", fontSize: "0.82rem", fontWeight: 600 }}>
                Chỉnh sửa
              </button>
            ) : (
              <button onClick={() => { setEditMode(false); setForm(selectedContract ? { ...selectedContract } : {}); }} className="flex-1 py-2.5 rounded-xl transition" style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", fontSize: "0.82rem", fontWeight: 600 }}>
                Hủy
              </button>
            )}

            {editMode ? (
              <button
                onClick={async () => {
                  if (!selectedContract) return;
                  setSaving(true);
                  try {
                    const payload: any = { ...form };
                    if (payload.soLuongThanhVien !== undefined && payload.soLuongThanhVien !== null && payload.soLuongThanhVien !== "") {
                      payload.soLuongThanhVien = Number(String(payload.soLuongThanhVien).replace(/[^\d.-]/g, "")) || 0;
                    }
                    await updateContract(selectedContract.maHopDongThue, payload);
                    setEditMode(false);
                    await reload();
                    addToast({ message: "Cập nhật hợp đồng thành công", type: "success" });
                  } catch (err: any) {
                    console.error(err);
                    addToast({ message: err?.message ?? "Lỗi khi cập nhật hợp đồng", type: "error" });
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white transition"
                style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.82rem", fontWeight: 700 }}
              >
                {saving ? "Đang lưu..." : "Ký / Cập nhật"}
              </button>
            ) : (
              <div style={{ width: "48%" }} />
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center" style={{ background: "white" }}>
          <FileText size={28} style={{ color: "#CBD5E1", margin: "0 auto" }} />
          <div className="mt-3" style={{ fontWeight: 700, color: "#1E293B" }}>Chọn một hợp đồng để xem chi tiết</div>
          <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 4 }}>Danh sách bên trái lấy dữ liệu trực tiếp từ backend</div>
        </div>
      )}
    </div>
  );
}

function ContractTab() {
  const {
    items: contracts,
    page,
    size,
    totalElements,
    totalPages,
    loading,
    error,
    setPage,
    setSize,
    reload,
  } = usePagedList<ApiContract>(getContracts, 8);
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [modalContract, setModalContract] = useState<ApiContract | null>(null);
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);

  const filteredContracts = contracts.filter(contract => {
    const haystack = [
      contract.maHopDongThue,
      contract.maVanBan,
      contract.loaiVanBan,
      contract.chiNhanh,
      contract.nhanVienLap,
      contract.khachHangSoHuu,
      contract.hinhThucThue,
      contract.kyThanhToan,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  const summary = [
    { label: "Tổng hợp đồng", value: totalElements, color: "#4F46E5", bg: "#EEF2FF", icon: FileText },
    { label: "Trang hiện tại", value: `${page + 1}/${totalPages || 1}`, color: "#EA580C", bg: "#FFF7ED", icon: CalendarDays },
    { label: "Đang xem", value: filteredContracts.length, color: "#059669", bg: "#ECFDF5", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative" style={{ width: 320 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã hợp đồng, khách hàng, chi nhánh..."
              className="w-full pl-9 pr-3 rounded-xl text-slate-700 placeholder-slate-400 transition"
              style={{ paddingTop: "0.55rem", paddingBottom: "0.55rem", background: "#F8FAFC", border: "1.5px solid #E2E8F0", fontSize: "0.82rem", outline: "none" }}
              onFocus={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.boxShadow = `0 0 0 3px ${A}12`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {summary.map(item => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "white", border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1E293B", lineHeight: 1.1 }}>{item.value}</div>
              <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ background: "#F8FAFC", borderBottom: "1px solid #E8EEF4" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Danh sách Hợp đồng Thuê</div>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                {totalElements} hợp đồng từ backend
              </div>
            </div>
            <button
              onClick={reload}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
              style={{ background: `${A}10`, border: `1px solid ${A}20`, color: A, fontSize: "0.78rem", fontWeight: 700 }}
            >
              <RotateCcw size={13} /> Tải lại
            </button>
          </div>

          <div className="px-5 py-3 border-b border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={setPage}
              onPageSizeChange={setSize}
            />
          </div>

          {loading ? (
            <div className="p-5 space-y-3" style={{ background: "white" }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-14 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center" style={{ background: "white" }}>
              <AlertTriangle size={28} style={{ color: "#DC2626", margin: "0 auto" }} />
              <div className="mt-3" style={{ fontWeight: 700, color: "#1E293B" }}>Không tải được danh sách hợp đồng</div>
              <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 4 }}>{error.message}</div>
              <button
                onClick={reload}
                className="mt-4 px-4 py-2 rounded-xl text-white"
                style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.82rem", fontWeight: 700 }}
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}>
                    {[
                      "Mã HĐ",
                      "Ngày lập",
                      "Khách hàng",
                      "Hình thức",
                      "Kỳ thanh toán",
                      "Số TV",
                      "Hành động",
                    ].map(header => (
                      <th key={header} className="text-left px-4 py-3" style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract, index) => {
                    const isSelected = selectedContract?.maHopDongThue === contract.maHopDongThue;

                    return (
                      <tr
                        key={contract.maHopDongThue}
                        onClick={() => {
                          setSelectedContract(contract);
                          setForm({ ...contract });
                        }}
                        className="group transition-colors hover:bg-indigo-50/30"
                        style={{ background: isSelected ? "#EEF2FF" : index % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${A}12` }}>
                              <FileText size={13} style={{ color: A }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.86rem", color: "#1E293B" }}>{contract.maHopDongThue}</div>
                              <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{contract.maVanBan}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ fontSize: "0.82rem", color: "#64748B" }}>{formatDate(contract.ngayLap)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1E293B" }}>{contract.khachHangSoHuu ?? "--"}</div>
                            <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{contract.chiNhanh ?? "--"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-md" style={{ background: "#ECFDF5", color: "#059669", fontSize: "0.72rem", fontWeight: 700 }}>
                            {contract.hinhThucThue ?? "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-md" style={{ background: "#FFF7ED", color: "#C2410C", fontSize: "0.72rem", fontWeight: 700 }}>
                            {contract.kyThanhToan ?? "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>{formatCurrency(contract.soLuongThanhVien)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setModalContract(contract); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition"
                            style={{ background: `${A}10`, border: `1px solid ${A}25`, color: A, fontSize: "0.75rem", fontWeight: 700 }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = `${A}20`}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = `${A}10`}
                          >
                            <Eye size={13} /> Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredContracts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12" style={{ background: "white" }}>
                  <FileText size={32} className="text-slate-300 mb-3" />
                  <div className="text-slate-500" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                    Không tìm thấy hợp đồng nào
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* Modal */}
      {modalContract && (
        <ContractDetailModal contract={modalContract} onClose={() => setModalContract(null)} reload={reload} />
      )}
    </div>
  );
}

function ContractDetailModal({ contract, onClose, reload }: { contract: ApiContract; onClose: () => void; reload: () => void; }) {
  const { addToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<ApiContract>>({ ...contract });

  const FIELDS = [
    { key: "maHopDongThue", label: "Mã hợp đồng", readonly: true },
    { key: "maVanBan", label: "Mã văn bản" },
    { key: "loaiVanBan", label: "Loại văn bản" },
    { key: "ngayLap", label: "Ngày lập", readonly: true },
    { key: "chiNhanh", label: "Chi nhánh" },
    { key: "nhanVienLap", label: "Nhân viên lập" },
    { key: "khachHangSoHuu", label: "Khách hàng sở hữu" },
    { key: "hinhThucThue", label: "Hình thức thuê" },
    { key: "kyThanhToan", label: "Kỳ thanh toán" },
    { key: "soLuongThanhVien", label: "Số lượng thành viên" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (payload.soLuongThanhVien !== undefined && payload.soLuongThanhVien !== null && payload.soLuongThanhVien !== "") {
        payload.soLuongThanhVien = Number(String(payload.soLuongThanhVien).replace(/[^\d.-]/g, "")) || 0;
      }
      await updateContract(contract.maHopDongThue, payload);
      setEditMode(false);
      await reload();
      onClose();
    } catch (err: any) {
      addToast({ message: err?.message ?? "Lỗi khi cập nhật hợp đồng", type: "error" });
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(5px)" }} onClick={onClose}>
      <div className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ maxWidth: 680, margin: "0 1rem", border: "1px solid #E0E7FF" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", borderBottom: "1px solid #E0E7FF" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${A}18` }}><FileText size={16} style={{ color: A }} /></div>
          <div className="flex-1 min-w-0">
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1E293B" }}>Chi tiết Hợp đồng</div>
            <div style={{ fontSize: "0.72rem", color: "#6366F1" }}>{contract.maHopDongThue} · {formatDate(contract.ngayLap)}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F1F5F9", color: "#64748B" }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FEE2E2"; (e.currentTarget as HTMLButtonElement).style.color = "#DC2626"; }} onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; }}><X size={15} /></button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FIELDS.map(f => (
              <div key={f.key} className="rounded-xl p-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</div>
                {editMode && !f.readonly ? (
                  <input value={String((form as any)[f.key] ?? "")} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg outline-none" style={{ border: `1.5px solid ${A}40`, background: "white", fontSize: "0.88rem", color: "#1E293B" }} onFocus={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.boxShadow = `0 0 0 3px ${A}12`; }} onBlur={e => { e.currentTarget.style.borderColor = `${A}40`; e.currentTarget.style.boxShadow = "none"; }} />
                ) : (
                  <div style={{ fontSize: "0.88rem", color: "#1E293B", fontWeight: 700 }}>{f.key === "soLuongThanhVien" ? formatCurrency((contract as any)[f.key]) : f.key === "ngayLap" ? formatDate((contract as any)[f.key]) : (contract as any)[f.key] ?? "--"}</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {editMode ? (
              <>
                <button onClick={() => { setEditMode(false); setForm({ ...contract }); }} className="flex-1 py-2.5 rounded-xl" style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", fontSize: "0.82rem", fontWeight: 600 }}>Hủy chỉnh sửa</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.82rem", fontWeight: 700 }}><Save size={14} />{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </>
            ) : (
              <>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl" style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#64748B", fontSize: "0.82rem", fontWeight: 600 }}>Đóng</button>
                <button onClick={() => setEditMode(true)} className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.82rem", fontWeight: 700 }}><Pencil size={14} /> Chỉnh sửa</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


//  MAIN SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════════════════
type Tab = "rooms" | "contracts" | "prices" | "staff";

const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id:"rooms",  label:"Quản lý Phòng/Giường", icon:BedDouble },
  { id:"contracts", label:"Hợp đồng Thuê",     icon:FileText },
  { id:"prices", label:"Bảng Đơn Giá",          icon:CircleDollarSign },
  { id:"staff",  label:"Tài khoản Nhân sự",     icon:Users },
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
            Cấu hình phòng, hợp đồng, bảng giá và quản lý tài khoản nhân sự
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
        {activeTab === "contracts" && <ContractTab />}
        {activeTab === "prices" && <PriceTab />}
        {activeTab === "staff"  && <StaffTab />}
      </div>
    </div>
  );
}
