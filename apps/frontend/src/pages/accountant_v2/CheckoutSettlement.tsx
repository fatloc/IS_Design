import { useEffect, useState, useMemo } from "react";
import { useToast } from "../../components/ToastProvider";
import { Pagination } from "../../components/Pagination";
import { getSettlementContracts, updateContractSettlementStatus, createTransaction } from "../../services/api";
import {
  Scale, RefreshCcw, Search, CheckCircle2, X, ArrowRight,
  Activity, Banknote, FileText, Filter, User, CalendarDays,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
function money(n: number | null | undefined) {
  if (!n && n !== 0) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}
function formatDate(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

const STATUS_CFG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  "Chờ đối soát": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Chờ đối soát" },
  "Đã đối soát":  { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", label: "Đã đối soát" },
  "Hoàn tất":     { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", label: "Hoàn tất" },
};

interface ContractRow {
  maHopDongThue: string;
  hinhThucThue: string;
  kyThanhToan: string;
  ngayKetThuc: string | null;
  trangThaiThanhLy: string | null;
  ngayLap: string | null;
  khachHangSoHuu: string;
  tenKhachHang: string;
  soDienThoai: string;
  danhSachPhong: string | null;
  danhSachGiuong: string | null;
  maBienBanTraPhong: string | null;
  soTienDoiSoat: number | null;
}

function mapRow(r: any): ContractRow {
  // Normalize TrangThaiThanhLy từ DB (không dấu) sang format hiển thị (có dấu)
  const rawStatus = r.TrangThaiThanhLy ?? r.trangThaiThanhLy ?? null;
  let normalizedStatus = rawStatus;
  if (rawStatus) {
    const s = rawStatus.toLowerCase().trim();
    if (s === "dang doi soat" || s === "chờ đối soát") normalizedStatus = "Chờ đối soát";
    else if (s === "da doi soat" || s === "đã đối soát") normalizedStatus = "Đã đối soát";
    else if (s === "hoan tat" || s === "hoàn tất") normalizedStatus = "Hoàn tất";
    else if (s === "chua thanh ly" || s === "chờ thanh lý") normalizedStatus = "Chờ đối soát"; // hiển thị như chờ đối soát
  }
  return {
    maHopDongThue: r.MaHopDongThue ?? r.maHopDongThue ?? "",
    hinhThucThue: r.HinhThucThue ?? r.hinhThucThue ?? "",
    kyThanhToan: r.KyThanhToan ?? r.kyThanhToan ?? "",
    ngayKetThuc: r.NgayKetThuc ?? r.ngayKetThuc ?? null,
    trangThaiThanhLy: normalizedStatus,
    ngayLap: r.NgayLap ?? r.ngayLap ?? null,
    khachHangSoHuu: r.KhachHangSoHuu ?? r.khachHangSoHuu ?? "",
    tenKhachHang: r.TenKhachHang ?? r.tenKhachHang ?? "",
    soDienThoai: r.SoDienThoai ?? r.soDienThoai ?? "",
    danhSachPhong: r.DanhSachPhong ?? r.danhSachPhong ?? null,
    danhSachGiuong: r.DanhSachGiuong ?? r.danhSachGiuong ?? null,
    maBienBanTraPhong: r.MaBienBanTraPhong ?? r.maBienBanTraPhong ?? null,
    soTienDoiSoat: r.SoTienDoiSoat != null ? Number(r.SoTienDoiSoat) : null,
  };
}

// ── Modal đối soát ─────────────────────────────────────────────────────────
function ReconcileModal({
  row,
  onClose,
  onSuccess,
}: {
  row: ContractRow;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { addToast } = useToast();
  const [tienCoc, setTienCoc] = useState(5000000);
  const [tyLeHoan, setTyLeHoan] = useState(100);
  const [khauTruPhong, setKhauTruPhong] = useState(0);
  const [khauTruDonDep, setKhauTruDonDep] = useState(0);
  const [khauTruHuHong, setKhauTruHuHong] = useState(0);
  const [ghiChu, setGhiChu] = useState("");
  const [saving, setSaving] = useState(false);

  const tongKhauTru = khauTruPhong + khauTruDonDep + khauTruHuHong;
  const soTienHoan = Math.round(tienCoc * tyLeHoan / 100) - tongKhauTru;

  async function handleConfirm() {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toTimeString().slice(0, 8);
      const ghiChuFull = `Đối soát HĐ ${row.maHopDongThue} | Cọc: ${tienCoc.toLocaleString()} | Hoàn ${tyLeHoan}% | Khấu trừ: ${tongKhauTru.toLocaleString()} | Net: ${soTienHoan.toLocaleString()} | ${ghiChu}`;
      await createTransaction({
        hinhThucThanhToan: soTienHoan >= 0 ? "Hoàn cọc" : "Thu bù",
        ghiChu: ghiChuFull,
        gioGiaoDich: now as any,
        ngayGiaoDich: today as any,
        trangThai: "Chờ xử lý",
        loaiGiaoDich: "Doi soat",
        maChungTu: row.maHopDongThue,
        soTienGiaoDich: Math.abs(soTienHoan),
      } as any);
      await updateContractSettlementStatus(row.maHopDongThue, "Đã đối soát");
      addToast({ message: `Đã tạo bảng đối soát cho HĐ ${row.maHopDongThue}. Net: ${money(soTienHoan)}`, type: "success" });
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
              <Scale size={18} className="text-emerald-600" />
              Bảng đối soát — HĐ {row.maHopDongThue}
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
          {/* Tiền cọc & tỷ lệ hoàn */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Tiền cọc ban đầu (VNĐ)</label>
              <input type="number" value={tienCoc}
                onChange={e => setTienCoc(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Tỷ lệ hoàn cọc</label>
              <select value={tyLeHoan} onChange={e => setTyLeHoan(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white">
                <option value={100}>100% — Đúng hạn</option>
                <option value={80}>80% — Hủy trước ký HĐ</option>
                <option value={70}>70% — Phá HĐ &gt; 6 tháng</option>
                <option value={50}>50% — Phá HĐ &lt; 6 tháng</option>
                <option value={0}>0% — Vi phạm nghiêm trọng</option>
              </select>
            </div>
          </div>

          {/* Các khoản khấu trừ */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Các khoản khấu trừ</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Nợ tiền phòng/DV", value: khauTruPhong, set: setKhauTruPhong },
                { label: "Phí dọn dẹp", value: khauTruDonDep, set: setKhauTruDonDep },
                { label: "Bồi thường hư hỏng", value: khauTruHuHong, set: setKhauTruHuHong },
              ].map(item => (
                <div key={item.label}>
                  <label className="text-xs text-slate-600 font-medium mb-1 block">{item.label}</label>
                  <input type="number" value={item.value}
                    onChange={e => item.set(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold outline-none focus:ring-1 focus:ring-amber-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tổng kết */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tiền cọc được hoàn ({tyLeHoan}%):</span>
              <span className="font-semibold">{money(Math.round(tienCoc * tyLeHoan / 100))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tổng khấu trừ:</span>
              <span className="font-semibold text-rose-600">− {money(tongKhauTru)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-end">
              <span className="text-sm font-bold text-slate-900">Kết quả (Net):</span>
              <div className="text-right">
                <span className={`text-xl font-bold ${soTienHoan >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {money(soTienHoan)}
                </span>
                <div className="text-xs text-slate-500 mt-0.5">
                  {soTienHoan >= 0 ? "Hoàn lại cho khách" : "Khách cần đóng thêm"}
                </div>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Ghi chú</label>
            <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)}
              rows={2} placeholder="Ghi chú thêm về tình trạng phòng, lý do khấu trừ..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">
            Hủy
          </button>
          <button onClick={handleConfirm} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50">
            <CheckCircle2 size={16} />
            {saving ? "Đang lưu..." : "Xác nhận đối soát"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CheckoutSettlement() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [openRow, setOpenRow] = useState<ContractRow | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  async function load() {
    setLoading(true);
    try {
      const data = await getSettlementContracts();
      setRows((data as any[]).map(mapRow));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r => {
      const matchSearch =
        r.maHopDongThue.toLowerCase().includes(q) ||
        (r.tenKhachHang || "").toLowerCase().includes(q) ||
        (r.danhSachPhong || "").toLowerCase().includes(q);
      const status = r.trangThaiThanhLy ?? "";
      const matchStatus = statusFilter === "Tất cả" || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const choDoiSoatCount = rows.filter(r => r.trangThaiThanhLy === "Chờ đối soát").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-700">
              <Scale size={12} /> Đối soát & Thanh lý
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Đối soát chi phí thanh lý</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Tạo bảng đối soát, tính toán hoàn cọc/khấu trừ và xác nhận thanh toán khi khách trả phòng.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold bg-white/70 rounded-full px-3 py-2">
              <Activity size={12} className="text-amber-500" />
              <span className="text-amber-700">{choDoiSoatCount} HĐ chờ đối soát</span>
            </div>
            <button onClick={load}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-white/70 rounded-full px-3 py-2 hover:bg-white transition">
              <RefreshCcw size={12} /> Làm mới
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
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Tìm mã HĐ, khách hàng, phòng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white">
              <option value="Tất cả">Tất cả</option>
              <option value="Chờ đối soát">Chờ đối soát</option>
              <option value="Đã đối soát">Đã đối soát</option>
            </select>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <Pagination currentPage={safePage} totalPages={totalPages} totalElements={totalElements}
            pageSize={pageSize} onPageChange={setPage}
            onPageSizeChange={s => { setPageSize(s); setPage(0); }} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
              <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Mã HĐ</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Phòng / Giường</th>
                  <th className="px-5 py-4">Ngày kết thúc</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map(r => {
                  const status = r.trangThaiThanhLy ?? "Chờ đối soát";
                  const cfg = STATUS_CFG[status] ?? STATUS_CFG["Chờ đối soát"];
                  const isDaDoiSoat = status === "Đã đối soát";

                  return (
                    <tr key={r.maHopDongThue} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 text-sm font-bold text-slate-700">{r.maHopDongThue}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                            {(r.tenKhachHang || r.khachHangSoHuu || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{r.tenKhachHang || r.khachHangSoHuu}</div>
                            <div className="text-xs text-slate-400">{r.soDienThoai || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {r.danhSachPhong ? `P. ${r.danhSachPhong}` : r.danhSachGiuong ? `G. ${r.danhSachGiuong}` : "—"}
                        </div>
                        <div className="text-xs text-slate-400">{r.hinhThucThue}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-700">{formatDate(r.ngayKetThuc)}</div>
                        <div className="text-xs text-slate-400">Lập: {formatDate(r.ngayLap)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isDaDoiSoat ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 size={14} /> Đã đối soát
                          </span>
                        ) : (
                          <button onClick={() => setOpenRow(r)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-sm">
                            <FileText size={13} /> Tạo bảng đối soát
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                      Không có hợp đồng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {openRow && (
        <ReconcileModal row={openRow} onClose={() => setOpenRow(null)} onSuccess={load} />
      )}
    </div>
  );
}
