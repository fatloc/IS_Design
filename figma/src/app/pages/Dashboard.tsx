import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2, AlertCircle, Wrench, TrendingUp, ChevronRight,
  ArrowUpRight, Clock, ClipboardCheck, ArrowLeftRight,
  BedDouble, CheckCircle, Zap, CalendarClock,
} from "lucide-react";

// ── Theme ──────────────────────────────────────────────────────────────────
const A = "#4F46E5";

// ── Room Status Data ────────────────────────────────────────────────────────
const ROOM_STATUS = [
  { label: "Trống",    value: 7,  color: "#22C55E", bg: "#F0FDF4", textColor: "#15803D" },
  { label: "Đang ở",  value: 18, color: "#EF4444", bg: "#FEF2F2", textColor: "#DC2626" },
  { label: "Đã cọc",  value: 2,  color: "#F59E0B", bg: "#FFFBEB", textColor: "#D97706" },
  { label: "Bảo trì", value: 3,  color: "#94A3B8", bg: "#F1F5F9", textColor: "#475569" },
];
const TOTAL_ROOMS = ROOM_STATUS.reduce((s, r) => s + r.value, 0);
const OCCUPIED    = ROOM_STATUS.find(r => r.label === "Đang ở")!.value;
const OCCUPANCY   = Math.round((OCCUPIED / TOTAL_ROOMS) * 100);

// ── Urgent Tasks Data ───────────────────────────────────────────────────────
type Priority = "critical" | "high" | "medium";
interface Task {
  id: string; title: string; desc: string;
  source: "approvals" | "operations";
  priority: Priority; time: string; tag: string;
}
const TASKS: Task[] = [
  { id:"t1", title:"Ký biên bản thanh lý phòng A101",         desc:"Lê Thị Cẩm đang chờ · Trả phòng hôm nay",          source:"operations", priority:"critical", time:"Hôm nay",  tag:"Thanh lý"    },
  { id:"t2", title:"Duyệt hồ sơ thuê phòng B203",             desc:"Nguyễn Thị Hoa · Hợp đồng 12 tháng",              source:"approvals",  priority:"critical", time:"26/04",    tag:"Duyệt thuê"  },
  { id:"t3", title:"Xác nhận tiền cọc Hoàng Văn Nam",         desc:"Phòng B202 · ₫1,200,000 · Tiền mặt",              source:"approvals",  priority:"high",     time:"28/04",    tag:"Xác nhận cọc"},
  { id:"t4", title:"Kiểm tra điều kiện cư trú Trần Văn Hùng", desc:"Phòng B201 · Khu vực ngoài danh sách cho phép",    source:"approvals",  priority:"high",     time:"27/04",    tag:"Điều kiện"   },
  { id:"t5", title:"Bàn giao phòng B203 cho Phạm Thị Lan",    desc:"Dọn vào 01/05/2026 · Chưa lập biên bản bàn giao", source:"operations", priority:"medium",   time:"Sắp tới",  tag:"Bàn giao"    },
  { id:"t6", title:"Xác nhận cọc Vũ Minh Tuấn – phòng C302", desc:"₫1,200,000 · Chuyển khoản TF-240428-003",         source:"approvals",  priority:"high",     time:"28/04",    tag:"Xác nhận cọc"},
];

const PRIORITY_CFG = {
  critical: { label:"Khẩn cấp", dot:"#EF4444", bg:"#FEF2F2",    border:"#FECACA",    text:"#DC2626"  },
  high:     { label:"Ưu tiên",  dot:"#F59E0B", bg:"#FFFBEB",    border:"#FDE68A",    text:"#D97706"  },
  medium:   { label:"Thường",   dot:"#6366F1", bg:"#EEF2FF",    border:"#C7D2FE",    text:A          },
};

// ── SVG Donut ───────────────────────────────────────────────────────────────
function DonutChart() {
  const r = 54, sw = 20, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg viewBox="0 0 160 160" width="164" height="164">
      {/* track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={sw} />
      {ROOM_STATUS.map((seg) => {
        const pct = seg.value / TOTAL_ROOMS;
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
        {TOTAL_ROOMS}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle"
        style={{ fontSize: "10.5px", fill: "#94A3B8", fontWeight: 500 }}>
        phòng
      </text>
    </svg>
  );
}

// ── Mini stat for room section ──────────────────────────────────────────────
function RoomLegendRow({ seg }: { seg: typeof ROOM_STATUS[number] }) {
  const pct = Math.round((seg.value / TOTAL_ROOMS) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: seg.color }}/>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{seg.label}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {/* Mini bar */}
        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: seg.color }}/>
        </div>
        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1E293B", minWidth: "1.5rem", textAlign: "right" }}>{seg.value}</span>
        <span style={{ fontSize: "0.72rem", color: "#94A3B8", minWidth: "2.5rem" }}>{pct}%</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const now     = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const hour    = now.getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const activeTasks = TASKS.filter(t => !dismissedIds.has(t.id));
  const criticalCount = activeTasks.filter(t => t.priority === "critical").length;

  const handleProcess = (task: Task) => {
    navigate(task.source === "approvals" ? "/manager/approvals" : "/manager/operations");
  };

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
            <CalendarClock size={13}/>
            <span>{dateStr}</span>
            <span className="mx-1 text-slate-300">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }}/>
              <span style={{ color: "#059669", fontWeight: 600 }}>Hệ thống hoạt động bình thường</span>
            </span>
          </div>
        </div>
        {/* Quick nav buttons */}
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate("/manager/approvals")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
            style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#DC2626", fontSize: "0.78rem", fontWeight: 700 }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#FEE2E2"}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#FEF2F2"}>
            <AlertCircle size={13}/> {criticalCount} việc khẩn cấp
          </button>
          <button onClick={() => navigate("/manager/operations")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition"
            style={{ background: "#EEF2FF", border: `1.5px solid ${A}30`, color: A, fontSize: "0.78rem", fontWeight: 700 }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=`${A}15`}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#EEF2FF"}>
            <ArrowLeftRight size={13}/> Vận hành hôm nay
          </button>
        </div>
      </div>

      {/* ── KPI Cards Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">

        {/* 1. Occupancy Rate */}
        <div className="rounded-2xl p-5"
          style={{ background: "white", border: "1px solid #EFF6FF", boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(37,99,235,0.06)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Tỷ lệ lấp đầy
              </div>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "#1E293B", lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: 4 }}>
                {OCCUPANCY}<span style={{ fontSize: "1.4rem", color: "#64748B" }}>%</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#EFF6FF" }}>
              <Building2 size={19} style={{ color: "#2563EB" }}/>
            </div>
          </div>
          {/* HIGH-CONTRAST vivid blue progress bar */}
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "#DBEAFE" }}>
            <div className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{ width: `${OCCUPANCY}%`, background: "linear-gradient(90deg,#2563EB,#3B82F6)", boxShadow: "0 0 8px rgba(37,99,235,0.5)" }}/>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{OCCUPIED}/{TOTAL_ROOMS} phòng có người</span>
            <span className="flex items-center gap-1" style={{ fontSize: "0.72rem", color: "#2563EB", fontWeight: 700 }}>
              <ArrowUpRight size={11}/> Tốt
            </span>
          </div>
        </div>

        {/* 2. Pending Approvals */}
        <div className="rounded-2xl p-5 relative overflow-hidden cursor-pointer transition"
          style={{ background: "white", border: "1.5px solid #FECACA", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          onClick={() => navigate("/manager/approvals")}
          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="#FFF5F5"}
          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="white"}>
          {/* Alert glow */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-6 translate-x-6 pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(239,68,68,0.12) 0%,transparent 70%)" }}/>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Yêu cầu chờ duyệt
              </div>
              <div className="flex items-end gap-2 mt-1">
                <span style={{ fontSize: "2.8rem", fontWeight: 900, color: "#DC2626", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {TASKS.length}
                </span>
                <span className="flex items-center gap-1.5 mb-2" style={{ fontSize: "0.75rem", color: "#DC2626", fontWeight: 700 }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#EF4444" }}/>
                  cần xử lý
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#FEF2F2" }}>
              <AlertCircle size={19} style={{ color: "#EF4444" }}/>
            </div>
          </div>
          {/* Breakdown */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Duyệt thuê",  count: 4, color: "#DC2626", bg: "#FEF2F2" },
              { label: "Xác nhận cọc", count: 2, color: "#D97706", bg: "#FFFBEB" },
              { label: "Điều kiện",   count: 1, color: "#7C3AED", bg: "#F5F3FF" },
            ].map(b => (
              <span key={b.label} className="px-2 py-0.5 rounded-full"
                style={{ background: b.bg, color: b.color, fontSize: "0.68rem", fontWeight: 700 }}>
                {b.count} {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* 3. Rooms in Maintenance */}
        <div className="rounded-2xl p-5"
          style={{ background: "white", border: "1px solid #FDE68A", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Phòng đang bảo trì
              </div>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "#D97706", lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: 4 }}>
                3
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#FFFBEB" }}>
              <Wrench size={19} style={{ color: "#D97706" }}/>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { label: "Phòng toàn phần", count: 2, icon: Building2 },
              { label: "Giường đơn",      count: 1, icon: BedDouble  },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <item.icon size={11} style={{ color: "#94A3B8" }}/>
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{item.label}</span>
                </div>
                <span className="px-1.5 rounded-md" style={{ background: "#FEF3C7", color: "#D97706", fontSize: "0.72rem", fontWeight: 800 }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Monthly Revenue */}
        <div className="rounded-2xl p-5"
          style={{ background: "white", border: "1px solid #A7F3D0", boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(5,150,105,0.06)" }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Doanh thu dự kiến
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.02em", marginTop: 4, lineHeight: 1.1 }}>
                ₫47,800,000
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#ECFDF5" }}>
              <TrendingUp size={19} style={{ color: "#059669" }}/>
            </div>
          </div>
          {/* Delta */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5" }}>
              <ArrowUpRight size={11} style={{ color: "#059669" }}/>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#059669" }}>+12.4%</span>
            </div>
            <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>so với tháng 3/2026</span>
          </div>
          {/* Revenue bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#D1FAE5" }}>
            <div className="h-full rounded-full" style={{ width: "74%", background: "linear-gradient(90deg,#059669,#10B981)" }}/>
          </div>
        </div>
      </div>

      {/* ── Split View ────────────────────────────────────────────────────── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 380px" }}>

        {/* LEFT: Urgent Tasks */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                <Zap size={15} style={{ color: "#EF4444" }}/>
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1E293B" }}>Nhiệm vụ Khẩn cấp</div>
                <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 1 }}>
                  {activeTasks.length} việc cần xử lý · {criticalCount} khẩn cấp
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/manager/approvals")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition"
                style={{ background: `${A}10`, border: `1px solid ${A}25`, color: A, fontSize: "0.75rem", fontWeight: 700 }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=`${A}18`}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background=`${A}10`}>
                Phê duyệt <ChevronRight size={12}/>
              </button>
              <button onClick={() => navigate("/manager/operations")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition"
                style={{ background: "#FFF7ED", border: "1px solid #FDE68A", color: "#D97706", fontSize: "0.75rem", fontWeight: 700 }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#FEF3C7"}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#FFF7ED"}>
                Vận hành <ChevronRight size={12}/>
              </button>
            </div>
          </div>

          {/* Task list */}
          <div className="divide-y divide-slate-50">
            {activeTasks.map(task => {
              const cfg = PRIORITY_CFG[task.priority];
              const isOps = task.source === "operations";
              return (
                <div key={task.id}
                  className="flex items-center gap-4 px-5 py-3.5 group transition-colors hover:bg-slate-50/70">
                  {/* Priority bar + dot */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 12 }}>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }}/>
                    {task.priority === "critical" && (
                      <div className="w-0.5 flex-1 rounded-full" style={{ background: `${cfg.dot}40`, minHeight: 16 }}/>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>{task.title}</span>
                      {/* Source tag */}
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                        style={{ background: isOps ? "#FFF7ED" : "#EEF2FF", color: isOps ? "#EA580C" : A, fontSize: "0.65rem", fontWeight: 700 }}>
                        {isOps ? <ArrowLeftRight size={8}/> : <ClipboardCheck size={8}/>}
                        {isOps ? "Vận hành" : "Phê duyệt"}
                      </span>
                      {/* Priority chip */}
                      <span className="px-1.5 py-0.5 rounded-md"
                        style={{ background: cfg.bg, color: cfg.text, fontSize: "0.65rem", fontWeight: 700, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{task.desc}</span>
                      <span className="flex-shrink-0 flex items-center gap-1 ml-auto" style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                        <Clock size={10}/>{task.time}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleProcess(task)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 transition opacity-0 group-hover:opacity-100"
                    style={{
                      background: task.priority === "critical"
                        ? "linear-gradient(135deg,#DC2626,#EF4444)"
                        : task.priority === "high"
                        ? "linear-gradient(135deg,#D97706,#F59E0B)"
                        : `linear-gradient(135deg,${A},#7C3AED)`,
                      color: "white", fontSize: "0.75rem", fontWeight: 800,
                      boxShadow: task.priority === "critical" ? "0 2px 8px rgba(220,38,38,0.3)" : "none",
                    }}>
                    Xử lý ngay <ChevronRight size={12}/>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
              Cập nhật lúc {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button className="flex items-center gap-1.5 text-indigo-500 transition hover:text-indigo-700"
              style={{ fontSize: "0.75rem", fontWeight: 700 }}
              onClick={() => navigate("/manager/approvals")}>
              Xem tất cả nhiệm vụ <ArrowUpRight size={12}/>
            </button>
          </div>
        </div>

        {/* RIGHT: Room Status */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #F1F5F9" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EEF2FF" }}>
              <Building2 size={15} style={{ color: A }}/>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "0.95rem", color: "#1E293B" }}>Tổng quan Trạng thái Phòng</div>
              <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 1 }}>
                {TOTAL_ROOMS} phòng · Cập nhật thời gian thực
              </div>
            </div>
          </div>

          <div className="px-5 py-5">
            {/* Donut + Legend */}
            <div className="flex items-center gap-5 mb-5">
              <div className="flex-shrink-0">
                <DonutChart/>
              </div>
              <div className="flex-1 space-y-3">
                {ROOM_STATUS.map(seg => <RoomLegendRow key={seg.label} seg={seg}/>)}
              </div>
            </div>

            {/* Today's snapshot strip */}
            <div className="rounded-xl p-3 space-y-2" style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Hôm nay
              </div>
              {[
                { icon: ArrowLeftRight, label: "Bàn giao dọn vào",    value: "3 phòng", color: A,         bg: "#EEF2FF" },
                { icon: CheckCircle,    label: "Trả phòng chờ ký",    value: "1 phòng", color: "#EA580C", bg: "#FFF7ED" },
                { icon: AlertCircle,    label: "Hợp đồng sắp hết hạn", value: "2 HĐ",   color: "#D97706", bg: "#FFFBEB" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: row.bg }}>
                      <row.icon size={10} style={{ color: row.color }}/>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{row.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md" style={{ background: row.bg, color: row.color, fontSize: "0.72rem", fontWeight: 800 }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
