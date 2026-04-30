import { useState } from "react";
import {
  Users, Search, Phone, Mail, MapPin, AlertTriangle, CheckCircle,
  Upload, Shield, X, Save, UserCheck, Clock, Edit3, ChevronRight,
} from "lucide-react";

const O  = "#EA580C";

// ── Types ──────────────────────────────────────────────────────────────────
type ProfileStatus = "complete" | "missing_cccd" | "missing_address" | "incomplete";
interface Customer {
  id: string; name: string; avatar: string; phone: string; email: string;
  address: string; cccd: string; cccdFront: boolean; cccdBack: boolean;
  status: ProfileStatus; joinedAt: string; note: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INIT_CUSTOMERS: Customer[] = [
  { id:"c1", name:"Trần Minh Khôi",  avatar:"MK", phone:"0912 345 678", email:"khoi.tran@email.com",   address:"123 Nguyễn Huệ, P.Bến Nghé, Q.1", cccd:"079123456789",   cccdFront:true,  cccdBack:true,  status:"complete",         joinedAt:"15/03/2026", note:"Khách VIP, đã thuê 2 lần" },
  { id:"c2", name:"Nguyễn Thị Hoa",  avatar:"TH", phone:"0918 765 432", email:"hoa.nguyen@email.com",  address:"",                                    cccd:"",               cccdFront:false, cccdBack:false, status:"missing_cccd",     joinedAt:"25/04/2026", note:"" },
  { id:"c3", name:"Lê Văn Phú",      avatar:"VP", phone:"0905 123 456", email:"phu.le@email.com",      address:"",                                    cccd:"079987654321",   cccdFront:true,  cccdBack:false, status:"missing_address",  joinedAt:"27/04/2026", note:"Cần xác minh địa chỉ" },
  { id:"c4", name:"Phạm Thị Ngân",   avatar:"TN", phone:"0901 234 567", email:"ngan.pham@email.com",   address:"45 Đinh Bộ Lĩnh, P.1, Q.Bình Thạnh",  cccd:"079555666777",   cccdFront:true,  cccdBack:true,  status:"complete",         joinedAt:"22/04/2026", note:"" },
  { id:"c5", name:"Hoàng Văn Dũng",  avatar:"VD", phone:"0908 654 321", email:"dung.hoang@email.com",  address:"",                                    cccd:"",               cccdFront:false, cccdBack:false, status:"incomplete",       joinedAt:"20/04/2026", note:"" },
  { id:"c6", name:"Vũ Minh Anh",     avatar:"MA", phone:"0916 789 012", email:"anh.vu@email.com",      address:"78 Cộng Hòa, P.4, Q.Tân Bình",       cccd:"079888999000",   cccdFront:true,  cccdBack:true,  status:"complete",         joinedAt:"18/04/2026", note:"Đã đặt cọc" },
  { id:"c7", name:"Đỗ Thị Thanh",    avatar:"TT", phone:"0903 456 789", email:"thanh.do@email.com",    address:"",                                    cccd:"",               cccdFront:false, cccdBack:false, status:"missing_cccd",     joinedAt:"28/04/2026", note:"Khách mới, cần bổ sung hồ sơ" },
];

const STATUS_CFG: Record<ProfileStatus, { label:string; icon:typeof CheckCircle; color:string; bg:string }> = {
  complete:        { label:"Đầy đủ hồ sơ",  icon:CheckCircle,   color:"#059669", bg:"#ECFDF5" },
  missing_cccd:    { label:"Thiếu CCCD",     icon:AlertTriangle, color:"#DC2626", bg:"#FEF2F2" },
  missing_address: { label:"Thiếu địa chỉ",  icon:AlertTriangle, color:"#D97706", bg:"#FFFBEB" },
  incomplete:      { label:"Hồ sơ chưa đủ",  icon:Clock,         color:"#6366F1", bg:"#EEF2FF" },
};

function calcStatus(c:Customer): ProfileStatus {
  if (!c.cccd) return "missing_cccd";
  if (!c.address) return "missing_address";
  if (!c.cccdFront || !c.cccdBack) return "incomplete";
  return "complete";
}

// ── Profile Form ────────────────────────────────────────────────────────────
function ProfilePanel({ customer, onSave }: {
  customer: Customer;
  onSave: (updated:Customer) => void;
}) {
  const [name,    setName]    = useState(customer.name);
  const [phone,   setPhone]   = useState(customer.phone);
  const [email,   setEmail]   = useState(customer.email);
  const [address, setAddress] = useState(customer.address);
  const [cccd,    setCccd]    = useState(customer.cccd);
  const [front,   setFront]   = useState(customer.cccdFront);
  const [back,    setBack]    = useState(customer.cccdBack);
  const [note,    setNote]    = useState(customer.note);
  const [saved,   setSaved]   = useState(false);
  const [touched, setTouched] = useState(false);

  const cccdError = touched && !cccd.trim();
  const addressError = touched && !address.trim();

  const handleSave = () => {
    setTouched(true);
    if (!cccd.trim()) return;
    const updated: Customer = {
      ...customer, name, phone, email, address, cccd, cccdFront:front, cccdBack:back, note,
      status: calcStatus({...customer, cccd, address, cccdFront:front, cccdBack:back}),
    };
    setSaved(true);
    setTimeout(()=>{ onSave(updated); setSaved(false); },1500);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Profile header */}
      <div className="px-5 py-4 flex-shrink-0" style={{ background:"linear-gradient(135deg,#FFF7ED,#FFFBEB)", borderBottom:"1px solid #FED7AA" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.95rem" }}>
            {customer.avatar}
          </div>
          <div className="flex-1">
            <div style={{ fontWeight:900, fontSize:"1rem", color:"#1E293B" }}>{name}</div>
            <div style={{ fontSize:"0.72rem", color:"#92400E", marginTop:2 }}>Khách hàng · Tham gia: {customer.joinedAt}</div>
          </div>
          {(() => {
            const cfg = STATUS_CFG[customer.status];
            return (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                style={{ background:cfg.bg, color:cfg.color, fontSize:"0.72rem", fontWeight:700 }}>
                <cfg.icon size={11}/> {cfg.label}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Họ và tên</label>
            <input value={name} onChange={e=>setName(e.target.value)}
              className="w-full px-3 rounded-xl outline-none"
              style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}/>
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Số điện thoại</label>
            <div className="relative">
              <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"#CBD5E1" }}/>
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                className="w-full pl-8 pr-3 rounded-xl outline-none"
                style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}/>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Email</label>
          <div className="relative">
            <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"#CBD5E1" }}/>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
              className="w-full pl-8 pr-3 rounded-xl outline-none"
              style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}/>
          </div>
        </div>

        {/* ── CCCD Section ── */}
        <div className="rounded-xl overflow-hidden" style={{ border:`1.5px solid ${cccdError?"#FCA5A5":"#E2E8F0"}` }}>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: cccdError?"#FEF2F2":"#F8FAFC", borderBottom:`1px solid ${cccdError?"#FCA5A5":"#E2E8F0"}` }}>
            <Shield size={13} style={{ color: cccdError?"#EF4444":O }}/>
            <span style={{ fontWeight:800, fontSize:"0.82rem", color: cccdError?"#DC2626":"#1E293B" }}>
              Căn cước công dân (CCCD) *
            </span>
            {cccdError && (
              <span className="ml-auto flex items-center gap-1.5" style={{ fontSize:"0.72rem", color:"#DC2626", fontWeight:700 }}>
                <AlertTriangle size={11}/> Bắt buộc để soạn hợp đồng
              </span>
            )}
          </div>
          <div className="px-4 py-3.5 space-y-3" style={{ background:"white" }}>
            <div>
              <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Số CCCD / CMND *</label>
              <input value={cccd} onChange={e=>{ setCccd(e.target.value); setTouched(false); }}
                placeholder="VD: 079 123 456 789"
                className="w-full px-3 rounded-xl outline-none transition"
                style={{
                  paddingTop:"0.6rem", paddingBottom:"0.6rem",
                  border:`1.5px solid ${cccdError?"#EF4444":"#E2E8F0"}`,
                  background: cccdError?"#FFF5F5":"#FAFAFA", fontSize:"0.85rem",
                  boxShadow: cccdError?"0 0 0 3px rgba(239,68,68,0.1)":"none",
                }}/>
              {cccdError && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <AlertTriangle size={11} style={{ color:"#EF4444" }}/>
                  <span style={{ fontSize:"0.72rem", color:"#EF4444", fontWeight:600 }}>
                    Vui lòng nhập số CCCD trước khi lưu hồ sơ
                  </span>
                </div>
              )}
            </div>
            {/* Upload zones */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:"Mặt trước", uploaded:front, toggle:()=>setFront(p=>!p) },
                { label:"Mặt sau",   uploaded:back,  toggle:()=>setBack(p=>!p)  },
              ].map(side=>(
                <button key={side.label} onClick={side.toggle}
                  className="relative flex flex-col items-center justify-center py-4 rounded-xl transition group"
                  style={{
                    border:`1.5px dashed ${side.uploaded?"#10B981":"#CBD5E1"}`,
                    background: side.uploaded?"#F0FDF4":"#FAFAFA",
                  }}>
                  {side.uploaded ? (
                    <>
                      <CheckCircle size={20} style={{ color:"#10B981" }} className="mb-1.5"/>
                      <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#059669" }}>{side.label}</span>
                      <span style={{ fontSize:"0.65rem", color:"#10B981", marginTop:1 }}>✓ Đã tải lên</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} style={{ color:"#CBD5E1" }} className="mb-1.5 group-hover:text-orange-400 transition-colors"/>
                      <span style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748B" }}>{side.label}</span>
                      <span style={{ fontSize:"0.65rem", color:"#94A3B8", marginTop:1 }}>Click để tải ảnh</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>
            <MapPin size={11} className="inline mr-1" style={{ color:"#94A3B8" }}/>
            Địa chỉ thường trú *
          </label>
          <input value={address} onChange={e=>setAddress(e.target.value)}
            placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
            className="w-full px-3 rounded-xl outline-none transition"
            style={{
              paddingTop:"0.6rem", paddingBottom:"0.6rem",
              border:`1.5px solid ${addressError?"#EF4444":"#E2E8F0"}`,
              background: addressError?"#FFF5F5":"#FAFAFA", fontSize:"0.85rem",
            }}/>
          {addressError && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <AlertTriangle size={11} style={{ color:"#EF4444" }}/>
              <span style={{ fontSize:"0.72rem", color:"#EF4444", fontWeight:600 }}>Địa chỉ thường trú là bắt buộc</span>
            </div>
          )}
        </div>

        {/* Note */}
        <div>
          <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Ghi chú nội bộ</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2}
            placeholder="Ghi chú về khách hàng..."
            className="w-full rounded-xl resize-none outline-none"
            style={{ padding:"0.65rem 0.85rem", background:"#FAFAFA", border:"1.5px solid #E2E8F0", fontSize:"0.82rem" }}/>
        </div>
      </div>

      {/* Save footer */}
      <div className="flex-shrink-0 px-5 py-4" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
        <button onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white transition"
          style={{ background: saved?"#059669":`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.88rem", boxShadow:`0 3px 12px ${O}30` }}>
          {saved ? <><CheckCircle size={15}/> Đã lưu hồ sơ!</> : <><Save size={15}/> Lưu hồ sơ</>}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
  const [selectedId, setSelectedId] = useState<string>(INIT_CUSTOMERS[1].id); // default to one with issues
  const [search, setSearch] = useState("");

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) || c.cccd.includes(search)
  );
  const selected = customers.find(c=>c.id===selectedId);

  const handleSave = (updated:Customer) => {
    setCustomers(prev=>prev.map(c=>c.id===updated.id?updated:c));
  };

  const completePct = Math.round(customers.filter(c=>c.status==="complete").length/customers.length*100);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
              <Users size={14} style={{ color:O }}/>
            </div>
            <h2 style={{ fontWeight:900, fontSize:"1.35rem", color:"#1E293B", letterSpacing:"-0.02em" }}>
              Hồ sơ Khách hàng
            </h2>
          </div>
          <p style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
            Quản lý thông tin và hồ sơ pháp lý của khách hàng
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background:"white", border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <div>
            <div style={{ fontSize:"1.3rem", fontWeight:900, color:"#1E293B", lineHeight:1 }}>{completePct}%</div>
            <div style={{ fontSize:"0.68rem", color:"#94A3B8" }}>Hồ sơ đầy đủ</div>
          </div>
          <div className="w-12 h-12 relative flex-shrink-0">
            <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#F1F5F9" strokeWidth="5"/>
              <circle cx="22" cy="22" r="18" fill="none" stroke={O} strokeWidth="5"
                strokeDasharray={`${completePct/100*113} 113`} strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns:"300px 1fr" }}>

        {/* LEFT – Customer list */}
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          {/* Search */}
          <div className="px-3 py-3" style={{ borderBottom:"1px solid #F1F5F9" }}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Tìm theo tên, số điện thoại..."
                className="w-full pl-9 pr-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.8rem" }}/>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto no-scrollbar" style={{ maxHeight:"calc(100vh - 260px)" }}>
            {filtered.map(c=>{
              const cfg = STATUS_CFG[c.status];
              const isSelected = c.id === selectedId;
              return (
                <button key={c.id} onClick={()=>setSelectedId(c.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                  style={{
                    background: isSelected ? "#FFF7ED" : "white",
                    borderBottom:"1px solid #F8FAFC",
                    borderLeft: isSelected ? `3px solid ${O}` : "3px solid transparent",
                  }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.72rem" }}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontWeight:700, fontSize:"0.85rem", color:"#1E293B" }}>{c.name}</div>
                    <div style={{ fontSize:"0.68rem", color:"#94A3B8" }}>{c.phone}</div>
                  </div>
                  <cfg.icon size={13} style={{ color:cfg.color, flexShrink:0 }}/>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT – Profile form */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", minHeight:500 }}>
          {selected ? (
            <ProfilePanel key={selected.id} customer={selected} onSave={handleSave}/>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Users size={32} style={{ color:"#CBD5E1" }} className="mb-3"/>
              <div style={{ fontSize:"0.9rem", color:"#64748B" }}>Chọn khách hàng để xem hồ sơ</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
