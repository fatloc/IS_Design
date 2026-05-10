import { Outlet, useLocation, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  Scale,
  Building2,
  LogOut,
  Bell,
  ChevronRight,
  Calculator,
  Search,
  BadgeDollarSign,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV_GROUPS = [
  {
    label: "Tổng quan",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/accountant/dashboard" }],
  },
  {
    label: "Nghiệp vụ kế toán",
    items: [
      { label: "Rental Requests",      icon: ArrowLeftRight, path: "/accountant/rental-requests"      },
      { label: "Operational Payments", icon: FileText,       path: "/accountant/operational-payments" },
      { label: "Check-out Settlement", icon: Scale,          path: "/accountant/checkout-settlement"  },
      { label: "Quản lý Hợp đồng",    icon: FileText,       path: "/accountant/contracts"            },
    ],
  },
];

const PAGE_META: Record<string, { title: string; sub: string; icon: React.ElementType; crumbs: string[] }> = {
  "/accountant/dashboard":            { title: "Dashboard Kế toán",       sub: "Tổng quan 3 luồng kế toán",                    icon: LayoutDashboard, crumbs: ["Kế toán", "Dashboard"] },
  "/accountant/rental-requests":      { title: "Yêu cầu thu cọc",         sub: "Kiểm tra và phát phiếu thu cọc từ sale",        icon: ArrowLeftRight,  crumbs: ["Kế toán", "Yêu cầu thu cọc"] },
  "/accountant/operational-payments": { title: "Thu tiền định kỳ",        sub: "Thu tiền từ hợp đồng đang hoạt động",           icon: FileText,        crumbs: ["Kế toán", "Thu tiền định kỳ"] },
  "/accountant/checkout-settlement":  { title: "Đối soát thanh lý",       sub: "Tính hoàn cọc, khấu trừ và xác nhận thanh lý", icon: Scale,           crumbs: ["Kế toán", "Đối soát thanh lý"] },
  "/accountant/transactions":         { title: "Thanh toán tiền cọc",     sub: "Nhận yêu cầu thuê và sinh phiếu thu cọc",      icon: ArrowLeftRight,  crumbs: ["Kế toán", "Thanh toán tiền cọc"] },
  "/accountant/invoices":             { title: "Thanh toán đầu kỳ",       sub: "Thu tiền khi vào ở dựa trên hợp đồng đã ký",   icon: FileText,        crumbs: ["Kế toán", "Thanh toán đầu kỳ"] },
  "/accountant/reconciliation":       { title: "Đối soát & trả phòng",    sub: "Tính hoàn cọc, khấu trừ và xác nhận thanh lý", icon: Scale,           crumbs: ["Kế toán", "Đối soát & trả phòng"] },
  "/accountant/contracts":            { title: "Quản lý Hợp đồng",        sub: "Danh sách hợp đồng thuê đang hoạt động",       icon: FileText,        crumbs: ["Kế toán", "Hợp đồng"] },
};

function AccountantSidebar() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const initials = currentUser?.hoTen
    ? currentUser.hoTen.split(" ").map(n => n[0]).join("").toUpperCase().slice(-2)
    : "??";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-200">
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
          <Building2 size={18} />
        </div>
        <div>
          <div className="text-sm font-bold text-white">HomeStay<span className="text-emerald-300">Dorm</span></div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Kế toán workspace</div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">{currentUser?.hoTen || "Accountant"}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-300">
              <Calculator size={10} /> Kế toán
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? "bg-white/15" : "bg-white/5"}`}>
                        <item.icon size={14} />
                      </span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {isActive && <ChevronRight size={14} className="opacity-80" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          onClick={() => navigate("/")}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5">
            <LogOut size={14} />
          </span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default function AccountantLayout() {
  const location = useLocation();
  const page = PAGE_META[location.pathname] ?? { title: "Kế toán", sub: "Workspace tài chính", icon: Calculator, crumbs: ["Kế toán"] };
  const PageIcon = page.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <AccountantSidebar />

      <div className="min-h-screen pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              <BadgeDollarSign size={11} /> Kế toán
            </div>
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-slate-400">
              {page.crumbs.map((crumb, index) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronRight size={12} className="text-slate-300" />}
                  <span className={index === page.crumbs.length - 1 ? "font-semibold text-slate-900" : "text-slate-400"}>
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
            <div className="hidden items-center gap-2 xl:flex">
              <span className="text-slate-300">·</span>
              <PageIcon size={14} className="text-emerald-600" />
              <span className="truncate text-sm text-slate-500">{page.sub}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm hoá đơn, giao dịch..."
                className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-emerald-500 hover:text-emerald-600">
              <Bell size={15} />
              <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold leading-4 text-white">1</span>
            </button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
