import { useState, useEffect } from "react";
import {
  FileText, Search, Plus, Eye, Edit2, Trash2, X, Save,
  Calendar, User, Home, DollarSign, Clock, CheckCircle,
  Calculator, Scale, FileX, ChevronLeft, ChevronRight,
  AlertCircle, Users, Bed, Package, CreditCard,
} from "lucide-react";
import { getTienKyDau, calculateDoiSoat, thanhLyHopDong, getContracts, createContract, updateContract, deleteContract, getRoomById} from "../../services/api";

const E = "#059669"; // Emerald accent

// ── Types (matching backend API) ───────────────────────────────────────────
interface Contract {
  id: string;
  loaiVanBan: string;
  ngayLap: string; // ISO date
  gioLap: string; // HH:mm
  chiNhanh: string;
  nhanVienLap: string;
  khachHangSoHuu: string;
  hinhThucThue: string;
  kyThanhToan: string;
  soLuongThanhVien: number;
  maPhong: string;
  danhSachMaGiuong: string[];
  danhSachDichVu: Array<{ tenDichVu: string; soLuong: number }>;
  mucTienCoc: number;
  trangThai: string;
}

interface DoiSoatResponse {
  maHopDong: string;
  tienCocBanDau: number;
  tyLeHoanCoc: number; // percentage
  tienCocDuocHoanCoBan: number;
  tongTienKhauTru: number;
  soTienThucTe: number;
  loaiGiaoDich: "system_pays_customer" | "customer_pays_system";
}

interface TienKyDauResponse {
  maHopDong: string;
  tienPhongThang1: number;
  tienDien: number;
  tienNuoc: number;
  phiDichVu: number;
  tongTienKyDau: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
// TODO: Replace mock data with API call: GET /api/contracts
const MOCK_CONTRACTS: Contract[] = [
  {
    id: "ct1",
    loaiVanBan: "Hợp đồng thuê phòng trọ",
    ngayLap: "2026-04-25",
    gioLap: "14:30",
    chiNhanh: "Chi nhánh Quận 1",
    nhanVienLap: "Nguyễn Văn A",
    khachHangSoHuu: "Vũ Minh Anh",
    hinhThucThue: "Toàn phòng",
    kyThanhToan: "Hàng tháng",
    soLuongThanhVien: 2,
    maPhong: "B201",
    danhSachMaGiuong: ["B201-01", "B201-02"],
    danhSachDichVu: [
      { tenDichVu: "Điện", soLuong: 100 },
      { tenDichVu: "Nước", soLuong: 8 },
    ],
    mucTienCoc: 3500000,
    trangThai: "active",
  },
  {
    id: "ct2",
    loaiVanBan: "Hợp đồng thuê phòng trọ",
    ngayLap: "2026-04-15",
    gioLap: "10:00",
    chiNhanh: "Chi nhánh Quận 1",
    nhanVienLap: "Trần Thị B",
    khachHangSoHuu: "Phạm Thị Lan",
    hinhThucThue: "Toàn phòng",
    kyThanhToan: "Hàng tháng",
    soLuongThanhVien: 1,
    maPhong: "A101",
    danhSachMaGiuong: ["A101-01"],
    danhSachDichVu: [
      { tenDichVu: "Điện", soLuong: 80 },
      { tenDichVu: "Nước", soLuong: 6 },
    ],
    mucTienCoc: 3500000,
    trangThai: "active",
  },
  {
    id: "ct3",
    loaiVanBan: "Hợp đồng thuê phòng trọ",
    ngayLap: "2025-12-20",
    gioLap: "16:45",
    chiNhanh: "Chi nhánh Quận 1",
    nhanVienLap: "Nguyễn Văn A",
    khachHangSoHuu: "Hoàng Văn Nam",
    hinhThucThue: "Ghép giường",
    kyThanhToan: "Hàng tháng",
    soLuongThanhVien: 1,
    maPhong: "B202",
    danhSachMaGiuong: ["B202-01"],
    danhSachDichVu: [
      { tenDichVu: "Điện", soLuong: 50 },
      { tenDichVu: "Nước", soLuong: 4 },
    ],
    mucTienCoc: 1200000,
    trangThai: "expired",
  },
];

// ── Helper Functions ───────────────────────────────────────────────────────
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// ── Contract Detail Modal ──────────────────────────────────────────────────
function ContractDetailModal({
  contract,
  onClose,
  onCalculateTienKyDau,
  onCalculateDoiSoat,
  onThanhLy,
}: {
  contract: Contract;
  onClose: () => void;
  onCalculateTienKyDau: (contractId: string) => void;
  onCalculateDoiSoat: (contractId: string) => void;
  onThanhLy: (contractId: string) => void;
}) {
  // TODO: Replace with API: GET /api/contracts/{id}
  // Currently using passed contract object from list

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden" style={{ background: "white", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: `linear-gradient(135deg,${E},#0891B2)` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <div className="text-white" style={{ fontWeight: 800, fontSize: "1.05rem" }}>Chi tiết Hợp đồng</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.85)", marginTop: 2 }}>Mã: {contract.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-white/20">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic Info */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Thông tin cơ bản
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Loại văn bản", value: contract.loaiVanBan, icon: FileText },
                { label: "Ngày lập", value: formatDate(contract.ngayLap), icon: Calendar },
                { label: "Giờ lập", value: contract.gioLap, icon: Clock },
                { label: "Chi nhánh", value: contract.chiNhanh, icon: Home },
                { label: "Nhân viên lập", value: contract.nhanVienLap, icon: User },
                { label: "Khách hàng sở hữu", value: contract.khachHangSoHuu, icon: User },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={11} style={{ color: E }} />
                      <span style={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>{f.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rental Info */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Thông tin thuê
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Hình thức thuê", value: contract.hinhThucThue, icon: Home },
                { label: "Kỳ thanh toán", value: contract.kyThanhToan, icon: Calendar },
                { label: "Số lượng thành viên", value: contract.soLuongThanhVien, icon: Users },
                { label: "Mã phòng", value: contract.maPhong, icon: Home },
                { label: "Mức tiền cọc", value: formatCurrency(contract.mucTienCoc), icon: DollarSign },
                { label: "Trạng thái", value: contract.trangThai === "active" ? "Đang hiệu lực" : "Đã hết hạn", icon: CheckCircle },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={11} style={{ color: E }} />
                      <span style={{ fontSize: "0.7rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B" }}>{f.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Beds */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Danh sách giường
            </div>
            <div className="flex flex-wrap gap-2">
              {contract.danhSachMaGiuong.map(bed => (
                <span key={bed} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#FFF7ED", border: "1px solid #FDBA74" }}>
                  <Bed size={12} style={{ color: "#EA580C" }} />
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9A3412" }}>{bed}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Danh sách dịch vụ
            </div>
            <div className="space-y-2">
              {contract.danhSachDichVu.map((service, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="flex items-center gap-2">
                    <Package size={14} style={{ color: E }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>{service.tenDichVu}</span>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748B" }}>Số lượng: {service.soLuong}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Actions */}
          <div className="pt-3" style={{ borderTop: "2px solid #F1F5F9" }}>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Nghiệp vụ tài chính
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onCalculateTienKyDau(contract.id)}
                className="flex flex-col items-center gap-2 px-4 py-3.5 rounded-xl transition"
                style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(217,119,6,0.25)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                  <Calculator size={16} style={{ color: "#D97706" }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400E", textAlign: "center" }}>Tính tiền kỳ đầu</span>
              </button>

              <button
                onClick={() => onCalculateDoiSoat(contract.id)}
                className="flex flex-col items-center gap-2 px-4 py-3.5 rounded-xl transition"
                style={{ background: "#EEF2FF", border: "1.5px solid #C7D2FE" }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.25)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DDD6FE" }}>
                  <Scale size={16} style={{ color: "#6366F1" }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4338CA", textAlign: "center" }}>Đối soát</span>
              </button>

              <button
                onClick={() => onThanhLy(contract.id)}
                disabled={contract.trangThai !== "active"}
                className="flex flex-col items-center gap-2 px-4 py-3.5 rounded-xl transition"
                style={{
                  background: contract.trangThai !== "active" ? "#F8FAFC" : "#FEF2F2",
                  border: `1.5px solid ${contract.trangThai !== "active" ? "#E2E8F0" : "#FECACA"}`,
                  opacity: contract.trangThai !== "active" ? 0.5 : 1,
                  cursor: contract.trangThai !== "active" ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => contract.trangThai === "active" && ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(220,38,38,0.25)")}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: contract.trangThai !== "active" ? "#F1F5F9" : "#FEE2E2" }}>
                  <FileX size={16} style={{ color: contract.trangThai !== "active" ? "#94A3B8" : "#DC2626" }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: contract.trangThai !== "active" ? "#94A3B8" : "#991B1B", textAlign: "center" }}>Thanh lý HĐ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl transition"
            style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tien Ky Dau Result Modal ───────────────────────────────────────────────
function TienKyDauModal({ result, onClose }: { result: TienKyDauResponse; onClose: () => void }) {
  // TODO: This modal displays result from: GET /api/contracts/{id}/tien-ky-dau

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "white" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
              <Calculator size={18} style={{ color: "#D97706" }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#92400E" }}>Tiền kỳ đầu</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-black/5">
            <X size={16} style={{ color: "#D97706" }} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Mã hợp đồng</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{result.maHopDong}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tiền phòng tháng đầu</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.tienPhongThang1)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tiền điện</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.tienDien)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tiền nước</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.tienNuoc)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Phí dịch vụ</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.phiDichVu)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#FFFBEB", border: "1.5px solid #FCD34D" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#D97706" }}>Tổng tiền kỳ đầu</span>
            <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "#D97706" }}>{formatCurrency(result.tongTienKyDau)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-white transition"
            style={{ background: "linear-gradient(135deg,#D97706,#B45309)", fontSize: "0.85rem", fontWeight: 700 }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Doi Soat Result Modal ──────────────────────────────────────────────────
function DoiSoatModal({ result, onClose }: { result: DoiSoatResponse; onClose: () => void }) {
  // TODO: This modal displays result from: GET /api/contracts/{id}/doi-soat

  const isSystemPays = result.loaiGiaoDich === "system_pays_customer";
  const highlightColor = isSystemPays ? "#059669" : "#DC2626";
  const highlightBg = isSystemPays ? "#ECFDF5" : "#FEF2F2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "white" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#EEF2FF", borderBottom: "1px solid #C7D2FE" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#DDD6FE" }}>
              <Scale size={18} style={{ color: "#6366F1" }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#4338CA" }}>Đối soát thanh toán</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-black/5">
            <X size={16} style={{ color: "#6366F1" }} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Mã hợp đồng</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{result.maHopDong}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tiền cọc ban đầu</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.tienCocBanDau)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tỷ lệ hoàn cọc</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{result.tyLeHoanCoc}%</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tiền cọc được hoàn cơ bản</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.tienCocDuocHoanCoBan)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}>Tổng tiền khấu trừ</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1E293B" }}>{formatCurrency(result.tongTienKhauTru)}</span>
          </div>

          {/* Highlighted final amount */}
          <div className="flex items-center justify-between px-4 py-4 rounded-xl" style={{ background: highlightBg, border: `2px solid ${highlightColor}` }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: highlightColor }}>Số tiền thực tế</span>
            <span style={{ fontSize: "1.25rem", fontWeight: 900, color: highlightColor }}>
              {isSystemPays ? "+" : "-"}{formatCurrency(Math.abs(result.soTienThucTe))}
            </span>
          </div>

          {/* Payment direction indicator */}
          <div className="px-4 py-3 rounded-xl" style={{ background: highlightBg, border: `1px solid ${highlightColor}40` }}>
            <div className="flex items-center gap-2">
              <CreditCard size={14} style={{ color: highlightColor }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: highlightColor }}>
                {isSystemPays ? "Hệ thống hoàn tiền cho khách hàng" : "Khách hàng cần thanh toán thêm"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-white transition"
            style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)", fontSize: "0.85rem", fontWeight: 700 }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Contract Form Modal ────────────────────────────────────────────────────
function ContractFormModal({ contract, onClose, onSave }: {
  contract?: Contract;
  onClose: () => void;
  onSave: (data: Partial<Contract>) => void;
}) {
  // TODO: When creating new contract, call: POST /api/contracts
  // TODO: When editing existing contract, call: PUT /api/contracts/{id}

  const [formData, setFormData] = useState<Partial<Contract>>(
    contract ?? {
      loaiVanBan: "Hợp đồng thuê phòng trọ",
      ngayLap: "",
      gioLap: "",
      chiNhanh: "",
      nhanVienLap: "",
      khachHangSoHuu: "",
      hinhThucThue: "Toàn phòng",
      kyThanhToan: "Hàng tháng",
      soLuongThanhVien: 1,
      maPhong: "",
      danhSachMaGiuong: [],
      danhSachDichVu: [],
      mucTienCoc: 0,
    }
  );

  const [newService, setNewService] = useState({ tenDichVu: "", soLuong: 0 });

  // Hàm tự động check giá phòng để điền tiền cọc
  const handleAutoFillDeposit = async () => {
    if (!formData.maPhong || formData.hinhThucThue !== "Toàn phòng") return;
    
    try {
      const roomData = await getRoomById(formData.maPhong);
      // Giả sử Backend trả về roomData có field giaThuePhong
      if (roomData && roomData.giaThuePhong) {
        setFormData(prev => ({ ...prev, mucTienCoc: Number(roomData.giaThuePhong) }));
      }
    } catch (error) {
      console.log("Không tìm thấy thông tin phòng để tự điền cọc.");
    }
  };
  
  const handleSubmit = () => {
    // TODO: Call appropriate API here based on create/edit mode
    onSave(formData);
    onClose();
  };

  const addService = () => {
    if (newService.tenDichVu && newService.soLuong > 0) {
      setFormData({
        ...formData,
        danhSachDichVu: [...(formData.danhSachDichVu || []), { ...newService }],
      });
      setNewService({ tenDichVu: "", soLuong: 0 });
    }
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      danhSachDichVu: formData.danhSachDichVu?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden" style={{ background: "white", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: `linear-gradient(135deg,${E},#0891B2)` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <FileText size={18} className="text-white" />
            </div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              {contract ? "Chỉnh sửa Hợp đồng" : "Tạo Hợp đồng mới"}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-white/20">
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Basic fields */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Thông tin cơ bản
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Loại văn bản *</label>
                <input
                  value={formData.loaiVanBan}
                  onChange={e => setFormData({ ...formData, loaiVanBan: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Chi nhánh *</label>
                <input
                  value={formData.chiNhanh}
                  onChange={e => setFormData({ ...formData, chiNhanh: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Ngày lập *</label>
                <input
                  type="date"
                  value={formData.ngayLap}
                  onChange={e => setFormData({ ...formData, ngayLap: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Giờ lập *</label>
                <input
                  type="time"
                  value={formData.gioLap}
                  onChange={e => setFormData({ ...formData, gioLap: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Nhân viên lập *</label>
                <input
                  value={formData.nhanVienLap}
                  onChange={e => setFormData({ ...formData, nhanVienLap: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Khách hàng sở hữu *</label>
                <input
                  value={formData.khachHangSoHuu}
                  onChange={e => setFormData({ ...formData, khachHangSoHuu: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
            </div>
          </div>

          {/* Rental info */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Thông tin thuê
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Hình thức thuê *</label>
                <select
                  value={formData.hinhThucThue}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ 
                      ...formData, 
                      hinhThucThue: val,
                      // Tự động xóa danh sách giường nếu chọn Toàn phòng
                      danhSachMaGiuong: val === "Toàn phòng" ? [] : formData.danhSachMaGiuong 
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                >
                  <option value="Toàn phòng">Toàn phòng</option>
                  <option value="Ghép giường">Ghép giường</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Kỳ thanh toán *</label>
                <select
                  value={formData.kyThanhToan}
                  onChange={e => setFormData({ ...formData, kyThanhToan: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                >
                  <option value="Hàng tháng">Hàng tháng</option>
                  <option value="Hàng quý">Hàng quý</option>
                  <option value="Hàng năm">Hàng năm</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Số lượng thành viên *</label>
                <input
                  type="number"
                  value={formData.soLuongThanhVien}
                  onChange={e => setFormData({ ...formData, soLuongThanhVien: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Mã phòng *</label>
                <input
                  value={formData.maPhong}
                  onChange={e => setFormData({ ...formData, maPhong: e.target.value })}
                  onBlur={handleAutoFillDeposit}
                  placeholder="VD: B201"
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Mức tiền cọc *</label>
                <input
                  type="number"
                  value={formData.mucTienCoc}
                  readOnly 
                  placeholder="Hệ thống tự động tính..."
                  onChange={e => setFormData({ ...formData, mucTienCoc: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ 
                    border: "1.5px solid #E2E8F0", 
                    fontSize: "0.85rem",
                    background: "#F1F5F9",
                    color: "#64748B",
                    cursor: "not-allowed", 
                    fontWeight: 700
                  }}
                />
              </div>
            </div>
          </div>

          {/* Beds */}
          {formData.hinhThucThue === "Ghép giường" && (
            <div>
              <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Danh sách mã giường *
              </div>
              <input
                value={(formData.danhSachMaGiuong || []).join(", ")}
                onChange={e => setFormData({ ...formData, danhSachMaGiuong: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                placeholder="VD: B201-01, B201-02"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
              />
              <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 4 }}>Nhập các mã giường, phân cách bằng dấu phẩy</div>
            </div>
          )}

          {/* Services */}
          <div>
            <div className="mb-3" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Danh sách dịch vụ
            </div>
            <div className="space-y-2 mb-3">
              {(formData.danhSachDichVu || []).map((service, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <Package size={14} style={{ color: E }} />
                  <span className="flex-1" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1E293B" }}>{service.tenDichVu}</span>
                  <span style={{ fontSize: "0.85rem", color: "#64748B" }}>SL: {service.soLuong}</span>
                  <button
                    onClick={() => removeService(i)}
                    className="p-1.5 rounded-lg transition hover:bg-red-100"
                    style={{ color: "#DC2626" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                value={newService.tenDichVu}
                onChange={e => setNewService({ ...newService, tenDichVu: e.target.value })}
                placeholder="Tên dịch vụ"
                className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
              />
              <input
                type="number"
                value={newService.soLuong || ""}
                onChange={e => setNewService({ ...newService, soLuong: Number(e.target.value) })}
                placeholder="Số lượng"
                className="w-32 px-3 py-2.5 rounded-xl outline-none"
                style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
              />
              <button
                onClick={addService}
                className="px-4 py-2.5 rounded-xl text-white transition"
                style={{ background: `linear-gradient(135deg,${E},#0891B2)`, fontSize: "0.85rem", fontWeight: 700 }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl transition"
            style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition"
            style={{ background: `linear-gradient(135deg,${E},#0891B2)`, fontSize: "0.85rem", fontWeight: 700 }}
          >
            <Save size={14} /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────
function DeleteConfirmModal({ contract, onClose, onConfirm }: {
  contract: Contract;
  onClose: () => void;
  onConfirm: () => void;
}) {
  // TODO: When confirmed, call: DELETE /api/contracts/{id}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: "white" }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEE2E2" }}>
            <AlertCircle size={18} style={{ color: "#DC2626" }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#991B1B" }}>Xác nhận xoá</div>
        </div>

        <div className="p-6">
          <p style={{ fontSize: "0.9rem", color: "#64748B", lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xoá hợp đồng <strong style={{ color: "#1E293B" }}>{contract.id}</strong> của khách hàng <strong style={{ color: "#1E293B" }}>{contract.khachHangSoHuu}</strong> không? Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl transition"
            style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem", fontWeight: 600, color: "#64748B" }}
          >
            Huỷ
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition"
            style={{ background: "linear-gradient(135deg,#DC2626,#991B1B)", fontSize: "0.85rem", fontWeight: 700 }}
          >
            <Trash2 size={14} /> Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AccountantContracts() {
  // TODO: Replace mock data with API call: GET /api/contracts
  const [contracts, setContracts] = useState<Contract[]>([]);
// Tự động Load danh sách hợp đồng khi mở trang
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await getContracts();
        
        // BƯỚC PHIÊN DỊCH DỮ LIỆU:
        // Đổi tên biến maVanBan của Java thành chữ id của React
        // Bơm chuỗi rỗng vào các trường bị null để giao diện không lỗi
        const realData = (response.data as any[]).map(item => {
          let st = "active";
          if (item.loaiVanBan?.includes("[STATUS:Terminated]")) st = "terminated";
          else if (item.loaiVanBan === "CHO_KY") st = "pending";

          return {
            ...item,
            id: item.maVanBan || item.maHopDongThue || item.id || "N/A",
            khachHangSoHuu: item.khachHangSoHuu || "Chưa cập nhật",
            maPhong: item.maPhong || "Ghép giường", 
            danhSachMaGiuong: item.danhSachMaGiuong || [],
            danhSachDichVu: item.danhSachDichVu || [],
            mucTienCoc: item.mucTienCoc || item.tienCoc || 0,
            trangThai: st
          };
        });

        setContracts(realData as Contract[]);
      } catch (error) {
        console.error("Lỗi khi tải danh sách hợp đồng:", error);
      }
    };
    fetchContracts();
  }, []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailModal, setDetailModal] = useState<Contract | null>(null);
  const [formModal, setFormModal] = useState<{ mode: "create" | "edit"; contract?: Contract } | null>(null);
  const [deleteModal, setDeleteModal] = useState<Contract | null>(null);
  const [tienKyDauResult, setTienKyDauResult] = useState<TienKyDauResponse | null>(null);
  const [doiSoatResult, setDoiSoatResult] = useState<DoiSoatResponse | null>(null);

  const itemsPerPage = 5;
  const filteredContracts = contracts.filter(c =>
      (c.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.khachHangSoHuu || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.maPhong || "").toLowerCase().includes(search.toLowerCase())
    );
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSave = async (data: Partial<Contract>) => {
    if (formModal?.mode === "create") {
      try {
        const response = await createContract(data as any);
        alert("Tạo hợp đồng thành công!");
        setContracts([response as unknown as Contract, ...contracts]);
      } catch (error) {
        console.error("Lỗi khi tạo hợp đồng:", error);
        alert("Tạo thất bại. Xem console log.");
      }
    } else if (formModal?.mode === "edit" && formModal.contract) {
      try {
        const response = await updateContract(formModal.contract.id, data as any);
        alert("Cập nhật thành công!");
        setContracts(contracts.map(c => c.id === formModal.contract!.id ? { ...c, ...data } : c));
      } catch (error) {
        console.error("Lỗi khi cập nhật hợp đồng:", error);
      }
    }
  };

  const handleDelete = (contract: Contract) => {
    // TODO: Call API: DELETE /api/contracts/{id}
    setContracts(contracts.filter(c => c.id !== contract.id));
  };

  const handleCalculateTienKyDau = async (contractId: string) => {
    try {
      const tongTien = await getTienKyDau(contractId);
      
      const realResult: TienKyDauResponse = {
        maHopDong: contractId,
        tienPhongThang1: 0, // Backend hiện chỉ trả cục tổng, có thể update API sau
        tienDien: 0,
        tienNuoc: 0,
        phiDichVu: 0,
        tongTienKyDau: tongTien, // Nhét số tổng thật vào đây
      };
      setTienKyDauResult(realResult);
      setDetailModal(null);
    } catch (error) {
      console.error("Lỗi khi tính tiền kỳ đầu:", error);
      alert("Không thể tính toán. Kiểm tra xem hợp đồng có bị lỗi dữ liệu không.");
    }
  };

  const handleCalculateDoiSoat = async (contractId: string) => {
    try {
      // Truyền tiền phạt = 0, hết hạn = false làm mặc định
      const apiData = await calculateDoiSoat(contractId, 0, false);
      
      const realResult: DoiSoatResponse = {
        maHopDong: apiData.maHopDong,
        tienCocBanDau: apiData.tienCocBanDau,
        tyLeHoanCoc: parseFloat(apiData.tyLeHoanCoc.replace("%", "")),
        tienCocDuocHoanCoBan: apiData.tienCocDuocHoanCoBan,
        tongTienKhauTru: apiData.tongTienKhauTru,
        soTienThucTe: apiData.soTienThucTe,
        loaiGiaoDich: apiData.loaiGiaoDich.includes("Chi trả") ? "system_pays_customer" : "customer_pays_system",
      };
      setDoiSoatResult(realResult);
      setDetailModal(null);
    } catch (error) {
      console.error("Lỗi khi tính đối soát:", error);
      alert("Không thể tính toán. Kiểm tra xem hợp đồng có bị lỗi dữ liệu không.");
    }
  };
    const handleThanhLy = async (contractId: string) => {
    try {
      const message = await thanhLyHopDong(contractId);
      alert(message); // Hiển thị lời nhắn từ Backend: "Đã thanh lý..."
      
      // Đổi trạng thái hiển thị trên màn hình thành "terminated"
      setContracts(contracts.map(c => c.id === contractId ? { ...c, trangThai: "terminated" } : c));
      setDetailModal(null);
    } catch (error) {
      console.error("Lỗi khi thanh lý hợp đồng:", error);
      alert("Không thể thanh lý hợp đồng. Vui lòng thử lại.");
    }
  };
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${E}15` }}>
              <FileText size={14} style={{ color: E }} />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: "1.35rem", color: "#1E293B", letterSpacing: "-0.02em" }}>
              Quản lý Hợp đồng
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748B", paddingLeft: "2.25rem" }}>
            Danh sách và nghiệp vụ tài chính hợp đồng thuê
          </p>
        </div>
        <button
          onClick={() => setFormModal({ mode: "create" })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition"
          style={{ background: `linear-gradient(135deg,${E},#0891B2)`, fontSize: "0.85rem", fontWeight: 700, boxShadow: `0 4px 14px ${E}40` }}
        >
          <Plus size={15} /> Tạo hợp đồng mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Đang hiệu lực", value: contracts.filter(c => c.trangThai === "active").length, color: E, icon: CheckCircle },
          { label: "Đã hết hạn", value: contracts.filter(c => c.trangThai === "expired").length, color: "#DC2626", icon: Clock },
          { label: "Tổng hợp đồng", value: contracts.length, color: "#6366F1", icon: FileText },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "white", border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#1E293B", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.68rem", color: "#94A3B8", marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, khách hàng, phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none"
            style={{ border: "1.5px solid #E2E8F0", fontSize: "0.85rem" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: `${E}08`, borderBottom: `1px solid ${E}20` }}>
              {["Mã hợp đồng", "Khách hàng", "Phòng", "Tiền cọc", "Trạng thái", "Hành động"].map(h => (
                <th key={h} className="text-left px-4 py-3" style={{ fontSize: "0.7rem", fontWeight: 800, color: E, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedContracts.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9" }} className="hover:bg-emerald-50/20 transition-colors">
                <td className="px-4 py-3">
                  <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1E293B" }}>{c.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1E293B" }}>{c.khachHangSoHuu}</div>
                  <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>{c.hinhThucThue}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-lg" style={{ background: "#FFF7ED", color: "#EA580C", fontSize: "0.78rem", fontWeight: 700 }}>
                    {c.maPhong}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: E }}>{formatCurrency(c.mucTienCoc)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
                    background: c.trangThai === "active" ? "#ECFDF5" : "#FEF2F2",
                    color: c.trangThai === "active" ? E : "#DC2626",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ 
                      background: c.trangThai === "active" ? "#10B981" : 
                                 c.trangThai === "pending" ? "#F59E0B" : "#EF4444" 
                    }} />
                    {c.trangThai === "active" ? "Đang hiệu lực" : 
                     c.trangThai === "pending" ? "Chờ phê duyệt" : "Đã hết hạn"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailModal(c)}
                      className="p-2 rounded-lg transition"
                      style={{ background: "#EEF2FF", color: "#6366F1" }}
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setFormModal({ mode: "edit", contract: c })}
                      className="p-2 rounded-lg transition"
                      style={{ background: "#FFFBEB", color: "#D97706" }}
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteModal(c)}
                      className="p-2 rounded-lg transition"
                      style={{ background: "#FEF2F2", color: "#DC2626" }}
                      title="Xoá"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
            Hiển thị {((page - 1) * itemsPerPage) + 1} - {Math.min(page * itemsPerPage, filteredContracts.length)} trong tổng số {filteredContracts.length} hợp đồng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg transition"
              style={{ border: "1px solid #E2E8F0", color: page === 1 ? "#CBD5E1" : "#64748B", cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg transition"
                style={{
                  background: p === page ? `linear-gradient(135deg,${E},#0891B2)` : "white",
                  border: `1px solid ${p === page ? E : "#E2E8F0"}`,
                  color: p === page ? "white" : "#64748B",
                  fontSize: "0.8rem",
                  fontWeight: p === page ? 700 : 500,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg transition"
              style={{ border: "1px solid #E2E8F0", color: page === totalPages ? "#CBD5E1" : "#64748B", cursor: page === totalPages ? "not-allowed" : "pointer" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {detailModal && (
        <ContractDetailModal
          contract={detailModal}
          onClose={() => setDetailModal(null)}
          onCalculateTienKyDau={handleCalculateTienKyDau}
          onCalculateDoiSoat={handleCalculateDoiSoat}
          onThanhLy={handleThanhLy}
        />
      )}
      {formModal && (
        <ContractFormModal
          contract={formModal.contract}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          contract={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={() => handleDelete(deleteModal)}
        />
      )}
      {tienKyDauResult && (
        <TienKyDauModal
          result={tienKyDauResult}
          onClose={() => setTienKyDauResult(null)}
        />
      )}
      {doiSoatResult && (
        <DoiSoatModal
          result={doiSoatResult}
          onClose={() => setDoiSoatResult(null)}
        />
      )}
    </div>
  );
}
