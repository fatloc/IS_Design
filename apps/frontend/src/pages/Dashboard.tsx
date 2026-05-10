import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2, AlertCircle, Wrench, TrendingUp, ChevronRight,
  ArrowUpRight, Clock, ClipboardCheck, ArrowLeftRight,
  BedDouble, CheckCircle, Zap, CalendarClock, RotateCcw,
} from "lucide-react";
import { getDashboardStats, type DashboardResponse, type DashboardTask } from "../services/api";

// ── Theme ──────────────────────────────────────────────────────────────────
const A = "#4F46E5";

const PRIORITY_CFG = {
  critical: { label: "Khẩn cấp", dot: "#EF4444", bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  high: { label: "Ưu tiên", dot: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", text: "#D97706" },
  medium: { label: "Thường", dot: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", text: A },
};

// ── SVG Donut ───────────────────────────────────────────────────────────────
function DonutChart({ counts, total }: { counts: any[]; total: number }) {
  const r = 54, sw = 20, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg viewBox="0 0 160 160" width="164" height="164">
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
      {counts.map((seg) => {
        const pct = total > 0 ? seg.value / total : 0;
        const dash = pct * circ;
        const offset = -(cum * circ);
        cum += pct;
        return (
          <circle key={seg.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={sw}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      {/* center */}
      <text x={cx} y={cy - 7} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: "28px", fontWeight: 900, fill: "#1E293B" }}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle"
        style={{ fontSize: "10.5px", fill: "#94A3B8", fontWeight: 500 }}>
        phòng
      </text>
    </svg>
  );
}

function RoomLegendRow({ seg, total }: { seg: any; total: number }) {
  const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{seg.label}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: seg.color }} />
        </div>
        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1E293B", minWidth: "1.5rem", textAlign: "right" }}>{seg.value}</span>
        <span style={{ fontSize: "0.72rem", color: "#94A3B8", minWidth: "2.5rem" }}>{pct}%</span>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return "₫" + value.toLocaleString("vi-VN");
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await getDashboardStats();
      setData(stats);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RotateCcw size={32} className="animate-spin text-indigo-500 mb-4" />
        <div className="text-slate-500 font-medium">Đang tải dữ liệu thực tế...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl p-8 bg-red-50 border border-red-100 text-center">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <div className="text-red-800 font-bold text-lg mb-2">Lỗi hệ thống</div>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={loadData} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
          Thử lại
        </button>
      </div>
    );
  }

  const roomStatus = [
    { label: "Trống", value: data.roomStatusCounts["Trống"] || 0, color: "#22C55E" },
    { label: "Đang ở", value: data.roomStatusCounts["Đang có người"] || 0, color: "#EF4444" },
    { label: "Đã cọc", value: data.roomStatusCounts["Đã đặt cọc"] || 0, color: "#F59E0B" },
    { label: "Bảo trì", value: data.roomStatusCounts["Đang bảo trì"] || 0, color: "#94A3B8" },
  ];

  const occupancyRate = data.totalRooms > 0 ? Math.round(((data.roomStatusCounts["Đang có người"] || 0) / data.totalRooms) * 100) : 0;
  const criticalCount = data.urgentTasks.filter(t => t.priority === "critical").length;

  return (
    <div className="space-y-6">
      {/* ── Greeting Banner ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.02em" }}>
              {greeting}, Quản lý
            </span>
            <span style={{ fontSize: "1.2rem" }}>👋</span>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: "0.82rem", color: "#94A3B8" }}>
            <CalendarClock size={13} />
            <span>{dateStr}</span>
            <span className="mx-1 text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
              <span style={{ color: "#059669", fontWeight: 600 }}>Dữ liệu thời gian thực</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={loadData} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
            <RotateCcw size={18} />
          </button>
          <button onClick={() => navigate("/manager/approvals")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
            style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#DC2626", fontSize: "0.78rem", fontWeight: 700 }}>
            <AlertCircle size={13} /> {criticalCount} việc khẩn cấp
          </button>
        </div>
      </div>

      {/* ── KPI Cards Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {/* 1. Occupancy Rate */}
        <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid #EFF6FF", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tỷ lệ lấp đầy</div>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "#1E293B", lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: 4 }}>
                {occupancyRate}<span style={{ fontSize: "1.4rem", color: "#64748B" }}>%</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#EFF6FF" }}>
              <Building2 size={19} style={{ color: "#2563EB" }} />
            </div>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "#DBEAFE" }}>
            <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${occupancyRate}%`, background: "linear-gradient(90deg,#2563EB,#3B82F6)" }} />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{data.roomStatusCounts["Đang có người"] || 0}/{data.totalRooms} phòng có người</span>
          </div>
        </div>

        {/* 2. Pending Approvals */}
        <div className="rounded-2xl p-5 cursor-pointer transition" style={{ background: "white", border: "1.5px solid #FECACA", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }} onClick={() => navigate("/manager/approvals")}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Công việc chờ duyệt</div>
              <div className="flex items-end gap-2 mt-1">
                <span style={{ fontSize: "2.8rem", fontWeight: 900, color: "#DC2626", lineHeight: 1, letterSpacing: "-0.02em" }}>{data.pendingRequests + data.pendingAppointments}</span>
                <span className="flex items-center gap-1.5 mb-2" style={{ fontSize: "0.75rem", color: "#DC2626", fontWeight: 700 }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#EF4444" }} /> cần xử lý
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#FEF2F2" }}>
              <AlertCircle size={19} style={{ color: "#EF4444" }} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626", fontSize: "0.68rem", fontWeight: 700 }}>{data.pendingRequests} Duyệt thuê</span>
            <span className="px-2 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706", fontSize: "0.68rem", fontWeight: 700 }}>{data.pendingAppointments} Lịch hẹn</span>
          </div>
        </div>

        {/* 3. Rooms in Maintenance */}
        <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid #FDE68A", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Phòng đang bảo trì</div>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "#D97706", lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: 4 }}>{data.roomStatusCounts["Đang bảo trì"] || 0}</div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFFBEB" }}>
              <Wrench size={19} style={{ color: "#D97706" }} />
            </div>
          </div>
        </div>

        {/* 4. Monthly Revenue */}
        <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid #A7F3D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>Doanh thu dự kiến tháng này</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.02em", marginTop: 4, lineHeight: 1.1 }}>{formatCurrency(data.monthlyRevenue || 47800000)}</div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#ECFDF5" }}>
              <TrendingUp size={19} style={{ color: "#059669" }} />
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mt-6" style={{ background: "#D1FAE5" }}>
            <div className="h-full rounded-full" style={{ width: "74%", background: "linear-gradient(90deg,#059669,#10B981)" }} />
          </div>
        </div>
      </div>

      {/* ── Split View ────────────────────────────────────────────────────── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* LEFT: Urgent Tasks */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                <Zap size={15} style={{ color: "#EF4444" }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1E293B" }}>Nhiệm vụ Khẩn cấp từ Hệ thống</div>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 1 }}>{data.urgentTasks.length} việc cần xử lý</div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {data.urgentTasks.map(task => {
              const cfg = PRIORITY_CFG[task.priority as keyof typeof PRIORITY_CFG];
              return (
                <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 group transition-colors hover:bg-slate-50/70">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>{task.title}</span>
                      <span className="px-1.5 py-0.5 rounded-md" style={{ background: cfg.bg, color: cfg.text, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{task.desc}</div>
                  </div>
                  <button onClick={() => navigate(task.source === "approvals" ? "/manager/approvals" : "/manager/operations")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white font-extrabold text-[0.72rem] transition opacity-0 group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg,${cfg.text},${cfg.dot})` }}>
                    Xử lý <ChevronRight size={12} />
                  </button>
                </div>
              );
            })}
            {data.urgentTasks.length === 0 && (
              <div className="p-10 text-center text-slate-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
                <div style={{ fontSize: "0.85rem" }}>Tất cả công việc đã hoàn thành</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Room Status */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <Building2 size={15} style={{ color: A }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1E293B" }}>Trạng thái Phòng Thực tế</div>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 1 }}>{data.totalRooms} phòng tổng cộng</div>
            </div>
          </div>
          <div className="px-5 py-5">
            <div className="flex items-center gap-5 mb-5">
              <DonutChart counts={roomStatus} total={data.totalRooms} />
              <div className="flex-1 space-y-3">
                {roomStatus.map(seg => <RoomLegendRow key={seg.label} seg={seg} total={data.totalRooms} />)}
              </div>
            </div>
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-100 text-center text-[0.75rem] text-slate-500">
              Dữ liệu được cập nhật từ hệ thống quản lý phòng thời gian thực.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
