import { useEffect, useMemo, useState } from "react";
import { CalendarDays, FileText, BedDouble, ArrowRight, User, Phone, MapPin, TrendingUp, AlertCircle, Clock, Home } from "lucide-react";
import { useNavigate } from "react-router";
import { getSaleDashboardStats, SaleDashboardResponse } from "../../services/api";

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
  const [data, setData] = useState<SaleDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsData = await getSaleDashboardStats();
        if (!active) return;
        setData(statsData);
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

  const stats = useMemo(() => {
    if (!data) return [];
    const aptTrend = data.todayAppointments.length - data.yesterdayAppointmentsCount;
    const aptTrendStr = aptTrend >= 0 ? `+${aptTrend} so với hôm qua` : `${aptTrend} so với hôm qua`;

    const depTrend = data.depositedTodayCount - data.yesterdayDepositsCount;
    const depTrendStr = depTrend >= 0 ? `↑ ${depTrend} so với hôm qua` : `↓ ${Math.abs(depTrend)} so với hôm qua`;

    return [
      {
        label: "Lịch xem hôm nay",
        value: data.todayAppointments.length,
        icon: CalendarDays,
        color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100",
        sub: `${data.todayAppointments.filter(a => a.status === "Shown").length} đã xem xong`,
        trend: aptTrendStr,
      },
      {
        label: "Yêu cầu đang xử lý",
        value: data.pendingRequestsCount,
        icon: FileText,
        color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100",
        sub: `${data.requestStatusCounts["Pending"] || 0} mới chờ phân công`,
        trend: "Cần follow-up sớm",
      },
      {
        label: "Giường/Phòng đặt cọc hôm nay",
        value: data.depositedTodayCount,
        icon: BedDouble,
        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
        sub: `${data.depositedTodayCount} hồ sơ cọc phát sinh hôm nay`,
        trend: depTrendStr,
      },
    ];
  }, [data]);

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
            {!data ? null : (["Pending","Scheduled","Shown","Deposited","Cancelled"] as const).map(status => {
              const count = data.requestStatusCounts[status] || 0;
              const totalRequests = Object.values(data.requestStatusCounts || {}).reduce((a, b) => a + b, 0);
              const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
              
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
            {!data ? null : (["Whole Room","Shared Bed"] as const).map(mode => {
              const reqsCount = data.requestRentalModeCounts[mode] || 0;
              const depCount = data.depositedByRentalModeCounts[mode] || 0;
              const isWhole = mode === "Whole Room";
              return (
                <div key={mode} className={`rounded-xl p-4 border ${isWhole ? "bg-violet-50 border-violet-100" : "bg-teal-50 border-teal-100"}`}>
                  <div className={`text-2xl mb-1 ${isWhole ? "text-violet-700" : "text-teal-700"}`} style={{ fontWeight: 700 }}>{reqsCount}</div>
                  <div className={`text-sm ${isWhole ? "text-violet-700" : "text-teal-700"}`} style={{ fontWeight: 600 }}>
                    {isWhole ? "🏠 Toàn phòng" : "🛏 Ghép giường"}
                  </div>
                  <div className={`text-xs mt-1 ${isWhole ? "text-violet-500" : "text-teal-500"}`}>
                    {depCount} đã đặt cọc
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            {!data ? null : (["Male","Female","Any"] as const).map(g => {
              const count = data.requestGenderCounts[g] || 0;
              const totalRequests = Object.values(data.requestStatusCounts || {}).reduce((a, b) => a + b, 0);
              return (
                <div key={g} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-16">{g === "Male" ? "Nam" : g === "Female" ? "Nữ" : "Bất kỳ"}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${g === "Male" ? "bg-blue-400" : g === "Female" ? "bg-pink-400" : "bg-slate-300"}`}
                      style={{ width: `${totalRequests > 0 ? (count / totalRequests) * 100 : 0}%` }} />
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
            {!loading && !error && data && (
              data.todayAppointments.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">Không có lịch xem phòng hôm nay</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[42px] top-3 bottom-3 w-px bg-slate-100" />
                  <div className="space-y-4">
                    {data.todayAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => (
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
            {data && data.visiblePendingRequests.map((req) => (
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
                {req.criteria && req.criteria.length > 0 && (
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
