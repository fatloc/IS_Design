import { money } from "./accounting";
import * as api from "./api";

const KEY_REQ = "acct_v2_requests";
const KEY_CON = "acct_v2_contracts";
const KEY_RECON = "acct_v2_reconciliations";

function seed() {
  if (!localStorage.getItem(KEY_REQ)) {
    const reqs = [
      { id: "REQ-001", client: "Nguyễn Văn A", room: "R-101/B1", sales: "Sale1", date: "2026-05-01", rent: 5000000, deposit: 10000000, fees: 500000, status: "Pending Accounting Review" },
      { id: "REQ-002", client: "Trần Thị B", room: "R-201/B2", sales: "Sale2", date: "2026-05-03", rent: 4500000, deposit: 9000000, fees: 300000, status: "Pending Accounting Review" },
    ];
    localStorage.setItem(KEY_REQ, JSON.stringify(reqs));
  }

  if (!localStorage.getItem(KEY_CON)) {
    const cons = [
      { id: "CON-1001", client: "Nguyễn Văn A", room: "R-101/B1", dueDate: "2026-05-10", type: "Initial", amount: 15500000, status: "Awaiting Accounting Setup" },
      { id: "CON-1002", client: "Trần Thị B", room: "R-201/B2", dueDate: "2026-05-15", type: "Monthly", amount: 4800000, status: "Awaiting Accounting Setup" },
    ];
    localStorage.setItem(KEY_CON, JSON.stringify(cons));
  }

  if (!localStorage.getItem(KEY_RECON)) {
    const recon = [
      { id: "REC-9001", client: "Lê Văn C", room: "R-301/B3", moveOut: "2026-04-30", deposit: 10000000, submitted: "2026-05-02", status: "Awaiting Accounting Reconciliation", note: "Vỡ kính nhỏ" },
    ];
    localStorage.setItem(KEY_RECON, JSON.stringify(recon));
  }
}

seed();

export async function getRentalRequests() {
  try {
    // Gọi song song cho từng trạng thái kế toán cần xử lý
    const statuses = ["Yêu cầu mới", "Chờ phê duyệt", "Đã phê duyệt", "Đã xác nhận"];
    const results = await Promise.all(
      statuses.map(s => api.getRequests({ size: 5000, page: 0, trangThaiYeuCau: s }))
    );

    // Gộp tất cả kết quả
    const allData = results.flatMap(res => res.data || []);

    // map to local shape
    return allData.map((r: any) => ({ 
      id: r.maYeuCau, 
      client: r.khachHangYeuCau ?? "", 
      room: r.maPhongDeXuat ?? "-", 
      sales: r.nhanVienPhuTrach ?? "", 
      date: r.thoiGianBatDauThueDuKien ?? "", 
      rent: r.mucGiaMongMuon ?? 0, 
      deposit: 0, 
      fees: 0, 
      status: r.trangThaiYeuCau ?? "" 
    }));
  } catch (err) {
    const raw = localStorage.getItem(KEY_REQ) || "[]";
    return JSON.parse(raw);
  }
}

export async function confirmGeneratePaymentRequest(id: string, finalAmount: number) {
  try {
    // try creating deposit or transaction via real API
    await api.createDeposit({ mucTienCoc: String(finalAmount) } as any);
  } catch (err) {
    console.warn("Lỗi khi tạo Deposit (có thể do thiếu field API):", err);
  }
  // Kế toán xác nhận & phát phiếu → chuyển sang Chờ phê duyệt (manager duyệt)
  await api.updateRequest(id, { trangThaiYeuCau: "Chờ phê duyệt", mucGiaMongMuon: finalAmount } as any);
  return true;
}

export async function confirmCollection(id: string) {
  // Kế toán thu tiền xong (ngoài hệ thống) → chuyển sang Đã xác nhận
  await api.updateRequest(id, { trangThaiYeuCau: "Đã xác nhận" } as any);
  return true;
}

export async function getContractsForOperationalPayments() {
  try {
    const res = await api.getContracts();
    return res.data || [];
  } catch (err) {
    const raw = localStorage.getItem(KEY_CON) || "[]";
    return JSON.parse(raw);
  }
}

export async function confirmPaymentSetup(id: string, items: any[]) {
  // attach items to contract via updateContract
  await api.updateContract(id, { items } as any);
  return true;
}

export async function markContractPaid(id: string) {
  await api.updateContract(id, { status: "Paid" } as any);
  return true;
}

export async function getReconciliationSubmissions() {
  try {
    const ops = await api.getOperations();
    return ops.checkouts.map((c: any) => ({ id: c.id || c.room, client: c.tenant, room: c.room, moveOut: c.moveOut, deposit: c.deposit, submitted: new Date().toISOString().split("T")[0], status: "Awaiting Accounting Reconciliation", note: "" }));
  } catch (err) {
    const raw = localStorage.getItem(KEY_RECON) || "[]";
    return JSON.parse(raw);
  }
}

export async function confirmReconciliation(id: string, ratePercent: number, deductions: number) {
  const response = await api.default.post("/settlements/reconcile", { 
    contractId: id, 
    ratePercent, 
    deductions 
  });
  return { net: response.data.data.soTienThucTe };
}

export async function getCreatedSettlements() {
  try {
    const response = await api.default.get("/settlements/pending");
    return (response.data.data || []).map((s: any) => ({
      id: s.maBangDoiSoat,
      client: "Khách hàng " + s.maHopDongThue,
      room: "HĐ " + s.maHopDongThue,
      net: s.soTienThucTe,
      created: s.ngayLap,
      status: s.trangThai
    }));
  } catch (err) {
    const raw = localStorage.getItem("acct_v2_settlements") || "[]";
    return JSON.parse(raw);
  }
}

export async function handleSettlementPayment(id: string, action: "collect" | "refund") {
  await api.default.post(`/settlements/${id}/pay?action=${action}`);
  return true;
}

export { money };
