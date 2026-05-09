import { useEffect, useMemo, useState } from "react";
import { CalendarDays, FileText, BedDouble, ArrowRight, User, Phone, MapPin, TrendingUp, AlertCircle, Clock, Home } from "lucide-react";
import { useNavigate } from "react-router";
import { getAppointments, getCustomers, getDeposits, getRequests, getUsers } from "../../services/api";
import type { Appointment, Customer, Deposit, Employee, Request } from "../../types";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Shown: "bg-purple-100 text-purple-700",
  Deposited: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<string, string> = {
  Pending: "Chờ xử lý", Scheduled: "Đã hẹn", Shown: "Đã xem",
  Deposited: "Đã cọc", Cancelled: "Huỷ",
};

export default function SaleDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { today, yesterday, currentMonth } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yy = yest.getFullYear();
    const ym = String(yest.getMonth() + 1).padStart(2, "0");
    const yd = String(yest.getDate()).padStart(2, "0");
    
    return {
      today: `${y}-${m}-${d}`,
      yesterday: `${yy}-${ym}-${yd}`,
      currentMonth: now.getMonth() + 1
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [requestsRes, appointmentsRes, depositsRes, customersRes, usersRes] = await Promise.all([
          getRequests({ page: 0, size: 500 }),
          getAppointments({ page: 0, size: 500 }),
          getDeposits({ page: 0, size: 500 }),
          getCustomers({ page: 0, size: 500 }),
          getUsers({ page: 0, size: 500 }),
        ]);

        if (!active) return;
        setRequests(requestsRes.data ?? []);
        setAppointments(appointmentsRes.data ?? []);
        setDeposits(depositsRes.data ?? []);
        setCustomers(customersRes.data ?? []);
        setEmployees((usersRes.data ?? []).filter((item): item is Employee => "maNhanVien" in item));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Không tải được dữ liệu dashboard");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.maKhachHang, c])), [customers]);
  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.maNhanVien, e])), [employees]);

  const toDashboardStatus = (status?: string | null): "Pending" | "Scheduled" | "Shown" | "Deposited" | "Cancelled" => {
    switch (status?.trim()) {
      case "Yêu cầu mới":
        return "Pending";
      case "Đã lên lịch xem":
        return "Scheduled";
      case "Đã xem phòng":
        return "Shown";
      case "Đặt cọc thành công":
        return "Deposited";
      case "Đã hủy":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  const todayAppointments = appointments
    .filter((a) => a.ngayHen === today)
    .map((a) => ({
      id: a.maLichHen,
      time: a.thoiGianHen?.slice(0, 5) ?? "--:--",
      clientName: customerMap.get(a.khachHangXem ?? "")?.hoTen ?? a.khachHangXem ?? "Khách hàng",
      rentalMode: "Shared Bed" as const,
      targetAssetLabel: `Lịch hẹn ${a.maLichHen}`,
      staffName: employeeMap.get(a.nhanVienPhuTrach ?? "")?.hoTen ?? a.nhanVienPhuTrach ?? "--",
      status: a.trangThaiHen === "Đã xem" ? "Shown" : a.trangThaiHen === "Đã hủy" ? "Cancelled" : "Pending",
      notes: "",
    }));

  const mappedRequests = requests.map((r) => ({
    id: r.maYeuCau,
    date: r.thoiGianBatDauThueDuKien ?? r.thoiGianBanGiaoPhongDuKien ?? "",
    clientName: customerMap.get(r.khachHangYeuCau ?? "")?.hoTen ?? r.khachHangYeuCau ?? "Khách hàng",
    phone: customerMap.get(r.khachHangYeuCau ?? "")?.soDienThoai ?? "--",
    rentalMode: r.soLuongNguoi && r.soLuongNguoi > 1 ? "Whole Room" as const : "Shared Bed" as const,
    headcount: r.soLuongNguoi ?? 1,
    gender: r.gioiTinhYeuCau === "Nam" ? "Male" : r.gioiTinhYeuCau === "Nữ" ? "Female" : "Any",
    budget: r.mucGiaMongMuon ? `${Math.round(Number(r.mucGiaMongMuon) / 1000000 * 10) / 10}M` : "Chưa cập nhật",
    status: toDashboardStatus(r.trangThaiYeuCau),
    criteria: r.cacTieuChiKhac ? [r.cacTieuChiKhac] : [],
    note: r.cacTieuChiKhac ?? "",
  }));

  const pendingRequests = mappedRequests.filter((r) => r.status === "Pending" || r.status === "Scheduled");
  const newestPendingRequests = [...mappedRequests]
    .filter((r) => r.status === "Pending")
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const visiblePendingRequests = newestPendingRequests.slice(0, 5);
  const depositedToday = deposits.filter((d) => d.ngayLap === today);

  const yesterdayAppointments = appointments.filter(a => a.ngayHen === yesterday);
  const aptTrend = todayAppointments.length - yesterdayAppointments.length;
  const aptTrendStr = aptTrend >= 0 ? `+${aptTrend} so với hôm qua` : `${aptTrend} so với hôm qua`;

  const yesterdayDeposits = deposits.filter(d => d.ngayLap === yesterday);
  const depTrend = depositedToday.length - yesterdayDeposits.length;
  const depTrendStr = depTrend >= 0 ? `↑ ${depTrend} so với hôm qua` : `↓ ${Math.abs(depTrend)} so với hôm qua`;

  const stats = [
    {
      label: "Lịch xem hôm nay",
      value: todayAppointments.length,
      icon: CalendarDays,
      color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
      sub: `${todayAppointments.filter(a => a.status === "Shown").length} đã xem xong`,
      trend: aptTrendStr,
    },
    {
      label: "Yêu cầu đang xử lý",
      value: pendingRequests.length,
      icon: FileText,
      color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
      sub: `${mappedRequests.filter(r => r.status === "Pending").length} mới chờ phân công`,
      trend: "Cần follow-up sớm",
    },
    {
      label: "Giường/Phòng đặt cọc hôm nay",
      value: depositedToday.length,
      icon: BedDouble,
      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
      sub: `${depositedToday.length} hồ sơ cọc phát sinh hôm nay`,
      trend: depTrendStr,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-5 shadow-sm`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{stat.trend}</span>
            </div>
            <div className="text-3xl text-slate-900 mb-0.5" style={{ fontWeight: 700 }}>{stat.value}</div>
            <div className="text-sm text-slate-600" style={{ fontWeight: 500 }}>{stat.label}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Inventory at-a-glance */}
      <div className="grid grid-cols-2 gap-5">
        {/* Request funnel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Tình trạng yêu cầu tháng {currentMonth}</h2>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(["Pending","Scheduled","Shown","Deposited","Cancelled"] as const).map(status => {
              const count = mappedRequests.filter(r => r.status === status).length;
              const pct = mappedRequests.length > 0 ? Math.round((count / mappedRequests.length) * 100) : 0;
              return (
                <div key={status} className="text-center">
                  <div className={`text-2xl mb-1 ${
                    status === "Deposited" ? "text-emerald-600" : status === "Cancelled" ? "text-slate-400" :
                    status === "Pending" ? "text-amber-600" : status === "Scheduled" ? "text-blue-600" : "text-purple-600"
                  }`} style={{ fontWeight: 700 }}>{count}</div>
                  <div className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${statusColors[status]}`} style={{ fontWeight: 500, fontSize: "10px" }}>
                    {statusLabels[status]}
                  </div>
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      status === "Deposited" ? "bg-emerald-400" : status === "Cancelled" ? "bg-slate-300" :
                      status === "Pending" ? "bg-amber-400" : status === "Scheduled" ? "bg-blue-400" : "bg-purple-400"
                    }`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rental mode breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Phân loại hình thức thuê</h2>
            <BedDouble size={16} className="text-teal-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["Whole Room","Shared Bed"] as const).map(mode => {
              const reqs = mappedRequests.filter(r => r.rentalMode === mode);
              const isWhole = mode === "Whole Room";
              return (
                <div key={mode} className={`rounded-xl p-4 border ${isWhole ? "bg-violet-50 border-violet-100" : "bg-teal-50 border-teal-100"}`}>
                  <div className={`text-2xl mb-1 ${isWhole ? "text-violet-700" : "text-teal-700"}`} style={{ fontWeight: 700 }}>{reqs.length}</div>
                  <div className={`text-sm ${isWhole ? "text-violet-700" : "text-teal-700"}`} style={{ fontWeight: 600 }}>
                    {isWhole ? "🏠 Toàn phòng" : "🛏 Ghép giường"}
                  </div>
                  <div className={`text-xs mt-1 ${isWhole ? "text-violet-500" : "text-teal-500"}`}>
                    {reqs.filter(r => r.status === "Deposited").length} đã đặt cọc
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            {(["Male","Female","Any"] as const).map(g => {
              const count = mappedRequests.filter(r => r.gender === g).length;
              return (
                <div key={g} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-16">{g === "Male" ? "Nam" : g === "Female" ? "Nữ" : "Bất kỳ"}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${g === "Male" ? "bg-blue-400" : g === "Female" ? "bg-pink-400" : "bg-slate-300"}`}
                      style={{ width: `${mappedRequests.length > 0 ? (count / mappedRequests.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-4 text-right" style={{ fontWeight: 600 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-5 gap-5">
        {/* Today's schedule – timeline */}
        <div className="col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Lịch xem hôm nay</h2>
              <p className="text-xs text-slate-400 mt-0.5">{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
            </div>
            <button onClick={() => navigate("/sale/appointments")}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700" style={{ fontWeight: 500 }}>
              Xem tất cả <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-5">
            {loading && <div className="text-center py-10 text-slate-400 text-sm">Đang tải dữ liệu lịch hẹn...</div>}
            {error && <div className="text-center py-10 text-red-500 text-sm">{error}</div>}
            {!loading && !error && (
              todayAppointments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">Không có lịch xem phòng hôm nay</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[42px] top-3 bottom-3 w-px bg-slate-100" />
                  <div className="space-y-4">
                    {todayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => (
                      <div key={apt.id} className="flex gap-4 items-start group">
                        <div className="w-[42px] flex-shrink-0 text-right">
                          <span className="text-xs text-slate-500" style={{ fontWeight: 600 }}>{apt.time}</span>
                        </div>
                        <div className={`relative z-10 w-3 h-3 rounded-full flex-shrink-0 mt-1 border-2 border-white ${
                          apt.status === "Shown" ? "bg-emerald-400" :
                          apt.status === "Cancelled" ? "bg-red-400" : "bg-blue-400"
                        }`} />
                        <div className={`flex-1 rounded-xl p-3.5 border transition-all ${
                          apt.status === "Shown" ? "bg-emerald-50 border-emerald-100" :
                          apt.status === "Cancelled" ? "bg-slate-50 border-slate-200 opacity-60" :
                          "bg-slate-50 border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50/30"
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{apt.clientName}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  apt.rentalMode === "Whole Room" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"
                                }`} style={{ fontWeight: 500 }}>
                                  {apt.rentalMode === "Whole Room" ? "🏠 Toàn phòng" : "🛏 Ghép giường"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin size={10} /> {apt.targetAssetLabel}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <User size={10} /> {apt.staffName}
                                </span>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                              apt.status === "Shown" ? "bg-emerald-100 text-emerald-700" :
                              apt.status === "Cancelled" ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-blue-700"
                            }`} style={{ fontWeight: 500 }}>
                              {apt.status === "Shown" ? "Đã xem" : apt.status === "Cancelled" ? "Huỷ" : "Chờ"}
                            </span>
                          </div>
                          {apt.notes && <div className="mt-2 text-xs text-slate-500 italic">"{apt.notes}"</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* New Requests */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Yêu cầu mới</h2>
              <p className="text-xs text-slate-400 mt-0.5">Cần follow-up ngay</p>
            </div>
            <button onClick={() => navigate("/sale/requests")}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700" style={{ fontWeight: 500 }}>
              Tất cả <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {visiblePendingRequests.map((req) => (
              <div key={req.id} className="px-5 py-3.5 hover:bg-slate-50 transition cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                      req.rentalMode === "Whole Room" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"
                    }`} style={{ fontWeight: 700 }}>
                      {req.rentalMode === "Whole Room" ? <Home size={16} /> : <BedDouble size={16} />}
                    </div>
                    <div>
                      <div className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{req.clientName}</div>
                      <div className="text-xs text-slate-400">
                          {req.rentalMode === "Whole Room" ? "Toàn phòng" : `${req.headcount} giường · ${req.gender === "Male" ? "Nam" : req.gender === "Female" ? "Nữ" : "Bất kỳ"}`}
                        {" · "}{req.budget}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[req.status]}`} style={{ fontWeight: 500 }}>
                    {statusLabels[req.status]}
                  </span>
                </div>
                {req.criteria.length > 0 && (
                  <div className="mt-1.5 ml-11 flex gap-1 flex-wrap">
                    {req.criteria.slice(0, 2).map(c => (
                      <span key={c} className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{c}</span>
                    ))}
                    {req.criteria.length > 2 && <span className="text-xs text-slate-400">+{req.criteria.length - 2}</span>}
                  </div>
                )}
                {req.note && (
                  <div className="mt-1 ml-11 text-xs text-slate-400 flex items-start gap-1">
                    <AlertCircle size={10} className="mt-0.5 flex-shrink-0 text-amber-400" /> {req.note}
                  </div>
                )}
                <div className="mt-1.5 ml-11 flex items-center gap-1.5 text-xs text-slate-400">
                  <Phone size={10} /> {req.phone}
                  <span className="mx-0.5">·</span>
                  <Clock size={10} /> {req.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
