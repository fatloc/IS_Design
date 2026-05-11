import React from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, Building2, LogOut, ChevronRight,
  ClipboardCheck, ArrowLeftRight, TrendingUp, Settings,
} from "lucide-react";

const ACCENT = "#4F46E5";
const ACCENT_L = "#818CF8";
const RING_CLR = "#6366F1";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard", badge: null },
  { label: "Phê duyệt", icon: ClipboardCheck, path: "/manager/approvals", badge: "3" },
  { label: "Vận hành", icon: ArrowLeftRight, path: "/manager/operations", badge: null },
];

export default function Sidebar() {
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
            style={{ background: `linear-gradient(135deg,${ACCENT},#7C3AED)`, boxShadow: "0 4px 12px rgba(79,70,229,0.3)" }}
          >
            <Building2 size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
              Dorm<span style={{ color: ACCENT_L }}>Admin</span>
            </div>
            <div className="text-slate-500" style={{ fontSize: "0.68rem", letterSpacing: "0.04em", fontWeight: 600 }}>
              MANAGER SYSTEM
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
              style={{ background: `linear-gradient(135deg,${ACCENT},#7C3AED)`, fontWeight: 800, fontSize: "0.75rem" }}
            >
              QL
            </div>
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `0 0 0 2.5px ${RING_CLR}, 0 0 0 4px rgba(99,102,241,0.2)` }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
              style={{ background: "#22C55E" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white truncate" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Quản lý</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp size={9} style={{ color: ACCENT_L }} />
              <span style={{ fontSize: "0.68rem", color: ACCENT_L, fontWeight: 600 }}>Active Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto no-scrollbar space-y-0.5" style={{ scrollbarWidth: "none" }}>
        <div className="px-3 mb-2" style={{ fontSize: "0.6rem", fontWeight: 800, color: "#3D4F65", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Main Workflow
        </div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            style={({ isActive }) => isActive ? {
              background: `linear-gradient(135deg,${ACCENT}E0,${ACCENT}90)`,
              boxShadow: "0 2px 12px rgba(79,70,229,0.25)",
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

        <div className="h-4" />
        <div className="px-3 mb-2" style={{ fontSize: "0.6rem", fontWeight: 800, color: "#3D4F65", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Resources
        </div>
        <NavLink to="/manager/rooms"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Building2 size={14} />
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>Quản lý phòng</span>
        </NavLink>
        <NavLink to="/manager/settings"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Settings size={14} />
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>Cấu hình hệ thống</span>
        </NavLink>
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
