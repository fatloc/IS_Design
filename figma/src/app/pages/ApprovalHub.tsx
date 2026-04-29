import { useState } from "react";
import {
  ClipboardCheck, DollarSign, Users, Check, X, AlertTriangle,
  ChevronRight, Clock, Calendar, Home, CheckCircle, XCircle,
  FileText, ShieldCheck, Send, MessageSquare, BadgeCheck,
  Building2, Info, BedDouble, MapPin, Fingerprint,
} from "lucide-react";

const A  = "#4F46E5";
const AL = "#818CF8";

// ── Types ──────────────────────────────────────────────────────────────────
type RS = "pending" | "approved" | "rejected";
type DS = "pending" | "confirmed";
type CS = "pending" | "approved" | "flagged";

interface RentalReq {
  id:string; tenant:string; avatar:string; room:string; roomType:string;
  period:string; fromDate:string; submitted:string; note:string; source:string;
  status:RS; rejectReason?:string;
}
interface DepositReq {
  id:string; tenant:string; avatar:string; room:string; amount:number;
  accountant:string; date:string; method:string; ref:string; status:DS;
}
interface ConditionReq {
  id:string; tenant:string; avatar:string; room:string;
  gender:string; roomGender:string;
  areaOk:boolean; groupOk:boolean; idVerified:boolean; status:CS;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INIT_RENTALS: RentalReq[] = [
  { id:"rr1", tenant:"Trần Minh Khôi",  avatar:"MK", room:"A102", roomType:"Ghép giường", period:"6 tháng",  fromDate:"01/05/2026", submitted:"25/04/2026", note:"Sinh viên ĐH Bách Khoa năm 3 – ưu tiên phòng yên tĩnh", source:"Website",       status:"pending" },
  { id:"rr2", tenant:"Nguyễn Thị Hoa",  avatar:"TH", room:"B203", roomType:"Toàn phòng",  period:"12 tháng", fromDate:"01/06/2026", submitted:"26/04/2026", note:"", source:"Nhân viên Sale", status:"pending" },
  { id:"rr3", tenant:"Lê Văn Phú",      avatar:"VP", room:"C301", roomType:"Ghép giường", period:"3 tháng",  fromDate:"01/05/2026", submitted:"27/04/2026", note:"Cần phòng gần thang máy – chân bị thương", source:"Hotline",        status:"pending" },
  { id:"rr4", tenant:"Phạm Thị Ngân",   avatar:"TN", room:"A103", roomType:"Toàn phòng",  period:"6 tháng",  fromDate:"15/05/2026", submitted:"28/04/2026", note:"", source:"Website",        status:"pending" },
];
const INIT_DEPOSITS: DepositReq[] = [
  { id:"dc1", tenant:"Phạm Thị Lan",  avatar:"TL", room:"A101", amount:3500000, accountant:"Trần Thị B",    date:"27/04/2026", method:"Chuyển khoản", ref:"TF-240427-001", status:"pending" },
  { id:"dc2", tenant:"Hoàng Văn Nam", avatar:"VN", room:"B202", amount:1200000, accountant:"Phạm Hải Yến", date:"28/04/2026", method:"Tiền mặt",     ref:"CS-240428-001", status:"pending" },
  { id:"dc3", tenant:"Vũ Minh Tuấn",  avatar:"MT", room:"C302", amount:1200000, accountant:"Trần Thị B",    date:"28/04/2026", method:"Chuyển khoản", ref:"TF-240428-003", status:"pending" },
];
const INIT_CONDITIONS: ConditionReq[] = [
  { id:"rc1", tenant:"Nguyễn Thị Mai", avatar:"TM", room:"C303", gender:"Nữ",  roomGender:"Nữ",  areaOk:true,  groupOk:true,  idVerified:true,  status:"pending" },
  { id:"rc2", tenant:"Trần Văn Hùng",  avatar:"VH", room:"B201", gender:"Nam", roomGender:"Nam", areaOk:false, groupOk:true,  idVerified:true,  status:"pending" },
  { id:"rc3", tenant:"Vũ Thị Linh",    avatar:"TL", room:"A103", gender:"Nữ",  roomGender:"Nữ",  areaOk:true,  groupOk:false, idVerified:false, status:"pending" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string,{bg:string;color:string}> = {
  "Website":       { bg:"#EEF2FF", color:A },
  "Nhân viên Sale":{ bg:"#FFF7ED", color:"#EA580C" },
  "Hotline":       { bg:"#ECFDF5", color:"#059669" },
};

function Avatar({ initials, gradient, size=9 }: { initials:string; gradient:string; size?:number }) {
  const s = `${size/4}rem`;
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ width:s, height:s, background:gradient, fontWeight:800, fontSize:"0.72rem" }}>
      {initials}
    </div>
  );
}

// ── Section A: Rental Approvals ────────────────────────────────────────────
function RentalSection() {
  const [items, setItems] = useState<RentalReq[]>(INIT_RENTALS);
  const [rejectingId, setRejectingId] = useState<string|null>(null);
  const [rejectText, setRejectText]   = useState("");
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);

  const showToast = (msg:string, type:"ok"|"err"="ok") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),2500);
  };

  const approve = (id:string) => {
    setItems(p=>p.map(r=>r.id===id ? {...r,status:"approved"} : r));
    showToast("Đã duyệt yêu cầu thuê phòng");
    setTimeout(()=>setItems(p=>p.filter(r=>r.id!==id)),1600);
  };
  const startReject = (id:string) => { setRejectingId(id); setRejectText(""); };
  const cancelReject = () => { setRejectingId(null); setRejectText(""); };
  const confirmReject = (id:string) => {
    if (!rejectText.trim()) return;
    setItems(p=>p.map(r=>r.id===id ? {...r,status:"rejected",rejectReason:rejectText} : r));
    showToast("Đã từ chối yêu cầu","err");
    setRejectingId(null); setRejectText("");
    setTimeout(()=>setItems(p=>p.filter(r=>r.id!==id)),1600);
  };

  const pending = items.filter(r=>r.status==="pending");

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white"
          style={{ background: toast.type==="ok" ? "#059669" : "#DC2626", transition:"all .3s" }}>
          {toast.type==="ok" ? <CheckCircle size={15}/> : <XCircle size={15}/>}
          <span style={{ fontSize:"0.85rem", fontWeight:600 }}>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-slate-900" style={{ fontWeight:800, fontSize:"1rem" }}>Yêu cầu thuê phòng</div>
          <div className="text-slate-500 mt-0.5" style={{ fontSize:"0.78rem" }}>
            {pending.length} yêu cầu đang chờ phê duyệt · Xem xét kỹ trước khi xác nhận
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background:`${A}10`, border:`1px solid ${A}25` }}>
          <Clock size={13} style={{ color:A }}/>
          <span style={{ fontSize:"0.75rem", fontWeight:700, color:A }}>SLA: 24h/yêu cầu</span>
        </div>
      </div>

      {pending.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background:"#F8FAFC", border:"1px dashed #CBD5E1" }}>
          <CheckCircle size={36} className="mb-3" style={{ color:"#86EFAC" }}/>
          <div style={{ fontWeight:700, color:"#374151", fontSize:"0.95rem" }}>Tất cả đã được xử lý!</div>
          <div style={{ color:"#94A3B8", fontSize:"0.8rem", marginTop:4 }}>Không còn yêu cầu nào đang chờ duyệt</div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(req => {
          const isRejecting = rejectingId === req.id;
          const isDone      = req.status !== "pending";
          const srcStyle    = SOURCE_COLORS[req.source] ?? { bg:"#F8FAFC", color:"#64748B" };

          return (
            <div key={req.id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                border:`1.5px solid ${isDone && req.status==="approved" ? "#86EFAC" : isDone && req.status==="rejected" ? "#FCA5A5" : "#E8EEF4"}`,
                background: isDone && req.status==="approved" ? "#F0FDF4" : isDone && req.status==="rejected" ? "#FFF1F2" : "white",
                boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                opacity: isDone ? 0.7 : 1,
              }}>
              {/* Card body */}
              <div className="flex items-start gap-4 p-4">
                <Avatar initials={req.avatar} gradient={`linear-gradient(135deg,${A},#7C3AED)`}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span style={{ fontWeight:800, fontSize:"0.92rem", color:"#1E293B" }}>{req.tenant}</span>
                    <span className="px-2 py-0.5 rounded-md" style={{ background:srcStyle.bg, color:srcStyle.color, fontSize:"0.68rem", fontWeight:700 }}>{req.source}</span>
                    {isDone && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: req.status==="approved" ? "#D1FAE5" : "#FEE2E2", color: req.status==="approved" ? "#059669" : "#DC2626", fontSize:"0.68rem", fontWeight:700 }}>
                        {req.status==="approved" ? <><Check size={9}/> Đã duyệt</> : <><X size={9}/> Đã từ chối</>}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Home size={11} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.78rem", color:"#64748B" }}><strong style={{ color:"#374151" }}>{req.room}</strong> · {req.roomType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.78rem", color:"#64748B" }}>{req.period} từ {req.fromDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.78rem", color:"#94A3B8" }}>Nộp: {req.submitted}</span>
                    </div>
                  </div>
                  {req.note && (
                    <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-lg" style={{ background:"#F8FAFC", border:"1px solid #E2E8F0" }}>
                      <MessageSquare size={11} className="mt-0.5 flex-shrink-0" style={{ color:"#94A3B8" }}/>
                      <span style={{ fontSize:"0.75rem", color:"#64748B", fontStyle:"italic" }}>"{req.note}"</span>
                    </div>
                  )}
                </div>
                {/* Actions */}
                {!isDone && !isRejecting && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={()=>startReject(req.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                      style={{ background:"#FFF1F2", border:"1.5px solid #FECDD3", color:"#DC2626", fontSize:"0.78rem", fontWeight:700 }}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#FEE2E2"}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#FFF1F2"}>
                      <X size={13}/> Từ chối
                    </button>
                    <button onClick={()=>approve(req.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition text-white"
                      style={{ background:`linear-gradient(135deg,${A},#7C3AED)`, fontSize:"0.78rem", fontWeight:700, boxShadow:`0 2px 10px ${A}40` }}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                      <Check size={13}/> Đồng ý cho thuê
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Reject Form */}
              {isRejecting && (
                <div className="px-4 pb-4 pt-0">
                  <div className="rounded-xl overflow-hidden" style={{ border:"1.5px solid #FECACA", background:"#FFFBFB" }}>
                    <div className="flex items-center gap-2 px-3 py-2.5" style={{ background:"#FEF2F2", borderBottom:"1px solid #FECACA" }}>
                      <AlertTriangle size={13} style={{ color:"#EF4444" }}/>
                      <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#DC2626" }}>Lý do từ chối *</span>
                      <span style={{ fontSize:"0.72rem", color:"#F87171", marginLeft:4 }}>Bắt buộc – sẽ được gửi tới khách hàng</span>
                    </div>
                    <div className="p-3">
                      <textarea
                        value={rejectText} onChange={e=>setRejectText(e.target.value)}
                        placeholder="VD: Phòng không còn trống trong khoảng thời gian yêu cầu..."
                        rows={3}
                        className="w-full rounded-lg resize-none transition outline-none"
                        style={{ padding:"0.6rem 0.75rem", background:"white", border:`1.5px solid ${rejectText.trim() ? "#E2E8F0" : "#FECACA"}`, fontSize:"0.82rem", color:"#374151" }}
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span style={{ fontSize:"0.68rem", color: rejectText.trim() ? "#94A3B8" : "#EF4444" }}>
                          {rejectText.trim() ? `${rejectText.length} ký tự` : "Vui lòng nhập lý do từ chối"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={cancelReject}
                            className="px-3 py-1.5 rounded-lg transition"
                            style={{ border:"1.5px solid #E2E8F0", fontSize:"0.75rem", fontWeight:600, color:"#64748B" }}>
                            Hủy
                          </button>
                          <button onClick={()=>confirmReject(req.id)}
                            disabled={!rejectText.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-white"
                            style={{ background: rejectText.trim() ? "#DC2626" : "#E2E8F0", color: rejectText.trim() ? "white" : "#94A3B8", fontSize:"0.75rem", fontWeight:700, cursor: rejectText.trim() ? "pointer" : "not-allowed" }}>
                            <XCircle size={12}/> Xác nhận từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section B: Deposit Confirmations ──────────────────────────────────────
function DepositSection() {
  const [items, setItems] = useState<DepositReq[]>(INIT_DEPOSITS);

  const confirm = (id:string) => {
    setItems(p=>p.map(d=>d.id===id ? {...d,status:"confirmed"} : d));
    setTimeout(()=>setItems(p=>p.filter(d=>d.id!==id)),1600);
  };

  const METHODS: Record<string,{bg:string;color:string}> = {
    "Chuyển khoản": { bg:"#EEF2FF", color:A },
    "Tiền mặt":     { bg:"#ECFDF5", color:"#059669" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-slate-900" style={{ fontWeight:800, fontSize:"1rem" }}>Xác nhận đặt cọc</div>
          <div className="text-slate-500 mt-0.5" style={{ fontSize:"0.78rem" }}>
            Kế toán đã ghi nhận – Manager xác nhận đã nhận cọc thực tế
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
              {["Khách hàng","Phòng","Số tiền cọc","Kế toán xử lý","Hình thức","Ngày nộp","Hành động"].map(h=>(
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((dep,i)=>{
              const mStyle = METHODS[dep.method] ?? { bg:"#F8FAFC", color:"#64748B" };
              const isConfirmed = dep.status === "confirmed";
              return (
                <tr key={dep.id}
                  style={{ background: isConfirmed ? "#F0FDF4" : i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9", transition:"background .3s" }}
                  className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={dep.avatar} gradient="linear-gradient(135deg,#059669,#0891B2)" size={8}/>
                      <span style={{ fontWeight:700, fontSize:"0.85rem", color:"#1E293B" }}>{dep.tenant}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <Home size={12} style={{ color:"#94A3B8" }}/>
                      <span style={{ fontWeight:600, fontSize:"0.82rem", color:"#374151" }}>{dep.room}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>
                      ₫{dep.amount.toLocaleString("vi-VN")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize:"0.78rem", color:"#64748B" }}>{dep.accountant}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md" style={{ background:mStyle.bg, color:mStyle.color, fontSize:"0.72rem", fontWeight:700 }}>{dep.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize:"0.75rem", color:"#94A3B8" }}>{dep.ref}</span>
                    </div>
                    <span style={{ fontSize:"0.72rem", color:"#64748B" }}>{dep.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    {isConfirmed ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background:"#D1FAE5" }}>
                        <CheckCircle size={12} style={{ color:"#059669" }}/>
                        <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#059669" }}>Đã xác nhận</span>
                      </div>
                    ) : (
                      <button onClick={()=>confirm(dep.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white transition"
                        style={{ background:"linear-gradient(135deg,#059669,#0891B2)", fontSize:"0.75rem", fontWeight:700, boxShadow:"0 2px 8px rgba(5,150,105,0.3)" }}
                        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                        <BadgeCheck size={12}/> Xác nhận nhận cọc
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length===0 && (
          <div className="flex flex-col items-center py-12">
            <CheckCircle size={30} style={{ color:"#86EFAC" }} className="mb-2"/>
            <div style={{ fontSize:"0.88rem", fontWeight:600, color:"#64748B" }}>Không có khoản cọc nào chờ xác nhận</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section C: Residency Condition Checks ─────────────────────────────────
function ConditionSection() {
  const [items, setItems] = useState<ConditionReq[]>(INIT_CONDITIONS);
  const [checkingId, setCheckingId] = useState<string|null>(null);

  const getRules = (c:ConditionReq) => [
    { label:"Giới tính phù hợp",    ok: c.gender===c.roomGender, detail:`${c.gender} ↔ Phòng ${c.roomGender}` },
    { label:"Khu vực được duyệt",    ok: c.areaOk,               detail: c.areaOk ? "Khu vực hợp lệ" : "Ngoài khu vực ưu tiên" },
    { label:"Quy tắc nhóm ở",        ok: c.groupOk,              detail: c.groupOk ? "Tuân thủ quy định" : "Vi phạm quy tắc ghép phòng" },
    { label:"Xác minh CMND/CCCD",    ok: c.idVerified,           detail: c.idVerified ? "Đã xác minh" : "Chưa nộp giấy tờ" },
  ];

  const allPass = (c:ConditionReq) => c.gender===c.roomGender && c.areaOk && c.groupOk && c.idVerified;

  const submitCheck = (id:string) => {
    const target = items.find(c=>c.id===id);
    if (!target) return;
    setItems(p=>p.map(c=>c.id===id ? {...c,status: allPass(target)?"approved":"flagged"} : c));
    setCheckingId(null);
    setTimeout(()=>setItems(p=>p.filter(c=>c.id!==id)),1800);
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-slate-900" style={{ fontWeight:800, fontSize:"1rem" }}>Kiểm tra điều kiện cư trú</div>
        <div className="text-slate-500 mt-0.5" style={{ fontSize:"0.78rem" }}>
          Xác minh điều kiện giới tính, khu vực và quy tắc nhóm trước khi nhận cư trú
        </div>
      </div>

      <div className="space-y-3">
        {items.map(c=>{
          const rules    = getRules(c);
          const passes   = rules.filter(r=>r.ok).length;
          const isOpen   = checkingId === c.id;
          const isDone   = c.status !== "pending";
          const passAll  = allPass(c);

          return (
            <div key={c.id} className="rounded-2xl overflow-hidden"
              style={{ border:`1.5px solid ${isDone ? (passAll?"#86EFAC":"#FCA5A5") : isOpen ? `${A}40` : "#E8EEF4"}`, background:"white", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

              {/* Row header */}
              <div className="flex items-center gap-4 px-4 py-3.5">
                <Avatar initials={c.avatar} gradient={passAll ? "linear-gradient(135deg,#059669,#0891B2)" : "linear-gradient(135deg,#D97706,#DC2626)"} size={9}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>{c.tenant}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background:"#F1F5F9", fontSize:"0.7rem", color:"#64748B" }}>
                      <Building2 size={9}/> Phòng {c.room}
                    </span>
                  </div>
                  {/* Mini rule pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {rules.map(r=>(
                      <span key={r.label} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: r.ok?"#D1FAE5":"#FEE2E2", fontSize:"0.65rem", fontWeight:700, color: r.ok?"#059669":"#DC2626" }}>
                        {r.ok ? <Check size={8}/> : <X size={8}/>} {r.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pass/fail indicator */}
                <div className="flex-shrink-0 text-center">
                  <div style={{ fontSize:"1.3rem", fontWeight:900, color: passes===4?"#059669":passes>=2?"#D97706":"#DC2626", lineHeight:1 }}>
                    {passes}<span style={{ fontSize:"0.7rem", color:"#94A3B8" }}>/4</span>
                  </div>
                  <div style={{ fontSize:"0.65rem", color:"#94A3B8", marginTop:2 }}>điều kiện</div>
                </div>

                {!isDone && (
                  <button onClick={()=>setCheckingId(isOpen?null:c.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition flex-shrink-0"
                    style={{ background: isOpen ? `${A}10` : "#F8FAFC", border:`1.5px solid ${isOpen ? `${A}40`:"#E2E8F0"}`, color: isOpen ? A : "#64748B", fontSize:"0.78rem", fontWeight:700 }}>
                    <ShieldCheck size={13}/> {isOpen ? "Đóng" : "Kiểm tra điều kiện"}
                  </button>
                )}
                {isDone && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: passAll?"#D1FAE5":"#FEE2E2", fontSize:"0.75rem", fontWeight:700, color: passAll?"#059669":"#DC2626" }}>
                    {passAll ? <><CheckCircle size={12}/> Đủ điều kiện</> : <><XCircle size={12}/> Gắn cờ vi phạm</>}
                  </span>
                )}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4" style={{ borderTop:"1px solid #F1F5F9" }}>
                  <div className="pt-3 grid grid-cols-2 gap-2.5 mb-4">
                    {rules.map(r=>(
                      <div key={r.label} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: r.ok?"#F0FDF4":"#FFF1F2", border:`1px solid ${r.ok?"#BBF7D0":"#FECDD3"}` }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: r.ok?"#D1FAE5":"#FEE2E2" }}>
                          {r.ok ? <Check size={11} style={{ color:"#059669" }}/> : <X size={11} style={{ color:"#DC2626" }}/>}
                        </div>
                        <div>
                          <div style={{ fontSize:"0.78rem", fontWeight:700, color:"#1E293B" }}>{r.label}</div>
                          <div style={{ fontSize:"0.72rem", color: r.ok?"#059669":"#DC2626", marginTop:2 }}>{r.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!passAll && (
                    <div className="flex items-start gap-2 p-3 rounded-xl mb-3"
                      style={{ background:"#FFF7ED", border:"1px solid #FDE68A" }}>
                      <AlertTriangle size={13} style={{ color:"#D97706", flexShrink:0, marginTop:1 }}/>
                      <span style={{ fontSize:"0.78rem", color:"#92400E" }}>
                        Khách thuê <strong>{c.tenant}</strong> không đáp ứng đầy đủ điều kiện. Hồ sơ sẽ bị gắn cờ để xem xét thêm.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2">
                    <button onClick={()=>setCheckingId(null)}
                      className="px-3 py-2 rounded-xl transition"
                      style={{ border:"1.5px solid #E2E8F0", fontSize:"0.78rem", fontWeight:600, color:"#64748B" }}>
                      Hủy
                    </button>
                    <button onClick={()=>submitCheck(c.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white transition"
                      style={{ background: passAll ? "linear-gradient(135deg,#059669,#0891B2)" : "linear-gradient(135deg,#D97706,#DC2626)", fontSize:"0.78rem", fontWeight:700, boxShadow: passAll ? "0 2px 8px rgba(5,150,105,0.3)" : "0 2px 8px rgba(217,119,6,0.3)" }}>
                      {passAll ? <><BadgeCheck size={13}/> Xác nhận đủ điều kiện</> : <><AlertTriangle size={13}/> Gắn cờ vi phạm</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type ATab = "rentals" | "deposits" | "conditions";

const ATABS: { id:ATab; label:string; icon:React.ElementType; count:number; accentColor:string }[] = [
  { id:"rentals",    label:"Duyệt thuê phòng",       icon:FileText,      count:INIT_RENTALS.length,    accentColor:A          },
  { id:"deposits",   label:"Xác nhận đặt cọc",       icon:DollarSign,    count:INIT_DEPOSITS.length,   accentColor:"#059669"  },
  { id:"conditions", label:"Kiểm tra điều kiện",     icon:ShieldCheck,   count:INIT_CONDITIONS.length, accentColor:"#D97706"  },
];

export default function ApprovalHub() {
  const [tab, setTab] = useState<ATab>("rentals");

  const totalPending = ATABS.reduce((s,t)=>s+t.count,0);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${A}15` }}>
              <ClipboardCheck size={14} style={{ color:A }}/>
            </div>
            <h2 className="text-slate-900" style={{ fontWeight:900, fontSize:"1.35rem", letterSpacing:"-0.02em" }}>
              Trung tâm Phê duyệt
            </h2>
          </div>
          <p style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
            Xử lý các yêu cầu thuê phòng, xác nhận cọc và kiểm tra điều kiện cư trú
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background:"#FFF7ED", border:"1px solid #FDE68A" }}>
          <Clock size={14} style={{ color:"#D97706" }}/>
          <span style={{ fontSize:"0.82rem", fontWeight:800, color:"#D97706" }}>{totalPending} việc chờ xử lý</span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex items-stretch gap-3 mb-6">
        {ATABS.map(t=>{
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left"
              style={{
                background: isActive ? "white" : "#F8FAFC",
                border: `1.5px solid ${isActive ? t.accentColor+"50" : "#E2E8F0"}`,
                boxShadow: isActive ? `0 2px 12px ${t.accentColor}18, 0 0 0 0px` : "none",
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isActive ? `${t.accentColor}15` : "#F1F5F9" }}>
                <t.icon size={17} style={{ color: isActive ? t.accentColor : "#94A3B8" }}/>
              </div>
              <div className="min-w-0 flex-1">
                <div style={{ fontSize:"0.82rem", fontWeight: isActive ? 800 : 500, color: isActive ? "#1E293B" : "#64748B", whiteSpace:"nowrap" }}>
                  {t.label}
                </div>
                <div style={{ fontSize:"0.68rem", color: isActive ? t.accentColor : "#94A3B8", marginTop:2, fontWeight: isActive ? 700 : 400 }}>
                  {t.count} đang chờ
                </div>
              </div>
              {t.count > 0 && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: isActive ? t.accentColor : "#CBD5E1", fontSize:"0.68rem", fontWeight:900 }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab==="rentals"    && <RentalSection/>}
      {tab==="deposits"   && <DepositSection/>}
      {tab==="conditions" && <ConditionSection/>}
    </div>
  );
}
