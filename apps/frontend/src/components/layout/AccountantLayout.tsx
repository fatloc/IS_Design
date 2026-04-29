import { Outlet, useLocation, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard, ArrowLeftRight, FileText, Scale,
  Building2, LogOut, Bell, ChevronRight, Calculator, Search,
  BadgeDollarSign,
} from "lucide-react";

// ── Accountant theme: Emerald Green ───────────────────────────────────────
const ACCENT   = "#059669"; // emerald-600
const ACCENT_L = "#34D399"; // emerald-400
const RING_CLR = "#10B981"; // emerald-500

const NAV_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      { label: "Dashboard",           icon: LayoutDashboard, path: "/accountant/dashboard"       },
    ],
  },
  {
    label: "Nghiệp vụ tài chính",
    items: [
      { label: "Phiếu Thu / Chi",      icon: ArrowLeftRight,  path: "/accountant/transactions"    },
      { label: "Hoá đơn định kỳ",      icon: FileText,        path: "/accountant/invoices"        },
      { label: "Đối soát & Thanh lý",  icon: Scale,           path: "/accountant/reconciliation"  },
    ],
  },
];

const PAGE_META: Record<string, { title: string; sub: string; icon: React.ElementType; crumbs: string[] }> = {
  "/accountant/dashboard":      { title: "Accountant Dashboard",    sub: "Tổng quan tài chính, cảnh báo và KPI kế toán",           icon: LayoutDashboard, crumbs: ["Kế toán", "Dashboard"]         },
  "/accountant/transactions":   { title: "Phiếu Thu / Chi",         sub: "Ghi nhận và quản lý giao dịch tài chính theo loại",      icon: ArrowLeftRight,  crumbs: ["Kế toán", "Phiếu Thu/Chi"]     },
  "/accountant/invoices":       { title: "Hoá đơn định kỳ",         sub: "Phát hành và theo dõi hoá đơn thuê phòng hàng tháng",   icon: FileText,        crumbs: ["Kế toán", "Hoá đơn"]           },
  "/accountant/reconciliation": { title: "Đối soát & Thanh lý",     sub: "Tính toán hoàn/giữ cọc khi khách trả phòng",            icon: Scale,           crumbs: ["Kế toán", "Đối soát & Thanh lý"] },
};

// ── Accountant Sidebar ─────────────────────────────────────────────────────
function AccountantSidebar() {
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
            style={{ background: `linear-gradient(135deg,${ACCENT},#0891B2)`, boxShadow: `0 4px 12px ${ACCENT}50` }}
          >
            <Building2 size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "0.9rem", letterSpacing: "-0.01em" }}>
              HomeStay<span style={{ color: ACCENT_L }}>Dorm</span>
            </div>
            <div className="text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.04em", fontWeight: 600 }}>
              KẾ TOÁN WORKSPACE
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
              style={{ background: `linear-gradient(135deg,${ACCENT},#0891B2)`, fontWeight: 800, fontSize: "0.75rem" }}
            >
              TB
            </div>
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `0 0 0 2.5px ${RING_CLR}, 0 0 0 4px rgba(16,185,129,0.2)` }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
              style={{ background: "#22C55E" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white truncate" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Trần Thị B</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calculator size={9} style={{ color: ACCENT_L }} />
              <span style={{ fontSize: "0.68rem", color: ACCENT_L, fontWeight: 600 }}>Kế Toán</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-4" style={{ scrollbarWidth: "none" }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-1.5" style={{ fontSize: "0.62rem", fontWeight: 800, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => (
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
                      {isActive && <ChevronRight size={12} style={{ opacity: 0.7 }} />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
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

// ── Accountant Layout ──────────────────────────────────────────────────────
export default function AccountantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_META[location.pathname] ?? {
    title: "Kế toán", sub: "Workspace tài chính", icon: Calculator, crumbs: ["Kế toán"],
  };
  const PageIcon = page.icon;

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <AccountantSidebar />

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
              <BadgeDollarSign size={11} style={{ color: ACCENT }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: ACCENT, letterSpacing: "0.06em" }}>KẾ TOÁN</span>
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
                placeholder="Tìm hoá đơn, giao dịch..."
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
                1
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
                  style={{ background: `linear-gradient(135deg,${ACCENT},#0891B2)`, fontWeight: 800, fontSize: "0.65rem" }}
                >
                  TB
                </div>
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: `0 0 0 2px ${RING_CLR}` }} />
              </div>
              <div className="hidden sm:block text-left">
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>Trần Thị B</div>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>Kế Toán</div>
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
