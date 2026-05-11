import React from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router";
import {
  LayoutDashboard, Building2, LogOut, Bell, ChevronRight,
  Shield, ClipboardCheck, ArrowLeftRight, Search, Zap, Users,
} from "lucide-react";
import Sidebar from "./Sidebar";

// ── Manager theme ──────────────────────────────────────────────────────────
const ACCENT = "#4F46E5";
const ACCENT_L = "#818CF8";
const RING_CLR = "#6366F1";

const PAGE_META: Record<string, { title: string; sub: string; icon: React.ElementType; crumbs: string[] }> = {
  "/manager/dashboard": { title: "Dashboard Tổng quan", sub: "Báo cáo tình hình phòng, tỷ lệ lấp đầy và nhiệm vụ khẩn cấp", icon: LayoutDashboard, crumbs: ["Manager", "Dashboard"] },
  "/manager/approvals": { title: "Trung tâm Phê duyệt", sub: "Phê duyệt các yêu cầu thuê phòng và lịch hẹn từ Sales", icon: ClipboardCheck, crumbs: ["Manager", "Phê duyệt"] },
  "/manager/operations": { title: "Vận hành & Bàn giao", sub: "Quản lý quy trình bàn giao nhận phòng và thanh lý hợp đồng", icon: ArrowLeftRight, crumbs: ["Manager", "Vận hành"] },
  "/manager/rooms": { title: "Quản lý phòng", sub: "Danh sách và chi tiết trạng thái tất cả phòng trong hệ thống", icon: Building2, crumbs: ["Manager", "Phòng"] },
  "/manager/users": { title: "Tài khoản người dùng", sub: "Quản lý tài khoản nhân viên trong hệ thống", icon: Users, crumbs: ["Manager", "Tài khoản"] },
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_META[location.pathname] ?? {
    title: "Manager", sub: "Hệ thống quản lý ký túc xá", icon: Shield, crumbs: ["Manager"],
  };
  const PageIcon = page.icon;

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <Sidebar />

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
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: ACCENT, letterSpacing: "0.06em" }}>ADMIN</span>
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
                3
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
                  style={{ background: `linear-gradient(135deg,${ACCENT},#7C3AED)`, fontWeight: 800, fontSize: "0.65rem" }}
                >
                  QL
                </div>
                <div className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ boxShadow: `0 0 0 2px ${RING_CLR}` }} />
              </div>
              <div className="hidden sm:block text-left">
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>Admin</div>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>Manager Workspace</div>
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