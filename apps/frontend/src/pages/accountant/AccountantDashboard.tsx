import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Receipt, CreditCard, Scale, ArrowRight,
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  Banknote, RefreshCw, FileText, Activity,
} from "lucide-react";
import { getRentalRequests } from "../../services/accountingV2";
import { getOperationalContracts, getSettlementContracts } from "../../services/api";

function money(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, bg,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
          <div className="mt-1.5 text-xs text-slate-500">{sub}</div>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: bg }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ── Workflow Card ──────────────────────────────────────────────────────────
function WorkflowCard({
  title, desc, path, icon: Icon, color, bg, badge, badgeColor,
  steps,
}: {
  title: string; desc: string; path: string;
  icon: React.ElementType; color: string; bg: string;
  badge?: string; badgeColor?: string;
  steps: string[];
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0" style={{ background: bg }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{title}</div>
            {badge && (
              <span className="mt-0.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: badgeColor + "20", color: badgeColor }}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 transition mt-1 flex-shrink-0" />
      </div>

      <p className="mt-3 text-xs text-slate-500 leading-5">{desc}</p>

      {/* Luồng trạng thái */}
      <div className="mt-4 flex items-center gap-1 flex-wrap">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{step}</span>
            {i < steps.length - 1 && <ArrowRight size={10} className="text-slate-300 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </button>
  );
}

// ── Recent Item ────────────────────────────────────────────────────────────
function RecentItem({ id, name, sub, amount, status, statusColor, statusBg }: {
  id: string; name: string; sub: string; amount?: string;
  status: string; statusColor: string; statusBg: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
        {(name || id)[0]?.toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-800 truncate">{name || id}</div>
        <div className="text-xs text-slate-400 truncate">{sub}</div>
      </div>
      <div className="flex-shrink-0 text-right">
        {amount && <div className="text-sm font-bold text-slate-900">{amount}</div>}
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: statusBg, color: statusColor }}>
          {status}
        </span>
      </div>
    </div>
  );
}

function normalizeSettlementStatus(value: string | null | undefined) {
  const text = (value ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  if (text.includes("da doi soat")) return "Đã đối soát";
  if (text.includes("dang doi soat")) return "Chờ đối soát";
  if (text.includes("chua thanh ly") || text.includes("cho thanh ly")) return "Chờ đối soát";
  return value ?? "";
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AccountantDashboard() {
  const [loading, setLoading] = useState(true);
  const [rentalStats, setRentalStats] = useState({ moiCount: 0, choPheDuyetCount: 0, daPheDuyetCount: 0 });
  const [operationalStats, setOperationalStats] = useState({ chuaThuCount: 0, daThuCount: 0 });
  const [settlementStats, setSettlementStats] = useState({ choDoiSoatCount: 0, daDoiSoatCount: 0 });
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [recentSettlements, setRecentSettlements] = useState<any[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [rentals, operational, settlements] = await Promise.allSettled([
        getRentalRequests(),
        getOperationalContracts({ page: 0, size: 200 }),
        getSettlementContracts(),
      ]);

      // Rental requests stats
      if (rentals.status === "fulfilled") {
        const data = rentals.value as any[];
        setRentalStats({
          moiCount: data.filter(r => r.status === "Yêu cầu mới").length,
          choPheDuyetCount: data.filter(r => r.status === "Chờ phê duyệt").length,
          daPheDuyetCount: data.filter(r => r.status === "Đã phê duyệt").length,
        });
        setRecentRentals(data.slice(0, 4));
      }

      // Operational payments stats
      if (operational.status === "fulfilled") {
        const data = operational.value as any[];
        const normalize = (v: string | null | undefined) => {
          const t = (v ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
          return t.includes("da thu") || t.includes("thanh cong") || t.includes("paid") ? "da thu" : "chua thu";
        };
        setOperationalStats({
          chuaThuCount: data.filter(r => normalize(r.TrangThaiThanhToan ?? r.trangThaiThanhToan) === "chua thu").length,
          daThuCount: data.filter(r => normalize(r.TrangThaiThanhToan ?? r.trangThaiThanhToan) === "da thu").length,
        });
      }

      // Settlement stats
      if (settlements.status === "fulfilled") {
        const data = settlements.value as any[];
        const normalizedSettlements = data.map(r => ({
          ...r,
          TrangThaiThanhLy: normalizeSettlementStatus(r.TrangThaiThanhLy ?? r.trangThaiThanhLy),
        }));
        setSettlementStats({
          choDoiSoatCount: normalizedSettlements.filter(r => r.TrangThaiThanhLy === "Chờ đối soát").length,
          daDoiSoatCount: normalizedSettlements.filter(r => r.TrangThaiThanhLy === "Đã đối soát").length,
        });
        setRecentSettlements(normalizedSettlements.filter(r => r.TrangThaiThanhLy === "Chờ đối soát").slice(0, 4));
      }
    } finally {
      setLoading(false);
    }
  }

  const totalPending = rentalStats.moiCount + rentalStats.daPheDuyetCount + operationalStats.chuaThuCount + settlementStats.choDoiSoatCount;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-700">
              <TrendingUp size={12} className="text-emerald-600" /> Kế toán Dashboard
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Tổng quan nghiệp vụ</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Theo dõi 3 luồng kế toán chính: thu cọc, thu định kỳ và đối soát thanh lý.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {totalPending > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold bg-amber-50 border border-amber-200 rounded-full px-3 py-2">
                <AlertCircle size={12} className="text-amber-500" />
                <span className="text-amber-700">{totalPending} việc cần xử lý</span>
              </div>
            )}
            <button onClick={load}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-white/70 rounded-full px-3 py-2 hover:bg-white transition">
              <RefreshCw size={12} /> Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Yêu cầu mới"
          value={rentalStats.moiCount}
          sub="Chờ kế toán kiểm tra"
          icon={Receipt}
          color="#2563EB"
          bg="#EFF6FF"
        />
        <StatCard
          label="Chờ thu cọc"
          value={rentalStats.daPheDuyetCount}
          sub="Manager đã duyệt"
          icon={Banknote}
          color="#059669"
          bg="#ECFDF5"
        />
        <StatCard
          label="HĐ chưa thu kỳ"
          value={operationalStats.chuaThuCount}
          sub="Thu tiền định kỳ"
          icon={CreditCard}
          color="#7C3AED"
          bg="#F5F3FF"
        />
        <StatCard
          label="Chờ đối soát"
          value={settlementStats.choDoiSoatCount}
          sub="Hợp đồng thanh lý"
          icon={Scale}
          color="#D97706"
          bg="#FFFBEB"
        />
      </div>

      {/* Workflow Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Luồng nghiệp vụ</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <WorkflowCard
            title="Yêu cầu thu cọc"
            desc="Nhận yêu cầu từ sale, kiểm tra thông tin, phát phiếu thu và xác nhận đã thu tiền cọc."
            path="/accountant/rental-requests"
            icon={Receipt}
            color="#2563EB"
            bg="#EFF6FF"
            badge={rentalStats.moiCount > 0 ? `${rentalStats.moiCount} yêu cầu mới` : undefined}
            badgeColor="#2563EB"
            steps={["Yêu cầu mới", "Phát phiếu", "Chờ duyệt", "Thu tiền"]}
          />
          <WorkflowCard
            title="Thu tiền định kỳ"
            desc="Kiểm tra các khoản thu từ hợp đồng đang hoạt động, điều chỉnh và xác nhận đã thu."
            path="/accountant/operational-payments"
            icon={CreditCard}
            color="#7C3AED"
            bg="#F5F3FF"
            badge={operationalStats.chuaThuCount > 0 ? `${operationalStats.chuaThuCount} chưa thu` : undefined}
            badgeColor="#7C3AED"
            steps={["Chưa thu", "Kiểm tra", "Xác nhận thu"]}
          />
          <WorkflowCard
            title="Đối soát thanh lý"
            desc="Tính toán hoàn cọc, khấu trừ chi phí và xác nhận kết quả đối soát khi khách trả phòng."
            path="/accountant/checkout-settlement"
            icon={Scale}
            color="#059669"
            bg="#ECFDF5"
            badge={settlementStats.choDoiSoatCount > 0 ? `${settlementStats.choDoiSoatCount} chờ đối soát` : undefined}
            badgeColor="#D97706"
            steps={["Chờ đối soát", "Tạo bảng đối soát", "Đã đối soát"]}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Recent Rental Requests */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt size={15} className="text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Yêu cầu thu cọc gần đây</span>
            </div>
            <button onClick={() => window.location.href = "/accountant/rental-requests"}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
              Xem tất cả →
            </button>
          </div>
          <div className="px-5 divide-y divide-slate-50">
            {recentRentals.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Không có yêu cầu nào</div>
            ) : recentRentals.map(r => {
              const statusMap: Record<string, { color: string; bg: string }> = {
                "Yêu cầu mới":   { color: "#2563EB", bg: "#EFF6FF" },
                "Chờ phê duyệt": { color: "#D97706", bg: "#FFFBEB" },
                "Đã phê duyệt":  { color: "#059669", bg: "#ECFDF5" },
                "Đã xác nhận":   { color: "#6B7280", bg: "#F9FAFB" },
              };
              const cfg = statusMap[r.status] ?? { color: "#6B7280", bg: "#F9FAFB" };
              return (
                <RecentItem
                  key={r.id}
                  id={r.id}
                  name={r.client}
                  sub={`${r.room || "—"} · ${r.date || ""}`}
                  amount={r.rent != null ? money(r.rent + (r.deposit ?? 0) + (r.fees ?? 0)) : undefined}
                  status={r.status}
                  statusColor={cfg.color}
                  statusBg={cfg.bg}
                />
              );
            })}
          </div>
        </div>

        {/* Recent Settlements */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Scale size={15} className="text-emerald-600" />
              <span className="text-sm font-semibold text-slate-900">Hợp đồng chờ đối soát</span>
            </div>
            <button onClick={() => window.location.href = "/accountant/checkout-settlement"}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition">
              Xem tất cả →
            </button>
          </div>
          <div className="px-5 divide-y divide-slate-50">
            {recentSettlements.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Không có hợp đồng nào chờ đối soát</div>
            ) : recentSettlements.map(r => {
              const maHD = r.MaHopDongThue ?? r.maHopDongThue ?? "";
              const tenKH = r.TenKhachHang ?? r.tenKhachHang ?? maHD;
              const phong = r.DanhSachPhong ?? r.danhSachPhong ?? r.DanhSachGiuong ?? r.danhSachGiuong ?? "—";
              const ngayKT = r.NgayKetThuc ?? r.ngayKetThuc ?? "";
              return (
                <RecentItem
                  key={maHD}
                  id={maHD}
                  name={tenKH}
                  sub={`HĐ ${maHD} · ${phong ? `P.${phong}` : "—"} · KT: ${ngayKT ? ngayKT.slice(0, 10) : "—"}`}
                  status="Chờ đối soát"
                  statusColor="#D97706"
                  statusBg="#FFFBEB"
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Activity size={15} className="text-slate-500" /> Tóm tắt trạng thái
        </h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Đã thu cọc", value: rentalStats.moiCount === 0 && rentalStats.daPheDuyetCount === 0 ? "—" : `${rentalStats.choPheDuyetCount} chờ duyệt`, icon: CheckCircle2, color: "#059669" },
            { label: "HĐ đã thu kỳ", value: `${operationalStats.daThuCount} hợp đồng`, icon: CheckCircle2, color: "#059669" },
            { label: "Đã đối soát", value: `${settlementStats.daDoiSoatCount} hợp đồng`, icon: CheckCircle2, color: "#059669" },
            { label: "Tổng cần xử lý", value: `${totalPending} việc`, icon: Clock, color: totalPending > 0 ? "#D97706" : "#059669" },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
              <item.icon size={16} style={{ color: item.color }} className="flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="text-sm font-bold text-slate-900">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
