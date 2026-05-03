import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, Building2, User, Lock, Phone, Mail, CreditCard,
  ShieldCheck, Check, ArrowRight, ChevronRight, AlertCircle,
  TrendingUp, BarChart3, Sparkles, UserPlus,
} from "lucide-react";

// ── Colors ─────────────────────────────────────────────────────────────────
const NAVY  = "#0F172A";
const TEAL  = "#0D9488";
const TEAL2 = "#14B8A6";
const TEAL3 = "#CCFBF1";

const BG_IMAGE = "https://images.unsplash.com/photo-1585744135548-705522607eee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkb3JtaXRvcnklMjBidWlsZGluZyUyMGV4dGVyaW9yJTIwbmlnaHQlMjBibHVlfGVufDF8fHx8MTc3NzQyOTMzNXww&ixlib=rb-4.1.0&q=80&w=1080";

// ── Keyframes ──────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  .reg-fade-1 { animation: fadeUp .5s .05s cubic-bezier(.21,1.02,.73,1) both; }
  .reg-fade-2 { animation: fadeUp .5s .12s cubic-bezier(.21,1.02,.73,1) both; }
  .reg-fade-3 { animation: fadeUp .5s .20s cubic-bezier(.21,1.02,.73,1) both; }
  .reg-fade-4 { animation: fadeUp .5s .28s cubic-bezier(.21,1.02,.73,1) both; }
  .reg-fade-5 { animation: fadeUp .5s .36s cubic-bezier(.21,1.02,.73,1) both; }
`;

// ── Role options ───────────────────────────────────────────────────────────
const ROLES = [
  { id:"manager",   label:"Quản lý",        sub:"Toàn quyền hệ thống",    icon:ShieldCheck, emoji:"🛡️",  color:"#4F46E5", light:"#EEF2FF", border:"#C7D2FE" },
  { id:"sale",      label:"Nhân viên Sale",  sub:"Quản lý khách & HĐ",    icon:TrendingUp,  emoji:"💼",  color:"#EA580C", light:"#FFF7ED", border:"#FED7AA" },
  { id:"accountant",label:"Kế toán",         sub:"Tài chính & Kế toán",   icon:BarChart3,   emoji:"📊",  color:"#059669", light:"#ECFDF5", border:"#6EE7B7" },
];

// ── Input component ────────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: { label:string; required?:boolean; error?:string; children:React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5" style={{ fontSize:"0.78rem", fontWeight:700, color:"#1E293B" }}>
        {label}{required && <span style={{ color:"#EF4444", marginLeft:2 }}>*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5" style={{ animation:"fadeIn .2s both" }}>
          <AlertCircle size={11} style={{ color:"#EF4444", flexShrink:0 }}/>
          <span style={{ fontSize:"0.72rem", color:"#EF4444", fontWeight:500 }}>{error}</span>
        </div>
      )}
    </div>
  );
}

function StyledInput({
  type="text", value, onChange, placeholder, icon: Icon, suffix, disabled,
  error, maxLength,
}: {
  type?:string; value:string; onChange:(v:string)=>void;
  placeholder?:string; icon?:React.ElementType; suffix?:React.ReactNode;
  disabled?:boolean; error?:boolean; maxLength?:number;
}) {
  const [focused, setFocused] = useState(false);
  const hasVal = value.length > 0;
  const borderColor = error ? "#EF4444" : focused ? TEAL : hasVal ? "#A7F3D0" : "#E2E8F0";
  const shadowColor = error ? "rgba(239,68,68,0.12)" : focused ? "rgba(13,148,136,0.14)" : "none";
  const bg = error ? "#FFF5F5" : hasVal||focused ? "#F0FDFA" : "#FAFAFA";

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon size={15} style={{ color: focused||hasVal ? TEAL : "#94A3B8", transition:"color .15s" }}/>
        </div>
      )}
      <input
        type={type} value={value} placeholder={placeholder}
        maxLength={maxLength} disabled={disabled}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
        className="w-full rounded-xl outline-none transition-all"
        style={{
          paddingLeft: Icon ? "2.6rem" : "0.9rem",
          paddingRight: suffix ? "3rem" : "0.9rem",
          paddingTop: "0.72rem", paddingBottom: "0.72rem",
          border: `1.5px solid ${borderColor}`,
          background: bg, fontSize:"0.88rem", color:"#1E293B",
          boxShadow: focused||error ? `0 0 0 3px ${shadowColor}` : "none",
          transition:"border-color .15s, box-shadow .15s, background .15s",
        }}
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function Register() {
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────────
  const [fullName, setFullName]   = useState("");
  const [phone,    setPhone]      = useState("");
  const [email,    setEmail]      = useState("");
  const [cccd,     setCccd]       = useState("");
  const [gender,   setGender]     = useState<"Nam"|"Nữ"|"">("");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [role,     setRole]       = useState<string>("");
  const [showPw,   setShowPw]     = useState(false);
  const [showCfm,  setShowCfm]    = useState(false);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errors,   setErrors]     = useState<Record<string,string>>({});
  const [loading,  setLoading]    = useState(false);
  const [success,  setSuccess]    = useState(false);
  const [touched,  setTouched]    = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string,string> = {};
    if (!fullName.trim())            e.fullName = "Vui lòng nhập họ và tên";
    if (!/^[0-9]{10}$/.test(phone))  e.phone    = "Số điện thoại phải đúng 10 chữ số";
    if (!email.includes("@"))        e.email    = "Email không hợp lệ";
    if (!/^[0-9]{12}$/.test(cccd))   e.cccd     = "CCCD phải đúng 12 chữ số";
    if (!gender)                     e.gender   = "Vui lòng chọn giới tính";
    if (username.length < 4)         e.username = "Tên đăng nhập tối thiểu 4 ký tự";
    if (/\s/.test(username))         e.username = "Tên đăng nhập không được chứa khoảng trắng";
    if (password.length < 8)         e.password = "Mật khẩu tối thiểu 8 ký tự";
    if (confirm !== password)        e.confirm  = "Mật khẩu xác nhận không khớp";
    if (!role)                       e.role     = "Vui lòng chọn loại nhân viên";
    return e;
  };

  const handleSubmit = () => {
    setTouched(true);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    }, 1600);
  };

  const fieldError = (key:string) => touched ? errors[key] : undefined;

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <img src={BG_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter:"blur(3px)", transform:"scale(1.06)" }}/>
          <div className="absolute inset-0" style={{ background:"rgba(8,16,38,0.84)" }}/>
          <div className="relative z-10 text-center px-6" style={{ animation:"fadeIn .4s both" }}>
            <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background:`linear-gradient(135deg,${TEAL},#0891B2)`, boxShadow:`0 8px 30px ${TEAL}50` }}>
              <Check size={36} className="text-white" strokeWidth={3}/>
            </div>
            <div className="text-white mb-2" style={{ fontWeight:900, fontSize:"1.5rem" }}>Đăng ký thành công!</div>
            <div style={{ color:"#94A3B8", fontSize:"0.88rem" }}>Tài khoản đang chờ phê duyệt. Đang chuyển về trang đăng nhập...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Full-screen background ─────────────────────────────────────── */}
      <div className="min-h-screen relative overflow-auto flex items-start justify-center py-8 px-4">

        {/* BG image */}
        <img src={BG_IMAGE} alt="HomeStay Dorm"
          className="fixed inset-0 w-full h-full object-cover"
          style={{ filter:"blur(3px)", transform:"scale(1.06)", zIndex:0 }}/>

        {/* Navy overlay with teal gradient */}
        <div className="fixed inset-0" style={{ zIndex:1,
          background:"linear-gradient(135deg,rgba(8,16,38,0.90) 0%,rgba(10,26,50,0.85) 50%,rgba(5,30,40,0.90) 100%)" }}/>

        {/* Decorative orbs */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ zIndex:1,
          background:`radial-gradient(circle,${TEAL}14 0%,transparent 70%)`, filter:"blur(40px)" }}/>
        <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ zIndex:1,
          background:`radial-gradient(circle,rgba(30,58,138,0.3) 0%,transparent 70%)`, filter:"blur(30px)" }}/>

        {/* ── Registration Card ──────────────────────────────────────────── */}
        <div className="relative z-10 w-full" style={{ maxWidth:720, marginTop:16, marginBottom:16 }}>
          <div className="rounded-3xl overflow-hidden"
            style={{ background:"white", boxShadow:"0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)" }}>

            {/* ── Card Top Banner ── */}
            <div className="relative px-8 pt-8 pb-6 overflow-hidden"
              style={{ background:`linear-gradient(135deg,${NAVY} 0%,#0C2340 60%,#0B3040 100%)` }}>
              {/* Decorative teal line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background:`linear-gradient(90deg,transparent,${TEAL},transparent)` }}/>
              {/* Subtle grid */}
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,0.5) 30px,rgba(255,255,255,0.5) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,0.5) 30px,rgba(255,255,255,0.5) 31px)" }}/>

              <div className="relative z-10 reg-fade-1">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background:`linear-gradient(135deg,${TEAL},#0891B2)`, boxShadow:`0 4px 14px ${TEAL}50` }}>
                    <Building2 size={19} className="text-white"/>
                  </div>
                  <div>
                    <div className="text-white" style={{ fontWeight:900, fontSize:"1.05rem", letterSpacing:"-0.01em" }}>
                      HomeStay<span style={{ color:TEAL2 }}>Dorm</span>
                    </div>
                    <div style={{ fontSize:"0.62rem", color:"#64748B", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      Hệ thống Quản lý Ký túc xá
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background:`${TEAL}25`, border:`1px solid ${TEAL}40` }}>
                    <UserPlus size={20} style={{ color:TEAL2 }}/>
                  </div>
                  <div>
                    <h1 className="text-white" style={{ fontWeight:900, fontSize:"1.55rem", lineHeight:1.2, letterSpacing:"-0.025em" }}>
                      Đăng ký Tài khoản Nhân viên
                    </h1>
                    <p style={{ color:"#94A3B8", fontSize:"0.85rem", marginTop:4, lineHeight:1.5 }}>
                      Vui lòng điền đầy đủ thông tin để thiết lập tài khoản của bạn trong hệ thống
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Form Body ── */}
            <div className="px-8 py-7">

              {/* General error */}
              {touched && Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5"
                  style={{ background:"#FFF1F2", border:"1px solid #FECDD3", animation:"fadeIn .2s both" }}>
                  <AlertCircle size={14} style={{ color:"#EF4444", flexShrink:0 }}/>
                  <span style={{ fontSize:"0.82rem", color:"#BE123C", fontWeight:600 }}>
                    Vui lòng kiểm tra lại {Object.keys(errors).length} trường thông tin chưa hợp lệ
                  </span>
                </div>
              )}

              {/* ── SECTION 1: Thông tin cá nhân ── */}
              <div className="mb-6 reg-fade-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{ background:"#F1F5F9" }}/>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{ background:"#F0FDFA", border:`1px solid ${TEAL3}` }}>
                    <User size={10} style={{ color:TEAL }}/>
                    <span style={{ fontSize:"0.65rem", fontWeight:800, color:TEAL, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      Thông tin cá nhân
                    </span>
                  </div>
                  <div className="h-px flex-1" style={{ background:"#F1F5F9" }}/>
                </div>

                <div className="space-y-4">
                  {/* Row 1: Full name */}
                  <Field label="Họ và Tên" required error={fieldError("fullName")}>
                    <StyledInput
                      value={fullName} onChange={setFullName}
                      placeholder="VD: Nguyễn Văn B"
                      icon={User} error={!!fieldError("fullName")}
                    />
                  </Field>

                  {/* Row 2: Phone + Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Số điện thoại" required error={fieldError("phone")}>
                      <StyledInput
                        value={phone} onChange={v=>setPhone(v.replace(/\D/g,""))}
                        placeholder="0912 345 678"
                        icon={Phone} maxLength={10} error={!!fieldError("phone")}
                      />
                    </Field>
                    <Field label="Email" required error={fieldError("email")}>
                      <StyledInput
                        type="email" value={email} onChange={setEmail}
                        placeholder="ten@homestay.vn"
                        icon={Mail} error={!!fieldError("email")}
                      />
                    </Field>
                  </div>

                  {/* Row 3: CCCD + Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Căn cước công dân" required error={fieldError("cccd")}>
                      <StyledInput
                        value={cccd} onChange={v=>setCccd(v.replace(/\D/g,""))}
                        placeholder="079 xxx xxx xxx"
                        icon={CreditCard} maxLength={12} error={!!fieldError("cccd")}
                      />
                    </Field>
                    <Field label="Giới tính" required error={fieldError("gender")}>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(["Nam","Nữ"] as const).map(g=>(
                          <button key={g} type="button" onClick={()=>setGender(g)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
                            style={{
                              border: `1.5px solid ${gender===g ? TEAL : fieldError("gender") ? "#FECACA" : "#E2E8F0"}`,
                              background: gender===g ? "#F0FDFA" : "#FAFAFA",
                              color: gender===g ? TEAL : "#64748B",
                              fontWeight: gender===g ? 800 : 500,
                              fontSize:"0.88rem",
                              boxShadow: gender===g ? `0 0 0 3px rgba(13,148,136,0.12)` : "none",
                            }}>
                            <span style={{ fontSize:"1.1rem" }}>{g==="Nam"?"👨":"👩"}</span>
                            {g}
                            {gender===g && <Check size={12} style={{ color:TEAL }}/>}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Tài khoản đăng nhập ── */}
              <div className="mb-6 reg-fade-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{ background:"#F1F5F9" }}/>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{ background:"#F0FDFA", border:`1px solid ${TEAL3}` }}>
                    <Lock size={10} style={{ color:TEAL }}/>
                    <span style={{ fontSize:"0.65rem", fontWeight:800, color:TEAL, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      Tài khoản đăng nhập
                    </span>
                  </div>
                  <div className="h-px flex-1" style={{ background:"#F1F5F9" }}/>
                </div>

                <div className="space-y-4">
                  {/* Row 4: Username */}
                  <Field label="Tên đăng nhập" required error={fieldError("username")}>
                    <StyledInput
                      value={username} onChange={setUsername}
                      placeholder="Chỉ chữ cái, số và dấu gạch dưới (min. 4 ký tự)"
                      icon={User} error={!!fieldError("username")}
                    />
                  </Field>

                  {/* Row 5: Password + Confirm */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Mật khẩu" required error={fieldError("password")}>
                      <StyledInput
                        type={showPw ? "text" : "password"}
                        value={password} onChange={setPassword}
                        placeholder="Tối thiểu 8 ký tự"
                        icon={Lock} error={!!fieldError("password")}
                        suffix={
                          <button type="button" onClick={()=>setShowPw(p=>!p)}
                            className="transition" style={{ color: showPw ? TEAL : "#94A3B8", outline:"none" }}>
                            {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                          </button>
                        }
                      />
                    </Field>
                    <Field label="Xác nhận mật khẩu" required error={fieldError("confirm")}>
                      <StyledInput
                        type={showCfm ? "text" : "password"}
                        value={confirm} onChange={setConfirm}
                        placeholder="Nhập lại mật khẩu"
                        icon={Lock} error={!!fieldError("confirm")}
                        suffix={
                          <button type="button" onClick={()=>setShowCfm(p=>!p)}
                            className="transition" style={{ color: showCfm ? TEAL : "#94A3B8", outline:"none" }}>
                            {showCfm ? <EyeOff size={15}/> : <Eye size={15}/>}
                          </button>
                        }
                      />
                    </Field>
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div style={{ animation:"fadeIn .2s both" }}>
                      <div className="flex items-center gap-2 mb-1">
                        {[
                          { check: password.length >= 8,           label:"8+ ký tự" },
                          { check: /[A-Z]/.test(password),          label:"Chữ hoa"  },
                          { check: /[0-9]/.test(password),          label:"Số"       },
                          { check: /[^A-Za-z0-9]/.test(password),   label:"Ký tự đặc biệt" },
                        ].map((r,i)=>(
                          <div key={i} className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.check ? TEAL : "#E2E8F0" }}/>
                            <span style={{ fontSize:"0.65rem", color: r.check ? TEAL : "#94A3B8", fontWeight: r.check?700:400 }}>
                              {r.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── SECTION 3: Vai trò / Role ── */}
              <div className="mb-7 reg-fade-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{ background:"#F1F5F9" }}/>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{ background:"#F0FDFA", border:`1px solid ${TEAL3}` }}>
                    <Sparkles size={10} style={{ color:TEAL }}/>
                    <span style={{ fontSize:"0.65rem", fontWeight:800, color:TEAL, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                      Loại nhân viên / Vai trò
                    </span>
                  </div>
                  <div className="h-px flex-1" style={{ background:"#F1F5F9" }}/>
                </div>

                {fieldError("role") && (
                  <div className="flex items-center gap-1.5 mb-3" style={{ animation:"fadeIn .2s both" }}>
                    <AlertCircle size={11} style={{ color:"#EF4444" }}/>
                    <span style={{ fontSize:"0.72rem", color:"#EF4444", fontWeight:500 }}>{fieldError("role")}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map(r=>{
                    const isSelected = role === r.id;
                    const RIcon = r.icon;
                    return (
                      <button key={r.id} type="button" onClick={()=>setRole(r.id)}
                        className="relative flex flex-col items-center gap-2.5 px-4 py-4 rounded-2xl transition-all text-center"
                        style={{
                          border: `2px solid ${isSelected ? r.color : fieldError("role") ? "#FECACA" : "#E8EEF4"}`,
                          background: isSelected ? r.light : "#FAFAFA",
                          boxShadow: isSelected ? `0 4px 20px ${r.color}22, 0 0 0 3px ${r.color}14` : "0 1px 4px rgba(0,0,0,0.04)",
                          transform: isSelected ? "translateY(-1px)" : "translateY(0)",
                        }}
                        onMouseEnter={e=>{ if(!isSelected){
                          (e.currentTarget as HTMLButtonElement).style.borderColor=r.color+"60";
                          (e.currentTarget as HTMLButtonElement).style.background=r.light+"60";
                        }}}
                        onMouseLeave={e=>{ if(!isSelected){
                          (e.currentTarget as HTMLButtonElement).style.borderColor=fieldError("role")?"#FECACA":"#E8EEF4";
                          (e.currentTarget as HTMLButtonElement).style.background="#FAFAFA";
                        }}}>
                        {/* Check badge */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: r.color, boxShadow:`0 2px 6px ${r.color}50` }}>
                            <Check size={10} className="text-white" strokeWidth={3}/>
                          </div>
                        )}
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: isSelected ? r.color : `${r.color}15`, border:`1px solid ${r.color}${isSelected?"":"25"}`, transition:"all .15s" }}>
                          <RIcon size={22} style={{ color: isSelected ? "white" : r.color }}/>
                        </div>
                        <div>
                          <div style={{ fontWeight:800, fontSize:"0.88rem", color: isSelected ? r.color : "#1E293B", transition:"color .15s" }}>
                            {r.label}
                          </div>
                          <div style={{ fontSize:"0.68rem", color: isSelected ? r.color+"90" : "#94A3B8", marginTop:2 }}>
                            {r.sub}
                          </div>
                        </div>
                        {/* Emoji badge */}
                        <span style={{ fontSize:"1.3rem", lineHeight:1 }}>{r.emoji}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Submit + Login link ── */}
              <div className="space-y-3.5 reg-fade-5">
                <button type="button" onClick={handleSubmit} disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl transition-all relative overflow-hidden"
                  style={{
                    padding:"0.9rem 1.5rem",
                    background: loading
                      ? `linear-gradient(135deg,${TEAL}90,#0891B2)`
                      : `linear-gradient(135deg,${NAVY} 0%,#0C2A4A 40%,${TEAL} 100%)`,
                    color:"white", fontWeight:800, fontSize:"0.95rem",
                    boxShadow: loading ? "none" : `0 4px 20px rgba(13,148,136,0.35), 0 2px 6px rgba(15,23,42,0.3)`,
                    cursor: loading ? "not-allowed" : "pointer",
                    letterSpacing:"-0.005em",
                  }}
                  onMouseEnter={e=>{ if(!loading)(e.currentTarget as HTMLButtonElement).style.filter="brightness(1.07)"; }}
                  onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.filter=""; }}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                        style={{ borderColor:"rgba(255,255,255,0.35)", borderTopColor:"white", animation:"spin .75s linear infinite" }}/>
                      Đang xử lý đăng ký...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17}/>
                      Đăng ký Tài khoản
                      <div className="flex-1"/>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-lg"
                        style={{ background:"rgba(255,255,255,0.12)", fontSize:"0.75rem", fontWeight:600 }}>
                        Gửi yêu cầu <ArrowRight size={12}/>
                      </div>
                    </>
                  )}
                </button>

                {/* Login link */}
                <div className="flex items-center justify-center gap-1.5">
                  <span style={{ fontSize:"0.82rem", color:"#94A3B8" }}>Đã có tài khoản?</span>
                  <button type="button" onClick={()=>navigate("/")}
                    className="flex items-center gap-1 transition"
                    style={{ fontSize:"0.82rem", fontWeight:700, color:TEAL, outline:"none" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color="#0F766E"}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color=TEAL}>
                    Đăng nhập ngay <ChevronRight size={13}/>
                  </button>
                </div>

                {/* Security note */}
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background:"#F8FAFC", border:"1px solid #F1F5F9" }}>
                  <ShieldCheck size={14} style={{ color:"#94A3B8", flexShrink:0 }}/>
                  <span style={{ fontSize:"0.72rem", color:"#94A3B8", lineHeight:1.5 }}>
                    Tài khoản mới sẽ cần được <strong style={{ color:"#64748B" }}>Quản lý hệ thống phê duyệt</strong> trước khi có thể đăng nhập. Bạn sẽ nhận thông báo qua email.
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-6" style={{ fontSize:"0.72rem", color:"#CBD5E1" }}>
                © 2026 HomeStayDorm · v2.4.1 · Hệ thống quản lý ký túc xá
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
