import { Outlet, useLocation, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import {
  Bell, Search, ChevronRight, Shield,
  LayoutDashboard, Grid3X3, Kanban, BarChart3, CalendarDays, FileText,
  Settings2, ClipboardCheck, ArrowLeftRight,
} from "lucide-react";

// ── Manager theme ──────────────────────────────────────────────────────────
const ACCENT   = "#4F46E5";
const ACCENT_L = "#818CF8";
const RING_CLR = "#6366F1";

const PAGE_META: Record<string, {
  title: string; sub: string; icon: React.ElementType; crumbs: string[];
}> = {
  "/manager/dashboard":  { title: "Dashboard & Tổng quan",     sub: "Theo dõi KPI, vận hành và cảnh báo hệ thống",            icon: LayoutDashboard, crumbs: ["Manager", "Dashboard"]      },
  "/manager/rooms":      { title: "Sơ đồ phòng",               sub: "Quản lý và theo dõi trạng thái từng phòng theo thời gian thực",  icon: Grid3X3,         crumbs: ["Manager", "Sơ đồ phòng"]   },
  "/manager/workflows":  { title: "Quy trình – Workflows",      sub: "Kanban board theo dõi toàn bộ tiến trình khách thuê",    icon: Kanban,          crumbs: ["Manager", "Workflows"]      },
  "/manager/financials": { title: "Tài chính & Báo cáo",        sub: "Dòng tiền, doanh thu, công nợ và phân tích xu hướng",    icon: BarChart3,        crumbs: ["Manager", "Tài chính"]      },
  "/manager/showings":   { title: "Lịch xem phòng",             sub: "Quản lý lịch hẹn và phân công nhân viên Sales",          icon: CalendarDays,    crumbs: ["Manager", "Lịch xem phòng"] },
  "/manager/settings":   { title: "Cài đặt & Quản trị",         sub: "Quản lý phòng, bảng giá và tài khoản nhân sự",           icon: Settings2,       crumbs: ["Manager", "Cài đặt"]        },
  "/manager/approvals":  { title: "Trung tâm Phê duyệt",         sub: "Duyệt thuê phòng, xác nhận cọc và kiểm tra điều kiện",   icon: ClipboardCheck,  crumbs: ["Manager", "Phê duyệt"]      },
  "/manager/operations": { title: "Bàn giao & Thanh lý",          sub: "Check-in biên bản bàn giao và check-out thanh lý cọc",   icon: ArrowLeftRight,  crumbs: ["Manager", "Vận hành"]       },
};

const NOTIFS = [
  { text: "3 hợp đồng cần duyệt hôm nay",   type: "warn"    },
  { text: "Phòng A204 đã hết hạn 2 ngày",    type: "danger"  },
  { text: "Báo cáo tháng 4 đã sẵn sàng",     type: "info"    },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_META[location.pathname] ?? {
    title: "Manager", sub: "Hệ thống quản lý ký túc xá", icon: LayoutDashboard, crumbs: ["Manager"],
  };
  const PageIcon = page.icon;

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 248 }}>

        {/* ── Top Header ── */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6"
          style={{
            height: 64,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #F1F5F9",
            boxShadow: "0 1px 0 0 #F1F5F9, 0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Left: Breadcrumb + title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Role badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}
            >
              <Shield size={11} style={{ color: ACCENT }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: ACCENT, letterSpacing: "0.06em" }}>MANAGER</span>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0" style={{ fontSize: "0.78rem" }}>
              {page.crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-slate-300" />}
                  <span style={{ color: i === page.crumbs.length - 1 ? "#1E293B" : "#94A3B8", fontWeight: i === page.crumbs.length - 1 ? 700 : 400 }}>
                    {c}
                  </span>
                </span>
              ))}
            </div>

            {/* Page title (hidden on small) */}
            <div className="hidden xl:flex items-center gap-2 min-w-0">
              <span className="text-slate-200">·</span>
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                <PageIcon size={11} style={{ color: ACCENT }} />
              </div>
              <span className="text-slate-500 truncate" style={{ fontSize: "0.78rem" }}>{page.sub}</span>
            </div>
          </div>

          {/* Right: Search + Bell + Profile */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="pl-9 pr-4 rounded-xl text-slate-700 placeholder-slate-400 transition"
                style={{
                  width: 200, paddingTop: "0.5rem", paddingBottom: "0.5rem",
                  background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                  fontSize: "0.82rem", outline: "none",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`; e.currentTarget.style.background = "white"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#F8FAFC"; }}
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"}
              >
                <Bell size={15} className="text-slate-500" />
              </button>
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: "#EF4444", fontSize: "0.6rem", fontWeight: 800 }}
              >
                {NOTIFS.length}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200" />

            {/* User profile chip */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all group"
              style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}08`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
            >
              {/* Avatar with ring */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg,${ACCENT},#7C3AED)`, fontWeight: 800, fontSize: "0.65rem" }}
                >
                  QL
                </div>
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: `0 0 0 2px ${RING_CLR}` }} />
              </div>
              <div className="hidden sm:block text-left">
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>Admin - Quản lý</div>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>Manager</div>
              </div>
              <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-400 transition" />
            </button>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 p-6 overflow-auto" style={{ minHeight: "calc(100vh - 64px)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}