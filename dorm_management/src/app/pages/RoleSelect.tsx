import { useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Calculator,
  ArrowRight, Building2, CheckCircle,
  Shield, TrendingUp, FileText
} from "lucide-react";

const roles = [
  {
    id: "manager",
    title: "Manager",
    subtitle: "Toàn quyền quản trị",
    description:
      "Tổng quan hệ thống, quản lý workflows, hợp đồng thuê, sơ đồ phòng và toàn bộ vận hành.",
    icon: LayoutDashboard,
    accentIcon: Shield,
    path: "/manager/dashboard",
    gradient: "from-indigo-600 to-violet-600",
    softBg: "bg-indigo-50",
    softText: "text-indigo-600",
    softBorder: "border-indigo-100",
    hoverRing: "hover:ring-indigo-300",
    badgeColor: "bg-indigo-600",
    features: ["Dashboard & Báo cáo", "Quản lý hợp đồng", "Kanban Workflows", "Cài đặt hệ thống"],
  },
  {
    id: "sales",
    title: "Sales",
    subtitle: "Quản lý bán hàng",
    description:
      "Quản lý lịch xem phòng, hồ sơ khách hàng, đặt cọc và chuyển đổi khách tiềm năng thành khách thuê.",
    icon: Users,
    accentIcon: TrendingUp,
    path: "/sale/dashboard",
    gradient: "from-emerald-500 to-teal-600",
    softBg: "bg-emerald-50",
    softText: "text-emerald-600",
    softBorder: "border-emerald-100",
    hoverRing: "hover:ring-emerald-300",
    badgeColor: "bg-emerald-500",
    features: ["Lịch xem phòng", "Hồ sơ khách hàng", "Đơn đặt cọc", "Tỷ lệ chuyển đổi"],
  },
  {
    id: "accountant",
    title: "Accountant",
    subtitle: "Quản lý tài chính",
    description:
      "Đối soát tài chính, phiếu thanh toán, hóa đơn và báo cáo doanh thu chi tiết theo kỳ.",
    icon: Calculator,
    accentIcon: FileText,
    path: "/manager/financials",
    gradient: "from-amber-500 to-orange-500",
    softBg: "bg-amber-50",
    softText: "text-amber-600",
    softBorder: "border-amber-100",
    hoverRing: "hover:ring-amber-300",
    badgeColor: "bg-amber-500",
    features: ["Đối soát thu chi", "Phiếu thanh toán", "Quản lý hóa đơn", "Báo cáo doanh thu"],
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100/60 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <span className="text-slate-900 text-sm" style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>RMS</span>
            <span className="text-slate-400 text-sm"> · Property Manager</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          Hệ thống đang hoạt động
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Hero heading */}
        <div className="text-center mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-500 shadow-sm mb-6">
            <Building2 size={12} className="text-indigo-500" />
            Room Management System v2.0
          </div>
          <h1 className="text-slate-900 mb-4" style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Welcome to the<br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Property Management System
            </span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed">
            Vui lòng chọn không gian làm việc phù hợp với vai trò của bạn để tiếp tục.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(role.path)}
              className={`group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-2 ring-2 ring-transparent ${role.hoverRing} overflow-hidden`}
            >
              {/* Top gradient band */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${role.gradient}`} />

              <div className="p-7">
                {/* Icon area */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 ${role.softBg} rounded-2xl flex items-center justify-center border ${role.softBorder} group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon size={26} className={role.softText} />
                  </div>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md`}>
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>

                {/* Text */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                      {role.title}
                    </h2>
                    <span className={`text-xs text-white px-2 py-0.5 rounded-full ${role.badgeColor}`} style={{ fontWeight: 500 }}>
                      {role.subtitle}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed mt-2">
                    {role.description}
                  </p>
                </div>

                {/* Feature list */}
                <ul className="space-y-2 mb-7">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-slate-600">
                      <CheckCircle size={13} className={role.softText} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(role.path); }}
                  className={`w-full py-3 rounded-xl text-sm text-white bg-gradient-to-r ${role.gradient} hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md`}
                  style={{ fontWeight: 600 }}
                >
                  Vào không gian làm việc
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>

              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none rounded-2xl`} />
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-12 text-xs text-slate-400 text-center">
          Bằng cách truy cập hệ thống, bạn đồng ý tuân thủ chính sách bảo mật và điều khoản sử dụng.
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-6 text-xs text-slate-300">
        © 2025 RMS · Room Management System · All rights reserved
      </footer>
    </div>
  );
}