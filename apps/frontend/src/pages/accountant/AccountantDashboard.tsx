import { useNavigate } from "react-router";
import {
  TrendingUp, Wallet, PiggyBank, FileWarning,
  AlertTriangle, Clock, ArrowRight, CheckCircle,
  BarChart3, Activity
} from "lucide-react";
import { overduePayments, pendingRefunds, invoices, accTransactions } from "../../data/accountantMockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fmt = (n: number) => (n / 1_000_000).toFixed(1) + " tr";
const fmtFull = (n: number) => n.toLocaleString("vi-VN") + " đ";

const monthlyData = [
  { month: "T1", thu: 82, chi: 18 }, { month: "T2", thu: 79, chi: 16 },
  { month: "T3", thu: 85, chi: 20 }, { month: "T4", thu: 88, chi: 19 },
];

const stats = [
  {
    label: "Doanh thu tháng 4",
    value: "88,0 tr",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    sub: "↑ 3.5% so với T3",
    subColor: "text-emerald-600",
  },
  {
    label: "Thu trong ngày",
    value: "7,2 tr",
    icon: Wallet,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    sub: "3 giao dịch hôm nay",
    subColor: "text-slate-400",
  },
  {
    label: "Tổng cọc đang giữ",
    value: "112,4 tr",
    icon: PiggyBank,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    sub: "15 hợp đồng hiện hành",
    subColor: "text-slate-400",
  },
  {
    label: "Hoá đơn chờ xử lý",
    value: String(invoices.filter(i => i.status === "Not Sent" || i.status === "Sent").length),
    icon: FileWarning,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    sub: `${invoices.filter(i => i.status === "Overdue").length} quá hạn cần xử lý`,
    subColor: "text-red-500",
  },
];

export default function AccountantDashboard() {
  const navigate = useNavigate();
  const todayIncome = accTransactions.filter(t => t.type === "Income" && t.createdAt.startsWith("2025-04-20") && t.status === "Confirmed").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 shadow-sm`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon size={20} className={s.color} />
              </div>
            </div>
            <div className="text-3xl text-slate-900 mb-0.5" style={{ fontWeight: 700 }}>{s.value}</div>
            <div className="text-sm text-slate-600 mb-1" style={{ fontWeight: 500 }}>{s.label}</div>
            <div className={`text-xs ${s.subColor}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Overdue Payments */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle size={15} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Thanh toán quá hạn</h2>
                <p className="text-xs text-slate-400 mt-0.5">{overduePayments.length} trường hợp cần xử lý ngay</p>
              </div>
            </div>
            <button onClick={() => navigate("/accountant/invoices")}
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition" style={{ fontWeight: 500 }}>
              Xem hoá đơn <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {overduePayments.map((op) => (
              <div key={op.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-red-50/30 transition group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${
                  op.daysOverdue >= 7 ? "bg-red-100 text-red-700" :
                  op.daysOverdue >= 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                }`} style={{ fontWeight: 700 }}>
                  {op.daysOverdue}d
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{op.residentName}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{op.roomId}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">Quá hạn {op.daysOverdue} ngày</span>
                    {op.lastReminderSent && (
                      <span className="text-xs text-slate-400">Nhắc: {op.lastReminderSent}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm text-red-600" style={{ fontWeight: 700 }}>{fmtFull(op.amount)}</div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs" style={{ fontWeight: 500 }}>
                  Gửi nhắc
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Refunds */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock size={15} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Hoàn cọc đang chờ</h2>
                <p className="text-xs text-slate-400 mt-0.5">{pendingRefunds.length} khách hàng</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingRefunds.map((rf) => (
              <div key={rf.id} className="px-5 py-4 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{rf.residentName}</div>
                    <div className="text-xs text-slate-400">{rf.roomId} · Trả phòng {rf.checkoutDate}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg flex-shrink-0 ${
                    rf.status === "Ready" ? "bg-emerald-100 text-emerald-700" :
                    rf.status === "Processing" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`} style={{ fontWeight: 500 }}>
                    {rf.status === "Ready" ? "Sẵn sàng" : rf.status === "Processing" ? "Đang xử lý" : "Tính toán"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Hoàn lại</div>
                    <div className={`text-sm mt-0.5 ${rf.refundAmount > 0 ? "text-emerald-600" : "text-slate-400"}`} style={{ fontWeight: 700 }}>
                      {rf.refundAmount > 0 ? fmtFull(rf.refundAmount) : "—"}
                    </div>
                  </div>
                  {rf.status === "Ready" && (
                    <button
                      onClick={() => navigate("/accountant/reconciliation")}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
                      style={{ fontWeight: 500 }}>
                      Xuất PDF
                    </button>
                  )}
                  {rf.status === "Calculating" && (
                    <button
                      onClick={() => navigate("/accountant/reconciliation")}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                      style={{ fontWeight: 500 }}>
                      Đối soát
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart + Quick status */}
      <div className="grid grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Thu – Chi 4 tháng gần nhất</h2>
              <p className="text-xs text-slate-400 mt-0.5">Đơn vị: triệu đồng</p>
            </div>
            <BarChart3 size={16} className="text-violet-400" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`${v} tr`, ""]}
              />
              <Bar dataKey="thu" fill="#7c3aed" radius={[6, 6, 0, 0]} name="Thu" />
              <Bar dataKey="chi" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Chi" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-violet-600" /> Doanh thu
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-slate-200" /> Chi phí
            </div>
          </div>
        </div>

        {/* Invoice status mini */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Trạng thái hoá đơn T4</h2>
            <Activity size={16} className="text-violet-400" />
          </div>
          <div className="space-y-3">
            {(["Paid","Sent","Not Sent","Overdue"] as const).map(s => {
              const count = invoices.filter(i => i.status === s).length;
              const pct = Math.round((count / invoices.length) * 100);
              const cfg = {
                Paid:     { label: "Đã thanh toán", color: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50" },
                Sent:     { label: "Đã gửi",         color: "bg-blue-500",    text: "text-blue-700",    light: "bg-blue-50" },
                "Not Sent":{ label: "Chưa gửi",      color: "bg-slate-300",   text: "text-slate-600",   light: "bg-slate-50" },
                Overdue:  { label: "Quá hạn",        color: "bg-red-500",     text: "text-red-700",     light: "bg-red-50" },
              }[s];
              return (
                <div key={s}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600" style={{ fontWeight: 500 }}>{cfg.label}</span>
                    <span className={`text-xs ${cfg.text}`} style={{ fontWeight: 700 }}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate("/accountant/invoices")}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-50 text-violet-700 text-xs hover:bg-violet-100 transition"
            style={{ fontWeight: 600 }}>
            <CheckCircle size={13} /> Tạo hoá đơn tháng 5
          </button>
        </div>
      </div>
    </div>
  );
}
