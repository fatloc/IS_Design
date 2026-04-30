import { useState } from "react";
import {
  ClipboardList, ArrowLeftRight, Home, Calendar, User, Check, X,
  ChevronRight, Clock, AlertTriangle, CheckCircle, Trash2, Send,
  FileSignature, Sparkles, BedDouble, Lock, BadgeCheck, Building2,
  SlidersHorizontal, Droplets, Star, Wrench,
} from "lucide-react";

const A  = "#4F46E5";
const AL = "#818CF8";

// ── Types ──────────────────────────────────────────────────────────────────
type CheckinStatus = "Chờ bàn giao" | "Đã bàn giao";
type CheckoutStatus = "Chờ thanh lý" | "Chờ đối soát" | "Đã trả phòng";
type ItemCondition = "Tốt" | "Bình thường" | "Cần sửa chữa";

interface CheckinRoom {
  id: string; room: string; tenant: string; avatar: string;
  roomType: string; moveIn: string; deposit: number; status: CheckinStatus;
}
interface CheckoutRoom {
  id: string; room: string; tenant: string; avatar: string;
  roomType: string; moveOut: string; deposit: number;
  daysLeft: number; status: CheckoutStatus;
}
interface ChecklistItem {
  asset: string; present: boolean; condition: ItemCondition; notes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INIT_CHECKIN: CheckinRoom[] = [
  { id:"ci1", room:"A102", tenant:"Trần Minh Khôi",  avatar:"MK", roomType:"Ghép giường", moveIn:"01/05/2026", deposit:1200000, status:"Chờ bàn giao" },
  { id:"ci2", room:"B203", tenant:"Phạm Thị Lan",    avatar:"TL", roomType:"Toàn phòng",  moveIn:"01/05/2026", deposit:3500000, status:"Chờ bàn giao" },
  { id:"ci3", room:"C301", tenant:"Nguyễn Thị Mai",  avatar:"TM", roomType:"Ghép giường", moveIn:"03/05/2026", deposit:1200000, status:"Chờ bàn giao" },
];
const INIT_CHECKOUT: CheckoutRoom[] = [
  { id:"co1", room:"A101", tenant:"Lê Thị Cẩm",     avatar:"TC", roomType:"Toàn phòng",  moveOut:"30/04/2026", deposit:3500000, daysLeft:2,  status:"Chờ thanh lý" },
  { id:"co2", room:"B202", tenant:"Hoàng Văn Nam",   avatar:"VN", roomType:"Ghép giường", moveOut:"28/04/2026", deposit:1200000, daysLeft:0,  status:"Chờ thanh lý" },
  { id:"co3", room:"C302", tenant:"Vũ Minh Tuấn",    avatar:"MT", roomType:"Toàn phòng",  moveOut:"02/05/2026", deposit:3500000, daysLeft:4,  status:"Chờ thanh lý" },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { asset:"Giường",           present:true, condition:"Tốt",       notes:"" },
  { asset:"Nệm",              present:true, condition:"Tốt",       notes:"" },
  { asset:"Tủ đầu giường",    present:true, condition:"Tốt",       notes:"" },
  { asset:"Chìa khóa/Thẻ từ", present:true, condition:"Tốt",       notes:"" },
];
const ASSET_ICONS: Record<string, React.ElementType> = {
  "Giường":           BedDouble,
  "Nệm":              Sparkles,
  "Tủ đầu giường":    Building2,
  "Chìa khóa/Thẻ từ": Lock,
};

// ── Helpers ────────────────────────────────────────────────────────────────
function Avatar({ initials, gradient, size=9 }:{ initials:string; gradient:string; size?:number }) {
  const s = `${size/4}rem`;
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ width:s, height:s, background:gradient, fontWeight:800, fontSize:"0.72rem" }}>
      {initials}
    </div>
  );
}

function ConditionPill({ value, active, onClick }:{ value:ItemCondition; active:boolean; onClick:()=>void }) {
  const COLORS: Record<ItemCondition,{bg:string;active:string;text:string}> = {
    "Tốt":            { bg:"#F0FDF4", active:"#059669", text:"#166534" },
    "Bình thường":    { bg:"#FFFBEB", active:"#D97706", text:"#92400E" },
    "Cần sửa chữa":   { bg:"#FFF1F2", active:"#DC2626", text:"#991B1B" },
  };
  const c = COLORS[value];
  return (
    <button onClick={onClick}
      className="px-2.5 py-1 rounded-lg transition-all"
      style={{ background: active ? c.active : "#F1F5F9", color: active ? "white" : "#94A3B8", fontSize:"0.72rem", fontWeight: active ? 800 : 500, border:`1.5px solid ${active ? c.active : "#E2E8F0"}` }}>
      {value}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  CHECK-IN TAB
// ══════════════════════════════════════════════════════════════════════════
function CheckInTab() {
  const [rooms, setRooms]       = useState<CheckinRoom[]>(INIT_CHECKIN);
  const [modalId, setModalId]   = useState<string|null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST.map(c=>({...c})));
  const [handoverNote, setHandoverNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const openModal = (id:string) => {
    setModalId(id); setChecklist(DEFAULT_CHECKLIST.map(c=>({...c})));
    setHandoverNote(""); setConfirmed(false);
  };
  const closeModal = () => { setModalId(null); };

  const updateItem = (idx:number, field:keyof ChecklistItem, val:unknown) => {
    setChecklist(prev => prev.map((item,i) => i===idx ? {...item,[field]:val} : item));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(()=>{
      setRooms(prev=>prev.filter(r=>r.id!==modalId));
      closeModal();
    }, 1600);
  };

  const activeRoom = rooms.find(r=>r.id===modalId);
  const allPresent = checklist.every(c=>c.present);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:"Chờ bàn giao", value:rooms.length,                                        color:A,         bg:"#EEF2FF" },
          { label:"Tổng cọc chờ", value:`₫${(rooms.reduce((s,r)=>s+r.deposit,0)/1e6).toFixed(1)}M`, color:"#059669", bg:"#ECFDF5" },
          { label:"Vào sớm nhất", value:rooms[0]?.moveIn ?? "—",                            color:"#D97706", bg:"#FFFBEB" },
        ].map(s=>(
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background:"white", border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:s.bg }}>
              <ClipboardList size={15} style={{ color:s.color }}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"1.1rem", color:"#1E293B", lineHeight:1.1 }}>{s.value}</div>
              <div style={{ fontSize:"0.7rem", color:"#94A3B8", marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
              {["Phòng","Khách thuê","Loại phòng","Ngày dọn vào","Tiền cọc","Trạng thái","Hành động"].map(h=>(
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((r,i)=>(
              <tr key={r.id}
                style={{ background:i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                className="hover:bg-indigo-50/20 transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"#EEF2FF" }}>
                      <Home size={13} style={{ color:A }}/>
                    </div>
                    <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>{r.room}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={r.avatar} gradient={`linear-gradient(135deg,${A},#7C3AED)`} size={8}/>
                    <span style={{ fontWeight:600, fontSize:"0.85rem", color:"#374151" }}>{r.tenant}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md" style={{ background: r.roomType==="Toàn phòng"?"#EEF2FF":"#FFF7ED", color: r.roomType==="Toàn phòng"?A:"#EA580C", fontSize:"0.72rem", fontWeight:700 }}>
                    {r.roomType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} style={{ color:"#94A3B8" }}/>
                    <span style={{ fontSize:"0.82rem", color:"#374151" }}>{r.moveIn}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span style={{ fontWeight:800, fontSize:"0.88rem", color:"#1E293B" }}>₫{r.deposit.toLocaleString("vi-VN")}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background:"#FFF7ED", color:"#C2410C", border:"1px solid #FDE68A", fontSize:"0.72rem", fontWeight:700 }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#F97316" }}/>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={()=>openModal(r.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition"
                    style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.78rem", fontWeight:700, boxShadow:`0 2px 8px ${A}35` }}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                    <ClipboardList size={13}/> Lập biên bản
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length===0 && (
          <div className="flex flex-col items-center py-14">
            <CheckCircle size={32} style={{ color:"#86EFAC" }} className="mb-2"/>
            <div style={{ fontWeight:700, color:"#374151" }}>Tất cả phòng đã được bàn giao</div>
          </div>
        )}
      </div>

      {/* ── CheckIn Modal ── */}
      {modalId && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(15,23,42,0.6)", backdropFilter:"blur(6px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border:"1px solid #E2E8F0" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ background:`linear-gradient(135deg,${A},#7C3AED)` }}>
              <div>
                <div className="text-white flex items-center gap-2" style={{ fontWeight:900, fontSize:"1.05rem" }}>
                  <ClipboardList size={16}/> Biên bản Bàn giao Phòng
                </div>
                <div className="text-indigo-200 mt-0.5" style={{ fontSize:"0.78rem" }}>
                  Phòng <strong>{activeRoom.room}</strong> · {activeRoom.tenant} · Vào ngày {activeRoom.moveIn}
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-200 hover:text-white hover:bg-white/10 transition">
                <X size={16}/>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Info row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label:"Loại phòng",   value:activeRoom.roomType },
                  { label:"Ngày dọn vào", value:activeRoom.moveIn   },
                  { label:"Tiền cọc",     value:`₫${activeRoom.deposit.toLocaleString("vi-VN")}` },
                ].map(info=>(
                  <div key={info.label} className="px-3 py-2.5 rounded-xl" style={{ background:"#F8FAFC", border:"1px solid #E2E8F0" }}>
                    <div style={{ fontSize:"0.68rem", color:"#94A3B8", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{info.label}</div>
                    <div style={{ fontSize:"0.88rem", fontWeight:800, color:"#1E293B", marginTop:2 }}>{info.value}</div>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background:`${A}15` }}>
                    <CheckCircle size={11} style={{ color:A }}/>
                  </div>
                  <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Kiểm kê tài sản bàn giao</span>
                </div>
                <div className="space-y-2">
                  {checklist.map((item,idx)=>{
                    const Icon = ASSET_ICONS[item.asset] || BedDouble;
                    return (
                      <div key={item.asset} className="rounded-xl overflow-hidden"
                        style={{ border:`1.5px solid ${item.present ? "#E2E8F0" : "#FECACA"}`, background: item.present ? "white" : "#FFF5F5" }}>
                        <div className="flex items-center gap-3 px-4 py-3">
                          {/* Checkbox */}
                          <button onClick={()=>updateItem(idx,"present",!item.present)}
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition"
                            style={{ background: item.present ? A : "#F1F5F9", border:`2px solid ${item.present ? A : "#CBD5E1"}` }}>
                            {item.present && <Check size={11} className="text-white"/>}
                          </button>
                          {/* Asset icon + name */}
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${A}12` }}>
                            <Icon size={13} style={{ color:A }}/>
                          </div>
                          <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B", flex:1 }}>{item.asset}</span>
                          {/* Condition pills */}
                          {item.present && (
                            <div className="flex items-center gap-1.5">
                              {(["Tốt","Bình thường","Cần sửa chữa"] as ItemCondition[]).map(c=>(
                                <ConditionPill key={c} value={c} active={item.condition===c} onClick={()=>updateItem(idx,"condition",c)}/>
                              ))}
                            </div>
                          )}
                          {!item.present && (
                            <span className="px-2 py-0.5 rounded-md" style={{ background:"#FEE2E2", color:"#DC2626", fontSize:"0.7rem", fontWeight:700 }}>Thiếu / Không có</span>
                          )}
                        </div>
                        {/* Notes */}
                        {item.present && (
                          <div className="px-4 pb-3">
                            <input value={item.notes} onChange={e=>updateItem(idx,"notes",e.target.value)}
                              placeholder="Ghi chú tình trạng (tùy chọn)..."
                              className="w-full px-3 rounded-lg outline-none"
                              style={{ paddingTop:"0.45rem", paddingBottom:"0.45rem", background:"#F8FAFC", border:"1px solid #E2E8F0", fontSize:"0.78rem", color:"#64748B" }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <div className="mb-1.5" style={{ fontWeight:700, fontSize:"0.85rem", color:"#374151" }}>Ghi chú bổ sung</div>
                <textarea value={handoverNote} onChange={e=>setHandoverNote(e.target.value)}
                  placeholder="Ghi nhận thêm về tình trạng phòng, yêu cầu đặc biệt..."
                  rows={2}
                  className="w-full rounded-xl resize-none outline-none"
                  style={{ padding:"0.65rem 0.85rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", color:"#374151" }}
                />
              </div>

              {!allPresent && (
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background:"#FFF7ED", border:"1px solid #FDE68A" }}>
                  <AlertTriangle size={13} style={{ color:"#D97706", flexShrink:0, marginTop:1 }}/>
                  <span style={{ fontSize:"0.78rem", color:"#92400E" }}>Một hoặc nhiều tài sản bị ghi nhận là thiếu. Cần xử lý trước khi hoàn tất bàn giao.</span>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
              <button onClick={closeModal}
                className="px-4 py-2.5 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
                Hủy
              </button>
              <button onClick={handleConfirm} disabled={!allPresent || confirmed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition"
                style={{
                  background: confirmed ? "#059669" : !allPresent ? "#CBD5E1" : `linear-gradient(135deg,${A},#7C3AED)`,
                  fontSize:"0.85rem", fontWeight:800, cursor: !allPresent ? "not-allowed" : "pointer",
                  boxShadow: !allPresent || confirmed ? "none" : `0 3px 12px ${A}40`,
                }}>
                {confirmed ? <><CheckCircle size={14}/> Đã xác nhận!</> : <><FileSignature size={14}/> Xác nhận Biên bản Bàn giao</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  CHECK-OUT TAB
// ══════════════════════════════════════════════════════════════════════════
function CheckOutTab() {
  const [rooms, setRooms]   = useState<CheckoutRoom[]>(INIT_CHECKOUT);
  const [modalId, setModalId] = useState<string|null>(null);

  // Liquidation form state
  const [assetList, setAssetList] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST.map(c=>({...c})));
  const [cleanState, setCleanState] = useState<"Tốt"|"Trung bình"|"Kém">("Tốt");
  const [damages, setDamages] = useState("");
  const [penalty, setPenalty] = useState("0");
  const [sentToAcct, setSentToAcct] = useState(false);
  const [released, setReleased]     = useState(false);

  const openModal = (id:string) => {
    setModalId(id);
    setAssetList(DEFAULT_CHECKLIST.map(c=>({...c})));
    setCleanState("Tốt"); setDamages(""); setPenalty("0");
    setSentToAcct(false); setReleased(false);
  };
  const closeModal = () => setModalId(null);

  const activeRoom = rooms.find(r=>r.id===modalId);

  const updateAsset = (idx:number, field:keyof ChecklistItem, val:unknown) =>
    setAssetList(prev=>prev.map((item,i)=>i===idx?{...item,[field]:val}:item));

  const handleSendToAccountant = () => {
    setSentToAcct(true);
    setRooms(prev=>prev.map(r=>r.id===modalId?{...r,status:"Chờ đối soát"}:r));
  };

  const handleRelease = () => {
    setReleased(true);
    setTimeout(()=>{
      setRooms(prev=>prev.filter(r=>r.id!==modalId));
      closeModal();
    },1600);
  };

  const depositAmt = activeRoom?.deposit ?? 0;
  const penaltyAmt = Number((penalty||"0").replace(/\D/g,"")) || 0;
  const refundAmt  = Math.max(0, depositAmt - penaltyAmt);

  const CLEAN_COLORS: Record<string,{bg:string;color:string;active:string}> = {
    "Tốt":      { bg:"#F0FDF4", color:"#166534", active:"#059669" },
    "Trung bình":{ bg:"#FFFBEB", color:"#92400E", active:"#D97706" },
    "Kém":      { bg:"#FFF1F2", color:"#991B1B", active:"#DC2626" },
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:"Chờ thanh lý",   value:rooms.filter(r=>r.status==="Chờ thanh lý").length,   color:"#EA580C", bg:"#FFF7ED" },
          { label:"Chờ kế toán",    value:rooms.filter(r=>r.status==="Chờ đối soát").length,    color:A,         bg:"#EEF2FF" },
          { label:"Tổng cọc chờ",   value:`₫${(rooms.reduce((s,r)=>s+r.deposit,0)/1e6).toFixed(1)}M`, color:"#059669", bg:"#ECFDF5" },
        ].map(s=>(
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background:"white", border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:s.bg }}>
              <ArrowLeftRight size={15} style={{ color:s.color }}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"1.1rem", color:"#1E293B", lineHeight:1.1 }}>{s.value}</div>
              <div style={{ fontSize:"0.7rem", color:"#94A3B8", marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
              {["Phòng","Khách thuê","Loại phòng","Ngày trả phòng","Còn","Tiền cọc","Trạng thái","Hành động"].map(h=>(
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((r,i)=>{
              const statusColors: Record<CheckoutStatus,{bg:string;dot:string;color:string}> = {
                "Chờ thanh lý":  { bg:"#FFF7ED", dot:"#F97316", color:"#C2410C" },
                "Chờ đối soát":  { bg:"#EEF2FF", dot:"#6366F1", color:"#4338CA" },
                "Đã trả phòng":  { bg:"#F0FDF4", dot:"#22C55E", color:"#15803D" },
              };
              const sc = statusColors[r.status];
              return (
                <tr key={r.id}
                  style={{ background:i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                  className="hover:bg-red-50/10 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"#FFF7ED" }}>
                        <Home size={13} style={{ color:"#EA580C" }}/>
                      </div>
                      <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>{r.room}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={r.avatar} gradient="linear-gradient(135deg,#EA580C,#DC2626)" size={8}/>
                      <span style={{ fontWeight:600, fontSize:"0.85rem", color:"#374151" }}>{r.tenant}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md" style={{ background:"#F8FAFC", color:"#64748B", fontSize:"0.72rem", fontWeight:700, border:"1px solid #E2E8F0" }}>{r.roomType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.82rem", color:"#374151" }}>{r.moveOut}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{
                      background: r.daysLeft===0?"#FEE2E2":r.daysLeft<=2?"#FEF3C7":"#F0FDF4",
                      color: r.daysLeft===0?"#DC2626":r.daysLeft<=2?"#D97706":"#059669",
                      fontSize:"0.72rem", fontWeight:800 }}>
                      {r.daysLeft===0?"Hôm nay":`${r.daysLeft}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight:800, fontSize:"0.88rem", color:"#1E293B" }}>₫{r.deposit.toLocaleString("vi-VN")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.dot}30`, fontSize:"0.72rem", fontWeight:700 }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background:sc.dot }}/>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={()=>openModal(r.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                      style={{ background:"#FFF7ED", border:"1.5px solid #FDE68A", color:"#C2410C", fontSize:"0.78rem", fontWeight:700 }}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#FEF3C7"}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#FFF7ED"}>
                      <SlidersHorizontal size={13}/> Thanh lý
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rooms.length===0 && (
          <div className="flex flex-col items-center py-14">
            <CheckCircle size={32} style={{ color:"#86EFAC" }} className="mb-2"/>
            <div style={{ fontWeight:700, color:"#374151" }}>Không có phòng nào chờ thanh lý</div>
          </div>
        )}
      </div>

      {/* ── Checkout Modal ── */}
      {modalId && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(15,23,42,0.6)", backdropFilter:"blur(6px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden" style={{ border:"1px solid #E2E8F0" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ background:"linear-gradient(135deg,#EA580C,#DC2626)" }}>
              <div>
                <div className="text-white flex items-center gap-2" style={{ fontWeight:900, fontSize:"1.05rem" }}>
                  <ArrowLeftRight size={16}/> Biên bản Thanh lý & Trả phòng
                </div>
                <div className="text-orange-200 mt-0.5" style={{ fontSize:"0.78rem" }}>
                  Phòng <strong>{activeRoom.room}</strong> · {activeRoom.tenant} · Trả ngày {activeRoom.moveOut}
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-200 hover:text-white hover:bg-white/10 transition">
                <X size={16}/>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Asset inspection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={14} style={{ color:"#EA580C" }}/>
                  <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Tình trạng tài sản khi trả phòng</span>
                </div>
                <div className="space-y-2">
                  {assetList.map((item,idx)=>{
                    const Icon = ASSET_ICONS[item.asset] || BedDouble;
                    return (
                      <div key={item.asset} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background:"#F8FAFC", border:"1px solid #E2E8F0" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"#FFF7ED" }}>
                          <Icon size={13} style={{ color:"#EA580C" }}/>
                        </div>
                        <span style={{ fontWeight:700, fontSize:"0.85rem", color:"#374151", flex:1 }}>{item.asset}</span>
                        <div className="flex items-center gap-1.5">
                          {(["Tốt","Bình thường","Cần sửa chữa"] as ItemCondition[]).map(c=>(
                            <ConditionPill key={c} value={c} active={item.condition===c} onClick={()=>updateAsset(idx,"condition",c)}/>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cleanliness */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={14} style={{ color:"#0891B2" }}/>
                  <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Vệ sinh phòng</span>
                </div>
                <div className="flex items-center gap-2">
                  {(["Tốt","Trung bình","Kém"] as const).map(c=>{
                    const cs = CLEAN_COLORS[c];
                    const isActive = cleanState===c;
                    return (
                      <button key={c} onClick={()=>setCleanState(c)}
                        className="flex-1 py-2.5 rounded-xl transition"
                        style={{ background: isActive ? cs.active : "#F8FAFC", color: isActive ? "white" : "#64748B", border:`1.5px solid ${isActive ? cs.active : "#E2E8F0"}`, fontSize:"0.82rem", fontWeight: isActive ? 800 : 500 }}>
                        {c==="Tốt" ? "✓ Tốt" : c==="Trung bình" ? "~ Trung bình" : "✗ Kém"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Damages */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench size={14} style={{ color:"#DC2626" }}/>
                  <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>Hư hỏng / Mất mát</span>
                </div>
                <textarea value={damages} onChange={e=>setDamages(e.target.value)}
                  placeholder="Mô tả chi tiết hư hỏng, đồ thiếu... VD: Gương bị nứt, chìa khóa thiếu 1 cái..."
                  rows={3} className="w-full rounded-xl resize-none outline-none"
                  style={{ padding:"0.65rem 0.85rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", color:"#374151" }}
                />
                <div className="flex items-center gap-3 mt-2">
                  <label style={{ fontSize:"0.8rem", fontWeight:700, color:"#374151", whiteSpace:"nowrap" }}>Phụ phí ước tính (₫):</label>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize:"0.82rem", color:"#94A3B8" }}>₫</span>
                    <input value={penalty} onChange={e=>setPenalty(e.target.value)}
                      placeholder="0" type="text"
                      className="w-full pl-6 pr-3 rounded-xl outline-none"
                      style={{ paddingTop:"0.5rem", paddingBottom:"0.5rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.88rem", fontWeight:700, color:"#1E293B" }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial summary */}
              <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4" }}>
                <div className="px-4 py-3" style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
                  <span style={{ fontWeight:800, fontSize:"0.88rem", color:"#1E293B" }}>Tổng kết tài chính</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label:"Tiền cọc gốc",     value:`₫${depositAmt.toLocaleString("vi-VN")}`,    color:"#374151" },
                    { label:"Khấu trừ hư hỏng", value:`− ₫${penaltyAmt.toLocaleString("vi-VN")}`, color:"#DC2626" },
                  ].map(row=>(
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                      <span style={{ fontSize:"0.82rem", color:"#64748B" }}>{row.label}</span>
                      <span style={{ fontSize:"0.88rem", fontWeight:700, color:row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3" style={{ background:"#F0FDF4" }}>
                    <span style={{ fontSize:"0.9rem", fontWeight:800, color:"#1E293B" }}>Hoàn lại khách</span>
                    <span style={{ fontSize:"1.1rem", fontWeight:900, color:"#059669" }}>₫{refundAmt.toLocaleString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              {/* Status feedback */}
              {sentToAcct && !released && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background:"#EEF2FF", border:"1px solid #C7D2FE" }}>
                  <BadgeCheck size={14} style={{ color:A }}/>
                  <span style={{ fontSize:"0.82rem", fontWeight:600, color:A }}>
                    Đã chuyển kế toán xử lý. Đang chờ đối soát số liệu...
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
              <button onClick={closeModal}
                className="px-4 py-2.5 rounded-xl transition"
                style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
                Đóng
              </button>
              <div className="flex-1"/>
              {/* Send to Accountant */}
              <button onClick={handleSendToAccountant} disabled={sentToAcct}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition"
                style={{
                  background: sentToAcct ? "#D1FAE5" : "linear-gradient(135deg,#EA580C,#DC2626)",
                  color: sentToAcct ? "#059669" : "white",
                  fontSize:"0.82rem", fontWeight:800,
                  boxShadow: sentToAcct ? "none" : "0 2px 10px rgba(234,88,12,0.35)",
                  cursor: sentToAcct ? "default" : "pointer",
                }}>
                {sentToAcct ? <><BadgeCheck size={13}/> Đã chuyển kế toán</> : <><Send size={13}/> Chuyển Kế toán đối soát</>}
              </button>
              {/* Release room */}
              <button onClick={handleRelease} disabled={!sentToAcct || released}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition"
                style={{
                  background: !sentToAcct ? "#CBD5E1" : released ? "#059669" : "linear-gradient(135deg,#059669,#0891B2)",
                  fontSize:"0.82rem", fontWeight:800,
                  cursor: !sentToAcct ? "not-allowed" : "pointer",
                  boxShadow: sentToAcct && !released ? "0 2px 10px rgba(5,150,105,0.35)" : "none",
                }}>
                {released ? <><CheckCircle size={13}/> Đã trả phòng!</> : <><FileSignature size={13}/> Ký biên bản & Trả phòng</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
type OTab = "checkin" | "checkout";

export default function Operations() {
  const [tab, setTab] = useState<OTab>("checkin");

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:"#FFF7ED" }}>
          <ArrowLeftRight size={14} style={{ color:"#EA580C" }}/>
        </div>
        <h2 className="text-slate-900" style={{ fontWeight:900, fontSize:"1.35rem", letterSpacing:"-0.02em" }}>
          Bàn giao & Thanh lý
        </h2>
      </div>
      <p className="mb-6" style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
        Quản lý check-in (lập biên bản bàn giao) và check-out (thanh lý & hoàn cọc)
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl" style={{ background:"#F1F5F9", border:"1px solid #E2E8F0", display:"inline-flex" }}>
        {([
          { id:"checkin"  as const, label:"Bàn giao (Check-in)",  icon:ClipboardList,    color:A,         count:INIT_CHECKIN.length  },
          { id:"checkout" as const, label:"Thanh lý (Check-out)",  icon:ArrowLeftRight,   color:"#EA580C", count:INIT_CHECKOUT.length },
        ]).map(t=>{
          const isActive = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                fontSize:"0.82rem", fontWeight: isActive ? 700 : 500,
                color: isActive ? t.color : "#64748B",
                background: isActive ? "white" : "transparent",
                boxShadow: isActive ? "0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" : "none",
              }}>
              <t.icon size={14}/>
              {t.label}
              <span className="px-1.5 py-0.5 rounded-full text-white" style={{ background: isActive ? t.color : "#CBD5E1", fontSize:"0.65rem", fontWeight:800 }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab==="checkin"  && <CheckInTab/>}
      {tab==="checkout" && <CheckOutTab/>}
    </div>
  );
}
