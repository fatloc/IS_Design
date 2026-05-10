import { useState, useMemo, useEffect } from "react";
import {
  FileText, ChevronLeft, DollarSign, Shield, AlertTriangle,
  CheckCircle, Calendar, Zap, Droplets, Car, Bike,
  BadgeCheck, Clock, Send, RotateCcw, Search,
} from "lucide-react";
import { formatVNDInput } from "../../utils/format";
import { usePagedList } from "../../hooks/usePagedList";
import { getContracts, updateContract, getUsers, getContractStats } from "../../services/api";
import { Pagination } from "../../components/Pagination";
import type { ApiContract } from "../../services/api";

const O = "#EA580C";

function fmtDate(d: string | null) {
  if (!d) return "--";
  try { return new Date(d).toLocaleDateString("vi-VN"); } catch { return d; }
}

// ── Contract Draft ─────────────────────────────────────────────────────────
function ContractDraft({ contract, onBack, onSubmit }: {
  contract: ApiContract;
  onBack: ()=>void;
  onSubmit: ()=>void;
}) {
  const [rent,        setRent]        = useState("");
  const [electricity, setElectricity] = useState("3,500");
  const [water,       setWater]       = useState("15,000");
  const [parking,     setParking]     = useState("150,000");
  const [duration,    setDuration]    = useState("6");
  const [startDate,   setStartDate]   = useState(new Date().toISOString().slice(0,10));
  const [rules,       setRules]       = useState(
    "1. Không nuôi thú cưng trong phòng\n2. Giờ giấc ra vào: trước 23:00\n3. Không tổ chức tiệc, sự kiện ồn ào\n4. Giữ gìn vệ sinh khu vực chung\n5. Thanh toán tiền phòng trước ngày 5 hàng tháng"
  );
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await updateContract(contract.maHopDongThue, { ...contract, loaiVanBan: "Đã trình ký" });
      setDone(true);
      setTimeout(onSubmit, 1200);
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
          style={{ background:"#F1F5F9", border:"1px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>
          <ChevronLeft size={14}/> Quay lại
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background:O }}/>
          <span style={{ fontSize:"0.82rem", color:"#64748B" }}>Soạn HĐ cho</span>
          <span style={{ fontWeight:800, color:"#1E293B", fontSize:"0.82rem" }}>
            KH: {contract.khachHangSoHuu ?? "--"}
          </span>
          <span className="px-2 py-0.5 rounded-md" style={{ background:"#FFF7ED", color:O, fontSize:"0.72rem", fontWeight:700 }}>
            HĐ: {contract.maHopDongThue}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Info panel */}
        <div className="rounded-2xl overflow-hidden" style={{ border:"1.5px solid #6EE7B7", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-3 px-5 py-3.5"
            style={{ background:"linear-gradient(135deg,#ECFDF5,#F0FDFA)", borderBottom:"1px solid #A7F3D0" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"#D1FAE5" }}>
              <Shield size={16} style={{ color:"#059669" }}/>
            </div>
            <div className="flex-1">
              <div style={{ fontWeight:800, fontSize:"0.92rem", color:"#1E293B" }}>Thông tin hợp đồng từ database</div>
              <div style={{ fontSize:"0.72rem", color:"#059669", marginTop:2 }}>
                Ngày lập: {fmtDate(contract.ngayLap)} · Chi nhánh: {contract.chiNhanh ?? "--"} · NV lập: {contract.nhanVienLap ?? "--"}
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background:"#D1FAE5", color:"#059669", fontSize:"0.75rem", fontWeight:800 }}>
              <BadgeCheck size={13}/> Hình thức: {contract.hinhThucThue ?? "--"}
            </span>
          </div>
        </div>

        {/* Contract Terms */}
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
            {/* Finance */}
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
                    <input value={rent} onChange={e=>setRent(formatVNDInput(e.target.value))}
                      className="w-full pl-6 pr-3 rounded-xl outline-none"
                      style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:`1.5px solid ${O}30`, background:"#FFF7ED", fontSize:"0.88rem", fontWeight:700 }}/>
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
                <div>
                  <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>
                    <Calendar size={10} className="inline mr-1" style={{ color:"#94A3B8" }}/>
                    Ngày bắt đầu
                  </label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop:"0.6rem", paddingBottom:"0.6rem", border:"1.5px solid #E2E8F0", background:"#FAFAFA", fontSize:"0.82rem" }}/>
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
                  { label:"Điện (kWh)",  icon:Zap,      iconColor:"#D97706", iconBg:"#FFFBEB", value:electricity, set:setElectricity },
                  { label:"Nước (m³)",   icon:Droplets,  iconColor:"#0891B2", iconBg:"#ECFEFF", value:water,       set:setWater       },
                  { label:"Xe máy",      icon:Car,       iconColor:"#64748B", iconBg:"#F8FAFC", value:parking,     set:setParking     },
                  { label:"Xe đạp",      icon:Bike,      iconColor:"#64748B", iconBg:"#F8FAFC", value:"50,000",    set:()=>{}         },
                ].map(fee=>(
                  <div key={fee.label}>
                    <label className="block mb-1.5" style={{ fontSize:"0.72rem", fontWeight:600, color:"#64748B" }}>
                      <fee.icon size={9} className="inline mr-0.5" style={{ color:fee.iconColor }}/>{fee.label}
                    </label>
                    <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border:"1.5px solid #E2E8F0" }}>
                      <div className="flex items-center justify-center px-2 flex-shrink-0" style={{ background:fee.iconBg, borderRight:"1px solid #E2E8F0", height:"2.2rem" }}>
                        <span style={{ fontSize:"0.72rem", fontWeight:700, color:fee.iconColor }}>₫</span>
                      </div>
                      <input value={fee.value} onChange={e=>fee.set(formatVNDInput(e.target.value))}
                        className="flex-1 px-2 outline-none"
                        style={{ paddingTop:"0.5rem", paddingBottom:"0.5rem", background:"white", fontSize:"0.82rem", fontWeight:600, minWidth:0 }}/>
                    </div>
                  </div>
                ))}
              </div>
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

          <div className="flex items-center gap-3 px-5 py-4" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
            <div className="flex-1">
              <div style={{ fontSize:"0.72rem", color:"#94A3B8" }}>
                Hợp đồng sẽ được gửi đến Manager và khách hàng để ký xác nhận
              </div>
            </div>
            <button onClick={onBack} className="px-4 py-2.5 rounded-xl"
              style={{ border:"1.5px solid #E2E8F0", fontSize:"0.82rem", fontWeight:600, color:"#64748B" }}>Hủy</button>
            <button onClick={handleSubmit} disabled={submitting||done}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white"
              style={{ background:done?"#059669":submitting?`${O}90`:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.85rem", fontWeight:800, boxShadow:done||submitting?"none":`0 3px 14px ${O}45` }}>
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
  const [drafting,  setDrafting]  = useState<string|null>(null);
  const [search,    setSearch]    = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("Tất cả");
  const [stats, setStats] = useState<Record<string, number>>({ total: 0, contract: 0, handover: 0, deposit: 0 });

  // Fetch stats on reload or filter change
  useEffect(() => {
    getContractStats().then(data => data && setStats(data)).catch(console.error);
  }, [debouncedSearch, actionFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    items: contracts, loading, error,
    totalElements, totalPages,
    page, size, setPage, setSize,
    reload,
  } = usePagedList<ApiContract>(getContracts, 20, { 
    search: debouncedSearch,
    loaiVanBan: actionFilter,
  });

  const { items: rawUsers } = usePagedList<any>(getUsers, 1000);
  const userMap = useMemo(() => new Map((rawUsers as any[]).map(u => [u.maKhachHang || u.maNhanVien, u.hoTen])), [rawUsers]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, actionFilter, setPage]);

  const handleSubmit = () => { reload(); setDrafting(null); };

  const draftingContract = contracts.find(c=>c.maHopDongThue===drafting);

  if (drafting && draftingContract) {
    return <ContractDraft contract={draftingContract} onBack={()=>setDrafting(null)} onSubmit={handleSubmit}/>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background:`${O}15` }}>
                <FileText size={14} style={{ color:O }}/>
              </div>
              <h2 style={{ fontWeight:900, fontSize:"1.35rem", color:"#1E293B", letterSpacing:"-0.02em" }}>
                Hợp đồng & Văn bản
              </h2>
            </div>
            <p style={{ fontSize:"0.85rem", color:"#64748B", paddingLeft:"2.25rem" }}>
              {totalElements.toLocaleString()} văn bản trong hệ thống
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-white text-slate-700"
              >
                <option value="Tất cả">Tất cả loại VB</option>
                <option value="Hợp đồng thuê">Hợp đồng thuê</option>
                <option value="Biên bản bàn giao">Bàn giao tài sản</option>
                <option value="Hồ sơ đặt cọc">Hồ sơ đặt cọc</option>
                <option value="Biên bản trả phòng">Biên bản trả phòng</option>
              </select>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Tìm mã HĐ, khách hàng..."
                className="pl-9 pr-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"white", border:"1.5px solid #E2E8F0", fontSize:"0.82rem", width:220 }}/>
            </div>
            <button onClick={reload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background:`${O}10`, border:`1px solid ${O}20`, color:O, fontSize:"0.78rem", fontWeight:700 }}>
              <RotateCcw size={13}/> Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label:`Số lượng kết quả`, value:totalElements, color:O, bg:"#FFF7ED" },
          { label:"Chứng từ chính", value:stats.contract || 0, color:"#4338CA", bg:"#EEF2FF" },
          { label:"Văn bản bàn giao", value:stats.handover || 0, color:"#0891B2", bg:"#ECFEFF" },
          { label:"Hồ sơ đặt cọc", value:stats.deposit || 0, color:"#D97706", bg:"#FFFBEB" },
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
        {loading ? (
          <div className="p-6 space-y-3" style={{ background:"white" }}>
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:"#F1F5F9" }}/>
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center" style={{ background:"white" }}>
            <AlertTriangle size={28} style={{ color:"#DC2626", margin:"0 auto" }}/>
            <div className="mt-3 font-bold text-slate-700">Không tải được danh sách hợp đồng</div>
            <div className="text-xs text-slate-500 mt-1">{error.message}</div>
            <button onClick={reload} className="mt-4 px-4 py-2 rounded-xl text-white text-sm font-bold"
              style={{ background:`linear-gradient(135deg,${O},#DC2626)` }}>Thử lại</button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E8EEF4" }}>
                  {["Mã VB/HĐ","Khách hàng","Hình thức","Kỳ Thanh Toán","Ngày lập","Loại văn bản","Hành động"].map(h=>(
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize:"0.7rem", fontWeight:800, color:"#94A3B8", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map((c: ApiContract, i: number) => {
                  const loai = c.loaiVanBan || "Chưa rõ";
                  let bg = "#F1F5F9", color = "#64748B", dot = "#94A3B8", border = "#E2E8F0";
                  if (loai.includes("Hop dong") || loai.includes("Hợp đồng")) { bg="#EEF2FF"; color="#4338CA"; dot="#6366F1"; border="#C7D2FE"; }
                  else if (loai.includes("Ban giao") || loai.includes("Bàn giao")) { bg="#ECFEFF"; color="#0891B2"; dot="#06B6D4"; border="#A5F3FC"; }
                  else if (loai.includes("Dat coc") || loai.includes("đặt cọc")) { bg="#FFFBEB"; color="#D97706"; dot="#F59E0B"; border="#FDE68A"; }
                  else if (loai.includes("Tra phong") || loai.includes("trả phòng")) { bg="#FEE2E2"; color="#DC2626"; dot="#EF4444"; border="#FECACA"; }

                  return (
                    <tr key={c.maVanBan || `doc-${i}`}
                      style={{ background:i%2===0?"white":"#FAFBFD", borderBottom:"1px solid #F1F5F9" }}
                      className="hover:bg-orange-50/15 transition-colors">
                      <td className="px-4 py-3">
                        <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:"0.82rem", color:"#1E293B" }}>{c.maHopDongThue || c.maVanBan || "--"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ fontWeight:700, fontSize:"0.88rem", color:"#1E293B" }}>
                          {c.khachHangSoHuu ? userMap.get(c.khachHangSoHuu) || c.khachHangSoHuu : "--"}
                        </div>
                        <div style={{ fontSize:"0.68rem", color:"#94A3B8" }}>
                          NV: {c.nhanVienLap ? userMap.get(c.nhanVienLap) || c.nhanVienLap : "--"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize:"0.82rem", color:"#64748B" }}>{c.hinhThucThue ?? "--"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize:"0.82rem", color:"#64748B" }}>{c.kyThanhToan ?? "--"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize:"0.82rem", color:"#64748B" }}>{fmtDate(c.ngayLap)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                          style={{ background:bg, color:color, border:`1px solid ${border}`, fontSize:"0.72rem", fontWeight:700 }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background:dot }}/>
                          {loai}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setDrafting(c.maHopDongThue)} disabled={!c.maHopDongThue}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition disabled:opacity-50"
                          style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontSize:"0.78rem", fontWeight:800, boxShadow:`0 2px 10px ${O}40` }}
                          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.08)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.filter=""}>
                          <FileText size={12}/> Xem Nội dung
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {contracts.length === 0 && (
              <div className="flex flex-col items-center py-12" style={{ background:"white" }}>
                <FileText size={32} className="text-slate-300 mb-3"/>
                <div className="text-slate-500 text-sm font-medium">Không tìm thấy hợp đồng nào</div>
              </div>
            )}
            <div className="px-4" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={size}
                onPageChange={setPage}
                onPageSizeChange={(s)=>{ setSize(s); setPage(0); }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
