import { useState, useEffect } from "react";
import {
  Users, Search, Phone, Mail, AlertTriangle, CheckCircle,
  Shield, X, Save, Clock, RotateCcw,
} from "lucide-react";
import { usePagedList } from "../../hooks/usePagedList";
import { getCustomers, updateCustomer, deleteCustomer } from "../../services/api";
import { Pagination } from "../../components/Pagination";
import { toast } from "sonner";
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

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditCustomerModal({ customer, isOpen, onClose, onSave }: { 
  customer: Customer; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<Customer>) => Promise<void>; 
}) {
  const [formData, setFormData] = useState<Partial<Customer>>({
    hoTen: customer.hoTen,
    soDienThoai: customer.soDienThoai,
    email: customer.email,
    cccd: customer.cccd,
    quocTich: customer.quocTich,
    phai: customer.phai,
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (!formData.hoTen?.trim()) {
      toast.error("Họ tên không được để trống");
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom:"1px solid #F1F5F9" }}>
          <div>
            <h3 style={{ fontWeight:900, fontSize:"1.1rem", color:"#1E293B" }}>Sửa Hồ sơ Khách hàng</h3>
            <p style={{ fontSize:"0.72rem", color:"#64748B" }}>Cập nhật thông tin chi tiết</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} className="text-slate-400"/>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>Họ và tên</label>
              <input value={formData.hoTen || ""} onChange={e=>setFormData({...formData, hoTen:e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border-1.5 outline-none focus:border-orange-500 transition-all font-medium"
                style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}/>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>Giới tính</label>
              <select value={formData.phai || ""} onChange={e=>setFormData({...formData, phai:e.target.value as any})}
                className="w-full px-4 py-2.5 rounded-xl border-1.5 outline-none focus:border-orange-500 transition-all font-medium"
                style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}>
                <option value="">Chọn...</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>Số điện thoại</label>
              <input value={formData.soDienThoai || ""} onChange={e=>setFormData({...formData, soDienThoai:e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border-1.5 outline-none focus:border-orange-500 transition-all font-medium"
                style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}/>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>Quốc tịch</label>
              <input value={formData.quocTich || ""} onChange={e=>setFormData({...formData, quocTich:e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border-1.5 outline-none focus:border-orange-500 transition-all font-medium"
                style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}/>
            </div>
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>Email</label>
            <input value={formData.email || ""} onChange={e=>setFormData({...formData, email:e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border-1.5 outline-none focus:border-orange-500 transition-all font-medium"
              style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}/>
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontSize:"0.75rem", fontWeight:700, color:"#475569" }}>CCCD</label>
            <input value={formData.cccd || ""} onChange={e=>setFormData({...formData, cccd:e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border-1.5 outline-none focus:border-orange-500 transition-all font-medium"
              style={{ background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.85rem" }}/>
          </div>
        </div>

        <div className="px-6 py-5 flex items-center justify-end gap-3" style={{ background:"#FAFBFD", borderTop:"1px solid #F1F5F9" }}>
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold transition-all text-slate-500 hover:bg-slate-100"
            style={{ fontSize:"0.82rem" }}>
            Hủy
          </button>
          <button onClick={handleApply} disabled={saving}
            className="px-7 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-200/50 flex items-center gap-2"
            style={{ background:O, color:"white", fontSize:"0.82rem" }}>
            {saving ? <RotateCcw size={14} className="animate-spin" /> : <Save size={14}/>}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, customerName, isDeleting }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  customerName: string;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} className="text-red-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Xác nhận xóa?</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa khách hàng <span className="font-bold text-slate-900">{customerName}</span>? 
            Hành động này <span className="text-red-600 font-semibold underline decoration-2 underline-offset-4">không thể hoàn tác</span>.
          </p>
        </div>
        
        <div className="p-6 bg-slate-50/50 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 text-[0.85rem]"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-[0.85rem]"
          >
            {isDeleting ? <RotateCcw size={16} className="animate-spin" /> : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Profile Panel ──────────────────────────────────────────────────────────
function ProfilePanel({ customer, onUpdate, onDelete }: { 
  customer: Customer; 
  onUpdate: (id: string, data: Partial<Customer>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const status = calcStatus(customer);
  const cfg    = STATUS_CFG[status];
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(customer.maKhachHang);
      toast.success("Đã xóa khách hàng");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa khách hàng");
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="flex flex-col items-end gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{ background:cfg.bg, color:cfg.color, fontSize:"0.72rem", fontWeight:700 }}>
              <cfg.icon size={11}/> {cfg.label}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-orange-600 border border-transparent hover:border-orange-200"
                title="Sửa hồ sơ">
                <Save size={14}/>
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-red-600 border border-transparent hover:border-red-200"
                title="Xóa hồ sơ">
                {isDeleting ? <RotateCcw size={14} className="animate-spin"/> : <X size={14}/>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditCustomerModal 
        key={customer.maKhachHang}
        customer={customer} 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)}
        onSave={(data) => onUpdate(customer.maKhachHang, data)}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        customerName={customer.hoTen || "khách hàng"}
        isDeleting={isDeleting}
      />

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    items: customers, loading, error,
    totalElements, totalPages,
    page, size, setPage, setSize,
    reload,
  } = usePagedList<Customer>(getCustomers, 10, { search: debouncedSearch });

  // Reset to page 0 when searching
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, setPage]);

  const [selectedId, setSelectedId] = useState<string|null>(null);

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
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          {/* Search */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom:"1px solid #F1F5F9" }}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT, CCCD..."
                className="w-full pl-9 pr-3 rounded-xl outline-none"
                style={{ paddingTop:"0.55rem", paddingBottom:"0.55rem", background:"#F8FAFC", border:"1.5px solid #E2E8F0", fontSize:"0.8rem" }}/>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto no-scrollbar flex-1" style={{ maxHeight:"calc(100vh - 330px)" }}>
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
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <Users size={28} style={{ color:"#CBD5E1" }} className="mb-2"/>
                <div style={{ fontSize:"0.82rem", color:"#94A3B8" }}>Không tìm thấy khách hàng</div>
              </div>
            ) : (
              customers.map(c => {
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
        </div>

        {/* Right – Profile */}
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border:"1px solid #E8EEF4", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", minHeight:500 }}>
          {selected ? (
            <ProfilePanel 
              customer={selected}
              onUpdate={async (id, data) => {
                await updateCustomer(id, data);
                toast.success("Đã cập nhật hồ sơ");
                reload();
              }}
              onDelete={async (id) => {
                await deleteCustomer(id);
                setSelectedId(null);
                reload();
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Users size={32} style={{ color:"#CBD5E1" }} className="mb-3"/>
              <div style={{ fontSize:"0.9rem", color:"#64748B" }}>Chọn khách hàng để xem hồ sơ</div>
              <div style={{ fontSize:"0.78rem", color:"#94A3B8", marginTop:4 }}>
                Hiển thị {customers.length} / {totalElements.toLocaleString()} khách hàng
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
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
  );
}
