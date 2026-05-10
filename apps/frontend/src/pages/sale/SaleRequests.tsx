import { useMemo, useState, useEffect } from "react";
import {
  Plus, Search, Filter, ChevronRight, Home, MapPin, DollarSign,
  Calendar, CheckCircle, Clock, AlertTriangle, X, ArrowRight,
  Flame, BedDouble, SlidersHorizontal, User, Phone, Mail,
} from "lucide-react";
import { usePagedList } from "../../hooks/usePagedList";
import { getCustomers, getRequests, updateRequest, createRequest, getUsers, getAppointments, getAppointmentByRequest } from "../../services/api";
import { Pagination } from "../../components/Pagination";
import type { Appointment, Customer, Request, Employee } from "../../types";

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

// ── Mock Data ──────────────────────────────────────────────────────────────
const INIT_REQUESTS: RentalRequest[] = [
  { id: "rq1", customer: "Trần Minh Khôi", avatar: "MK", phone: "0912 345 678", roomType: "Ghép giường", area: "Q.7", budget: "1.5 – 2.0M", status: "Đã xem phòng", created: "24/04/2026", room: "A102", showingDate: "26/04/2026" },
  { id: "rq2", customer: "Nguyễn Thị Hoa", avatar: "TH", phone: "0918 765 432", roomType: "Toàn phòng", area: "Q.1", budget: "3.0 – 4.0M", status: "Đã lên lịch xem", created: "25/04/2026", room: "B203", showingDate: "29/04/2026" },
  { id: "rq3", customer: "Lê Văn Phú", avatar: "VP", phone: "0905 123 456", roomType: "Ghép giường", area: "Q.7", budget: "1.2 – 1.8M", status: "Yêu cầu mới", created: "27/04/2026", room: null, showingDate: null },
  { id: "rq4", customer: "Phạm Thị Ngân", avatar: "TN", phone: "0901 234 567", roomType: "Toàn phòng", area: "Q.3", budget: "2.5 – 3.5M", status: "Đã xem phòng", created: "22/04/2026", room: "A103", showingDate: "25/04/2026" },
  { id: "rq5", customer: "Hoàng Văn Dũng", avatar: "VD", phone: "0908 654 321", roomType: "Ghép giường", area: "Q.7", budget: "1.0 – 1.5M", status: "Chờ phê duyệt", created: "20/04/2026", room: "C301", showingDate: "23/04/2026" },
  { id: "rq6", customer: "Vũ Minh Anh", avatar: "MA", phone: "0916 789 012", roomType: "Toàn phòng", area: "Q.1", budget: "3.5 – 4.5M", status: "Đặt cọc thành công", created: "18/04/2026", room: "B201", showingDate: "21/04/2026" },
  { id: "rq7", customer: "Đỗ Thị Thanh", avatar: "TT", phone: "0903 456 789", roomType: "Ghép giường", area: "Q.7", budget: "1.2 – 1.6M", status: "Yêu cầu mới", created: "28/04/2026", room: null, showingDate: null },
];

const AVAILABLE_ROOMS = [
  { code: "A102", type: "Ghép giường", floor: 1, price: "1,800,000", area: "22m²", status: "Trống" },
  { code: "B204", type: "Ghép giường", floor: 2, price: "1,600,000", area: "20m²", status: "Trống" },
  { code: "C301", type: "Toàn phòng", floor: 3, price: "3,200,000", area: "28m²", status: "Trống" },
  { code: "A105", type: "Toàn phòng", floor: 1, price: "2,900,000", area: "25m²", status: "Trống" },
];

const STATUS_CFG: Record<ReqStatus, { bg: string; color: string; dot: string; border: string }> = {
  "Yêu cầu mới": { bg: "#EEF2FF", color: "#4338CA", dot: "#6366F1", border: "#C7D2FE" },
  "Đã lên lịch xem": { bg: "#F5F3FF", color: "#7C3AED", dot: "#8B5CF6", border: "#DDD6FE" },
  "Đã xem phòng": { bg: "#FFF7ED", color: "#C2410C", dot: "#F97316", border: "#FED7AA" },
  "Chờ phê duyệt": { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B", border: "#FDE68A" },
  "Đặt cọc thành công": { bg: "#ECFDF5", color: "#065F46", dot: "#10B981", border: "#6EE7B7" },
};

const STATUS_STEPS: ReqStatus[] = ["Đã lên lịch xem", "Đã xem phòng"];
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
              { label: "Phòng đề xuất", value: loadingAppt ? "Đang tải..." : (apptRoom ?? "Chưa phân phòng") },
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



function CreateRequestTab({
  customers,
  onSuccess
}: {
  customers: Customer[];
  onSuccess: () => void;
}) {
  const [searchCustomer, setSearchCustomer] = useState("");
  const [roomType, setRoomType] = useState("Ghép giường");
  const [soLuongNguoi, setSoLuongNguoi] = useState(1);
  const [gioiTinh, setGioiTinh] = useState("Nam");
  const [area, setArea] = useState("Q.7");
  const [budget, setBudget] = useState("1500000");
  const [note, setNote] = useState("");
  
  const [thoiGianBatDauThue, setThoiGianBatDauThue] = useState(() => new Date().toISOString().split('T')[0]);
  const [thoiGianBanGiao, setThoiGianBanGiao] = useState(() => new Date().toISOString().split('T')[0]);
  const [coDieuHoa, setCoDieuHoa] = useState(true);
  const [coBaiGuiXe, setCoBaiGuiXe] = useState(true);

  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const cid = searchCustomer.split(" - ")[0]?.trim();
    if (!cid || !customers.some(c => c.maKhachHang === cid)) {
      return alert("Vui lòng chọn khách hàng hợp lệ từ danh sách");
    }
    
    try {
      setLoading(true);
      await createRequest({
        khachHangYeuCau: cid,
        nhanVienPhuTrach: null,
        soLuongNguoi: Number(soLuongNguoi),
        gioiTinhYeuCau: gioiTinh,
        thoiGianBatDauThueDuKien: thoiGianBatDauThue,
        thoiGianBanGiaoPhongDuKien: thoiGianBanGiao,
        coDieuHoa,
        khuVuc: area,
        mucGiaMongMuon: Number(budget),
        coBaiGuiXe,
        cacTieuChiKhac: note,
        trangThaiYeuCau: "Mới tạo",
      } as any);
      alert("Tạo yêu cầu thuê thành công!");
      onSuccess();
    } catch (e: any) {
      alert("Lỗi khi tạo: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
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
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Khách hàng yêu cầu *</label>
          {customers.length === 0 ? (
            <div className="text-sm text-slate-500 italic px-3 py-2 border rounded-xl bg-slate-50">Đang tải danh sách khách hàng...</div>
          ) : (
            <>
              <input 
                list="customers-list"
                value={searchCustomer} 
                onChange={e => setSearchCustomer(e.target.value)} 
                placeholder="Ví dụ: KH-001 - Nguyễn Văn A"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
              />
              <datalist id="customers-list">
                {customers.map(c => <option key={c.maKhachHang} value={`${c.maKhachHang} - ${c.hoTen} - ${c.soDienThoai}`} />)}
              </datalist>
            </>
          )}
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
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" />
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

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú tiêu chí khác</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Nhập thêm yêu cầu của khách..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition" rows={3}></textarea>
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | ReqStatus>("Tất cả");
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [chotDoneId, setChotDoneId] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<RentalRequest | null>(null);

  const [localPage, setLocalPage] = useState(0);
  const [localSize, setLocalSize] = useState(10);

  const {
    items: rawRequests,
    loading: loadingRequests,
    error: requestsError,
    reload: reloadRequests,
  } = usePagedList<Request>(getRequests, 10000, {
    trangThaiYeuCau: statusFilter === "Tất cả" ? undefined : statusFilter,
  });

  const {
    items: customers,
    loading: loadingCustomers,
    reload: reloadCustomers,
  } = usePagedList<Customer>(getCustomers, 500);

  const { items: rawEmployees } = usePagedList<any>(getUsers, 500);
  const employees = rawEmployees as Employee[];

  const { items: appointments } = usePagedList<any>(getAppointments, 10000);

  const customerMap = useMemo(() => {
    return new Map(customers.map((c) => [c.maKhachHang, c]));
  }, [customers]);

  const appointmentMap = useMemo(() => {
    const map = new Map<string, Appointment>();

    appointments.forEach((appointment) => {
      if (appointment.maYeuCau) {
        map.set(appointment.maYeuCau, appointment);
      }
    });

    return map;
  }, [appointments]);

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
      .filter((request) => {
        const status = request.trangThaiYeuCau?.trim() as ReqStatus | undefined;
        return status && VALID_STATUS_SET.has(status);
      })
      .map((request) => {
      const customer = request.khachHangYeuCau ? customerMap.get(request.khachHangYeuCau) : undefined;
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
        created: formatDate(request.thoiGianBatDauThueDuKien ?? request.thoiGianBanGiaoPhongDuKien),
        room: matchedAppointment?.maPhong ?? null,
        showingDate: matchedAppointment ? formatSchedule(matchedAppointment.ngayHen, matchedAppointment.thoiGianHen) : null,
        note: request.cacTieuChiKhac,
      };
    });
  }, [rawRequests, customerMap, appointmentMap]);

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === "Tất cả" ? true : r.status === statusFilter;
    const matchesSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / localSize);
  const paginatedData = filtered.slice(localPage * localSize, (localPage + 1) * localSize);

  const handleChot = async (id: string) => {
    try {
      await updateRequest(id, { trangThaiYeuCau: "Yêu cầu mới" });
      setChotDoneId(id);
      reloadRequests();
      setTimeout(() => setChotDoneId(null), 2000);
    } catch {}
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
          onSuccess={() => {
            reloadRequests();
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
                    setLocalPage(0);
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
                currentPage={localPage}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={localSize}
                onPageChange={setLocalPage}
                onPageSizeChange={(newSize) => {
                  setLocalSize(newSize);
                  setLocalPage(0);
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
          </div>
        </>
      )}
    </div>
  );
}
