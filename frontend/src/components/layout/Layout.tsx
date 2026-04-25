import { Outlet, useLocation } from "react-router";
import Sidebar from "./Sidebar";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, { title: string; sub: string }> = {
  "/manager/dashboard": { title: "Dashboard & Admin", sub: "Tổng quan hệ thống, hợp đồng và cài đặt" },
  "/manager/rooms": { title: "Sơ đồ phòng", sub: "Quản lý và theo dõi trạng thái phòng" },
  "/manager/workflows": { title: "Quy trình (Workflows)", sub: "Kanban board theo dõi tiến trình khách thuê" },
  "/manager/financials": { title: "Tài chính & Báo cáo", sub: "Dòng tiền, báo cáo doanh thu và phân tích" },
  "/manager/showings": { title: "Lịch xem phòng", sub: "Quản lý lịch hẹn và nhân viên sale" },
};

export default function Layout() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "RMS", sub: "" };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top Header */}
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
                placeholder="Tìm kiếm nhanh..."
                className="pl-9 pr-4 py-2 rounded-lg bg-slate-100 border-0 text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
              />
            </div>
            <button className="relative w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs" style={{ fontWeight: 600 }}>QL</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}