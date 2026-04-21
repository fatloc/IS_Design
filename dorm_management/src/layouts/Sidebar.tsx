import React from "react";
import { Link } from "react-router";
import { Home, BedDouble, FileText, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-white md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-xl font-bold text-blue-600">Dorm Admin</h2>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          <Home size={20} />
          <span className="font-medium">Tổng quan</span>
        </Link>
        <Link
          to="/booking"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          <BedDouble size={20} />
          <span className="font-medium">Đặt phòng</span>
        </Link>
        <Link
          to="/deposit"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          <FileText size={20} />
          <span className="font-medium">Tiền cọc</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          <Settings size={20} />
          <span className="font-medium">Cài đặt</span>
        </Link>
      </nav>
    </aside>
  );
}
