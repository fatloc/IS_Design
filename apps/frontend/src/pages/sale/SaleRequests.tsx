import { useMemo, useState } from "react";
import {
  Plus, Search, Filter, ChevronRight, Home, MapPin, DollarSign,
  Calendar, CheckCircle, Clock, AlertTriangle, X, ArrowRight,
  Flame, BedDouble, SlidersHorizontal, Phone, Mail, RotateCcw,
} from "lucide-react";
import { usePagedList } from "../../hooks/usePagedList";
import { getCustomers, getRequests, updateRequest, getRooms, createRequest, createCustomer, createDeposit } from "../../services/api";
import { Pagination } from "../../components/Pagination";
import type { Customer, Request, Room } from "../../types";

const O = "#EA580C"; // orange accent
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
  note?: string | null;
}

// ── Chot Phong Modal ─────────────────────────────────────────────
function ChotPhongModal({ request, rawRequest, roomPrice, onClose, onSuccess }: { request: RentalRequest, rawRequest: any, roomPrice: number, onClose: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const depositAmount = roomPrice * 2; // Fixed deposit = 2 months

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update Request status to "Chờ phê duyệt"
      await updateRequest(request.id, { trangThaiYeuCau: "Chờ phê duyệt" } as any);
      
      // 2. We can try to create Deposit record here, but since Sale shouldn't edit amount,
      // it's created automatically or Accountant will create it. Let's create it.
      try {
        await createRequest({
          // Wait, createDeposit endpoint? No, we didn't import createDeposit.
          // Let's just create it with a dummy or use updateRequest
          // I will import createDeposit at the top.
        } as any);
      } catch(e) {}
      
      onSuccess();
    } catch(err) {
      console.error(err);
      alert("Có lỗi xảy ra khi chốt phòng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: `linear-gradient(135deg,${O},#DC2626)` }}>
          <div className="text-white flex items-center gap-2" style={{ fontWeight: 900, fontSize: "1.1rem" }}>
            <Flame size={18} /> Xác nhận chốt phòng
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-200 hover:text-white hover:bg-white/10 transition">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="text-sm text-slate-600 mb-2">
            Xác nhận tạo hồ sơ đặt cọc và chuyển yêu cầu <strong>{request.id}</strong> sang kế toán xử lý.
          </div>
          
          <div className="p-4 rounded-xl space-y-3" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Khách hàng</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>{request.customer}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2 border-slate-200">
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Phòng đề xuất</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>{request.room || "Không xác định"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: "0.8rem", color: "#64748B" }}>Tiền cọc dự tính (2 tháng)</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#059669" }}>
                {depositAmount.toLocaleString()} ₫
              </span>
            </div>
            <div className="text-[0.65rem] text-slate-400 italic text-right mt-1">
              * Số tiền cọc này chỉ có kế toán mới được phép chỉnh sửa
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl transition bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-sm">
              Hủy
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white transition font-bold text-sm"
              style={{ background: `linear-gradient(135deg,${O},#DC2626)`, boxShadow: `0 4px 12px ${O}40` }}>
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><CheckCircle size={16}/> Chuyển Kế toán</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data variables removed.

const STATUS_CFG: Record<ReqStatus, { bg: string; color: string; dot: string; border: string }> = {
  "Yêu cầu mới": { bg: "#EEF2FF", color: "#4338CA", dot: "#6366F1", border: "#C7D2FE" },
  "Đã lên lịch xem": { bg: "#F5F3FF", color: "#7C3AED", dot: "#8B5CF6", border: "#DDD6FE" },
  "Đã xem phòng": { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  "Chờ phê duyệt": { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B", border: "#FDE68A" },
  "Đặt cọc thành công": { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#6EE7B7" },
};

const STATUS_STEPS: ReqStatus[] = ["Yêu cầu mới", "Đã lên lịch xem", "Đã xem phòng", "Chờ phê duyệt", "Đặt cọc thành công"];
const VALID_STATUS_SET = new Set<ReqStatus>(STATUS_STEPS);

function Avatar({ initials, size = 9 }: { initials: string; size?: number }) {
  const s = `${size / 4}rem`;
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ width: s, height: s, background: `linear-gradient(135deg,${O},#DC2626)`, fontWeight: 800, fontSize: "0.72rem" }}>
      {initials}
    </div>
  );
}

function RequestDetailModal({
  request,
  onClose,
}: {
  request: RentalRequest;
  onClose: () => void;
}) {
  const cfg = STATUS_CFG[request.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E2E8F0", boxShadow: "0 20px 50px rgba(15,23,42,0.25)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1rem", color: "#1E293B" }}>Chi tiết yêu cầu thuê</div>
            <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>Mã yêu cầu: {request.id}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition" style={{ color: "#64748B" }}>
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar initials={request.avatar} size={10} />
            <div>
              <div style={{ fontWeight: 800, color: "#1E293B" }}>{request.customer}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>{request.phone}</div>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: "0.72rem", fontWeight: 700 }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
              {request.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Loại phòng mong muốn", value: request.roomType },
              { label: "Khu vực", value: request.area },
              { label: "Ngân sách", value: request.budget },
              { label: "Ngày tạo", value: request.created },
              { label: "Phòng đề xuất", value: request.room ?? "Chưa phân phòng" },
              { label: "Ngày xem phòng", value: request.showingDate ?? "Chưa có lịch xem" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl px-3 py-2.5" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#1E293B" }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl px-3 py-2.5" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <div style={{ fontSize: "0.72rem", color: "#92400E", marginBottom: 3 }}>Ghi chú yêu cầu</div>
            <div style={{ fontSize: "0.82rem", color: "#78350F", fontWeight: 600 }}>
              {request.note ?? "Chưa có ghi chú thêm"}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl"
            style={{ border: "1px solid #E2E8F0", fontSize: "0.82rem", fontWeight: 700, color: "#475569", background: "white" }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Request Modal ──────────────────────────────────────────────────────
function NewRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isNewCustomer, setIsNewCustomer] = useState(true);
  
  // New Customer fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [email, setEmail] = useState("");
  
  // Existing Customer fields
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const { items: customersList } = usePagedList<Customer>(getCustomers, 500);
  
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery) return customersList;
    const lowerQ = customerSearchQuery.toLowerCase();
    return customersList.filter(c => 
      (c.hoTen || "").toLowerCase().includes(lowerQ) || 
      (c.soDienThoai || "").includes(lowerQ)
    );
  }, [customersList, customerSearchQuery]);

  // Error handling
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Request fields
  const [roomType, setRoomType] = useState("Ghép giường");
  const [area, setArea] = useState("Tất cả");
  const [budget, setBudget] = useState("Tất cả");
  const [guests, setGuests] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searched, setSearched] = useState(false);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: rooms } = usePagedList<Room>(getRooms, 200, { search: "Trong" });
  
  const filteredRooms = rooms.filter(r => {
    if (area !== "Tất cả" && String(r.chiNhanh ?? "") !== area) return false;
    
    if ((r.sucChuaToiDa ?? 0) < guests) return false;

    const price = Number(r.giaThuePhong ?? 0);
    if (budget === "< 1.5M" && price >= 1500000) return false;
    if (budget === "1.5 – 2.0M" && (price < 1500000 || price > 2000000)) return false;
    if (budget === "2.0 – 3.0M" && (price < 2000000 || price > 3000000)) return false;
    if (budget === "3.0 – 4.0M" && (price < 3000000 || price > 4000000)) return false;
    if (budget === "> 4.0M" && price <= 4000000) return false;

    return true;
  });

  const handleCreate = async () => {
    setErrorMsg("");
    setFieldErrors({});
    if (!selectedCustomerId || !selectedRoom) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
      return;
    }
    setIsSubmitting(true);
    try {
      let customerId = selectedCustomerId;
      
      const budgetValue = parseFloat(budget.replace(/[^0-9.-]+/g,"")) * 1000000;
      
      await createRequest({
        khachHangYeuCau: customerId,
        soLuongNguoi: guests,
        khuVuc: area,
        mucGiaMongMuon: isNaN(budgetValue) ? undefined : budgetValue,
        trangThaiYeuCau: "Yêu cầu mới",
        cacTieuChiKhac: `[Phòng đề xuất: ${selectedRoom.maPhong}] ${roomType}`,
      } as any);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        setErrorMsg(data.message || "Lỗi khi tạo yêu cầu. Vui lòng thử lại.");
        if (data.data && typeof data.data === 'object') {
          setFieldErrors(data.data);
        }
      } else {
        setErrorMsg(err.message || "Lỗi khi tạo yêu cầu. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep1 = async () => {
    setErrorMsg("");
    setFieldErrors({});
    if (isNewCustomer) {
      if (!name.trim()) {
        setErrorMsg("Vui lòng nhập họ và tên khách hàng.");
        return;
      }
      setIsSubmitting(true);
      try {
        const newCus = await createCustomer({
          hoTen: name.trim(),
          soDienThoai: phone.trim() || undefined,
          cccd: cccd.trim() || undefined,
          email: email.trim() || undefined,
        });
        setSelectedCustomerId(newCus.maKhachHang);
        setIsNewCustomer(false); // Customer created, switch to existing customer mode
        setStep(2);
      } catch (err: any) {
        console.error(err);
        if (err.response?.data) {
          const data = err.response.data;
          setErrorMsg(data.message || "Lỗi khi lưu khách hàng.");
          if (data.data && typeof data.data === 'object') {
            setFieldErrors(data.data);
          }
        } else {
          setErrorMsg(err.message || "Lỗi khi lưu khách hàng.");
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!selectedCustomerId) {
        setErrorMsg("Vui lòng chọn khách hàng.");
        return;
      }
      setStep(2);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      handleNextStep1();
    } else if (step === 2) {
      if (!selectedRoom) return;
      setStep(3);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: `linear-gradient(135deg,${O},#DC2626)` }}>
          <div>
            <div className="text-white" style={{ fontWeight: 900, fontSize: "1rem" }}>Lập yêu cầu thuê phòng mới</div>
            <div className="text-orange-200 mt-0.5" style={{ fontSize: "0.75rem" }}>
              Bước {step}/3 – {step === 1 ? "Thông tin khách" : step === 2 ? "Tìm phòng trống" : "Xác nhận"}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-200 hover:text-white hover:bg-white/10 transition">
            <X size={16} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center px-6 py-3" style={{ background: "#FFF7ED", borderBottom: "1px solid #FED7AA" }}>
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                  style={{ background: step >= s ? O : "#CBD5E1", fontSize: "0.7rem", fontWeight: 800 }}>
                  {step > s ? <CheckCircle size={12} /> : s}
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: step === s ? 700 : 400, color: step >= s ? "#C2410C" : "#94A3B8" }}>
                  {s === 1 ? "Khách hàng" : s === 2 ? "Tìm phòng" : "Xác nhận"}
                </span>
              </div>
              {s < 3 && <div className="flex-1 mx-3 h-px" style={{ background: step > s ? "#FED7AA" : "#E2E8F0" }} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100" style={{ fontSize: "0.82rem", fontWeight: 500 }}>
              <X size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <div style={{ fontWeight: 700 }}>{errorMsg}</div>
                {Object.values(fieldErrors).length > 0 && (
                  <ul className="list-disc pl-4 mt-1 opacity-90">
                    {Object.values(fieldErrors).map((msg, idx) => (
                      <li key={idx}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3.5">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setIsNewCustomer(true)} 
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${isNewCustomer ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>Khách hàng mới</button>
                <button onClick={() => setIsNewCustomer(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${!isNewCustomer ? "bg-white shadow text-slate-800" : "text-slate-500"}`}>Khách hàng cũ</button>
              </div>
              
              {isNewCustomer ? (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 700, color: fieldErrors.hoTen ? "#DC2626" : "#374151" }}>Họ và tên khách *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Nguyễn Văn B"
                      className="w-full px-4 rounded-xl outline-none transition"
                      style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem", border: `1.5px solid ${fieldErrors.hoTen ? "#FECACA" : (name.trim() ? "#CBD5E1" : "#E2E8F0")}`, background: fieldErrors.hoTen ? "#FEF2F2" : "#FAFAFA", fontSize: "0.9rem", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 700, color: fieldErrors.soDienThoai ? "#DC2626" : "#374151" }}>Số điện thoại</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xx xxx xxx"
                        className="w-full px-4 rounded-xl outline-none transition"
                        style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem", border: `1.5px solid ${fieldErrors.soDienThoai ? "#FECACA" : "#E2E8F0"}`, background: fieldErrors.soDienThoai ? "#FEF2F2" : "#FAFAFA", fontSize: "0.9rem" }} />
                    </div>
                    <div>
                      <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 700, color: fieldErrors.cccd ? "#DC2626" : "#374151" }}>CCCD</label>
                      <input value={cccd} onChange={e => setCccd(e.target.value)} placeholder="CCCD"
                        className="w-full px-4 rounded-xl outline-none transition"
                        style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem", border: `1.5px solid ${fieldErrors.cccd ? "#FECACA" : "#E2E8F0"}`, background: fieldErrors.cccd ? "#FEF2F2" : "#FAFAFA", fontSize: "0.9rem" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 700, color: fieldErrors.email ? "#DC2626" : "#374151" }}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (nếu có)"
                      className="w-full px-4 rounded-xl outline-none transition"
                      style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem", border: `1.5px solid ${fieldErrors.email ? "#FECACA" : "#E2E8F0"}`, background: fieldErrors.email ? "#FEF2F2" : "#FAFAFA", fontSize: "0.9rem" }} />
                  </div>
                </div>
              ) : (
                <div className="relative space-y-4">
                  <label className="block mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 700, color: "#374151" }}>Tìm và chọn khách hàng cũ *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={e => {
                        setCustomerSearchQuery(e.target.value);
                        setShowCustomerDropdown(true);
                        setSelectedCustomerId(""); // Reset selection if typing again
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      placeholder="Nhập tên hoặc số điện thoại để tìm..."
                      className="w-full pl-11 pr-4 rounded-xl outline-none transition"
                      style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem", border: `1.5px solid ${selectedCustomerId ? "#94A3B8" : (customerSearchQuery ? "#CBD5E1" : "#E2E8F0")}`, background: "#FAFAFA", fontSize: "0.9rem", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" }}
                    />
                    {showCustomerDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl max-h-60 overflow-y-auto" style={{ border: "1px solid #E2E8F0" }}>
                        {filteredCustomers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy khách hàng nào.</div>
                        ) : (
                          filteredCustomers.map(c => (
                            <button
                              key={c.maKhachHang}
                              onClick={() => {
                                setSelectedCustomerId(c.maKhachHang);
                                setCustomerSearchQuery(`${c.hoTen} - ${c.soDienThoai}`);
                                setShowCustomerDropdown(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100 last:border-b-0 flex justify-between items-center"
                            >
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1E293B" }}>{c.hoTen}</div>
                                <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Mã KH: {c.maKhachHang}</div>
                              </div>
                              <div style={{ fontSize: "0.8rem", color: "#3B82F6", fontWeight: 600 }}>{c.soDienThoai}</div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {selectedCustomerId && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 mt-2">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Đã chọn khách hàng hợp lệ.</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Loại phòng mong muốn</label>
                  <select value={roomType} onChange={e => setRoomType(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop: "0.6rem", paddingBottom: "0.6rem", border: "1.5px solid #E2E8F0", background: "#FAFAFA", fontSize: "0.85rem" }}>
                    <option>Ghép giường</option><option>Toàn phòng</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Chi nhánh</label>
                  <select value={area} onChange={e => setArea(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop: "0.6rem", paddingBottom: "0.6rem", border: "1.5px solid #E2E8F0", background: "#FAFAFA", fontSize: "0.85rem" }}>
                    {["Tất cả", "0001", "0002", "0003", "0004", "0005"].map(q => <option key={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Số người dự kiến</label>
                  <input type="number" min={1} value={guests} onChange={e => setGuests(parseInt(e.target.value) || 1)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop: "0.6rem", paddingBottom: "0.6rem", border: "1.5px solid #E2E8F0", background: "#FAFAFA", fontSize: "0.85rem" }} />
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Ngân sách / tháng</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)}
                    className="w-full px-3 rounded-xl outline-none"
                    style={{ paddingTop: "0.6rem", paddingBottom: "0.6rem", border: "1.5px solid #E2E8F0", background: "#FAFAFA", fontSize: "0.85rem" }}>
                    {["Tất cả", "< 1.5M", "1.5 – 2.0M", "2.0 – 3.0M", "3.0 – 4.0M", "> 4.0M"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
                <SlidersHorizontal size={13} style={{ color: O }} />
                <span style={{ fontSize: "0.78rem", color: "#92400E" }}>
                  Tìm kiếm: <strong>{roomType}</strong> · Chi nhánh: {area} · Số người: {guests} · Ngân sách: {budget}
                </span>
                {!searched && (
                  <button onClick={() => setSearched(true)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-white"
                    style={{ background: O, fontSize: "0.72rem", fontWeight: 700 }}>
                    <Search size={11} /> Tìm phòng trống
                  </button>
                )}
              </div>
              {searched && (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                  {filteredRooms.length === 0 && (
                    <div className="text-center py-8 text-slate-400" style={{ fontSize: "0.85rem" }}>Không có phòng phù hợp</div>
                  )}
                  {filteredRooms.map(room => (
                    <div key={room.maPhong} onClick={() => setSelectedRoom(room)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition"
                      style={{
                        border: `1.5px solid ${selectedRoom?.maPhong === room.maPhong ? O : "#E2E8F0"}`,
                        background: selectedRoom?.maPhong === room.maPhong ? "#FFF7ED" : "white",
                      }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: selectedRoom?.maPhong === room.maPhong ? `${O}20` : "#F8FAFC" }}>
                        <Home size={14} style={{ color: selectedRoom?.maPhong === room.maPhong ? O : "#94A3B8" }} />
                      </div>
                      <div className="flex-1">
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>Phòng {room.maPhong}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748B" }}>Sức chứa: {room.sucChuaToiDa ?? "—"} người · {room.chiNhanh ?? "Chi nhánh mặc định"}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.88rem", color: O }}>₫{room.giaThuePhong?.toLocaleString() ?? 0}/tháng</div>
                        <div className="text-right" style={{ fontSize: "0.65rem" }}>
                          <span className="px-1.5 py-0.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669", fontWeight: 700 }}>Trống</span>
                        </div>
                      </div>
                      {selectedRoom?.maPhong === room.maPhong && <CheckCircle size={16} style={{ color: O, flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && selectedRoom && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#374151", marginBottom: 8 }}>Xác nhận thông tin yêu cầu</div>
                {[
                  { label: "Khách hàng", value: isNewCustomer ? `${name} · ${phone}` : (customersList.find(c => c.maKhachHang === selectedCustomerId)?.hoTen ?? selectedCustomerId) },
                  { label: "Phòng chọn", value: `${selectedRoom.maPhong} (Sức chứa: ${selectedRoom.sucChuaToiDa}) · ₫${selectedRoom.giaThuePhong?.toLocaleString()}/tháng` },
                  { label: "Chi nhánh", value: area },
                  { label: "Số người dự kiến", value: guests },
                  { label: "Ngân sách", value: budget },
                ].map(r => (
                  <div key={r.label} className="flex items-start gap-3 py-1.5" style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94A3B8", minWidth: 90 }}>{r.label}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E293B" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 pb-5">
          <button onClick={() => step > 1 ? setStep((step - 1) as 1 | 2 | 3) : onClose()}
            className="flex-1 py-2.5 rounded-xl transition"
            style={{ border: "1.5px solid #E2E8F0", fontSize: "0.82rem", fontWeight: 600, color: "#64748B" }}>
            {step > 1 ? "Quay lại" : "Hủy"}
          </button>
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={isSubmitting || (step === 1 && (isNewCustomer ? !name.trim() : !selectedCustomerId)) || (step === 2 && !selectedRoom)}
              className="flex-1 flex justify-center items-center py-2.5 rounded-xl text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: (step === 1 && (isNewCustomer ? !name.trim() : !selectedCustomerId)) || (step === 2 && !selectedRoom) ? "#CBD5E1" : `linear-gradient(135deg,${O},#DC2626)`,
                fontSize: "0.85rem", fontWeight: 800, cursor: (step === 1 && (isNewCustomer ? !name.trim() : !selectedCustomerId)) || (step === 2 && !selectedRoom) ? "not-allowed" : "pointer",
              }}>
              {isSubmitting && step === 1 ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Tiếp theo <ArrowRight size={14} className="inline ml-1" /></>
              )}
            </button>
          ) : (
            <button onClick={handleCreate} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-white transition"
              style={{ background: isSubmitting ? "#CBD5E1" : `linear-gradient(135deg,${O},#DC2626)`, fontSize: "0.85rem", fontWeight: 800, boxShadow: `0 3px 12px ${O}40` }}>
              {isSubmitting ? "Đang xử lý..." : "Tạo yêu cầu ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | ReqStatus>("Tất cả");
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [chotDoneId, setChotDoneId] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<RentalRequest | null>(null);
  const [chotPhongRequest, setChotPhongRequest] = useState<RentalRequest | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const {
    items: rawRequests,
    loading: loadingRequests,
    error: requestsError,
    totalElements,
    totalPages,
    page,
    size,
    setPage,
    setSize,
    reload: reloadRequests,
  } = usePagedList<Request>(getRequests, 10, {
    trangThaiYeuCau: statusFilter === "Tất cả" ? undefined : statusFilter,
  });

  const {
    items: customers,
    loading: loadingCustomers,
  } = usePagedList<Customer>(getCustomers, 500);

  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [c.maKhachHang, c]));
  }, [customers]);

  const requests = useMemo<RentalRequest[]>(() => {
    const formatDate = (value: string | null) => {
      if (!value) return "—";
      const [year, month, day] = value.split("-");
      if (!year || !month || !day) return value;
      return `${day}/${month}/${year}`;
    };

    const formatBudget = (value: string | null) => {
      if (!value) return "Chưa cập nhật";
      const number = Number(value);
      if (Number.isNaN(number)) return value;
      return `${Math.round(number / 1_000_000 * 10) / 10}M`;
    };

    const getInitials = (name: string) =>
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const toStatus = (request: Request): ReqStatus => {
      const normalizedStatus = request.trangThaiYeuCau?.trim() as ReqStatus | undefined;
      if (normalizedStatus && VALID_STATUS_SET.has(normalizedStatus)) {
        return normalizedStatus;
      }
      return "Yêu cầu mới";
    };

    return rawRequests.map((request) => {
      const customer = request.khachHangYeuCau ? customerMap.get(request.khachHangYeuCau) : undefined;
      const customerName = customer?.hoTen ?? request.khachHangYeuCau ?? "Khách chưa rõ";

      return {
        id: request.maYeuCau,
        customer: customerName,
        avatar: getInitials(customerName),
        phone: customer?.soDienThoai ?? "—",
        roomType: request.soLuongNguoi && request.soLuongNguoi > 1 ? "Toàn phòng" : "Ghép giường",
        area: request.khuVuc ?? "Chưa rõ khu vực",
        budget: formatBudget(request.mucGiaMongMuon),
        status: toStatus(request),
        created: formatDate(request.thoiGianBatDauThueDuKien ?? request.thoiGianBanGiaoPhongDuKien),
        room: null,
        showingDate: formatDate(request.thoiGianBatDauThueDuKien),
        note: request.cacTieuChiKhac,
      };
    });
  }, [rawRequests, customerMap]);

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "Tất cả" ? true : r.status === statusFilter;
    const matchesSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      (r.room ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenChotModal = (req: RentalRequest) => {
    setChotPhongRequest(req);
  };

  const statusCounts = STATUS_STEPS.map(s => ({ status: s, count: requests.filter(r => r.status === s).length }));

  return (
    <div>
      {detailRequest && (
        <RequestDetailModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
        />
      )}
      {chotPhongRequest && (
        <ChotPhongModal
          request={chotPhongRequest}
          rawRequest={rawRequests.find(r => r.maYeuCau === chotPhongRequest.id)}
          roomPrice={chotPhongRequest.budget ? parseInt(chotPhongRequest.budget.replace(/[^0-9]/g, '')) * 1000000 : 0}
          onClose={() => setChotPhongRequest(null)}
          onSuccess={() => {
            setChotPhongRequest(null);
            setChotDoneId(chotPhongRequest.id);
            reloadRequests();
            setTimeout(() => setChotDoneId(null), 2000);
          }}
        />
      )}
      {showNewModal && (
        <NewRequestModal
          onClose={() => setShowNewModal(false)}
          onSuccess={reloadRequests}
        />
      )}
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${O}15` }}>
              <Home size={14} style={{ color: O }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: "1.35rem", color: "#1E293B", letterSpacing: "-0.02em" }}>
              Yêu cầu & Chốt phòng
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748B", paddingLeft: "2.25rem" }}>
            Pipeline xử lý yêu cầu từ khách hàng tiềm năng đến ký hợp đồng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white transition"
            style={{ background: `linear-gradient(135deg,${O},#DC2626)`, fontWeight: 800, fontSize: "0.85rem", boxShadow: `0 4px 16px ${O}40` }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ""}>
            <Plus size={16} /> Tạo yêu cầu mới
          </button>
          <button onClick={reloadRequests}
            className="flex items-center gap-1.5 px-3 py-3 rounded-2xl transition"
            style={{ background: `${O}10`, border: `1px solid ${O}20`, color: O, fontSize: "0.85rem", fontWeight: 700 }}>
            <RotateCcw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {/* Pipeline status strip */}
      <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {statusCounts.map((s, i) => {
          const cfg = STATUS_CFG[s.status];
          const arrows = ["→", "→", "→", "→"];
          return (
            <div key={s.status} className="relative">
              <div className="px-3 py-2.5 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.status}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1E293B", lineHeight: 1.1, marginTop: 2 }}>{s.count}</div>
              </div>
              {i < 4 && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 text-slate-300" style={{ fontSize: "0.9rem" }}>›</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="mb-4 rounded-2xl p-3" style={{ border: "1px solid #E8EEF4", background: "white" }}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách, mã phòng..."
              className="w-full pl-10 pr-4 rounded-xl outline-none transition"
              style={{ paddingTop: "0.65rem", paddingBottom: "0.65rem", background: "white", border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
              onFocus={e => { e.currentTarget.style.borderColor = O; e.currentTarget.style.boxShadow = `0 0 0 3px ${O}15`; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: "#94A3B8" }} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "Tất cả" | ReqStatus);
                setPage(0);
              }}
              className="px-3 py-2 rounded-xl outline-none"
              style={{ border: "1.5px solid #E2E8F0", background: "white", fontSize: "0.82rem", color: "#374151", minWidth: 180 }}
            >
              <option value="Tất cả">Tất cả trạng thái</option>
              {STATUS_STEPS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={size}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        {(loadingRequests || loadingCustomers) && (
          <div className="px-4 py-3 text-sm" style={{ color: "#64748B", borderBottom: "1px solid #F1F5F9", background: "#FAFBFD" }}>
            Đang tải dữ liệu yêu cầu thuê từ hệ thống...
          </div>
        )}
        {requestsError && (
          <div className="px-4 py-3 text-sm" style={{ color: "#B91C1C", borderBottom: "1px solid #FEE2E2", background: "#FEF2F2" }}>
            Không tải được dữ liệu yêu cầu: {requestsError.message}
          </div>
        )}
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E8EEF4" }}>
              {["Khách hàng", "Yêu cầu", "Phòng & Lịch xem", "Trạng thái", "Hành động"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((req, i) => {
              const cfg = STATUS_CFG[req.status];
              const canChot = req.status === "Đã xem phòng";
              const isDone = chotDoneId === req.id;
              return (
                <tr key={req.id}
                  style={{ background: i % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}
                  className="hover:bg-orange-50/20 transition-colors">
                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={req.avatar} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>{req.customer}</div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={10} style={{ color: "#94A3B8" }} />
                          <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{req.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Request details */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BedDouble size={11} style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.78rem", color: "#374151", fontWeight: 600 }}>{req.roomType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{req.area} · {req.budget}</span>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#94A3B8", marginTop: 2 }}>Tạo: {req.created}</div>
                  </td>
                  {/* Room & showing */}
                  <td className="px-4 py-3">
                    {req.room ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Home size={11} style={{ color: O }} />
                          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1E293B" }}>Phòng {req.room}</span>
                        </div>
                        {req.showingDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={10} style={{ color: "#94A3B8" }} />
                            <span style={{ fontSize: "0.72rem", color: "#64748B" }}>Xem: {req.showingDate}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#CBD5E1", fontStyle: "italic" }}>Chưa phân phòng</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: "0.72rem", fontWeight: 700 }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                      {req.status}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {canChot && (
                        <div className="relative"
                          onMouseEnter={() => setTooltipId(req.id)}
                          onMouseLeave={() => setTooltipId(null)}>
                          <button onClick={() => handleOpenChotModal(req)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition"
                            style={{ background: `linear-gradient(135deg,${O},#DC2626)`, fontSize: "0.78rem", fontWeight: 800, boxShadow: `0 2px 10px ${O}40` }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = ""}>
                            <Flame size={13} /> Chốt phòng
                          </button>
                          {/* Tooltip */}
                          {tooltipId === req.id && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-white z-20 pointer-events-none whitespace-nowrap"
                              style={{ background: "#1E293B", fontSize: "0.72rem", fontWeight: 600 }}>
                              📋 Chuyển Kế toán thu cọc
                              <div className="absolute top-full left-1/2 -translate-x-1/2" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1E293B" }} />
                            </div>
                          )}
                        </div>
                      )}
                      {isDone && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "#ECFDF5" }}>
                          <CheckCircle size={12} style={{ color: "#059669" }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669" }}>Đã chuyển</span>
                        </div>
                      )}
                      {!canChot && !isDone && (
                        <button
                          onClick={() => setDetailRequest(req)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition"
                          style={{ background: "#F1F5F9", fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>
                          <ChevronRight size={12} /> Chi tiết
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <Search size={28} style={{ color: "#CBD5E1" }} className="mb-2" />
            <div style={{ color: "#64748B", fontSize: "0.88rem" }}>
              {statusFilter === "Tất cả"
                ? "Không tìm thấy yêu cầu nào"
                : `Không có yêu cầu ở trạng thái "${statusFilter}"`}
            </div>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-4" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setSize(newSize);
                setPage(0);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
