import { useState } from "react";
import {
  Users, Search, Phone, Mail, AlertTriangle, CheckCircle,
  Shield, X, Save, Clock, RotateCcw,
} from "lucide-react";
import { usePagedList } from "../../hooks/usePagedList";
import { getCustomers } from "../../services/api";
import { Pagination } from "../../components/Pagination";
import type { Customer } from "../../types";

const O = "#EA580C";

type ProfileStatus = "complete" | "missing_cccd" | "missing_address" | "incomplete";

const STATUS_CFG: Record<ProfileStatus, { label:string; icon:typeof CheckCircle; color:string; bg:string }> = {
  complete:        { label:"Đầy đủ hồ sơ",  icon:CheckCircle,   color:"#059669", bg:"#ECFDF5" },
  missing_cccd:    { label:"Thiếu CCCD",     icon:AlertTriangle, color:"#DC2626", bg:"#FEF2F2" },
  missing_address: { label:"Thiếu địa chỉ",  icon:AlertTriangle, color:"#D97706", bg:"#FFFBEB" },
  incomplete:      { label:"Hồ sơ chưa đủ",  icon:Clock,         color:"#6366F1", bg:"#EEF2FF" },
};

function calcStatus(c: Customer): ProfileStatus {
  if (!c.cccd) return "missing_cccd";
  return "complete";
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
}

// ── Profile Panel ──────────────────────────────────────────────────────────
function ProfilePanel({ customer }: { customer: Customer }) {
  const status = calcStatus(customer);
  const cfg    = STATUS_CFG[status];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex-shrink-0" style={{ background:"linear-gradient(135deg,#FFF7ED,#FFFBEB)", borderBottom:"1px solid #FED7AA" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.95rem" }}>
            {getInitials(customer.hoTen)}
          </div>
          <div className="flex-1">
            <div style={{ fontWeight:900, fontSize:"1rem", color:"#1E293B" }}>{customer.hoTen ?? "--"}</div>
            <div style={{ fontSize:"0.72rem", color:"#92400E", marginTop:2 }}>Mã KH: {customer.maKhachHang} · {customer.phai ?? "?"}</div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{ background:cfg.bg, color:cfg.color, fontSize:"0.72rem", fontWeight:700 }}>
            <cfg.icon size={11}/> {cfg.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Họ và tên</label>
            <div className="w-full px-3 py-2.5 rounded-xl" style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem", color:"#1E293B" }}>
              {customer.hoTen ?? "--"}
            </div>
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Số điện thoại</label>
            <div className="relative">
              <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"#CBD5E1" }}/>
              <div className="w-full pl-8 pr-3 py-2.5 rounded-xl" style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem", color:"#1E293B" }}>
                {customer.soDienThoai ?? "--"}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Email</label>
          <div className="relative">
            <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"#CBD5E1" }}/>
            <div className="w-full pl-8 pr-3 py-2.5 rounded-xl" style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem", color:"#1E293B" }}>
              {customer.email ?? "--"}
            </div>
          </div>
        </div>

        {/* CCCD */}
        <div className="rounded-xl overflow-hidden" style={{ border:`1.5px solid ${!customer.cccd?"#FCA5A5":"#E2E8F0"}` }}>
          <div className="flex items-center gap-2 px-4 py-2.5"
            style={{ background:!customer.cccd?"#FEF2F2":"#F8FAFC", borderBottom:`1px solid ${!customer.cccd?"#FCA5A5":"#E2E8F0"}` }}>
            <Shield size={13} style={{ color:!customer.cccd?"#EF4444":O }}/>
            <span style={{ fontWeight:800, fontSize:"0.82rem", color:!customer.cccd?"#DC2626":"#1E293B" }}>
              Căn cước công dân (CCCD)
            </span>
            {!customer.cccd && (
              <span className="ml-auto flex items-center gap-1.5" style={{ fontSize:"0.72rem", color:"#DC2626", fontWeight:700 }}>
                <AlertTriangle size={11}/> Chưa có thông tin
              </span>
            )}
          </div>
          <div className="px-4 py-3.5" style={{ background:"white" }}>
            <div className="w-full px-3 py-2.5 rounded-xl" style={{ background:!customer.cccd?"#FFF5F5":"#F8FAFC", border:`1.5px solid ${!customer.cccd?"#EF4444":"#E2E8F0"}`, fontSize:"0.85rem", color:"#1E293B", fontFamily:"monospace" }}>
              {customer.cccd ?? "Chưa cập nhật"}
            </div>
          </div>
        </div>

        {/* Quoc tich */}
        <div>
          <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#374151" }}>Quốc tịch</label>
          <div className="w-full px-3 py-2.5 rounded-xl" style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem", color:"#1E293B" }}>
            {customer.quocTich ?? "--"}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-5 py-3 text-center" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
        <span style={{ fontSize:"0.72rem", color:"#94A3B8" }}>Dữ liệu thực từ database · Cập nhật thông qua quy trình nội bộ</span>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleCustomers() {
  const {
    items: customers, loading, error,
    totalElements, totalPages,
    page, size, setPage, setSize,
    reload,
  } = usePagedList<Customer>(getCustomers, 10);

  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(c =>
    (c.hoTen ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.soDienThoai ?? "").includes(search) ||
    (c.cccd ?? "").includes(search) ||
    (c.maKhachHang ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const selected = customers.find(c=>c.maKhachHang===selectedId);
  const completePct = customers.length
    ? Math.round(customers.filter(c=>c.cccd).length/customers.length*100)
    : 0;

  return (
    <div>
      {/* Header */}
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
            {totalElements.toLocaleString()} khách hàng trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{ background:"white", border:"1px solid #E2E8F0", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
            <div>
              <div style={{ fontSize:"1.3rem", fontWeight:900, color:"#1E293B", lineHeight:1 }}>{completePct}%</div>
              <div style={{ fontSize:"0.68rem", color:"#94A3B8" }}>Có CCCD</div>
            </div>
            <div className="w-12 h-12 relative flex-shrink-0">
              <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#F1F5F9" strokeWidth="5"/>
                <circle cx="22" cy="22" r="18" fill="none" stroke={O} strokeWidth="5"
                  strokeDasharray={`${completePct/100*113} 113`} strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <button onClick={reload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background:`${O}10`, border:`1px solid ${O}20`, color:O, fontSize:"0.78rem", fontWeight:700 }}>
            <RotateCcw size={13}/> Làm mới
          </button>
        </div>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns:"320px 1fr" }}>
        {/* Left – Customer list */}
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          {/* Search */}
          <div className="px-3 py-3" style={{ borderBottom:"1px solid #F1F5F9" }}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT, CCCD..."
                className="w-full pl-9 pr-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.8rem" }}/>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto no-scrollbar" style={{ maxHeight:"calc(100vh - 380px)" }}>
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({length:8}).map((_,i)=>(
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background:"#F1F5F9" }}/>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertTriangle size={24} style={{ color:"#DC2626", margin:"0 auto" }}/>
                <div className="text-sm text-slate-600 mt-2">Lỗi tải dữ liệu</div>
                <button onClick={reload} className="mt-2 text-xs font-bold" style={{ color:O }}>Thử lại</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Users size={28} style={{ color:"#CBD5E1" }} className="mb-2"/>
                <div style={{ fontSize:"0.82rem", color:"#94A3B8" }}>Không tìm thấy khách hàng</div>
              </div>
            ) : (
              filtered.map(c => {
                const status = calcStatus(c);
                const cfg    = STATUS_CFG[status];
                const isSelected = c.maKhachHang === selectedId;
                return (
                  <button key={c.maKhachHang} onClick={()=>setSelectedId(c.maKhachHang)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left"
                    style={{
                      background: isSelected ? "#FFF7ED" : "white",
                      borderBottom:"1px solid #F8FAFC",
                      borderLeft: isSelected ? `3px solid ${O}` : "3px solid transparent",
                    }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ background:`linear-gradient(135deg,${O},#DC2626)`, fontWeight:800, fontSize:"0.72rem" }}>
                      {getInitials(c.hoTen)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontWeight:700, fontSize:"0.85rem", color:"#1E293B" }}>{c.hoTen ?? "--"}</div>
                      <div style={{ fontSize:"0.68rem", color:"#94A3B8" }}>{c.soDienThoai ?? "Chưa có SĐT"}</div>
                    </div>
                    <cfg.icon size={13} style={{ color:cfg.color, flexShrink:0 }}/>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination footer */}
          <div className="px-3" style={{ borderTop:"1px solid #F1F5F9", background:"#FAFBFD" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setSize(s); setPage(0); }}
            />
          </div>
        </div>

        {/* Right – Profile */}
        <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", minHeight:500 }}>
          {selected ? (
            <ProfilePanel customer={selected}/>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Users size={32} style={{ color:"#CBD5E1" }} className="mb-3"/>
              <div style={{ fontSize:"0.9rem", color:"#64748B" }}>Chọn khách hàng để xem hồ sơ</div>
              <div style={{ fontSize:"0.78rem", color:"#94A3B8", marginTop:4 }}>
                Hiển thị {filtered.length} / {totalElements.toLocaleString()} khách hàng
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
