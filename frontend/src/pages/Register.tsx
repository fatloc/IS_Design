import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AlertCircle, Building2, Loader2, UserPlus } from "lucide-react";
import { register } from "@/services/api";
import { useAuthStore, type AuthUser } from "@/store/authStore";

function resolveRole(user: AuthUser) {
  const rawRole = String(user.role ?? user.loaiNhanVien ?? "").toLowerCase();

  if (rawRole.includes("sale")) {
    return "Sale";
  }

  if (rawRole.includes("manager") || rawRole.includes("quan ly")) {
    return "Manager";
  }

  if (rawRole.includes("accountant") || rawRole.includes("ke toan")) {
    return "Accountant";
  }

  return null;
}

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"Sale" | "Manager" | "Accountant">("Sale");
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading, setAuth } = useAuthStore();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        fullName,
        email,
        password,
        role,
      });

      const user = result.user as AuthUser;
      setAuth(user, result.token);

      const resolvedRole = resolveRole(user) ?? role;
      if (resolvedRole === "Sale") {
        navigate("/sale/dashboard", { replace: true });
        return;
      }

      if (resolvedRole === "Manager") {
        navigate("/manager/dashboard", { replace: true });
        return;
      }

      navigate("/accountant/dashboard", { replace: true });
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 text-lg" style={{ fontWeight: 700 }}>Đăng ký tài khoản</h1>
            <p className="text-slate-500 text-sm">Room Management System</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyen Van A"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Vai trò</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "Sale" | "Manager" | "Accountant")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="Sale">Sale</option>
              <option value="Manager">Manager</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-lg bg-indigo-600 text-white py-2.5 text-sm hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontWeight: 600 }}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Đã có tài khoản? {" "}
          <Link to="/login" className="text-indigo-600 hover:underline" style={{ fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}