import { useEffect, useMemo, useState } from "react";
import { Users, Filter, Search, Plus, Edit2, Trash2, X, Shield } from "lucide-react";
import { Pagination } from "../components/Pagination";
import { usePagedList } from "../hooks/usePagedList";
import { getUsers, createEmployee, updateEmployee, deleteEmployee, type CreateEmployeePayload, type UpdateEmployeePayload } from "../services/api";
import type { Employee } from "../types";

const ROLE_OPTIONS = [
  { value: "All", label: "Tất cả" },
  { value: "Manager", label: "Quản lý", color: "#4F46E5", bg: "#EEF2FF" },
  { value: "Sale", label: "Sale", color: "#EA580C", bg: "#FFF7ED" },
  { value: "Accountant", label: "Kế toán", color: "#10B981", bg: "#ECFDF5" },
  { value: "Kế toán", label: "Kế toán (VN)", color: "#10B981", bg: "#ECFDF5" },
] as const;

const GENDER_OPTIONS = ["Nam", "Nữ", "Khác"] as const;

function roleStyle(role: string | null | undefined) {
  const normalized = (role ?? "").toLowerCase();
  if (normalized.includes("manager") || normalized.includes("quản lý") || normalized.includes("quanly")) 
    return { label: "Quản lý", bg: "#EEF2FF", color: "#4F46E5" };
  if (normalized.includes("accountant") || normalized.includes("kế toán") || normalized.includes("ketoan")) 
    return { label: "Kế toán", bg: "#ECFDF5", color: "#10B981" };
  if (normalized.includes("sale") || normalized.includes("tư vấn")) 
    return { label: "Sale", bg: "#FFF7ED", color: "#EA580C" };
  return { label: role ?? "Không rõ", bg: "#F1F5F9", color: "#334155" };
}

type UserFormData = {
  hoTen: string;
  tenDangNhap: string;
  email: string;
  soDienThoai: string;
  phai: string;
  cccd: string;
  loaiNhanVien: string;
  matKhau: string;
};

export default function ManagerUsers() {
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_OPTIONS)[number]["value"]>("All");
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<UserFormData>({
    hoTen: "",
    tenDangNhap: "",
    email: "",
    soDienThoai: "",
    phai: "Nam",
    cccd: "",
    loaiNhanVien: "Sale",
    matKhau: "",
  });

  const apiParams = useMemo(() => {
    const query: Record<string, unknown> = {};
    if (roleFilter !== "All") {
      query.search = roleFilter;
    }
    return query;
  }, [roleFilter]);

  const { items, page, size, totalElements, totalPages, loading, error, setPage, setSize, reload } = usePagedList<Employee>(
    getUsers as any,
    12,
    apiParams
  );

  useEffect(() => {
    setPage(0);
    setSelectedUser(null);
  }, [roleFilter, setPage]);

  const visibleUsers = items.filter((user) => {
    const matchRole = roleFilter === "All" || roleStyle(user.loaiNhanVien).label.toLowerCase().includes(roleFilter.toLowerCase());
    const matchSearch = !searchText.trim() || 
      String(user.hoTen ?? "").toLowerCase().includes(searchText.trim().toLowerCase()) ||
      String(user.email ?? "").toLowerCase().includes(searchText.trim().toLowerCase()) ||
      String(user.tenDangNhap ?? "").toLowerCase().includes(searchText.trim().toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((user) => {
      const key = roleStyle(user.loaiNhanVien).label;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [items]);

  useEffect(() => {
    if (!selectedUser && visibleUsers.length > 0) {
      setSelectedUser(visibleUsers[0]);
    }
    if (selectedUser && !visibleUsers.find((user) => user.maNhanVien === selectedUser.maNhanVien)) {
      setSelectedUser(visibleUsers[0] ?? null);
    }
  }, [visibleUsers, selectedUser]);

  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({
      hoTen: "",
      tenDangNhap: "",
      email: "",
      soDienThoai: "",
      phai: "Nam",
      cccd: "",
      loaiNhanVien: "Sale",
      matKhau: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: Employee) => {
    setModalMode("edit");
    setFormData({
      hoTen: user.hoTen ?? "",
      tenDangNhap: user.tenDangNhap ?? "",
      email: user.email ?? "",
      soDienThoai: user.soDienThoai ?? "",
      phai: user.phai ?? "Nam",
      cccd: user.cccd ?? "",
      loaiNhanVien: user.loaiNhanVien ?? "Sale",
      matKhau: "",
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === "create") {
        const payload: CreateEmployeePayload = {
          hoTen: formData.hoTen,
          tenDangNhap: formData.tenDangNhap || undefined,
          email: formData.email,
          soDienThoai: formData.soDienThoai || undefined,
          phai: formData.phai || undefined,
          cccd: formData.cccd || undefined,
          loaiNhanVien: formData.loaiNhanVien,
          matKhau: formData.matKhau || undefined,
        };
        await createEmployee(payload);
      } else if (selectedUser) {
        const payload: UpdateEmployeePayload = {
          hoTen: formData.hoTen,
          tenDangNhap: formData.tenDangNhap || undefined,
          email: formData.email,
          soDienThoai: formData.soDienThoai || undefined,
          phai: formData.phai || undefined,
          cccd: formData.cccd || undefined,
          loaiNhanVien: formData.loaiNhanVien,
        };
        if (formData.matKhau) {
          payload.matKhau = formData.matKhau;
        }
        await updateEmployee(selectedUser.maNhanVien, payload);
      }
      setShowModal(false);
      reload();
    } catch (err) {
      console.error("Failed to save user:", err);
      alert("Không thể lưu người dùng. Vui lòng thử lại.");
    }
  };

  const handleDelete = async (user: Employee) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.hoTen}"?`)) return;
    try {
      await deleteEmployee(user.maNhanVien);
      reload();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Không thể xóa người dùng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {ROLE_OPTIONS.filter((option) => option.value !== "All").slice(0, 3).map((option) => {
          const count = roleCounts.get(option.label) ?? 0;
          return (
            <button
              key={option.value}
              onClick={() => setRoleFilter(roleFilter === option.value ? "All" : option.value)}
              className="rounded-2xl border p-4 text-left bg-white shadow-sm transition hover:-translate-y-0.5"
              style={{ borderColor: roleFilter === option.value ? option.color ?? "#E2E8F0" : "#E2E8F0" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">{option.label}</div>
                  <div className="mt-2 text-2xl text-slate-900" style={{ fontWeight: 800 }}>{count}</div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: option.bg }}>
                  <Shield size={18} style={{ color: option.color }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo tên, email, username..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 bg-slate-50">
              <Filter size={14} className="text-slate-400" />
              Vai trò
            </div>
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setRoleFilter(option.value)}
                className="px-3 py-2.5 rounded-xl text-sm transition border"
                style={{
                  background: roleFilter === option.value ? (option.bg ?? "#EEF2FF") : "#fff",
                  color: roleFilter === option.value ? (option.color ?? "#4F46E5") : "#64748B",
                  borderColor: roleFilter === option.value ? (option.color ?? "#CBD5E1") : "#E2E8F0",
                  fontWeight: roleFilter === option.value ? 700 : 500,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenCreate}
            className="ml-auto px-4 py-2.5 rounded-xl text-sm text-white transition flex items-center gap-2"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", fontWeight: 700 }}
          >
            <Plus size={16} />
            Thêm người dùng
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Không tải được dữ liệu người dùng. Hãy kiểm tra backend đang chạy.
            <button onClick={reload} className="ml-3 font-semibold underline underline-offset-2">
              Tải lại
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm text-slate-400">
                    Không có người dùng phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}

              {visibleUsers.map((user) => {
                const role = roleStyle(user.loaiNhanVien);
                const isSelected = selectedUser?.maNhanVien === user.maNhanVien;
                return (
                  <tr
                    key={user.maNhanVien}
                    onClick={() => setSelectedUser(user)}
                    className={`cursor-pointer transition ${isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center" style={{ fontWeight: 800, fontSize: "0.75rem" }}>
                          {user.hoTen?.split(" ").map(n => n[0]).join("").toUpperCase().slice(-2) ?? "??"}
                        </div>
                        <div>
                          <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{user.hoTen ?? "—"}</div>
                          <div className="text-xs text-slate-400">@{user.tenDangNhap ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.email ?? "—"}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">{user.soDienThoai ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs" style={{ background: role.bg, color: role.color, fontWeight: 700 }}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(user); }}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      </div>

      {selectedUser && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="text-sm text-slate-900 mb-4" style={{ fontWeight: 800 }}>Chi tiết người dùng</div>
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#F8FAFC)", border: "1px solid #E0E7FF" }}>
              <div className="text-xs uppercase tracking-widest text-indigo-500">Nhân viên</div>
              <div className="mt-1 text-2xl text-slate-900" style={{ fontWeight: 900 }}>{selectedUser.hoTen}</div>
              <div className="mt-2 text-sm text-slate-600">@{selectedUser.tenDangNhap}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Email</div>
                <div className="mt-1 text-sm text-slate-900" style={{ fontWeight: 800 }}>{selectedUser.email ?? "—"}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Số điện thoại</div>
                <div className="mt-1 text-sm text-slate-900" style={{ fontWeight: 800 }}>{selectedUser.soDienThoai ?? "—"}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-400">Giới tính</div>
                <div className="mt-1 text-sm text-slate-900" style={{ fontWeight: 800 }}>{selectedUser.phai ?? "—"}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-400">CCCD</div>
                <div className="mt-1 text-sm text-slate-900" style={{ fontWeight: 800 }}>{selectedUser.cccd ?? "—"}</div>
              </div>
            </div>

            <div className="rounded-xl px-3 py-2.5" style={{ background: roleStyle(selectedUser.loaiNhanVien).bg, color: roleStyle(selectedUser.loaiNhanVien).color, fontWeight: 700 }}>
              Vai trò: {roleStyle(selectedUser.loaiNhanVien).label}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-lg text-slate-900" style={{ fontWeight: 800 }}>
                  {modalMode === "create" ? "Thêm người dùng mới" : "Chỉnh sửa người dùng"}
                </div>
                <div className="text-sm text-slate-500">
                  {modalMode === "create" ? "Điền thông tin để tạo tài khoản mới" : "Cập nhật thông tin người dùng"}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100 transition">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Họ tên *</label>
                  <input
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Tên đăng nhập</label>
                  <input
                    value={formData.tenDangNhap}
                    onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="nguyenvana"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Số điện thoại</label>
                  <input
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="0123456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Giới tính</label>
                  <select
                    value={formData.phai}
                    onChange={(e) => setFormData({ ...formData, phai: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {GENDER_OPTIONS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>CCCD</label>
                  <input
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="001234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>Vai trò *</label>
                <select
                  value={formData.loaiNhanVien}
                  onChange={(e) => setFormData({ ...formData, loaiNhanVien: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="Sale">Sale</option>
                  <option value="Manager">Quản lý</option>
                  <option value="Accountant">Kế toán</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Mật khẩu {modalMode === "create" ? "*" : "(để trống nếu không đổi)"}
                </label>
                <input
                  type="password"
                  value={formData.matKhau}
                  onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder={modalMode === "create" ? "Nhập mật khẩu" : "Để trống nếu không đổi"}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-200 transition"
                style={{ fontWeight: 600 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2.5 rounded-xl text-sm text-white transition"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", fontWeight: 700 }}
              >
                {modalMode === "create" ? "Tạo người dùng" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
