import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, Building2, ChevronRight, Check,
  User, Lock, ShieldCheck, ArrowRight,
} from "lucide-react";
import { login } from "@/services/api";
import { useAuthStore, type AuthUser } from "@/store/authStore";


const DORM_IMAGE = "https://images.unsplash.com/photo-1767800766055-1cdbd2e351b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkZW50JTIwZG9ybWl0b3J5JTIwcm9vbSUyMGludGVyaW9yJTIwY296eXxlbnwxfHx8fDE3NzczNjQ3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080";

// ─── ANIMATION keyframes injected once ───────────────────────────────────────
const STYLES = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse2   { 0%,100% { opacity:.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }
  @keyframes shimmer  { from { background-position: -400px 0 } to { background-position: 400px 0 } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  .fade-up-1  { animation: fadeUp .55s .05s cubic-bezier(.21,1.02,.73,1) both; }
  .fade-up-2  { animation: fadeUp .55s .12s cubic-bezier(.21,1.02,.73,1) both; }
  .fade-up-3  { animation: fadeUp .55s .20s cubic-bezier(.21,1.02,.73,1) both; }
  .fade-up-4  { animation: fadeUp .55s .28s cubic-bezier(.21,1.02,.73,1) both; }
  .fade-up-5  { animation: fadeUp .55s .36s cubic-bezier(.21,1.02,.73,1) both; }
  .fade-up-6  { animation: fadeUp .55s .44s cubic-bezier(.21,1.02,.73,1) both; }
`;

function normalizeRoleLabel(value: string) {
  const compact = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  return compact;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  const { setAuth } = useAuthStore();

  // Main login handler
  const handleLogin = async () => {
    if (!email.trim()) { setError("Vui lòng nhập email hoặc tên đăng nhập."); return; }
    if (!password.trim()) { setError("Vui lòng nhập mật khẩu."); return; }
    setError("");

    setLoading(true);

    try {
      const result = await login({ username: email, password });
      const user = result.user as AuthUser;
      setAuth(user, result.token);

      const rawRole = normalizeRoleLabel(String(user.role ?? user.loaiNhanVien ?? ""));
      let target = "/sale/dashboard";
      if (rawRole.includes("manager") || rawRole.includes("quanly")) target = "/manager/dashboard";
      if (rawRole.includes("accountant") || rawRole.includes("ketoan")) target = "/accountant/dashboard";

      navigate(target, { replace: true });
    } catch {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
      setLoading(false);
    }
  };

  const isLoading = loading;

  return (
    <>
      <style>{STYLES}</style>

      <div className="min-h-screen flex" style={{ fontFamily: "inherit" }}>

        {/* ─── LEFT: Branding Panel ──────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
          {/* Background image */}
          <img
            src={DORM_IMAGE}
            alt="HomeStay Dorm interior"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Gradient overlays — dark base + brand tint */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(67,56,202,0.70) 50%, rgba(15,23,42,0.88) 100%)" }} />

          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full px-12 py-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Building2 size={20} className="text-white" />
              </div>
              <span className="text-white" style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
                HomeStay<span style={{ color: "#A5B4FC" }}>Dorm</span>
              </span>
            </div>

            {/* Hero text */}
            <div className="mt-auto pb-16">
              {/* Tag */}
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px flex-1" style={{ background: "rgba(165,180,252,0.35)" }} />
                <span className="px-3 py-1 rounded-full text-indigo-200"
                  style={{ background: "rgba(99,102,241,0.35)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", border: "1px solid rgba(165,180,252,0.35)" }}>
                  QUẢN LÝ KÝ TÚC XÁ
                </span>
              </div>

              <h1 className="text-white mb-4"
                style={{ fontWeight: 800, fontSize: "2.6rem", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Hệ thống Quản lý<br />
                <span style={{
                  background: "linear-gradient(90deg,#A5B4FC,#C4B5FD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Ký túc xá Toàn diện
                </span>
              </h1>

              <p className="text-indigo-200 mb-10"
                style={{ fontSize: "1rem", lineHeight: 1.6, maxWidth: 380 }}>
                Nền tảng quản lý phòng trọ thông minh cho Manager, Sales và Kế toán — tất cả trong một giao diện.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2.5">
                {["Dashboard thời gian thực", "Kanban Workflows", "Quản lý hợp đồng", "Báo cáo tài chính"].map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(6px)" }}>
                    <Check size={11} className="text-indigo-300" />
                    <span className="text-white" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex gap-8 mt-10 pt-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                {[
                  { value: "3", label: "Vai trò hệ thống" },
                  { value: "500+", label: "Phòng quản lý" },
                  { value: "99.9%", label: "Uptime" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>{s.value}</div>
                    <div className="text-indigo-300" style={{ fontSize: "0.73rem", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Login Form ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white relative overflow-y-auto no-scrollbar px-6 py-10"
          style={{ scrollbarWidth: "none" }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8 fade-up-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#6366F1" }}>
              <Building2 size={17} className="text-white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#1E293B" }}>
              HomeStay<span style={{ color: "#6366F1" }}>Dorm</span>
            </span>
          </div>

          <div className="w-full" style={{ maxWidth: 420 }}>

            {/* Header */}
            <div className="mb-8 fade-up-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "#EEF2FF" }}>
                  <ShieldCheck size={14} style={{ color: "#6366F1" }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6366F1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Xác thực hệ thống
                </span>
              </div>
              <h2 style={{ fontWeight: 800, fontSize: "1.85rem", color: "#0F172A", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                Đăng nhập hệ thống
              </h2>
              <p className="mt-2" style={{ fontSize: "0.88rem", color: "#64748B", lineHeight: 1.55 }}>
                Vui lòng nhập tài khoản được cấp để tiếp tục truy cập hệ thống quản lý.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4"
                style={{ background: "#FFF1F2", border: "1px solid #FECDD3", animation: "fadeIn .2s ease both" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                <span style={{ fontSize: "0.82rem", color: "#BE123C", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 fade-up-2">
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Email hoặc Tên đăng nhập
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User size={15} style={{ color: email ? "#6366F1" : "#94A3B8" }} />
                  </div>
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="example@homestay.vn"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    className="w-full rounded-xl transition"
                    style={{
                      paddingLeft: "2.6rem", paddingRight: "1rem", paddingTop: "0.75rem", paddingBottom: "0.75rem",
                      border: `1.5px solid ${email ? "#C7D2FE" : "#E2E8F0"}`,
                      background: email ? "#FAFAFE" : "#FAFAFA",
                      fontSize: "0.88rem", color: "#1E293B", outline: "none",
                      boxShadow: email ? "0 0 0 3px rgba(99,102,241,0.08)" : "none",
                      transition: "border-color .15s, box-shadow .15s",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = email ? "#C7D2FE" : "#E2E8F0"; e.currentTarget.style.boxShadow = email ? "0 0 0 3px rgba(99,102,241,0.08)" : "none"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock size={15} style={{ color: password ? "#6366F1" : "#94A3B8" }} />
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full rounded-xl transition"
                    style={{
                      paddingLeft: "2.6rem", paddingRight: "3rem", paddingTop: "0.75rem", paddingBottom: "0.75rem",
                      border: `1.5px solid ${password ? "#C7D2FE" : "#E2E8F0"}`,
                      background: password ? "#FAFAFE" : "#FAFAFA",
                      fontSize: "0.88rem", color: "#1E293B", outline: "none",
                      boxShadow: password ? "0 0 0 3px rgba(99,102,241,0.08)" : "none",
                      transition: "border-color .15s, box-shadow .15s",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = password ? "#C7D2FE" : "#E2E8F0"; e.currentTarget.style.boxShadow = password ? "0 0 0 3px rgba(99,102,241,0.08)" : "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition"
                    style={{ color: showPw ? "#6366F1" : "#94A3B8", outline: "none" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div
                    onClick={() => setRemember(p => !p)}
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: remember ? "#6366F1" : "#CBD5E1",
                      background: remember ? "#6366F1" : "white",
                      boxShadow: remember ? "0 0 0 2px rgba(99,102,241,0.18)" : "none",
                    }}>
                    {remember && <Check size={11} className="text-white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "#475569", fontWeight: 500 }}>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button"
                  className="transition"
                  style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6366F1", outline: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#4338CA")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6366F1")}>
                  Quên mật khẩu?
                </button>
              </div>

              {/* Primary Login Button */}
              <button
                onClick={() => handleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl transition-all relative overflow-hidden"
                style={{
                  padding: "0.85rem 1.5rem",
                  background: isLoading
                    ? "linear-gradient(135deg,#818CF8,#6366F1)"
                    : "linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)",
                  color: "white", fontWeight: 700, fontSize: "0.95rem",
                  boxShadow: isLoading ? "none" : "0 4px 14px rgba(99,102,241,0.38), 0 1px 3px rgba(0,0,0,0.12)",
                  letterSpacing: "-0.005em",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  outline: "none",
                }}
                onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ""; }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                      style={{ borderColor: "rgba(255,255,255,0.35)", borderTopColor: "white", animation: "spin .75s linear infinite" }} />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Đăng nhập
                    <ArrowRight size={15} style={{ marginLeft: "auto" }} />
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center fade-up-4">
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <span style={{ fontSize: "0.82rem", color: "#94A3B8" }}>Chưa có tài khoản nhân viên?</span>
                <button
                  onClick={() => navigate("/register")}
                  className="flex items-center gap-1 transition"
                  style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6366F1", outline: "none" }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#4338CA"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#6366F1"}>
                  Đăng ký tài khoản <ChevronRight size={13} />
                </button>
              </div>
              <span style={{ fontSize: "0.73rem", color: "#CBD5E1" }}>
                © 2026 HomeStayDorm · v2.4.1 · Hệ thống quản lý ký túc xá
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}