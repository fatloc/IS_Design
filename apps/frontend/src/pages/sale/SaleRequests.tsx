import { useMemo, useState, useEffect } from "react";
import {
  Plus, Search, Filter, ChevronRight, Home, MapPin,
  CheckCircle, AlertTriangle, X,
  Flame, BedDouble, Phone, Users, Building2,
} from "lucide-react";
import { usePagedList } from "../../hooks/usePagedList";
import { useToast } from "../../components/ToastProvider";
import { formatVNDInput, parseVNDInput } from "../../utils/format";
import { getCustomers, getRequests, updateRequest, createRequest, getAppointments, getAppointmentByRequest, getRequestStatusCounts, createCustomer, getAvailableRooms } from "../../services/api";
import { Pagination } from "../../components/Pagination";
import type { Appointment, Customer, Request, Room, Gender } from "../../types";


const O = "#EA580C"; // orange accent

// ── Companion form type ────────────────────────────────────────────────────
type CompanionForm = {
  hoTen: string;
  soDienThoai: string;
  phai: string;
  cccd: string;
  quocTich: string;
};

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
  status: ReqStatus;
  isOverdue?: boolean;
  created: string;
  room: string | null; showingDate: string | null;
  note?: string | null;
  suggestedRoom?: string | null;
}


const STATUS_CFG: Record<ReqStatus, { bg: string; color: string; dot: string; border: string }> = {
  "Yêu cầu mới": { bg: "#EEF2FF", color: "#4338CA", dot: "#6366F1", border: "#C7D2FE" },
  "Đã lên lịch xem": { bg: "#F5F3FF", color: "#7C3AED", dot: "#8B5CF6", border: "#DDD6FE" },
  "Đã xem phòng": { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  "Chờ phê duyệt": { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B", border: "#FDE68A" },
  "Đặt cọc thành công": { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#6EE7B7" },
};

const STATUS_STEPS: ReqStatus[] = [
  "Yêu cầu mới",
  "Đã lên lịch xem",
  "Đã xem phòng",
  "Chờ phê duyệt",
  "Đặt cọc thành công"
];
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

  const [apptRoom, setApptRoom] = useState<string | null>(request.room);
  const [apptDate, setApptDate] = useState<string | null>(request.showingDate);
  const [loadingAppt, setLoadingAppt] = useState(false);

  useEffect(() => {
    if (!request.id) return;
    setLoadingAppt(true);
    getAppointmentByRequest(request.id)
      .then((appt) => {
        if (!appt) return;
        // Format ngày xem phòng
        const formatDate = (value: string | null) => {
          if (!value) return null;
          const [year, month, day] = value.split("-");
          if (!year || !month || !day) return value;
          return `${day}/${month}/${year}`;
        };
        const formatTime = (value: string | null | undefined) => {
          if (!value) return null;
          return value.length >= 5 ? value.slice(0, 5) : value;
        };
        const date = formatDate(appt.ngayHen ?? null);
        const time = formatTime(appt.thoiGianHen);
        const schedule = date
          ? (time ? `${date} ${time}` : date)
          : (time ?? null);

        setApptRoom(appt.maPhong ?? null);
        setApptDate(schedule);
      })
      .catch(() => {
        // giữ nguyên giá trị đã có nếu lỗi
      })
      .finally(() => setLoadingAppt(false));
  }, [request.id]);

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
              { label: "Phòng đề xuất", value: loadingAppt ? "Đang tải..." : (apptRoom ?? request.suggestedRoom ?? "Chưa phân phòng") },
              { label: "Ngày xem phòng", value: loadingAppt ? "Đang tải..." : (apptDate ?? "Chưa có lịch xem") },
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

function CreateCustomerModal({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}) {
  const [hoTen, setHoTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [phai, setPhai] = useState<Gender>("Nam");
  const [cccd, setCccd] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hoTen || !soDienThoai) {
      addToast({ message: "Vui lòng điền họ tên và số điện thoại.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await createCustomer({
        hoTen,
        soDienThoai,
        phai,
        cccd: cccd || null
      });
      addToast({ message: "Khách hàng đã được tạo thành công!", type: "success" });
      onSuccess(res as Customer);
    } catch (err: any) {
      addToast({ message: "Lỗi khi tạo: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Thêm Khách hàng mới</h3>
            <p className="text-sm text-slate-500 mt-0.5">Hồ sơ sẽ được ghi vào cơ sở dữ liệu chung.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên *</label>
              <input value={hoTen} onChange={e => setHoTen(e.target.value)} required maxLength={50} placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số điện thoại *</label>
                <input value={soDienThoai} onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 10) setSoDienThoai(val);
                }} required maxLength={10} placeholder="09xxxxxxx" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giới tính</label>
                <select value={phai} onChange={e => setPhai(e.target.value as Gender)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">CCCD / CMND (Không bắt buộc)</label>
              <input value={cccd} onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 12) setCccd(val);
              }} maxLength={12} placeholder="01234..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition" />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Hủy</button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30 hover:brightness-110 transition disabled:opacity-50">
              {loading ? "Đang lưu..." : "Lưu hồ sơ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




function CreateRequestTab({

  customers,
  onSuccess,
  reloadCustomers
}: {
  customers: Customer[];
  onSuccess: () => void;
  reloadCustomers: () => void;
}) {
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("Ghép giường");
  const [soLuongNguoi, setSoLuongNguoi] = useState(1);
  const [gioiTinh, setGioiTinh] = useState("Nam");
  const [area, setArea] = useState("Q.7");
  const [budget, setBudget] = useState(formatVNDInput("1500000"));
  const [note, setNote] = useState("");
  
  const [thoiGianBatDauThue, setThoiGianBatDauThue] = useState(() => new Date().toISOString().split('T')[0]);
  const [thoiGianBanGiao, setThoiGianBanGiao] = useState(() => new Date().toISOString().split('T')[0]);
  const [coDieuHoa, setCoDieuHoa] = useState(true);
  const [coBaiGuiXe, setCoBaiGuiXe] = useState(true);
  const [thoiHanThue, setThoiHanThue] = useState<number | null>(null);

  const [companions, setCompanions] = useState<CompanionForm[]>([]);
  const [companionErrors, setCompanionErrors] = useState<Record<number, { hoTen?: string; soDienThoai?: string }>>({});

  const [suggestedRooms, setSuggestedRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [checkingRooms, setCheckingRooms] = useState(false);
  const [roomPage, setRoomPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const { addToast } = useToast();

  const [debouncedSearchCustomer, setDebouncedSearchCustomer] = useState("");
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchCustomer(searchCustomer), 400);
    return () => clearTimeout(handler);
  }, [searchCustomer]);

  useEffect(() => {
    if (!debouncedSearchCustomer || debouncedSearchCustomer.includes(" - ")) {
      setCustomerOptions([]);
      return;
    }
    
    let isMounted = true;
    setSearching(true);
    getCustomers({ page: 0, size: 10, search: debouncedSearchCustomer })
      .then(res => {
        if (isMounted) {
          setCustomerOptions(res.data || []);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setSearching(false);
      });

    return () => { isMounted = false; };
  }, [debouncedSearchCustomer]);

  // Đã chuyển sang search backend

  useEffect(() => {
    if (soLuongNguoi <= 1) {
      setCompanions([]);
      setCompanionErrors({});
    } else {
      const needed = soLuongNguoi - 1;
      setCompanions(prev => {
        if (prev.length === needed) return prev;
        if (prev.length < needed) {
          const extras = Array.from({ length: needed - prev.length }, () => ({
            hoTen: "", soDienThoai: "", phai: "Nam", cccd: "", quocTich: ""
          }));
          return [...prev, ...extras];
        }
        return prev.slice(0, needed);
      });
    }
  }, [soLuongNguoi]);

  const handleCheckRooms = async () => {
    setCheckingRooms(true);
    setSuggestedRooms([]);
    setSelectedRoomId(null);
    try {
      const rooms = await getAvailableRooms({
        loaiPhong: roomType,
        khuVuc: area,
        mucGia: Number(parseVNDInput(budget)),
        soLuongNguoi: Number(soLuongNguoi),
      });
      setSuggestedRooms(rooms ?? []);
      if (!rooms || rooms.length === 0) {
        addToast({ message: "Không tìm thấy phòng phù hợp với tiêu chí.", type: "error" });
      }
    } catch {
      addToast({ message: "Không thể kiểm tra phòng. Vui lòng thử lại.", type: "error" });
    } finally {
      setCheckingRooms(false);
    }
  };

  const renderHighlightedText = (text: string, query: string) => {
    if (!query) return text;
    // Escape special regex characters to avoid crashes
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="text-orange-600 font-bold">{part}</span>
            : part
        )}
      </span>
    );
  };

  const handleCreate = async () => {
    // Ưu tiên dùng ID đã lưu nếu có, nếu không thì parse từ chuỗi
    let cid = selectedCustomerId;
    if (!cid && searchCustomer.includes(" - ")) {
      cid = searchCustomer.split(" - ")[0]?.trim();
    }

    if (!cid) {
      addToast({ message: "Vui lòng chọn khách hàng hợp lệ từ danh sách", type: "error" });
      return;
    }
    
    // Nếu cid không có trong danh sách prop, có thể nó vừa được tạo. 
    // Chúng ta sẽ tin tưởng ID nếu nó bắt đầu bằng KH (prefix của backend)
    const existsInList = customers.some(c => c.maKhachHang === cid);
    if (!existsInList && !cid.startsWith("KH")) {
      addToast({ message: "Khách hàng không hợp lệ. Vui lòng chọn lại.", type: "error" });
      return;
    }
    
    try {
      setLoading(true);
      // Validate companions
      if (companions.length > 0) {
        const errors: Record<number, { hoTen?: string; soDienThoai?: string }> = {};
        companions.forEach((c, i) => {
          const err: { hoTen?: string; soDienThoai?: string } = {};
          if (!c.hoTen.trim()) err.hoTen = `Họ tên người đi cùng ${i + 1} không được để trống`;
          if (!c.soDienThoai.trim()) err.soDienThoai = `Số điện thoại người đi cùng ${i + 1} không được để trống`;
          if (Object.keys(err).length > 0) errors[i] = err;
        });
        if (Object.keys(errors).length > 0) {
          setCompanionErrors(errors);
          addToast({ message: "Vui lòng điền đầy đủ thông tin người đi cùng.", type: "error" });
          setLoading(false);
          return;
        }
      }

      await createRequest({
        khachHangYeuCau: cid,
        nhanVienPhuTrach: null,
        soLuongNguoi: Number(soLuongNguoi),
        gioiTinhYeuCau: gioiTinh,
        thoiGianBatDauThueDuKien: thoiGianBatDauThue,
        thoiGianBanGiaoPhongDuKien: thoiGianBanGiao,
        coDieuHoa,
        khuVuc: area,
        mucGiaMongMuon: Number(parseVNDInput(budget)),
        coBaiGuiXe,
        cacTieuChiKhac: note,
        trangThaiYeuCau: "Yêu cầu mới",
        thoiHanThue: thoiHanThue ?? undefined,
        maPhongDeXuat: selectedRoomId ?? undefined,
        thanhVienList: companions.length > 0 ? companions.map(c => ({
          hoTen: c.hoTen,
          soDienThoai: c.soDienThoai,
          phai: c.phai || null,
          cccd: c.cccd || null,
          quocTich: c.quocTich || null,
        })) : undefined,
      } as any);
      addToast({ message: "Tạo yêu cầu thuê thành công!", type: "success" });
      // Reset form
      setSearchCustomer("");
      setSelectedCustomerId(null);
      setRoomType("Ghép giường");
      setSoLuongNguoi(1);
      setGioiTinh("Nam");
      setArea("Q.7");
      setBudget(formatVNDInput("1500000"));
      setNote("");
      setThoiGianBatDauThue(new Date().toISOString().split('T')[0]);
      setThoiGianBanGiao(new Date().toISOString().split('T')[0]);
      setCoDieuHoa(true);
      setCoBaiGuiXe(true);
      setThoiHanThue(null);
      setCompanions([]);
      setCompanionErrors({});
      setSuggestedRooms([]);
      setSelectedRoomId(null);
      onSuccess();
    } catch (e: any) {
      addToast({ message: "Lỗi khi tạo yêu cầu: " + e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
      {showCreateCustomerModal && (
        <CreateCustomerModal 
          onClose={() => setShowCreateCustomerModal(false)}
          onSuccess={(newCus) => {
            setShowCreateCustomerModal(false);
            const fullText = `${newCus.maKhachHang} - ${newCus.hoTen} - ${newCus.soDienThoai}`;
            setSearchCustomer(fullText);
            setSelectedCustomerId(newCus.maKhachHang);
            reloadCustomers();
          }}
        />
      )}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full max-w-3xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 text-orange-600">
            <Plus size={18} />
          </div>
          Tạo Yêu Cầu Thuê Mới
        </h3>
        <p className="text-sm text-slate-500 mt-1 pl-10">Tạo mới yêu cầu và ghi trực tiếp vào hệ thống cơ sở dữ liệu.</p>
      </div>

      <div className="space-y-5">
        <div className="relative">
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Khách hàng yêu cầu *</label>
          <div className="relative">
            <div className="relative group">
              <input 
                value={searchCustomer} 
                onChange={e => {
                  const val = e.target.value;
                  setSearchCustomer(val);
                  // Nếu người dùng xóa bớt hoặc gõ mới (làm mất định dạng " - "), 
                  // reset ID đã chọn để ép họ phải chọn lại từ dropdown hoặc tạo mới
                  if (!val.includes(" - ")) {
                    setSelectedCustomerId(null);
                  }
                  setShowDropdown(true);
                }} 
                onFocus={() => setShowDropdown(true)}
                placeholder={customers.length === 0 ? "Đang tải danh sách khách hàng..." : "Tìm theo Tên, Mã hoặc SĐT... (VD: KH-001)"}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              {searching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)} 
                />
                <div className="absolute top-full left-0 right-0 mt-2 z-20 overflow-hidden bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto p-1.5 flex flex-col">
                    {/* Danh sách kết quả */}
                    {customerOptions.map(c => (
                      <button
                        key={c.maKhachHang}
                          onClick={() => {
                            const fullText = `${c.maKhachHang} - ${c.hoTen} - ${c.soDienThoai}`;
                            setSearchCustomer(fullText);
                            setSelectedCustomerId(c.maKhachHang);
                            setShowDropdown(false);
                          }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition-all text-left group border border-transparent hover:border-orange-100"
                      >
                        <Avatar initials={c.hoTen?.split(" ").pop()?.charAt(0) || "K"} size={8} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate group-hover:text-orange-600">
                            {renderHighlightedText(c.hoTen || "---", searchCustomer)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[0.7rem] text-slate-500">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                              {renderHighlightedText(c.maKhachHang || "---", searchCustomer)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Phone size={10} />
                              {renderHighlightedText(c.soDienThoai || "---", searchCustomer)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-orange-400 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                    {/* Thông báo khi không tìm thấy */}
                    {!searching && customerOptions.length === 0 && searchCustomer && !searchCustomer.includes(" - ") && (
                      <div className="p-4 text-center">
                        <div className="text-sm text-slate-500 mb-3">Không tìm thấy khách hàng "{searchCustomer}"</div>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            setShowCreateCustomerModal(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 hover:text-orange-700 transition-colors border border-dashed border-orange-300"
                        >
                          <Plus size={16} /> Thêm khách hàng mới
                        </button>
                      </div>
                    )}

                    {/* Nếu đang gõ mà chưa ra kết quả và cũng chưa báo trống (ví dụ searchCustomer rỗng) */}
                    {!searchCustomer && customers.length > 0 && (
                      <div className="p-4 text-center text-xs text-slate-400 italic">
                        Nhập thông tin khách hàng để tìm kiếm...
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại phòng</label>
            <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition">
              <option>Ghép giường</option>
              <option>Toàn phòng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Số lượng người</label>
            <input type="number" min="1" value={soLuongNguoi} onChange={e => setSoLuongNguoi(Number(e.target.value))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Giới tính</label>
            <select value={gioiTinh} onChange={e => setGioiTinh(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition">
              <option>Nam</option>
              <option>Nữ</option>
              <option>Bất kỳ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Thời hạn thuê</label>
          <select
            value={thoiHanThue ?? ""}
            onChange={e => setThoiHanThue(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
          >
            <option value="">Chọn thời hạn thuê</option>
            <option value="1">1 tháng</option>
            <option value="3">3 tháng (quý)</option>
            <option value="6">6 tháng</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày thuê dự kiến</label>
            <input type="date" value={thoiGianBatDauThue} onChange={e => setThoiGianBatDauThue(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày nhận phòng dự kiến</label>
            <input type="date" value={thoiGianBanGiao} onChange={e => setThoiGianBanGiao(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Khu vực ưu tiên</label>
            <select value={area} onChange={e => setArea(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition">
              <option>Q.1</option><option>Q.3</option><option>Q.7</option><option>Q.Bình Thạnh</option><option>Q.Tân Bình</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngân sách dự kiến (VNĐ)</label>
            <input type="text" value={budget} onChange={e => setBudget(formatVNDInput(e.target.value))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
            <input type="checkbox" checked={coDieuHoa} onChange={e => setCoDieuHoa(e.target.checked)} className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded" />
            Có điều hòa
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
            <input type="checkbox" checked={coBaiGuiXe} onChange={e => setCoBaiGuiXe(e.target.checked)} className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded" />
            Có bãi gửi xe
          </label>
        </div>

        {companions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              <span className="text-sm font-bold text-slate-700">Thông tin người đi cùng ({companions.length} người)</span>
            </div>
            {companions.map((c, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Người đi cùng {i + 1}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      value={c.hoTen}
                      onChange={e => {
                        const updated = [...companions];
                        updated[i] = { ...updated[i], hoTen: e.target.value };
                        setCompanions(updated);
                        if (companionErrors[i]?.hoTen) {
                          const errs = { ...companionErrors };
                          delete errs[i]?.hoTen;
                          setCompanionErrors(errs);
                        }
                      }}
                      maxLength={50}
                      placeholder="Nguyễn Văn B"
                      className={`w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition text-sm ${companionErrors[i]?.hoTen ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {companionErrors[i]?.hoTen && <p className="text-xs text-red-500 mt-1">{companionErrors[i].hoTen}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      value={c.soDienThoai}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 10) {
                          const updated = [...companions];
                          updated[i] = { ...updated[i], soDienThoai: val };
                          setCompanions(updated);
                          if (companionErrors[i]?.soDienThoai) {
                            const errs = { ...companionErrors };
                            delete errs[i]?.soDienThoai;
                            setCompanionErrors(errs);
                          }
                        }
                      }}
                      maxLength={10}
                      placeholder="09xxxxxxxx"
                      className={`w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition text-sm ${companionErrors[i]?.soDienThoai ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {companionErrors[i]?.soDienThoai && <p className="text-xs text-red-500 mt-1">{companionErrors[i].soDienThoai}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={c.phai}
                      onChange={e => { const updated = [...companions]; updated[i] = { ...updated[i], phai: e.target.value }; setCompanions(updated); }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition text-sm"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CCCD (Không bắt buộc)</label>
                    <input
                      value={c.cccd}
                      onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); if (val.length <= 12) { const updated = [...companions]; updated[i] = { ...updated[i], cccd: val }; setCompanions(updated); } }}
                      maxLength={12}
                      placeholder="01234..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none transition text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú tiêu chí khác</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Nhập thêm yêu cầu của khách..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" rows={3}></textarea>
        </div>

        {/* Kiểm tra phòng khả dụng */}
        <div>
          <button
            type="button"
            onClick={handleCheckRooms}
            disabled={checkingRooms || !roomType || !area || !budget || !soLuongNguoi}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-orange-300 text-orange-600 font-bold text-sm hover:bg-orange-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Building2 size={16} />
            {checkingRooms ? "Đang kiểm tra..." : "Kiểm tra phòng phù hợp"}
          </button>

          {suggestedRooms.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {suggestedRooms.length} phòng phù hợp — chọn 1 để gợi ý lịch xem
                </div>
                {suggestedRooms.length > 6 && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <button
                      type="button"
                      disabled={roomPage === 0}
                      onClick={() => setRoomPage(p => Math.max(0, p - 1))}
                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      ‹
                    </button>
                    <span className="px-1 font-bold">{roomPage + 1}/{Math.ceil(suggestedRooms.length / 6)}</span>
                    <button
                      type="button"
                      disabled={roomPage >= Math.ceil(suggestedRooms.length / 6) - 1}
                      onClick={() => setRoomPage(p => p + 1)}
                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedRooms.slice(roomPage * 6, roomPage * 6 + 6).map(room => (
                  <button
                    key={room.maPhong}
                    type="button"
                    onClick={() => setSelectedRoomId(prev => prev === room.maPhong ? null : room.maPhong)}
                    className={`p-3 rounded-xl border-2 text-left transition ${
                      selectedRoomId === room.maPhong
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-800">{room.maPhong}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {room.giaThuePhong ? `${Number(room.giaThuePhong).toLocaleString('vi-VN')}đ/tháng` : '—'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Sức chứa: {room.sucChuaToiDa ?? '—'} · {room.trangThai}
                    </div>
                  </button>
                ))}
              </div>
              {selectedRoomId && (
                <div className="text-xs text-orange-600 font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Đã chọn phòng {selectedRoomId} — sẽ gợi ý khi tạo lịch xem
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button onClick={handleCreate} disabled={loading || !searchCustomer} className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:brightness-110 transition shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? "Đang xử lý..." : <><CheckCircle size={18} /> Xác nhận Tạo yêu cầu</>}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SaleRequests() {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | ReqStatus>("Tất cả");
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [chotDoneId, setChotDoneId] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<RentalRequest | null>(null);
  const [statusCountsMap, setStatusCountsMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    items: rawRequests,
    loading: loadingRequests,
    error: requestsError,
    reload: reloadRequests,
    page, setPage,
    size, setSize,
    totalElements, totalPages
  } = usePagedList<Request>(getRequests, 10, {
    trangThaiYeuCau: statusFilter === "Tất cả" ? undefined : statusFilter,
    search: debouncedSearch || undefined
  });

  useEffect(() => {
    getRequestStatusCounts().then(data => setStatusCountsMap(data || {}));
  }, [reloadRequests]);

  const {
    items: customers,
    loading: loadingCustomers,
    reload: reloadCustomers,
  } = usePagedList<Customer>(getCustomers, 500);

  const {
    items: rawAppointments,
  } = usePagedList<Appointment>(getAppointments, 10, {
    search: debouncedSearch || undefined
  });

  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [c.maKhachHang, c]));
  }, [customers]);

  const appointmentMap = useMemo(() => {
    const map = new Map<string, Appointment>();

    rawAppointments.forEach((appointment) => {
      if (appointment.maYeuCau) {
        map.set(appointment.maYeuCau, appointment);
      }
    });

    return map;
  }, [rawAppointments]);

  const requests = useMemo<RentalRequest[]>(() => {
    const formatDate = (value: string | null) => {
      if (!value) return "—";
      const [year, month, day] = value.split("-");
      if (!year || !month || !day) return value;
      return `${day}/${month}/${year}`;
    };

    const formatTime = (value: string | null | undefined) => {
      if (!value) return null;
      return value.length >= 5 ? value.slice(0, 5) : value;
    };

    const formatSchedule = (date: string | null | undefined, time: string | null | undefined) => {
      if (!date && !time) return null;

      const formattedDate = formatDate(date ?? null);
      const formattedTime = formatTime(time);

      if (formattedDate === "—") {
        return formattedTime ?? null;
      }

      return formattedTime ? `${formattedDate} ${formattedTime}` : formattedDate;
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

    return rawRequests
      .map((request) => {
      const customer = request.khachHang || (request.khachHangYeuCau ? customerMap.get(request.khachHangYeuCau) : undefined);
      const customerName = customer?.hoTen ?? request.khachHangYeuCau ?? "Khách chưa rõ";
      const appointment = request.maYeuCau ? appointmentMap.get(request.maYeuCau) : undefined;
      const matchedAppointment = appointment ?? undefined;

      return {
        id: request.maYeuCau,
        customer: customerName,
        avatar: getInitials(customerName),
        phone: customer?.soDienThoai ?? "—",
        roomType: request.soLuongNguoi && request.soLuongNguoi > 1 ? "Toàn phòng" : "Ghép giường",
        area: request.khuVuc ?? "Chưa rõ khu vực",
        budget: formatBudget(request.mucGiaMongMuon),
        status: toStatus(request),
        isOverdue: request.isOverdue,
        created: formatDate(request.thoiGianBatDauThueDuKien ?? request.thoiGianBanGiaoPhongDuKien),
        room: matchedAppointment?.maPhong ?? null,
        showingDate: matchedAppointment ? formatSchedule(matchedAppointment.ngayHen, matchedAppointment.thoiGianHen) : null,
        note: request.cacTieuChiKhac,
        suggestedRoom: request.maPhongDeXuat ?? null,
      };
    });
  }, [rawRequests, customerMap, appointmentMap]);

  const paginatedData = requests;

  const handleChot = async (id: string) => {
    try {
      await updateRequest(id, { trangThaiYeuCau: "Yêu cầu mới" });
      setChotDoneId(id);
      addToast({ message: "Ghi nhận chốt phòng thành công!", type: "success" });
      reloadRequests();
      setTimeout(() => setChotDoneId(null), 2000);
    } catch (e: any) {
      addToast({ message: "Lỗi khi chốt phòng: " + e.message, type: "error" });
    }
  };

  const statusCounts = STATUS_STEPS.map(s => ({ status: s, count: statusCountsMap[s] || 0 }));

  return (
    <div>
      {detailRequest && (
        <RequestDetailModal
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
        />
      )}
      {/* Page header with Tabs */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${O}15` }}>
                <Home size={14} style={{ color: O }} />
              </div>
              <h2 style={{ fontWeight: 900, fontSize: "1.35rem", color: "#1E293B", letterSpacing: "-0.02em" }}>
                Yêu cầu thuê & Chốt phòng
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748B", paddingLeft: "2.25rem" }}>
              Quản lý quy trình chăm sóc khách hàng và lập yêu cầu thuê phòng.
            </p>
          </div>
          {activeTab === "list" && (
            <button onClick={reloadRequests}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-slate-700 transition hover:bg-slate-100 bg-white border border-slate-200"
              style={{ fontWeight: 700, fontSize: "0.85rem" }}>
              <Plus size={16} /> Tải lại dữ liệu
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "list" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Quản lý yêu cầu & Chốt phòng
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "create" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            + Lập yêu cầu mới
          </button>
        </div>
      </div>

      {activeTab === "create" ? (
        <CreateRequestTab 
          customers={customers} 
          reloadCustomers={reloadCustomers}
          onSuccess={() => {
            reloadRequests();
            addToast({ message: "Tạo yêu cầu thuê thành công!", type: "success" });
            setActiveTab("list");
          }} 
        />
      ) : (
        <>
          {/* Pipeline status strip */}
          <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
            {statusCounts.map((s, i) => {
              const cfg = STATUS_CFG[s.status];
              return (
                <div key={s.status} className="relative">
                  <div className="px-3 py-2.5 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.status}</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#1E293B", lineHeight: 1.1, marginTop: 2 }}>{s.count}</div>
                  </div>
                  {i < statusCounts.length - 1 && (
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
                  placeholder="Tìm theo tên khách hoặc mã yêu cầu..."
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
                  {["Khách hàng", "Yêu cầu", "Trạng thái", "Hành động"].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((req, i) => {
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
                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: "0.72rem", fontWeight: 700 }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                            {req.status}
                          </span>
                          {req.isOverdue && (
                            <span className="inline-flex items-center gap-1 mt-1 text-red-600" style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                              <AlertTriangle size={10} /> Quá hạn ưu tiên xử lý
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {canChot && (
                            <div className="relative"
                              onMouseEnter={() => setTooltipId(req.id)}
                              onMouseLeave={() => setTooltipId(null)}>
                              <button onClick={() => handleChot(req.id)}
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
            {paginatedData.length === 0 && (
              <div className="flex flex-col items-center py-12">
                <Search size={28} style={{ color: "#CBD5E1" }} className="mb-2" />
                <div style={{ color: "#64748B", fontSize: "0.88rem" }}>
                  {statusFilter === "Tất cả"
                    ? "Không tìm thấy yêu cầu nào"
                    : `Không có yêu cầu ở trạng thái "${statusFilter}"`}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
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
        </>
      )}
    </div>
  );
}
