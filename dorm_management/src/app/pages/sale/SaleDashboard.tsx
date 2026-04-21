import { CalendarDays, FileText, CheckCircle, Clock, ArrowRight, User, Phone, MapPin, TrendingUp, AlertCircle } from "lucide-react";
import { showingAppointments, saleRequests } from "../../data/saleMockData";
import { useNavigate } from "react-router";

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

export default function SaleDashboard() {
  const navigate = useNavigate();
  const today = "2025-04-20";
  const todayAppointments = showingAppointments.filter(a => a.date === today);
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
              <p className="text-xs text-slate-400 mt-0.5">Chủ nhật, 20/04/2025</p>
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
              <div className="text-center py-10 text-slate-400 text-sm">Không có lịch xem phòng hôm nay</div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[42px] top-3 bottom-3 w-px bg-slate-100" />
                <div className="space-y-4">
                  {todayAppointments.map((apt, i) => (
                    <div key={apt.id} className="flex gap-4 items-start group">
                      {/* Time */}
                      <div className="w-[42px] flex-shrink-0 text-right">
                        <span className="text-xs text-slate-500" style={{ fontWeight: 600 }}>{apt.time}</span>
                      </div>
                      {/* Dot */}
                      <div className={`relative z-10 w-3 h-3 rounded-full flex-shrink-0 mt-1 border-2 border-white ${
                        apt.status === "Shown" ? "bg-emerald-400" :
                        apt.status === "Cancelled" ? "bg-red-400" : "bg-blue-400"
                      }`} />
                      {/* Card */}
                      <div className={`flex-1 rounded-xl p-3.5 border transition-all ${
                        apt.status === "Shown" ? "bg-emerald-50 border-emerald-100" :
                        apt.status === "Cancelled" ? "bg-slate-50 border-slate-200 opacity-60" :
                        "bg-slate-50 border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50/30"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{apt.clientName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                apt.status === "Shown" ? "bg-emerald-100 text-emerald-700" :
                                apt.status === "Cancelled" ? "bg-slate-200 text-slate-500" :
                                "bg-blue-100 text-blue-700"
                              }`} style={{ fontWeight: 500 }}>
                                {apt.status === "Shown" ? "Đã xem" : apt.status === "Cancelled" ? "Huỷ" : "Chờ"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin size={11} /> Phòng {apt.roomId}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <User size={11} /> {apt.staffName}
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
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xs text-slate-600" style={{ fontWeight: 600 }}>
                      {req.clientName.split(" ").slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{req.clientName}</div>
                      <div className="text-xs text-slate-400">{req.roomType} · {req.budget}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[req.status]}`} style={{ fontWeight: 500 }}>
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
          </div>
        </div>
      </div>

      {/* Quick overview strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Tình trạng yêu cầu tháng 4</h2>
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {(["Pending","Scheduled","Shown","Deposited","Cancelled"] as const).map(status => {
            const count = saleRequests.filter(r => r.status === status).length;
            const pct = Math.round((count / saleRequests.length) * 100);
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
