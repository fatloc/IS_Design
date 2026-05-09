import { Outlet, useLocation, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard, FileText, CalendarDays, Users, ClipboardList,
  Building2, LogOut, Bell, ChevronRight, TrendingUp, Search, Zap,
} from "lucide-react";

// ── Sales theme: Action Orange ─────────────────────────────────────────────
const ACCENT   = "#EA580C";
const ACCENT_L = "#FB923C";
const RING_CLR = "#F97316";

const NAV_ITEMS = [
  { label: "Dashboard",             icon: LayoutDashboard, path: "/sale/dashboard",     badge: null as string|null },
  { label: "Yêu cầu thuê",          icon: FileText,        path: "/sale/requests",      badge: null },
  { label: "Lịch xem phòng",        icon: CalendarDays,    path: "/sale/appointments",  badge: null },
  { label: "Hồ sơ Khách hàng",      icon: Users,           path: "/sale/customers",     badge: null },
  { label: "Hợp đồng",              icon: ClipboardList,   path: "/sale/contracts",     badge: null },
];

const PAGE_META: Record<string, { title: string; sub: string; icon: React.ElementType; crumbs: string[] }> = {
  "/sale/dashboard":    { title: "Sales Dashboard",         sub: "KPI bán hàng, tỷ lệ chuyển đổi và lịch hẹn hôm nay",    icon: LayoutDashboard, crumbs: ["Sales", "Dashboard"]          },
  "/sale/requests":     { title: "Yêu cầu & Chốt phòng",   sub: "Pipeline từ yêu cầu mới đến chốt phòng và đặt cọc",      icon: FileText,        crumbs: ["Sales", "Yêu cầu thuê"]       },
  "/sale/appointments": { title: "Lịch xem phòng",          sub: "Quản lý lịch hẹn xem phòng và phân công nhân viên",      icon: CalendarDays,    crumbs: ["Sales", "Lịch xem phòng"]     },
  "/sale/customers":    { title: "Hồ sơ Khách hàng",        sub: "Quản lý hồ sơ pháp lý và thông tin khách hàng",          icon: Users,           crumbs: ["Sales", "Hồ sơ Khách hàng"]  },
  "/sale/contracts":    { title: "Soạn Hợp đồng thuê",      sub: "Soạn & trình ký hợp đồng cho khách đã đặt cọc",          icon: ClipboardList,   crumbs: ["Sales", "Hợp đồng"]           },
  "/sale/deposits":     { title: "Xử lý đặt cọc",           sub: "Pipeline xét duyệt và quản lý hồ sơ đặt cọc",           icon: FileText,        crumbs: ["Sales", "Đặt cọc"]            },
};

// ── Sales Sidebar ──────────────────────────────────────────────────────────
function SaleSidebar() {
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[248px] flex flex-col z-40"
      style={{
        background: "linear-gradient(180deg,#0F172A 0%,#111827 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg,${ACCENT},#DC2626)`, boxShadow: `0 4px 12px ${ACCENT}50` }}
          >
            <Building2 size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>
              HomeStay<span style={{ color: ACCENT_L }}>Dorm</span>
            </div>
            <div className="text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.04em", fontWeight: 600 }}>
              SALES WORKSPACE
            </div>
          </div>
        </div>
      </div>

      {/* ── User card ── */}
      <div className="mx-3 mt-4 mb-1 flex-shrink-0">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="relative flex-shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg,${ACCENT},#DC2626)`, fontWeight: 800, fontSize: "0.75rem" }}
            >
              VA
            </div>
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `0 0 0 2.5px ${RING_CLR}, 0 0 0 4px rgba(249,115,22,0.2)` }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
              style={{ background: "#22C55E" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white truncate" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Nguyễn Văn A</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={9} style={{ color: ACCENT_L }} />
              <span style={{ fontSize: "0.68rem", color: ACCENT_L, fontWeight: 600 }}>Nhân viên Sale</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5" style={{ scrollbarWidth: "none" }}>
        <div className="px-3 mb-2" style={{ fontSize: "0.6rem", fontWeight: 800, color: "#3D4F65", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Sales Pipeline
        </div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            style={({ isActive }) => isActive ? {
              background: `linear-gradient(135deg,${ACCENT}E0,${ACCENT}90)`,
              boxShadow: `0 2px 12px ${ACCENT}40`,
            } : {}}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ background: ACCENT_L }} />
                )}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)" }}
                >
                  <item.icon size={14} />
                </div>
                <span className="flex-1 truncate" style={{ fontSize: "0.82rem", fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
                {item.badge && !isActive && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: "#EF4444", fontSize: "0.6rem", fontWeight: 900 }}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={12} style={{ opacity: 0.7, flexShrink: 0 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div className="flex-shrink-0 px-3 pb-5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          style={{ fontSize: "0.82rem" }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-red-500/15"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          </div>
          <span style={{ fontWeight: 500 }}>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

// ── Sales Layout ───────────────────────────────────────────────────────────
export default function SaleLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_META[location.pathname] ?? {
    title: "Sales", sub: "Workspace dành cho nhân viên Sales", icon: TrendingUp, crumbs: ["Sales"],
  };
  const PageIcon = page.icon;

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <SaleSidebar />

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
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}
            >
              <Zap size={11} style={{ color: ACCENT }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: ACCENT, letterSpacing: "0.06em" }}>SALES</span>
            </div>
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
            <div className="hidden xl:flex items-center gap-2 min-w-0">
              <span className="text-slate-200">·</span>
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                <PageIcon size={11} style={{ color: ACCENT }} />
              </div>
              <span className="text-slate-500 truncate" style={{ fontSize: "0.78rem" }}>{page.sub}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative hidden md:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng..."
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
                2
              </span>
            </div>

            <div className="w-px h-6 bg-slate-200" />

            {/* Profile chip */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all group"
              style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}08`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg,${ACCENT},#DC2626)`, fontWeight: 800, fontSize: "0.65rem" }}
                >
                  VA
                </div>
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: `0 0 0 2px ${RING_CLR}` }} />
              </div>
              <div className="hidden sm:block text-left">
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>Nguyễn Văn A</div>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>Nhân viên Sale</div>
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