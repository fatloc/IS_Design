import { useState } from "react";
import {
  FileText, Check, ChevronLeft, DollarSign, Shield, AlertTriangle,
  CheckCircle, BedDouble, Calendar, Zap, Droplets, Car, Bike,
  BadgeCheck, ArrowRight, Clock, X, Send,
} from "lucide-react";

const O = "#EA580C";

// ── Types ──────────────────────────────────────────────────────────────────
type ContractStatus = "Chưa soạn" | "Đang soạn" | "Đã trình ký" | "Đã ký";
interface DepositedCustomer {
  id: string; name: string; avatar: string; room: string; roomType: string;
  depositAmount: number; depositDate: string;
  managerApproved: boolean;
  conditions: { label:string; ok:boolean }[];
  contractStatus: ContractStatus;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const INIT_DEPOSITED: DepositedCustomer[] = [
  {
    id:"dc1", name:"Vũ Minh Anh", avatar:"MA", room:"B201", roomType:"Toàn phòng",
    depositAmount:3500000, depositDate:"22/04/2026", managerApproved:true,
    conditions:[
      { label:"Giới tính phù hợp",  ok:true  },
      { label:"Khu vực được duyệt", ok:true  },
      { label:"Quy tắc nhóm ở",     ok:true  },
      { label:"Xác minh CCCD",      ok:true  },
    ],
    contractStatus:"Chưa soạn",
  },
  {
    id:"dc2", name:"Hoàng Văn Nam", avatar:"VN", room:"B202", roomType:"Ghép giường",
    depositAmount:1200000, depositDate:"28/04/2026", managerApproved:true,
    conditions:[
      { label:"Giới tính phù hợp",  ok:true  },
      { label:"Khu vực được duyệt", ok:false },
      { label:"Quy tắc nhóm ở",     ok:true  },
      { label:"Xác minh CCCD",      ok:true  },
    ],
    contractStatus:"Đang soạn",
  },
  {
    id:"dc3", name:"Phạm Thị Lan", avatar:"TL", room:"A101", roomType:"Toàn phòng",
    depositAmount:3500000, depositDate:"20/04/2026", managerApproved:true,
    conditions:[
      { label:"Giới tính phù hợp",  ok:true  },
      { label:"Khu vực được duyệt", ok:true  },
      { label:"Quy tắc nhóm ở",     ok:true  },
      { label:"Xác minh CCCD",      ok:true  },
    ],
    contractStatus:"Đã trình ký",
  },
];

const CONTRACT_STATUS_CFG: Record<ContractStatus, { bg:string; color:string; dot:string; border:string }> = {
  "Chưa soạn":   { bg:"#F1F5F9", color:"#64748B", dot:"#94A3B8", border:"#E2E8F0" },
  "Đang soạn":   { bg:"#FFF7ED", color:"#C2410C", dot:O,          border:"#FED7AA" },
  "Đã trình ký": { bg:"#EEF2FF", color:"#4338CA", dot:"#6366F1",   border:"#C7D2FE" },
  "Đã ký":       { bg:"#ECFDF5", color:"#065F46", dot:"#10B981",   border:"#6EE7B7" },
};

// ── Contract Draft View ────────────────────────────────────────────────────
function ContractDraft({ customer, onBack, onSubmit }: {
  customer: DepositedCustomer;
  onBack: ()=>void;
  onSubmit: ()=>void;
}) {
  const [rent,        setRent]        = useState("3,200,000");
  const [electricity, setElectricity] = useState("3,500");
  const [water,       setWater]       = useState("15,000");
  const [parking,     setParking]     = useState("150,000");
  const [deposit,     setDeposit]     = useState(String(customer.depositAmount));
  const [duration,    setDuration]    = useState("6");
  const [startDate,   setStartDate]   = useState("2026-05-01");
  const [rules,       setRules]       = useState(
    "1. Không nuôi thú cưng trong phòng\n2. Giờ giấc ra vào: trước 23:00\n3. Không tổ chức tiệc, sự kiện ồn ào\n4. Giữ gìn vệ sinh khu vực chung\n5. Thanh toán tiền phòng trước ngày 5 hàng tháng"
  );
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(()=>{ setDone(true); setTimeout(onSubmit,1200); },1000);
  };

  const allClear = customer.conditions.every(c=>c.ok);

  return (
    <div>
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
          style={{ background:"#F1F5F9", border:"1px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
          <ChevronLeft size={14}/> Quay lại danh sách
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background:O }}/>
          <span style={{ fontSize:"0.82rem", color:"#64748B" }}>Soạn hợp đồng cho</span>
          <span style={{ fontWeight:800, color:"#1E293B", fontSize:"0.82rem" }}>{customer.name}</span>
          <span className="px-2 py-0.5 rounded-md" style={{ background:"#FFF7ED", color:O, fontSize:"0.72rem", fontWeight:700 }}>
            Phòng {customer.room}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── Manager Approval Status Panel ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border:`1.5px solid ${allClear?"#6EE7B7":"#FDE68A"}`, boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-3 px-5 py-3.5"
            style={{ background: allClear?"linear-gradient(135deg,#ECFDF5,#F0FDFA)":"linear-gradient(135deg,#FFFBEB,#FFF7ED)", borderBottom:`1px solid ${allClear?"#A7F3D0":"#FDE68A"}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: allClear?"#D1FAE5":"#FEF3C7" }}>
              <Shield size={16} style={{ color: allClear?"#059669":"#D97706" }}/>
            </div>
            <div className="flex-1">
              <div style={{ fontWeight:800, fontSize:"0.92rem", color:"#1E293B" }}>
                Điều kiện lưu trú – {allClear?"Đã được Manager phê duyệt":"Có điều kiện chưa đạt"}
              </div>
              <div style={{ fontSize:"0.72rem", color: allClear?"#059669":"#D97706", marginTop:2 }}>
                {allClear
                  ? "Tất cả điều kiện đã thỏa mãn. Tiến hành soạn hợp đồng."
                  : "Một số điều kiện chưa đạt. Cần xử lý trước khi ký HĐ."}
              </div>
            </div>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${allClear?"":"opacity-80"}`}
              style={{ background: allClear?"#D1FAE5":"#FEF3C7", color: allClear?"#059669":"#D97706", fontSize:"0.75rem", fontWeight:800 }}>
              {allClear ? <><BadgeCheck size={13}/> Đã phê duyệt</> : <><AlertTriangle size={13}/> Cần kiểm tra</>}
            </span>
          </div>
          <div className="px-5 py-4" style={{ background:"white" }}>
            <div className="grid grid-cols-4 gap-2.5">
              {customer.conditions.map(cond=>(
                <div key={cond.label} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: cond.ok?"#F0FDF4":"#FFF1F2", border:`1px solid ${cond.ok?"#BBF7D0":"#FECDD3"}` }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: cond.ok?"#D1FAE5":"#FEE2E2" }}>
                    {cond.ok ? <Check size={10} style={{ color:"#059669" }}/> : <X size={10} style={{ color:"#DC2626" }}/>}
                  </div>
                  <span style={{ fontSize:"0.73rem", fontWeight:600, color: cond.ok?"#166534":"#991B1B", lineHeight:1.3 }}>{cond.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Contract Terms Form ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
              <FileText size={15} style={{ color:O }}/>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:"0.92rem", color:"#1E293B" }}>Điều khoản Hợp đồng Thuê phòng</div>
              <div style={{ fontSize:"0.72rem", color:"#94A3B8" }}>Điền đầy đủ trước khi trình ký</div>
            </div>
          </div>

          <div className="p-5 space-y-5" style={{ background:"white" }}>
            {/* Rent price + Duration */}
            <div>
              <div className="mb-2" style={{ fontSize:"0.75rem", fontWeight:800, color:"#374151", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                Thông tin tài chính
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>
                    <DollarSign size={10} className="inline mr-1" style={{ color:"#94A3B8" }}/>
                    Giá thuê / tháng *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize:"0.78rem", color:O, fontWeight:700 }}>₫</span>
                    <input value={rent} onChange={e=>setRent(e.target.value)}
                      className="w-full pl-6 pr-3 rounded-xl outline-none"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:`1.5px solid ${O}30`, background:"#FFF7ED", fontSize:"0.88rem", fontWeight:700 }}/>
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>
                    <DollarSign size={10} className="inline mr-1" style={{ color:"#94A3B8" }}/>
                    Tiền cọc
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize:"0.78rem", color:"#94A3B8" }}>₫</span>
                    <input value={deposit} onChange={e=>setDeposit(e.target.value)}
                      className="w-full pl-6 pr-3 rounded-xl outline-none"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#F8FAFC", fontSize:"0.88rem", fontWeight:700 }}/>
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Thời hạn HĐ</label>
                  <select value={duration} onChange={e=>setDuration(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem" }}>
                    {["3","6","12","24"].map(m=><option key={m} value={m}>{m} tháng</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Service fees */}
            <div>
              <div className="mb-2" style={{ fontSize:"0.75rem", fontWeight:800, color:"#374151", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                Phí dịch vụ
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label:"Điện (mỗi kWh)",    icon:Zap,      iconColor:"#D97706", iconBg:"#FFFBEB", value:electricity, set:setElectricity, suffix:"/kWh" },
                  { label:"Nước (mỗi m³)",      icon:Droplets, iconColor:"#0891B2", iconBg:"#ECFEFF", value:water,       set:setWater,       suffix:"/m³"  },
                  { label:"Giữ xe máy",          icon:Car,      iconColor:"#64748B", iconBg:"#F8FAFC", value:parking,     set:setParking,     suffix:"/xe"  },
                  { label:"Giữ xe đạp",          icon:Bike,     iconColor:"#64748B", iconBg:"#F8FAFC", value:"50,000",    set:()=>{},         suffix:"/xe"  },
                ].map(fee=>(
                  <div key={fee.label}>
                    <label className="block mb-1.5" style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748B" }}>
                      <fee.icon size={9} className="inline mr-0.5" style={{ color:fee.iconColor }}/>{fee.label}
                    </label>
                    <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border:"1.5px solid #E2E8F0" }}>
                      <div className="flex items-center justify-center px-2 flex-shrink-0" style={{ background:fee.iconBg, borderRight:"1px solid #E2E8F0", height:"2.2rem" }}>
                        <span style={{ fontSize:"0.72rem", fontWeight:700, color:fee.iconColor }}>₫</span>
                      </div>
                      <input value={fee.value} onChange={e=>fee.set(e.target.value)}
                        className="flex-1 px-2 outline-none"
                        style={{ paddingTop:"0.5rem", paddingBottom:"0.5rem", background:"white", fontSize:"0.82rem", fontWeight:600, minWidth:0 }}/>
                    </div>
                    <div style={{ fontSize:"0.62rem", color:"#94A3B8", marginTop:2 }}>{fee.suffix}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start date */}
            <div>
              <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>
                <Calendar size={10} className="inline mr-1" style={{ color:"#94A3B8" }}/>
                Ngày bắt đầu hợp đồng
              </label>
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                className="px-3 rounded-xl outline-none"
                style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.85rem", width:200 }}/>
            </div>

            {/* Rules */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Quy định nhà trọ</label>
                <span style={{ fontSize:"0.68rem", color:"#94A3B8" }}>Có thể chỉnh sửa</span>
              </div>
              <textarea value={rules} onChange={e=>setRules(e.target.value)} rows={5}
                className="w-full rounded-xl resize-none outline-none"
                style={{ padding:"0.75rem", background:"#FAFAFA", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", lineHeight:1.7 }}/>
            </div>
          </div>

          {/* Action footer */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
            <div className="flex-1">
              <div style={{ fontSize:"0.72rem", color:"#94A3B8" }}>
                Hợp đồng sẽ được gửi đến Manager và khách hàng để ký xác nhận
              </div>
            </div>
            <button onClick={onBack}
              className="px-4 py-2.5 rounded-xl transition"
              style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
              Hủy
            </button>
            <button onClick={handleSubmit}
              disabled={submitting||done}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition"
              style={{
                background: done?"#059669":submitting?`${O}90`:`linear-gradient(135deg,${O},#DC2626)`,
                fontSize:"0.85rem", fontWeight:800,
                boxShadow: done||submitting?"none":`0 3px 14px ${O}45`,
              }}>
              {done ? <><CheckCircle size={14}/> Đã trình ký!</>
                : submitting ? <><Clock size={14}/> Đang gửi...</>
                : <><Send size={14}/> Lưu & Trình ký</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleContracts() {
  const [customers, setCustomers] = useState<DepositedCustomer[]>(INIT_DEPOSITED);
  const [drafting,  setDrafting]  = useState<string|null>(null);

  const handleSubmit = () => {
    setCustomers(prev=>prev.map(c=>c.id===drafting?{...c,contractStatus:"Đã trình ký"}:c));
    setDrafting(null);
  };

  const draftingCustomer = customers.find(c=>c.id===drafting);

  if (drafting && draftingCustomer) {
    return (
      <ContractDraft
        customer={draftingCustomer}
        onBack={()=>setDrafting(null)}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
            <FileText size={14} style={{ color:O }}/>
          </div>
          <h2 style={{ fontWeight:900, fontSize:"1.35rem", color:"#1E293B", letterSpacing:"-0.02em" }}>
            Soạn Hợp đồng thuê
          </h2>
        </div>
        <div className="flex items-center gap-2" style={{ paddingLeft:"2.25rem" }}>
          <p style={{ fontSize:"0.85rem", color:"#64748B" }}>
            Chỉ hiển thị khách hàng có trạng thái
          </p>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
            style={{ background:"#ECFDF5", color:"#059669", fontSize:"0.75rem", fontWeight:700, border:"1px solid #6EE7B7" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#10B981" }}/>
            Đã đặt cọc thành công
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label:"Chờ soạn HĐ",    value:customers.filter(c=>c.contractStatus==="Chưa soạn").length,   color:O,          bg:"#FFF7ED"  },
          { label:"Đang soạn",       value:customers.filter(c=>c.contractStatus==="Đang soạn").length,   color:"#4338CA",  bg:"#EEF2FF"  },
          { label:"Chờ ký",          value:customers.filter(c=>c.contractStatus==="Đã trình ký").length, color:"#6366F1",  bg:"#EEF2FF"  },
          { label:"Hoàn tất",        value:customers.filter(c=>c.contractStatus==="Đã ký").length,       color:"#059669",  bg:"#ECFDF5"  },
        ].map(s=>(
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background:"white", border:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:s.bg }}>
              <FileText size={14} style={{ color:s.color }}/>
            </div>
            <div>
              <div style={{ fontWeight:900, fontSize:"1.3rem", color:"#1E293B", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:"0.68rem", color:"#94A3B8", marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
              {["Khách hàng","Phòng","Tiền cọc","Ngày cọc","Điều kiện","Hợp đồng","Hành động"].map(h=>(
                <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c,i)=>{
              const cs = CONTRACT_STATUS_CFG[c.contractStatus];
              const passAll = c.conditions.every(cond=>cond.ok);
              const passCount = c.conditions.filter(cond=>cond.ok).length;
              return (
                <tr key={c.id}
                  style={{ background: i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                  className="hover:bg-orange-50/15 transition-colors">
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.72rem" }}>
                        {c.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>{c.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background:"#10B981" }}/>
                          <span style={{ fontSize:"0.68rem", color:"#059669", fontWeight:600 }}>Đặt cọc thành công</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Room */}
                  <td className="px-4 py-3">
                    <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>Phòng {c.room}</div>
                    <div style={{ fontSize:"0.72rem", color:"#64748B" }}>{c.roomType}</div>
                  </td>
                  {/* Deposit */}
                  <td className="px-4 py-3">
                    <span style={{ fontWeight:800, fontSize:"0.9rem", color:"#1E293B" }}>₫{c.depositAmount.toLocaleString("vi-VN")}</span>
                  </td>
                  {/* Deposit date */}
                  <td className="px-4 py-3">
                    <span style={{ fontSize:"0.82rem", color:"#64748B" }}>{c.depositDate}</span>
                  </td>
                  {/* Conditions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontWeight:800, fontSize:"0.9rem", color: passAll?"#059669":"#D97706" }}>
                        {passCount}/4
                      </span>
                      <div className="flex gap-0.5">
                        {c.conditions.map((cond,ci)=>(
                          <div key={ci} className="w-2.5 h-2.5 rounded-sm"
                            style={{ background: cond.ok?"#10B981":"#EF4444" }}/>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize:"0.68rem", color: passAll?"#059669":"#D97706", marginTop:2 }}>
                      {passAll?"Đầy đủ điều kiện":"Có điều kiện chưa đạt"}
                    </div>
                  </td>
                  {/* Contract status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background:cs.bg, color:cs.color, border:`1px solid ${cs.border}`, fontSize:"0.72rem", fontWeight:700 }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background:cs.dot }}/>
                      {c.contractStatus}
                    </span>
                  </td>
                  {/* Action */}
                  <td className="px-4 py-3">
                    {c.contractStatus==="Chưa soạn" || c.contractStatus==="Đang soạn" ? (
                      <button onClick={()=>setDrafting(c.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition"
                        style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.78rem", fontWeight:800, boxShadow:`0 2px 10px ${O}40` }}
                        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                        <FileText size={12}/> Soạn Hợp đồng
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                        style={{ background: c.contractStatus==="Đã ký"?"#ECFDF5":"#EEF2FF" }}>
                        <CheckCircle size={12} style={{ color: c.contractStatus==="Đã ký"?"#059669":"#6366F1" }}/>
                        <span style={{ fontSize:"0.75rem", fontWeight:700, color: c.contractStatus==="Đã ký"?"#059669":"#4338CA" }}>
                          {c.contractStatus==="Đã trình ký"?"Chờ ký xác nhận":"Hoàn tất"}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
