import { useState, useEffect } from "react";
import { CalendarDays, FileText, CheckCircle, Clock, ArrowRight, User, Phone, MapPin, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { getRequests, getAppointments } from "../../services/api";
import type { Request as ApiRequest, Appointment as ApiAppointment } from "../../types";
import { useNavigate } from "react-router";

type RequestStatus = "Pending" | "Scheduled" | "Shown" | "Deposited" | "Cancelled";
type AppointmentStatus = "Pending" | "Shown" | "Cancelled";

export interface SaleRequest {
  id: string;
  date: string;
  clientName: string;
  phone: string;
  budget: string;
  roomType: "Single" | "Double" | "Triple";
  area: string;
  note: string;
  staffName: string;
  status: RequestStatus;
}

export interface ShowingAppointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  roomId: string;
  staffName: string;
  status: AppointmentStatus;
  notes?: string;
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Shown: "bg-purple-100 text-purple-700",
  Deposited: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<string, string> = {
  Pending: "Chờ xử lý",
  Scheduled: "Đã hẹn",
  Shown: "Đã xem",
  Deposited: "Đã cọc",
  Cancelled: "Huỷ",
};

function mapApiToUiRequest(req: ApiRequest): SaleRequest {
  let status: RequestStatus = "Pending";
  if (req.cacTieuChiKhac?.includes("[STATUS:Scheduled]")) status = "Scheduled";
  else if (req.cacTieuChiKhac?.includes("[STATUS:Shown]")) status = "Shown";
  else if (req.cacTieuChiKhac?.includes("[STATUS:Deposited]")) status = "Deposited";
  else if (req.cacTieuChiKhac?.includes("[STATUS:Cancelled]")) status = "Cancelled";

  return {
    id: req.maYeuCau,
    date: req.thoiGianBatDauThueDuKien || new Date().toISOString().split("T")[0],
    clientName: req.khachHangYeuCau || "Khách mới",
    phone: "Đang cập nhật...", 
    budget: req.mucGiaMongMuon ? req.mucGiaMongMuon.toString() : "Chưa rõ",
    roomType: req.soLuongNguoi === 1 ? "Single" : (req.soLuongNguoi === 2 ? "Double" : "Triple"),
    area: req.khuVuc || "Chưa rõ",
    note: req.cacTieuChiKhac?.replace(/\[STATUS:[A-Za-z]+\]/g, "").trim() || "",
    staffName: req.nhanVienPhuTrach || "Chưa rõ",
    status: status
  };
}

function mapApiToUiAppointment(apiApt: ApiAppointment): ShowingAppointment {
  const timeArray = apiApt.thoiGianHen || "00:00"; 
  const timeStr = typeof timeArray === "string" ? timeArray.slice(0, 5) : String(timeArray);
  
  let mappedStatus: AppointmentStatus = "Pending";
  if (apiApt.trangThaiHen === "Shown" || apiApt.trangThaiHen === "Cancelled") {
     mappedStatus = apiApt.trangThaiHen;
  }

  return {
    id: apiApt.maLichHen,
    date: apiApt.ngayHen || new Date().toISOString().split("T")[0],
    time: timeStr,
    clientName: apiApt.khachHangXem || "Khách ẩn danh",
    roomId: "(Nhiều phòng)", 
    staffName: apiApt.nhanVienPhuTrach || "NV",
    status: mappedStatus,
  };
}

export default function SaleDashboard() {
  const navigate = useNavigate();
  // We use a fixed date "2025-04-20" previously to match mock, but here let's actually just filter on what exists, or we keep it for demo layout.
  const today = "2025-04-20";
  
  const [saleRequests, setSaleRequests] = useState<SaleRequest[]>([]);
  const [showingAppointments, setShowingAppointments] = useState<ShowingAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getRequests(), getAppointments()])
      .then(([reqRes, aptRes]) => {
        setSaleRequests(reqRes.data.map(mapApiToUiRequest));
        setShowingAppointments(aptRes.data.map(mapApiToUiAppointment));
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 h-96">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
        <p className="text-slate-500">Đang đồng bộ dữ liệu tổng quan...</p>
      </div>
    );
  }

  // To simulate "Today" given the mock date, or if we want actual today we'd do new Date().toISOString().split('T')[0].
  // Mọi API từ nay dĩ nhiên sẽ match dựa vào database, nên nếu database có ngày khác, UI sẽ show đúng.
  // We use current Date for actual feeling, or fall back to mock's "today" if preferred, let's keep the mock string for UI consistency unless database is populated with current date.
  const todayAppointments = showingAppointments.filter(a => a.date === today || a.date === new Date().toISOString().split("T")[0]);
  const pendingRequests = saleRequests.filter(r => r.status === "Pending" || r.status === "Scheduled");
  const depositedCount = saleRequests.filter(r => r.status === "Deposited").length;

  const stats = [
    {
      label: "Lịch xem hôm nay",
      value: todayAppointments.length,
      icon: CalendarDays,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      sub: `${todayAppointments.filter(a => a.status === "Shown").length} đã xem`,
      trend: "+2 so với hôm qua",
    },
    {
      label: "Yêu cầu đang xử lý",
      value: pendingRequests.length,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      sub: `${saleRequests.filter(r => r.status === "Pending").length} mới chờ`,
      trend: "Cần follow-up sớm",
    },
    {
      label: "Đặt cọc thành công",
      value: depositedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      sub: "Tháng 4/2025",
      trend: "↑ 25% so với tháng trước",
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
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{stat.trend}</span>
            </div>
            <div className="text-3xl text-slate-900 mb-0.5" style={{ fontWeight: 700 }}>{stat.value}</div>
            <div className="text-sm text-slate-600" style={{ fontWeight: 500 }}>{stat.label}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-5 gap-5">
        {/* Left: Today's Schedule */}
        <div className="col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Lịch xem phòng hôm nay</h2>
              <p className="text-xs text-slate-400 mt-0.5">Thời gian thực tế</p>
            </div>
            <button
              onClick={() => navigate("/sale/appointments")}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              style={{ fontWeight: 500 }}
            >
              Xem tất cả <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-5 space-y-0">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm flex flex-col justify-center items-center">
                <CalendarDays className="h-10 w-10 text-slate-200 mb-2" />
                Không có lịch xem phòng hôm nay
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[42px] top-3 bottom-3 w-px bg-slate-100" />
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
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
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{apt.clientName}</span>
                              <span className={`border text-xs px-2 py-0.5 rounded-full ${
                                apt.status === "Shown" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                                apt.status === "Cancelled" ? "bg-slate-200 text-slate-500 border-slate-200" :
                                "bg-blue-100 text-blue-700 border-blue-200"
                              }`} style={{ fontWeight: 500 }}>
                                {apt.status === "Shown" ? "Đã xem" : apt.status === "Cancelled" ? "Huỷ" : "Chờ"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin size={11} /> {apt.roomId}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <User size={11} /> Bố trí: {apt.staffName}
                              </span>
                            </div>
                          </div>
                        </div>
                        {apt.notes && (
                          <div className="mt-2 text-xs text-slate-500 italic">"{apt.notes}"</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: New Requests */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Yêu cầu mới</h2>
              <p className="text-xs text-slate-400 mt-0.5">Cần follow-up ngay</p>
            </div>
            <button
              onClick={() => navigate("/sale/requests")}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
              style={{ fontWeight: 500 }}
            >
              Tất cả <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {saleRequests.filter(r => r.status === "Pending").map((req) => (
              <div key={req.id} className="px-5 py-3.5 hover:bg-slate-50 transition group cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs text-slate-600 uppercase" style={{ fontWeight: 600 }}>
                      {req.clientName?.charAt(0) || "K"}
                    </div>
                    <div>
                      <div className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{req.clientName}</div>
                      <div className="text-xs text-slate-400">{req.roomType} · {req.budget}đ</div>
                    </div>
                  </div>
                  <span className={`border text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[req.status]}`} style={{ fontWeight: 500 }}>
                    {statusLabels[req.status]}
                  </span>
                </div>
                {req.note && (
                  <div className="mt-1.5 ml-10 text-xs text-slate-400 flex items-start gap-1">
                    <AlertCircle size={10} className="mt-0.5 flex-shrink-0 text-amber-400" />
                    {req.note}
                  </div>
                )}
                <div className="mt-1.5 ml-10 flex items-center gap-1.5 text-xs text-slate-400">
                  <Phone size={10} /> {req.phone}
                  <span className="mx-1">·</span>
                  <Clock size={10} /> {req.date}
                </div>
              </div>
            ))}
            {saleRequests.filter(r => r.status === "Pending").length === 0 && (
               <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
                 <FileText className="text-slate-200 h-10 w-10 mb-2" />
                 Chưa có yêu cầu mới nào.
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick overview strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Tình trạng yêu cầu tổng thể</h2>
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {(["Pending","Scheduled","Shown","Deposited","Cancelled"] as const).map(status => {
            const count = saleRequests.filter(r => r.status === status).length;
            const pct = saleRequests.length > 0 ? Math.round((count / saleRequests.length) * 100) : 0;
            return (
              <div key={status} className="text-center">
                <div className={`text-2xl mb-1 ${
                  status === "Deposited" ? "text-emerald-600" :
                  status === "Cancelled" ? "text-slate-400" :
                  status === "Pending" ? "text-amber-600" :
                  status === "Scheduled" ? "text-blue-600" : "text-purple-600"
                }`} style={{ fontWeight: 700 }}>{count}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${statusColors[status]}`} style={{ fontWeight: 500 }}>
                  {statusLabels[status]}
                </div>
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    status === "Deposited" ? "bg-emerald-400" :
                    status === "Cancelled" ? "bg-slate-300" :
                    status === "Pending" ? "bg-amber-400" :
                    status === "Scheduled" ? "bg-blue-400" : "bg-purple-400"
                  }`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
