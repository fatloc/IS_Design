import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AlertCircle, Building2, Loader2, LogIn } from "lucide-react";
import { login } from "@/services/api";
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

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading, setAuth } = useAuthStore();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login({ username, password });
      const user = result.user as AuthUser;

      setAuth(user, result.token);

      const role = resolveRole(user);
      if (role === "Sale") {
        navigate("/sale/dashboard", { replace: true });
        return;
      }

      if (role === "Manager") {
        navigate("/manager/dashboard", { replace: true });
        return;
      }

      if (role === "Accountant") {
        navigate("/accountant/dashboard", { replace: true });
        return;
      }

      setError("Không xác định được vai trò tài khoản để điều hướng.");
    } catch {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập/email và mật khẩu.");
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
            <h1 className="text-slate-900 text-lg" style={{ fontWeight: 700 }}>Đăng nhập hệ thống</h1>
            <p className="text-slate-500 text-sm">Room Management System</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-600 mb-1.5">Tên đăng nhập hoặc email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nv0001 hoặc nv0001@company.vn"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
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
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4 text-center">
          Chưa có tài khoản? {" "}
          <Link to="/register" className="text-indigo-600 hover:underline" style={{ fontWeight: 600 }}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}