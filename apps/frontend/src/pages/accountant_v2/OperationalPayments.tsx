import { useEffect, useState, useMemo } from "react";
import { useToast } from "../../components/ToastProvider";
import { Pagination } from "../../components/Pagination";
import { getOperationalContracts, createTransaction } from "../../services/api";
import {
  CreditCard, Search, CheckCircle2, X, FileText, Filter,
  Banknote, Clock, User, Building2, CalendarDays, RefreshCw,
  Pencil, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function money(n: number | null | undefined) {
  if (!n) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function formatDate(val: string | null | undefined) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const KY_LABEL: Record<string, string> = {
  "Thang": "Hàng tháng",
  "Quy": "Hàng quý",
  "6 thang": "6 tháng/lần",
};

const STATUS_CFG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  "da thu":   { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", label: "Đã thu" },
  "chua thu": { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", label: "Chưa thu" },
};
const DEFAULT_STATUS = { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA", label: "Chưa thu" };

function normalizePaymentStatus(value: string | null | undefined) {
  const text = (value ?? "").trim();

  if (!text) return "chua thu";

  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  // Đã thu — xanh lá
  if (
    normalized.includes("da thu") ||
    normalized.includes("thanh cong") ||
    normalized.includes("paid") ||
    normalized.includes("hoan tat")
  ) {
    return "da thu";
  }

  // Tất cả còn lại → chưa thu — cam
  return "chua thu";
}

function isSupportedPaymentStatus(status: string) {
  return status === "chua thu" || status === "da thu";
}

interface KhoanThu {
  ten: string;
  soTien: number;
}

interface ContractRow {
  maHopDongThue: string;
  hinhThucThue: string;
  kyThanhToan: string;
  soLuongThanhVien: number;
  ngayKetThuc: string | null;
  ngayLap: string | null;
  khachHangSoHuu: string;
  tenKhachHang: string;
  soDienThoai: string;
  danhSachPhong: string | null;
  danhSachGiuong: string | null;
  giaThuePhong: number | null;
  tongGiaThueGiuong: number | null;
  trangThaiThanhToan: string | null;
  soTienThuGanNhat: number | null;
}

function mapRow(r: any): ContractRow {
  return {
    maHopDongThue: r.MaHopDongThue ?? r.maHopDongThue ?? "",
    hinhThucThue: r.HinhThucThue ?? r.hinhThucThue ?? "",
    kyThanhToan: r.KyThanhToan ?? r.kyThanhToan ?? "",
    soLuongThanhVien: Number(r.SoLuongThanhVien ?? r.soLuongThanhVien ?? 1),
    ngayKetThuc: r.NgayKetThuc ?? r.ngayKetThuc ?? null,
    ngayLap: r.NgayLap ?? r.ngayLap ?? null,
    khachHangSoHuu: r.KhachHangSoHuu ?? r.khachHangSoHuu ?? "",
    tenKhachHang: r.TenKhachHang ?? r.tenKhachHang ?? "",
    soDienThoai: r.SoDienThoai ?? r.soDienThoai ?? "",
    danhSachPhong: r.DanhSachPhong ?? r.danhSachPhong ?? null,
    danhSachGiuong: r.DanhSachGiuong ?? r.danhSachGiuong ?? null,
    giaThuePhong: r.GiaThuePhong != null ? Number(r.GiaThuePhong) : null,
    tongGiaThueGiuong: r.TongGiaThueGiuong != null ? Number(r.TongGiaThueGiuong) : null,
    trangThaiThanhToan: r.TrangThaiThanhToan ?? r.trangThaiThanhToan ?? null,
    soTienThuGanNhat: r.SoTienThuGanNhat != null ? Number(r.SoTienThuGanNhat) : null,
  };
}

function buildDefaultKhoanThu(row: ContractRow): KhoanThu[] {
  const items: KhoanThu[] = [];
  if (row.hinhThucThue === "Theo phong" || row.hinhThucThue === "Ket hop") {
    items.push({ ten: "Tiền thuê phòng", soTien: row.giaThuePhong ?? 0 });
  }
  if (row.hinhThucThue === "Theo giuong" || row.hinhThucThue === "Ket hop") {
    items.push({ ten: "Tiền thuê giường", soTien: row.tongGiaThueGiuong ?? 0 });
  }
  if (items.length === 0) {
    items.push({ ten: "Tiền thuê", soTien: row.giaThuePhong ?? row.tongGiaThueGiuong ?? 0 });
  }
  items.push({ ten: "Phí dịch vụ", soTien: 0 });
  items.push({ ten: "Điện / Nước", soTien: 0 });
  return items;
}

// ── Modal kiểm tra & thu tiền ──────────────────────────────────────────────
function PaymentModal({
  row,
  onClose,
  onSuccess,
}: {
  row: ContractRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addToast } = useToast();
  const [items, setItems] = useState<KhoanThu[]>(() => buildDefaultKhoanThu(row));
  const [saving, setSaving] = useState(false);
  const [hinhThuc, setHinhThuc] = useState("Tien mat");

  const tongTien = items.reduce((s, i) => s + (i.soTien || 0), 0);

  function updateItem(idx: number, field: keyof KhoanThu, value: string | number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function addItem() {
    setItems(prev => [...prev, { ten: "", soTien: 0 }]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleConfirm() {
    if (tongTien <= 0) {
      addToast({ message: "Tổng tiền phải lớn hơn 0", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().slice(0, 8);
      const ghiChu = items.map(i => `${i.ten}: ${i.soTien.toLocaleString()}đ`).join(" | ");
      await createTransaction({
        hinhThucThanhToan: hinhThuc,
        ghiChu,
        gioGiaoDich: now as any,
        ngayGiaoDich: today as any,
        trangThai: "Đã thu",
        loaiGiaoDich: "Thu tien thue",
        maChungTu: row.maHopDongThue,
        soTienGiaoDich: tongTien,
      } as any);
      addToast({ message: `Đã xác nhận thu ${money(tongTien)} cho HĐ ${row.maHopDongThue}`, type: "success" });
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({ message: `Lỗi: ${err.message}`, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-violet-600" />
              Kiểm tra & Thu tiền — HĐ {row.maHopDongThue}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {row.tenKhachHang || row.khachHangSoHuu} · {row.danhSachPhong ? `Phòng ${row.danhSachPhong}` : row.danhSachGiuong ? `Giường ${row.danhSachGiuong}` : "—"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Thông tin hợp đồng */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Hình thức thuê", value: row.hinhThucThue },
              { label: "Kỳ thanh toán", value: KY_LABEL[row.kyThanhToan] ?? row.kyThanhToan },
              { label: "Ngày kết thúc HĐ", value: formatDate(row.ngayKetThuc) },
            ].map(item => (
              <div key={item.label} className="rounded-xl px-3 py-2.5 bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                <div className="text-sm font-semibold text-slate-800">{item.value || "—"}</div>
              </div>
            ))}
          </div>

          {/* Các khoản thu — có thể chỉnh sửa */}
          <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Các khoản thu kỳ này
              </h4>
              <button onClick={addItem}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1">
                + Thêm khoản
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-sm">
                  <input
                    value={it.ten}
                    onChange={e => updateItem(idx, "ten", e.target.value)}
                    placeholder="Tên khoản thu"
                    className="flex-1 text-sm font-medium text-slate-800 outline-none bg-transparent"
                  />
                  <input
                    type="number"
                    value={it.soTien || ""}
                    onChange={e => updateItem(idx, "soTien", Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-36 text-sm font-bold text-right text-slate-900 outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-slate-400">đ</span>
                  <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-400 transition ml-1">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-violet-200/50 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Tổng thu kỳ này:</span>
              <span className="text-xl font-bold text-violet-700">{money(tongTien)}</span>
            </div>
          </div>

          {/* Hình thức thanh toán */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Hình thức thu tiền
            </label>
            <select
              value={hinhThuc}
              onChange={e => setHinhThuc(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50 focus:bg-white"
            >
              <option value="Tien mat">Tiền mặt</option>
              <option value="Chuyen khoan">Chuyển khoản</option>
              <option value="The ngan hang">Thẻ ngân hàng</option>
              <option value="Vi dien tu">Ví điện tử</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">
            Hủy
          </button>
          <button onClick={handleConfirm} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 shadow-md shadow-violet-500/20 transition flex items-center gap-2 disabled:opacity-50">
            <Banknote size={16} />
            {saving ? "Đang lưu..." : "Xác nhận đã thu"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function OperationalPayments() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [openRow, setOpenRow] = useState<ContractRow | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [backendPage, setBackendPage] = useState(0);
  const BACKEND_PAGE_SIZE = 200;

  async function load(bp = 0) {
    setLoading(true);
    try {
      const data = await getOperationalContracts({ page: bp, size: BACKEND_PAGE_SIZE });
      setRows((data as any[]).map(mapRow));
      setBackendPage(bp);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(0); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r => {
      const status = normalizePaymentStatus(r.trangThaiThanhToan);

      if (!isSupportedPaymentStatus(status)) {
        return false;
      }

      const matchSearch =
        r.maHopDongThue.toLowerCase().includes(q) ||
        (r.tenKhachHang || "").toLowerCase().includes(q) ||
        (r.khachHangSoHuu || "").toLowerCase().includes(q) ||
        (r.danhSachPhong || "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "Tất cả" ||
        (statusFilter === "Đã thu" && status === "da thu") ||
        (statusFilter === "Chưa thu" && status === "chua thu");
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const chuaThuCount = rows.filter(r => {
    return normalizePaymentStatus(r.trangThaiThanhToan) === "chua thu";
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-700">
              <CreditCard size={12} /> Thu tiền vận hành
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Thu tiền định kỳ</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Kiểm tra các khoản thu từ hợp đồng thuê, điều chỉnh nếu cần và xác nhận đã thu tiền thực tế.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/70 rounded-full px-3 py-2">
              <Clock size={12} className="text-amber-500" />
              <span className="text-amber-700">{chuaThuCount} HĐ chưa thu kỳ này</span>
            </div>
            <button onClick={() => load(0)}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-white/70 rounded-full px-3 py-2 hover:bg-white transition">
              <RefreshCw size={12} /> Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between px-5 py-4 border-b border-slate-100">
          <div className="relative w-full lg:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Tìm mã HĐ, khách hàng, phòng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50 focus:bg-white"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="Chưa thu">Chưa thu</option>
              <option value="Đã thu">Đã thu</option>
            </select>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={s => { setPageSize(s); setPage(0); }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
              <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu hợp đồng...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Mã HĐ</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Phòng / Giường</th>
                  <th className="px-5 py-4">Kỳ TT</th>
                  <th className="px-5 py-4">Số tiền kỳ này</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(r => {
                  const trangThai = normalizePaymentStatus(r.trangThaiThanhToan);
                  const isDaThu = trangThai === "da thu";
                  const cfg = STATUS_CFG[trangThai] ?? STATUS_CFG["chua thu"];
                  const soTien = r.giaThuePhong ?? r.tongGiaThueGiuong ?? 0;

                  return (
                    <tr key={r.maHopDongThue} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">{r.maHopDongThue}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                            {(r.tenKhachHang || r.khachHangSoHuu || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{r.tenKhachHang || r.khachHangSoHuu}</div>
                            <div className="text-xs text-slate-400">{r.soDienThoai || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700 font-medium">
                          {r.danhSachPhong ? `P. ${r.danhSachPhong}` : r.danhSachGiuong ? `G. ${r.danhSachGiuong}` : "—"}
                        </div>
                        <div className="text-xs text-slate-400">{r.hinhThucThue}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-700">{KY_LABEL[r.kyThanhToan] ?? r.kyThanhToan}</div>
                        <div className="text-xs text-slate-400">HĐ đến: {formatDate(r.ngayKetThuc)}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-900">
                        {isDaThu && r.soTienThuGanNhat
                          ? money(r.soTienThuGanNhat)
                          : money(soTien)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isDaThu ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 size={14} /> Hoàn tất
                          </span>
                        ) : (
                          <button
                            onClick={() => setOpenRow(r)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 shadow-sm shadow-violet-500/20"
                          >
                            <Pencil size={13} /> Kiểm tra & Thu
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                      Không tìm thấy hợp đồng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {openRow && (
        <PaymentModal
          row={openRow}
          onClose={() => setOpenRow(null)}
          onSuccess={() => load(backendPage)}
        />
      )}
    </div>
  );
}
