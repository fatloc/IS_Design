import { useState, useMemo, useEffect } from "react";
import {
  ClipboardCheck, DollarSign, Users, Check, X, AlertTriangle,
  ChevronRight, Clock, Calendar, Home, CheckCircle, XCircle,
  FileText, ShieldCheck, Send, MessageSquare, BadgeCheck,
  Building2, Info, BedDouble, MapPin, Fingerprint,
  PartyPopper,
} from "lucide-react";
import { usePagedList } from "../hooks/usePagedList";
import { 
  getRequests, 
  updateRequest, 
  getCustomers, 
  getTransactions, 
  updateTransaction,
  createTransaction,
  approveRequest,
  rejectRequest,
  type ApproveRequestResponse,
} from "../services/api";
import type { Request, Customer, Transaction } from "../types";
import { Pagination } from "../components/Pagination";
import { useToast } from "../components/ToastProvider";

const A = "#4F46E5";
const AL = "#818CF8";

// ── Types ──────────────────────────────────────────────────────────────────
type RS = "pending" | "approved" | "rejected";
type DS = "pending" | "confirmed";
type CS = "pending" | "approved" | "flagged";

interface RentalReq {
  id: string; tenant: string; avatar: string; room: string; roomType: string;
  period: string; fromDate: string; submitted: string; note: string; source: string;
  status: RS; rejectReason?: string;
}
interface DepositReq {
  id: string; tenant: string; avatar: string; room: string; amount: number;
  accountant: string; date: string; method: string; ref: string; status: DS;
}
interface ConditionReq {
  id: string; tenant: string; avatar: string; room: string;
  gender: string; roomGender: string;
  areaOk: boolean; groupOk: boolean; idVerified: boolean; status: CS;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  "Website": { bg: "#EEF2FF", color: A },
  "Nhân viên Sale": { bg: "#FFF7ED", color: "#EA580C" },
  "Hotline": { bg: "#ECFDF5", color: "#059669" },
};

function Avatar({ initials, gradient, size = 9 }: { initials: string; gradient: string; size?: number }) {
  const s = `${size / 4}rem`;
  return (
    <div className="flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ width: s, height: s, background: gradient, fontWeight: 800, fontSize: "0.72rem" }}>
      {initials}
    </div>
  );
}

// ── Section A: Rental Approvals ────────────────────────────────────────────
function RentalSection({ customers }: { customers: Map<string, Customer> }) {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectText, setRejectText] = useState("");
  const [approving, setApproving] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<ApproveRequestResponse | null>(null);

  const {
    items: rawItems,
    loading,
    reload,
    page,
    setPage,
    totalPages,
    totalElements,
    size,
    setSize,
  } = usePagedList<Request>(getRequests, 10, {
    trangThaiYeuCau: "Chờ phê duyệt",
  });

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500);
  };

  const approve = async (id: string) => {
    setApproving(id);
    try {
      const result = await approveRequest(id);
      setSuccessModal(result);
      reload();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Lỗi khi duyệt yêu cầu", "err");
    } finally {
      setApproving(null);
    }
  };

  const confirmReject = async (id: string) => {
    if (!rejectText.trim()) return;
    try {
      await rejectRequest(id, rejectText.trim());
      showToast("Đã từ chối yêu cầu", "err");
      setRejectingId(null);
      setRejectText("");
      reload();
    } catch {
      showToast("Lỗi khi từ chối", "err");
    }
  };

  function fmt(n: number | string | null | undefined) {
    if (!n) return "—";
    return Number(n).toLocaleString("vi-VN") + " đ";
  }

  const items = useMemo<RentalReq[]>(() => {
    return rawItems.map(r => {
      const customer = r.khachHangYeuCau ? customers.get(r.khachHangYeuCau) : null;
      const tenantName = customer?.hoTen ?? r.khachHangYeuCau ?? "Khách chưa rõ";
      // Xây dựng mô tả yêu cầu từ dữ liệu thực
      const roomType = r.soLuongNguoi && r.soLuongNguoi > 1 ? "Toàn phòng" : "Ghép giường";
      const extras: string[] = [];
      if (r.coDieuHoa) extras.push("Điều hòa");
      if (r.coBaiGuiXe) extras.push("Bãi xe");
      return {
        id: r.maYeuCau,
        tenant: tenantName,
        avatar: tenantName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(),
        room: r.khuVuc ? `Khu vực: ${r.khuVuc}` : "Chưa xác định khu vực",
        roomType,
        period: r.soLuongNguoi ? `${r.soLuongNguoi} người` : "—",
        fromDate: r.thoiGianBatDauThueDuKien ?? "—",
        submitted: r.thoiGianBanGiaoPhongDuKien ?? "—",
        note: [
          r.cacTieuChiKhac ?? "",
          r.mucGiaMongMuon ? `Mức giá: ${fmt(r.mucGiaMongMuon)}` : "",
          extras.length > 0 ? `Yêu cầu: ${extras.join(", ")}` : "",
          r.gioiTinhYeuCau ? `Giới tính: ${r.gioiTinhYeuCau}` : "",
        ].filter(Boolean).join(" · "),
        source: r.khuVuc ?? "Chưa rõ",
        status: "pending",
      };
    });
  }, [rawItems, customers]);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-white"
          style={{ background: toast.type === "ok" ? "#059669" : "#DC2626", transition: "all .3s" }}>
          {toast.type === "ok" ? <CheckCircle size={15} /> : <XCircle size={15} />}
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{toast.msg}</span>
        </div>
      )}

      {/* Modal thành công sau khi duyệt */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden bg-white shadow-2xl">
            <div className="px-6 pt-8 pb-4 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg,#059669,#0891B2)" }}>
                <CheckCircle size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1">Duyệt thành công!</h3>
              <p className="text-sm text-slate-500">{successModal.message}</p>
            </div>
            <div className="mx-6 mb-4 rounded-2xl overflow-hidden border border-slate-200">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Hợp đồng vừa tạo</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Mã hợp đồng", value: successModal.hopDong?.maVanBan ?? "—" },
                  { label: "Hình thức thuê", value: successModal.hopDong?.hinhThucThue ?? "—" },
                  { label: "Kỳ thanh toán", value: successModal.hopDong?.kyThanhToan ?? "—" },
                  { label: "Số thành viên", value: String(successModal.hopDong?.soLuongThanhVien ?? "—") },
                  { label: "Ngày kết thúc", value: successModal.hopDong?.ngayKetThuc ?? "Chưa xác định" },
                  { label: "Trạng thái", value: "Đang hoạt động" },
                ].map(item => (
                  <div key={item.label} className="rounded-xl px-3 py-2" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.68rem", color: "#94A3B8", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-center">
              <button
                onClick={() => setSuccessModal(null)}
                className="px-8 py-2.5 rounded-xl font-bold text-white"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)", fontSize: "0.88rem" }}>
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-slate-900" style={{ fontWeight: 800, fontSize: "1rem" }}>Yêu cầu thuê phòng</div>
          <div className="text-slate-500 mt-0.5" style={{ fontSize: "0.78rem" }}>
            {totalElements} yêu cầu đang chờ phê duyệt · Xem xét kỹ trước khi xác nhận
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: `${A}10`, border: `1px solid ${A}25` }}>
          <Clock size={13} style={{ color: A }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: A }}>SLA: 24h/yêu cầu</span>
        </div>
      </div>

      <div className="mt-4 mb-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      </div>

      {loading && (
        <div className="text-center py-4 text-slate-500 text-sm italic">Đang tải dữ liệu...</div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background: "#F8FAFC", border: "1px dashed #CBD5E1" }}>
          <CheckCircle size={36} className="mb-3" style={{ color: "#86EFAC" }} />
          <div style={{ fontWeight: 700, color: "#374151", fontSize: "0.95rem" }}>Tất cả đã được xử lý!</div>
          <div style={{ color: "#94A3B8", fontSize: "0.8rem", marginTop: 4 }}>Không còn yêu cầu nào đang chờ duyệt</div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(req => {
          const isRejecting = rejectingId === req.id;
          const isApprovingThis = approving === req.id;
          const srcStyle = SOURCE_COLORS[req.source] ?? { bg: "#F8FAFC", color: "#64748B" };

          return (
            <div key={req.id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                border: "1.5px solid #E8EEF4",
                background: "white",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
              <div className="flex items-start gap-4 p-4">
                <Avatar initials={req.avatar} gradient={`linear-gradient(135deg,${A},#7C3AED)`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#1E293B" }}>{req.tenant}</span>
                    <span className="px-2 py-0.5 rounded-md" style={{ background: srcStyle.bg, color: srcStyle.color, fontSize: "0.68rem", fontWeight: 700 }}>{req.source}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Home size={11} style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.78rem", color: "#64748B" }}><strong style={{ color: "#374151" }}>{req.room}</strong> · {req.roomType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={11} style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.78rem", color: "#64748B" }}>{req.period} từ {req.fromDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>Nộp: {req.submitted}</span>
                    </div>
                  </div>
                  {req.note && (
                    <div className="flex items-start gap-1.5 mt-2 px-3 py-2 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <MessageSquare size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.75rem", color: "#64748B", fontStyle: "italic" }}>"{req.note}"</span>
                    </div>
                  )}
                </div>
                {!isRejecting && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setRejectingId(req.id)}
                      disabled={isApprovingThis}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition disabled:opacity-50"
                      style={{ background: "#FFF1F2", border: "1.5px solid #FECDD3", color: "#DC2626", fontSize: "0.78rem", fontWeight: 700 }}>
                      <X size={13} /> Từ chối
                    </button>
                    <button onClick={() => approve(req.id)}
                      disabled={isApprovingThis}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition text-white disabled:opacity-60"
                      style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.78rem", fontWeight: 700, boxShadow: `0 2px 10px ${A}40` }}>
                      {isApprovingThis
                        ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Đang xử lý...</>
                        : <><Check size={13} /> Đồng ý cho thuê</>
                      }
                    </button>
                  </div>
                )}
              </div>

              {isRejecting && (
                <div className="px-4 pb-4 pt-0">
                  <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #FECACA", background: "#FFFBFB" }}>
                    <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA" }}>
                      <AlertTriangle size={13} style={{ color: "#EF4444" }} />
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#DC2626" }}>Lý do từ chối *</span>
                    </div>
                    <div className="p-3">
                      <textarea
                        value={rejectText} onChange={e => setRejectText(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                        rows={3}
                        className="w-full rounded-lg resize-none outline-none p-3"
                        style={{ border: "1.5px solid #E2E8F0", fontSize: "0.82rem" }}
                      />
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={() => { setRejectingId(null); setRejectText(""); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm">Hủy</button>
                        <button onClick={() => confirmReject(req.id)}
                          disabled={!rejectText.trim()}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50">Xác nhận</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section B: Deposit Confirmations ──────────────────────────────────────
function DepositSection({ customers }: { customers: Map<string, Customer> }) {
  const {
    items: rawItems,
    loading,
    reload,
    page,
    setPage,
    totalPages,
    totalElements,
    size,
    setSize,
  } = usePagedList<Transaction>(getTransactions, 10, {
    loaiGiaoDich: "Thu tien coc",
    trangThai: "Cho xu ly",
  });

  const confirm = async (id: string) => {
    try {
      await updateTransaction(id, { trangThai: "Thanh cong" });
      reload();
    } catch (err) {
      console.error(err);
    }
  };

  const items = useMemo<DepositReq[]>(() => {
    return rawItems.map(t => {
      // maChungTu là mã yêu cầu hoặc mã hợp đồng — dùng để tìm khách hàng
      const maChungTu = t.maChungTu ?? "";
      // Tìm khách hàng qua keToanLapPhieu hoặc quanLyDoiChung nếu có
      // Hiển thị thông tin thực từ transaction
      const tenantName = t.keToanLapPhieu
        ? `Phiếu bởi: ${t.keToanLapPhieu}`
        : `Mã CT: ${maChungTu || t.maPhieuThanhToan}`;
      return {
        id: t.maPhieuThanhToan,
        tenant: maChungTu || t.maPhieuThanhToan,
        avatar: (maChungTu || "P").slice(0, 2).toUpperCase(),
        room: t.ghiChu ? t.ghiChu.slice(0, 40) : "—",
        amount: t.soTienGiaoDich ?? 0,
        accountant: t.keToanLapPhieu ?? "—",
        date: t.ngayGiaoDich ?? "—",
        method: t.hinhThucThanhToan ?? "—",
        ref: t.maPhieuThanhToan,
        status: "pending",
      };
    });
  }, [rawItems, customers]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-slate-900" style={{ fontWeight: 800, fontSize: "1rem" }}>Xác nhận đặt cọc</div>
          <div className="text-slate-500 mt-0.5" style={{ fontSize: "0.78rem" }}>
            Kế toán đã ghi nhận – Manager xác nhận đã nhận cọc thực tế
          </div>
        </div>
      </div>

      <div className="mt-4 mb-4">
        <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} />
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Mã phiếu", "Mã chứng từ", "Số tiền cọc", "Kế toán lập", "Hình thức", "Ngày GD", "Ghi chú", "Hành động"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-extrabold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((dep) => (
              <tr key={dep.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{dep.id}</td>
                <td className="px-4 py-3 font-semibold text-sm text-slate-800">{dep.tenant}</td>
                <td className="px-4 py-3 font-bold text-emerald-700">
                  {dep.amount > 0 ? dep.amount.toLocaleString("vi-VN") + " đ" : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{dep.accountant}</td>
                <td className="px-4 py-3 text-[0.7rem] font-bold uppercase text-slate-600">{dep.method}</td>
                <td className="px-4 py-3 text-[0.7rem] text-slate-500">{dep.date}</td>
                <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate" title={dep.room}>{dep.room}</td>
                <td className="px-4 py-3">
                  <button onClick={() => confirm(dep.id)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[0.75rem] font-bold hover:bg-emerald-700 transition">
                    Xác nhận
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-400">Không có cọc chờ xác nhận</div>
        )}
        {loading && <div className="py-8 text-center italic text-slate-500">Đang tải...</div>}
      </div>
    </div>
  );
}

// ── Section C: Residency Condition Checks ─────────────────────────────────
function ConditionSection({ customers }: { customers: Map<string, Customer> }) {
  const {
    items: rawItems,
    loading,
    reload,
    page,
    setPage,
    totalPages,
    totalElements,
    size,
    setSize,
  } = usePagedList<Request>(getRequests, 10, {
    trangThaiYeuCau: "Yêu cầu mới",
  });

  const [checkingId, setCheckingId] = useState<string | null>(null);

  const getRules = (c: ConditionReq) => [
    {
      label: "Giới tính phù hợp",
      ok: c.gender === c.roomGender || c.roomGender === "—" || c.gender === "—",
      detail: c.gender !== "—" && c.roomGender !== "—"
        ? `Khách: ${c.gender} · Yêu cầu: ${c.roomGender}`
        : c.gender !== "—" ? `Khách: ${c.gender}` : "Chưa có thông tin giới tính",
    },
    {
      label: "Khu vực được duyệt",
      ok: c.areaOk,
      detail: c.areaOk ? c.room : "Chưa có khu vực",
    },
    {
      label: "Số lượng người hợp lệ",
      ok: c.groupOk,
      detail: c.groupOk ? "Đã khai báo số người" : "Chưa khai báo số người",
    },
    {
      label: "Xác minh CMND/CCCD",
      ok: c.idVerified,
      detail: c.idVerified ? "Đã có CCCD trong hệ thống" : "Chưa có CCCD",
    },
  ];

  const allPass = (c: ConditionReq) => (c.gender === c.roomGender || c.roomGender === "—") && c.areaOk && c.groupOk && c.idVerified;

  const items = useMemo<ConditionReq[]>(() => {
    return rawItems.map(r => {
      const customer = r.khachHangYeuCau ? customers.get(r.khachHangYeuCau) : null;
      const tenantName = customer?.hoTen ?? r.khachHangYeuCau ?? "Khách chưa rõ";
      // Kiểm tra điều kiện thực từ DB
      const gioiTinhYC = r.gioiTinhYeuCau ?? "";
      const gioiTinhKH = customer?.phai ?? "";
      // Giới tính phù hợp: nếu yêu cầu có giới tính thì phải khớp với khách
      const genderOk = !gioiTinhYC || !gioiTinhKH || gioiTinhYC === gioiTinhKH;
      // Khu vực: có khu vực là hợp lệ
      const areaOk = !!(r.khuVuc && r.khuVuc.trim());
      // Số lượng người: hợp lệ nếu > 0
      const groupOk = !!(r.soLuongNguoi && r.soLuongNguoi > 0);
      // CCCD đã xác minh
      const idVerified = !!(customer?.cccd && customer.cccd.trim());
      return {
        id: r.maYeuCau,
        tenant: tenantName,
        avatar: tenantName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase(),
        room: r.khuVuc ? `Khu vực: ${r.khuVuc}` : "Chưa xác định",
        gender: gioiTinhKH || "—",
        roomGender: gioiTinhYC || "—",
        areaOk,
        groupOk,
        idVerified,
        status: "pending",
      };
    });
  }, [rawItems, customers]);

  const submitCheck = async (id: string) => {
    try {
      await updateRequest(id, { trangThaiYeuCau: "Đã lên lịch xem" });
      reload();
      setCheckingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <div className="text-slate-900 font-extrabold text-base">Kiểm tra điều kiện cư trú</div>
        <div className="text-slate-500 text-xs mt-0.5">Xác minh điều kiện trước khi lên lịch xem phòng</div>
      </div>

      <div className="mt-4 mb-4">
        <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} />
      </div>

      {loading && <div className="py-4 text-center italic text-slate-500">Đang tải...</div>}

      <div className="space-y-3 mt-4">
        {items.map(c => {
          const rules = getRules(c);
          const passes = rules.filter(r => r.ok).length;
          const isOpen = checkingId === c.id;
          const passAll = allPass(c);

          return (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <Avatar initials={c.avatar} gradient={passAll ? "linear-gradient(135deg,#059669,#0891B2)" : "linear-gradient(135deg,#D97706,#DC2626)"} />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{c.tenant}</div>
                  <div className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-tight">Mã: {c.id}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black" style={{ color: passes === 4 ? "#059669" : "#D97706" }}>{passes}/4</div>
                </div>
                <button onClick={() => setCheckingId(isOpen ? null : c.id)} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-bold text-xs">
                  {isOpen ? "Đóng" : "Kiểm tra"}
                </button>
              </div>

              {isOpen && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {rules.map(r => (
                      <div key={r.label} className={`p-2 rounded-xl border ${r.ok ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                        <div className="text-[0.7rem] font-bold">{r.label}</div>
                        <div className={`text-[0.65rem] ${r.ok ? "text-emerald-700" : "text-red-700"}`}>{r.detail}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => submitCheck(c.id)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                      {passAll ? "Xác nhận & Chuyển bước" : "Ghi chú & Tiếp tục"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ApprovalHub() {
  const [tab, setTab] = useState<"rentals" | "deposits" | "conditions">("rentals");

  const { items: customersList } = usePagedList<Customer>(getCustomers, 1000);
  const customerMap = useMemo(() => new Map(customersList.map(c => [c.maKhachHang, c])), [customersList]);

  const tabs = [
    { id: "rentals",    label: "Duyệt thuê",  icon: FileText,    color: A },
    { id: "deposits",   label: "Xác nhận cọc", icon: DollarSign,  color: "#059669" },
    { id: "conditions", label: "Kiểm tra",     icon: ShieldCheck, color: "#D97706" },
  ] as const;

  return (
    <div className="pb-20">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trung tâm Phê duyệt</h1>
          <p className="text-slate-500 text-sm mt-1">Hệ thống quản lý phê duyệt và kiểm soát hồ sơ tập trung</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-2xl transition-all border ${tab === t.id ? "bg-white border-slate-200 shadow-md" : "bg-slate-50 border-transparent text-slate-400"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tab === t.id ? "" : "grayscale opacity-50"}`} style={{ background: `${t.color}15` }}>
              <t.icon size={20} style={{ color: t.color }} />
            </div>
            <div className="text-left">
              <div className={`text-xs font-bold uppercase tracking-widest ${tab === t.id ? "text-slate-900" : "text-slate-400"}`}>{t.label}</div>
              <div className="text-[0.65rem] font-medium">Hồ sơ chờ</div>
            </div>
          </button>
        ))}
      </div>

      {tab === "rentals" && <RentalSection customers={customerMap} />}
      {tab === "deposits" && <DepositSection customers={customerMap} />}
      {tab === "conditions" && <ConditionSection customers={customerMap} />}
    </div>
  );
}
