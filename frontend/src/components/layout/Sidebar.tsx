import { NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, Grid3X3, Kanban, BarChart3, CalendarDays,
  Building2, LogOut, Settings, Bell, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard" },
  { label: "Sơ đồ phòng", icon: Grid3X3, path: "/manager/rooms" },
  { label: "Workflows", icon: Kanban, path: "/manager/workflows" },
  { label: "Tài chính", icon: BarChart3, path: "/manager/financials" },
  { label: "Lịch xem phòng", icon: CalendarDays, path: "/manager/showings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm" style={{ fontWeight: 600 }}>RMS Manager</div>
            <div className="text-slate-400 text-xs">v2.0 Pro</div>
          </div>
        </div>
      </div>

      {/* Manager info */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>M</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs truncate" style={{ fontWeight: 500 }}>Nguyễn Quản Lý</div>
            <div className="text-slate-400 text-xs">Manager</div>
          </div>
          <Bell size={14} className="text-slate-400 flex-shrink-0" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-slate-500 text-xs uppercase tracking-wider px-3 mb-3" style={{ fontWeight: 600 }}>Menu chính</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-indigo-400 rounded-r-full" />
              )}
              <item.icon size={16} className="flex-shrink-0" />
              <span className="text-sm flex-1">{item.label}</span>
              {isActive && <ChevronRight size={12} className="opacity-60" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-700/50 pt-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm">
          <Settings size={16} />
          Cài đặt hệ thống
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-150 text-sm group"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform duration-150" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}