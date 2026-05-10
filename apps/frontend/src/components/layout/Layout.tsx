import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Sidebar from "./Sidebar";
import {
  Bell, Search, ChevronRight, Shield, X, Loader2, CheckCircle2,
  LayoutDashboard, Grid3X3, Kanban, BarChart3, CalendarDays, FileText,
  Settings2, ClipboardCheck, ArrowLeftRight, Check, CheckCheck,
} from "lucide-react";

// ── Manager theme ──────────────────────────────────────────────────────────
const ACCENT   = "#4F46E5";
const ACCENT_L = "#818CF8";
const RING_CLR = "#6366F1";

const PAGE_META: Record<string, {
  title: string; sub: string; icon: React.ElementType; crumbs: string[];
}> = {
  "/manager/dashboard":  { title: "Dashboard & Tổng quan",     sub: "Theo dõi KPI, vận hành và cảnh báo hệ thống",            icon: LayoutDashboard, crumbs: ["Manager", "Dashboard"]      },
  "/manager/rooms":      { title: "Sơ đồ phòng",               sub: "Quản lý và theo dõi trạng thái từng phòng theo thời gian thực",  icon: Grid3X3,         crumbs: ["Manager", "Sơ đồ phòng"]   },
  "/manager/workflows":  { title: "Quy trình – Workflows",      sub: "Kanban board theo dõi toàn bộ tiến trình khách thuê",    icon: Kanban,          crumbs: ["Manager", "Workflows"]      },
  "/manager/financials": { title: "Tài chính & Báo cáo",        sub: "Dòng tiền, doanh thu, công nợ và phân tích xu hướng",    icon: BarChart3,        crumbs: ["Manager", "Tài chính"]      },
  "/manager/showings":   { title: "Lịch xem phòng",             sub: "Quản lý lịch hẹn và phân công nhân viên Sales",          icon: CalendarDays,    crumbs: ["Manager", "Lịch xem phòng"] },
  "/manager/settings":   { title: "Cài đặt & Quản trị",         sub: "Quản lý phòng, bảng giá và tài khoản nhân sự",           icon: Settings2,       crumbs: ["Manager", "Cài đặt"]        },
  "/manager/approvals":  { title: "Trung tâm Phê duyệt",         sub: "Duyệt thuê phòng, xác nhận cọc và kiểm tra điều kiện",   icon: ClipboardCheck,  crumbs: ["Manager", "Phê duyệt"]      },
  "/manager/operations": { title: "Bàn giao & Thanh lý",          sub: "Check-in biên bản bàn giao và check-out thanh lý cọc",   icon: ArrowLeftRight,  crumbs: ["Manager", "Vận hành"]       },
  "/manager/contracts":  { title: "Hợp đồng & Văn bản",           sub: "Quản lý hợp đồng thuê và các nghiệp vụ tài chính",       icon: FileText,        crumbs: ["Manager", "Hợp đồng"]       },
};

const NOTIFS = [
  { text: "3 hợp đồng cần duyệt hôm nay",   type: "warn",   link: "/manager/approvals" },
  { text: "Phòng A204 đã hết hạn 2 ngày",    type: "danger", link: "/manager/operations" },
  { text: "Báo cáo tháng 4 đã sẵn sàng",     type: "info",   link: "/manager/financials" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = PAGE_META[location.pathname] ?? {
    title: "Manager", sub: "Hệ thống quản lý ký túc xá", icon: LayoutDashboard, crumbs: ["Manager"],
  };
  const PageIcon = page.icon;

  const [notifs, setNotifs] = useState(NOTIFS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSearch(val.length > 0);
    setIsSearching(true);
    // Fake loading delay for search
    setTimeout(() => setIsSearching(false), 400);
  };

  const markAllRead = () => {
    setNotifs([]);
    setShowNotifs(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F8FAFC" }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
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
          {/* Left: Breadcrumb + title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Role badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}
            >
              <Shield size={11} style={{ color: ACCENT }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: ACCENT, letterSpacing: "0.06em" }}>MANAGER</span>
            </div>

            {/* Breadcrumb */}
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

            {/* Page title (hidden on small) */}
            <div className="hidden xl:flex items-center gap-2 min-w-0">
              <span className="text-slate-200">·</span>
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                <PageIcon size={11} style={{ color: ACCENT }} />
              </div>
              <span className="text-slate-500 truncate" style={{ fontSize: "0.78rem" }}>{page.sub}</span>
            </div>
          </div>

          {/* Right: Search + Bell + Profile */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Search */}
            <div className="relative hidden md:block" ref={searchRef}>
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => { if (searchQuery.length > 0) setShowSearch(true); }}
                placeholder="Tìm kiếm nhanh..."
                className="pl-9 pr-4 rounded-xl text-slate-700 placeholder-slate-400 transition"
                style={{
                  width: showSearch ? 260 : 200, paddingTop: "0.5rem", paddingBottom: "0.5rem",
                  background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                  fontSize: "0.82rem", outline: "none",
                }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = `0 0 0 3px ${ACCENT}15`; e.currentTarget.style.background = "white"; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = "#F8FAFC"; }}
              />
              
              {/* Search Dropdown */}
              {showSearch && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-slate-200"
                  style={{ animation: "fadeIn 0.15s ease-out" }}>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6 text-slate-500">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      <span style={{ fontSize: "0.8rem" }}>Đang tìm "{searchQuery}"...</span>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Kết quả tìm kiếm</div>
                      {searchQuery.toLowerCase().includes("phòng") ? (
                        <>
                          <div onClick={() => { navigate("/manager/rooms"); setShowSearch(false); setSearchQuery(""); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Grid3X3 size={14} className="text-indigo-600" /></div>
                            <div>
                              <div className="text-sm font-semibold text-slate-700">Phòng A102</div>
                              <div className="text-xs text-slate-500">Tầng 1 · Đang có khách</div>
                            </div>
                          </div>
                          <div onClick={() => { navigate("/manager/rooms"); setShowSearch(false); setSearchQuery(""); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><Grid3X3 size={14} className="text-indigo-600" /></div>
                            <div>
                              <div className="text-sm font-semibold text-slate-700">Phòng B205</div>
                              <div className="text-xs text-slate-500">Tầng 2 · Trống</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <Search size={24} className="mx-auto text-slate-300 mb-2" />
                          <div className="text-sm text-slate-500">Không tìm thấy kết quả phù hợp</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${showNotifs ? "bg-indigo-50 border-indigo-200 text-indigo-600" : ""}`}
                style={{ background: showNotifs ? "#EEF2FF" : "#F8FAFC", border: `1.5px solid ${showNotifs ? ACCENT_L : "#E2E8F0"}` }}
                onMouseEnter={e => { if(!showNotifs) (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT }}
                onMouseLeave={e => { if(!showNotifs) (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0" }}
              >
                <Bell size={15} className={showNotifs ? "text-indigo-600" : "text-slate-500"} />
              </button>
              {notifs.length > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white pointer-events-none"
                  style={{ background: "#EF4444", fontSize: "0.6rem", fontWeight: 800 }}
                >
                  {notifs.length}
                </span>
              )}
              
              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-slate-200 flex flex-col"
                  style={{ animation: "fadeIn 0.15s ease-out" }}>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="font-bold text-slate-800 text-sm">Thông báo</div>
                    {notifs.length > 0 && (
                      <button onClick={markAllRead} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <CheckCheck size={14} /> Đã đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                        <div className="text-sm font-semibold text-slate-600">Bạn đã đọc hết thông báo</div>
                        <div className="text-xs text-slate-400 mt-1">Không có thông báo nào mới!</div>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifs.map((n, idx) => (
                          <div key={idx} onClick={() => { navigate(n.link); setShowNotifs(false); }} className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer flex gap-3">
                            <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" 
                              style={{ 
                                background: n.type === "warn" ? "#F59E0B" : n.type === "danger" ? "#EF4444" : "#3B82F6",
                                marginTop: "6px"
                              }} />
                            <div>
                              <div className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">{n.text}</div>
                              <div className="text-xs text-slate-400 mt-1">Vài phút trước</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200" />

            {/* User profile chip */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all group"
              style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}08`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC"; }}
            >
              {/* Avatar with ring */}
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
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", lineHeight: 1 }}>Admin - Quản lý</div>
                <div style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>Manager</div>
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