import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Search, ArrowUpRight, ArrowDownRight, Filter, RotateCcw, AlertCircle } from "lucide-react";
import { getTransactions, getContracts } from "../services/api";
import type { Transaction } from "../types";

const fmtCurrency = (v: number) => v >= 1000000
  ? `${(v / 1000000).toFixed(1)}M`
  : `${(v / 1000).toFixed(0)}K`;

// ── Map transaction loaiGiaoDich → display type ──────────────────────────
function mapTxType(loai: string | null | undefined): "Receipt" | "Payment" {
  if (!loai) return "Receipt";
  const l = loai.toLowerCase();
  if (l.includes("chi") || l.includes("hoan") || l.includes("refund") || l.includes("payment")) return "Payment";
  return "Receipt";
}

function mapTxCategory(loai: string | null | undefined): string {
  if (!loai) return "Khác";
  const l = loai.toLowerCase();
  if (l.includes("coc") || l.includes("deposit")) return "Đặt cọc";
  if (l.includes("thue") || l.includes("rent")) return "Tiền thuê";
  if (l.includes("hoan") || l.includes("refund")) return "Hoàn trả";
  if (l.includes("phi") || l.includes("service")) return "Phí dịch vụ";
  return loai;
}

// ──────────────── Financial Reconciliations ────────────────
function ReconciliationsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactions({ page: 0, size: 500 });
      setTransactions(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải dữ liệu giao dịch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const entries = transactions.map(t => ({
    id: t.maPhieuThanhToan,
    type: mapTxType(t.loaiGiaoDich),
    description: t.ghiChu ?? t.loaiGiaoDich ?? "Giao dịch",
    amount: 0, // Transaction entity không có amount field — hiển thị 0
    date: t.ngayGiaoDich ?? "—",
    category: mapTxCategory(t.loaiGiaoDich),
    relatedTo: t.maChungTu ?? "—",
    status: (t.trangThai === "Thanh cong" || t.trangThai === "Thành công") ? "Completed" : "Pending",
  }));

  const filtered = entries.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) || e.relatedTo.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || e.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalIncome  = entries.filter(e => e.type === "Receipt" && e.status === "Completed").reduce((a, e) => a + e.amount, 0);
  const totalPending = entries.filter(e => e.type === "Receipt" && e.status === "Pending").reduce((a, e) => a + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === "Payment").reduce((a, e) => a + e.amount, 0);
  const net = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
        <RotateCcw size={20} className="animate-spin text-indigo-400" />
        <span className="text-sm">Đang tải dữ liệu giao dịch...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <div className="text-red-600 font-semibold">{error}</div>
        <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng phiếu thu", value: entries.filter(e => e.type === "Receipt").length, sub: "Phiếu thu", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200", isCount: true },
          { label: "Chờ xử lý", value: entries.filter(e => e.status === "Pending").length, sub: "Phiếu chờ", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200", isCount: true },
          { label: "Tổng phiếu chi", value: entries.filter(e => e.type === "Payment").length, sub: "Phiếu chi", icon: TrendingDown, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-200", isCount: true },
          { label: "Tổng giao dịch", value: entries.length, sub: "Tất cả phiếu", icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-200", isCount: true },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 border border-slate-100 ring-1 ${s.ring} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <span className={s.color === "text-emerald-600" || s.color === "text-indigo-600" ? "text-emerald-500" : "text-red-500"}>
                {s.color === "text-emerald-600" || s.color === "text-indigo-600" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </span>
            </div>
            <div className={`text-xl ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</div>
            <div className="text-sm text-slate-600 mt-0.5">{s.label}</div>
            <div className="text-xs text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters + table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {["All", "Receipt", "Payment"].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-sm transition ${typeFilter === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t === "All" ? "Tất cả" : t === "Receipt" ? "Thu" : "Chi"}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            <RotateCcw size={13} /> Làm mới
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Mô tả", "Loại", "Danh mục", "Ngày", "Chứng từ", "Trạng thái"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-sm">Không có dữ liệu phù hợp</td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 text-slate-700">{e.description}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.type === "Receipt" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {e.type === "Receipt" ? "Thu" : "Chi"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{e.category}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{e.date}</td>
                  <td className="px-4 py-3.5 text-xs text-indigo-600">{e.relatedTo}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {e.status === "Completed" ? "Hoàn tất" : "Đang xử lý"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ──────────────── Reports ────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
        <p className="text-slate-600 mb-1" style={{ fontWeight: 600 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmtCurrency(p.value) : p.value}{p.name === "Tỷ lệ" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function ReportsView() {
  const [period, setPeriod] = useState("monthly");
  const [contracts, setContracts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getContracts({ page: 0, size: 500 }),
      getTransactions({ page: 0, size: 500 }),
    ]).then(([cRes, tRes]) => {
      setContracts(cRes.data ?? []);
      setTransactions(tRes.data ?? []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build monthly revenue from transactions grouped by month
  const monthlyRevenue = (() => {
    const months = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
    const counts = Array(12).fill(0).map((_, i) => ({ month: months[i], revenue: 0, expense: 0 }));
    transactions.forEach(t => {
      if (!t.ngayGiaoDich) return;
      const m = new Date(t.ngayGiaoDich).getMonth();
      const type = mapTxType(t.loaiGiaoDich);
      if (type === "Receipt") counts[m].revenue += 1;
      else counts[m].expense += 1;
    });
    return counts;
  })();

  // Contract expiration buckets
  const now = Date.now();
  const contractExpirationData = (() => {
    let lt30 = 0, lt60 = 0, gt60 = 0;
    contracts.forEach(c => {
      if (!c.ngayKetThuc) { gt60++; return; }
      const diff = (new Date(c.ngayKetThuc).getTime() - now) / 86400000;
      if (diff < 0) return; // expired
      if (diff < 30) lt30++;
      else if (diff < 60) lt60++;
      else gt60++;
    });
    return [
      { name: "Hết hạn <30 ngày", value: lt30, color: "#EF4444" },
      { name: "Hết hạn 30-60 ngày", value: lt60, color: "#F59E0B" },
      { name: "Hết hạn >60 ngày", value: gt60, color: "#10B981" },
    ];
  })();

  // Occupancy from contracts (active = has ngayKetThuc in future)
  const occupancyData = (() => {
    const months = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
    return months.map((month, i) => ({
      month,
      rate: contracts.length > 0
        ? Math.round(contracts.filter(c => {
            if (!c.ngayLap) return false;
            return new Date(c.ngayLap).getMonth() <= i;
          }).length / Math.max(contracts.length, 1) * 100)
        : 0,
    }));
  })();

  // Conversion funnel from real data
  const conversionData = [
    { stage: "Lịch hẹn", value: transactions.length + contracts.length },
    { stage: "Đặt cọc", value: transactions.filter(t => (t.loaiGiaoDich ?? "").toLowerCase().includes("coc")).length },
    { stage: "Ký HĐ", value: contracts.length },
    { stage: "Hoàn tất", value: transactions.filter(t => t.trangThai === "Thanh cong").length },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
        <RotateCcw size={20} className="animate-spin text-indigo-400" />
        <span className="text-sm">Đang tải dữ liệu báo cáo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Period toggle */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Kỳ báo cáo:</span>
          <div className="flex gap-1">
            {[{ id: "monthly", label: "Tháng" }, { id: "quarterly", label: "Quý" }].map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${period === p.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" defaultValue="2025-01-01" />
          <span className="text-slate-400">→</span>
          <input type="date" className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" defaultValue="2025-12-31" />
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-800">Báo cáo doanh thu</h3>
            <p className="text-xs text-slate-500">Doanh thu và chi phí theo tháng</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500" />Doanh thu</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400" />Chi phí</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyRevenue} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="Doanh thu" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Chi phí" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Occupancy Rate */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="mb-5">
            <h3 className="text-slate-800">Tỷ lệ lấp đầy</h3>
            <p className="text-xs text-slate-500">Phần trăm phòng có người thuê theo tháng</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={occupancyData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="rate" name="Tỷ lệ" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Contract Expiration */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="mb-5">
            <h3 className="text-slate-800">Dự báo hết hạn HĐ</h3>
            <p className="text-xs text-slate-500">Phân bổ hợp đồng theo thời gian còn lại</p>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={contractExpirationData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {contractExpirationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val} HĐ`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {contractExpirationData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-sm" style={{ fontWeight: 600, color: d.color }}>{d.value}</span>
                </div>
              ))}
              <div className="pt-1 border-t border-slate-100">
                <div className="text-xs text-slate-400">Tổng: {contractExpirationData.reduce((a, d) => a + d.value, 0)} hợp đồng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="mb-5">
          <h3 className="text-slate-800">Phễu chuyển đổi khách hàng</h3>
          <p className="text-xs text-slate-500">Từ lượt xem → Ký hợp đồng (Tháng 4/2025)</p>
        </div>
        <div className="flex items-end gap-2 h-48">
          {conversionData.map((d, i) => {
            const maxVal = conversionData[0].value;
            const pct = (d.value / maxVal) * 100;
            const colors = ["bg-indigo-500", "bg-blue-500", "bg-cyan-500", "bg-emerald-500", "bg-teal-500"];
            const conversion = i > 0 ? Math.round((d.value / conversionData[i - 1].value) * 100) : 100;
            return (
              <div key={d.stage} className="flex-1 flex flex-col items-center gap-2">
                {i > 0 && (
                  <div className="text-xs text-slate-400">{conversion}%</div>
                )}
                <div className="w-full flex flex-col items-center justify-end" style={{ height: "160px" }}>
                  <div
                    className={`w-full ${colors[i]} rounded-t-lg transition-all duration-500 flex items-end justify-center pb-1`}
                    style={{ height: `${pct}%` }}
                  >
                    <span className="text-white text-xs" style={{ fontWeight: 700 }}>{d.value}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-center leading-tight">{d.stage}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────── Main Page ────────────────
export default function Financials() {
  const [subView, setSubView] = useState<"reconciliation" | "reports">("reconciliation");

  return (
    <div className="space-y-5">
      {/* Sub-view switcher */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-1 flex gap-1">
        <button
          onClick={() => setSubView("reconciliation")}
          className={`flex-1 py-2.5 rounded-lg text-sm transition ${subView === "reconciliation" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Đối soát tài chính
        </button>
        <button
          onClick={() => setSubView("reports")}
          className={`flex-1 py-2.5 rounded-lg text-sm transition ${subView === "reports" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Báo cáo & Phân tích
        </button>
      </div>

      {subView === "reconciliation" && <ReconciliationsView />}
      {subView === "reports" && <ReportsView />}
    </div>
  );
}