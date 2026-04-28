import { Outlet, useLocation, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard, FileText, CalendarDays, Users, CreditCard,
  Building2, LogOut, Bell, ChevronRight, Search, TrendingUp
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/sale/dashboard" },
  { label: "Yêu cầu thuê", icon: FileText, path: "/sale/requests" },
  { label: "Lịch xem phòng", icon: CalendarDays, path: "/sale/appointments" },
  { label: "Khách hàng", icon: Users, path: "/sale/customers" },
  { label: "Đặt cọc", icon: CreditCard, path: "/sale/deposits" },
];

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/sale/dashboard": { title: "Sales Dashboard", sub: "Tổng quan hoạt động bán hàng hôm nay" },
  "/sale/requests": { title: "Yêu cầu thuê phòng", sub: "Quản lý và theo dõi yêu cầu từ khách hàng" },
  "/sale/appointments": { title: "Lịch xem phòng", sub: "Quản lý lịch hẹn xem phòng theo ngày/tuần" },
  "/sale/customers": { title: "Hồ sơ khách hàng", sub: "Danh sách và thông tin chi tiết khách hàng" },
  "/sale/deposits": { title: "Xử lý đặt cọc", sub: "Pipeline xét duyệt và quản lý hồ sơ đặt cọc" },
};

function SaleSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm" style={{ fontWeight: 600 }}>RMS Sales</div>
            <div className="text-slate-400 text-xs">Sales Workspace</div>
          </div>
        </div>
      </div>

      {/* Staff info */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>LA</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs truncate" style={{ fontWeight: 500 }}>Nguyễn Lan Anh</div>
            <div className="text-slate-400 text-xs">Sales Staff</div>
          </div>
          <Bell size={14} className="text-slate-400 flex-shrink-0" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-slate-500 text-xs uppercase tracking-wider px-3 mb-3" style={{ fontWeight: 600 }}>Menu</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-400 rounded-r-full" />
              )}
              <item.icon size={16} className="flex-shrink-0" />
              <span className="text-sm flex-1">{item.label}</span>
              {isActive && <ChevronRight size={12} className="opacity-60" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom - Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-slate-700/50">
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

export default function SaleLayout() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "Sales", sub: "" };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SaleSidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 leading-tight">{page.title}</h1>
            <p className="text-xs text-slate-500">{page.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-9 pr-4 py-2 rounded-lg bg-slate-100 border-0 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 w-52"
              />
            </div>
            <button className="relative w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>LA</div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
