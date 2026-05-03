// ─── Types ──────────────────────────────────────────────────────────────────

export type TxCategory = "Deposit" | "Monthly Rent" | "Move-in Fee" | "Check-out Settlement" | "Deposit Refund";
export type TxStatus = "Confirmed" | "Pending" | "Overdue";
export type InvoiceStatus = "Not Sent" | "Sent" | "Paid" | "Overdue";
export type RefundScenario = "Cancelled" | "Short Stay" | "Long Stay" | "Expired";

export interface AccTransaction {
  id: string;
  type: "Income" | "Expense";
  category: TxCategory;
  description: string;
  residentName: string;
  roomId: string;
  amount: number;
  createdAt: string; // ISO datetime
  dueAt?: string;
  status: TxStatus;
  receiptFile?: string;
  note?: string;
}

export interface Invoice {
  id: string;
  residentName: string;
  roomId: string;
  period: string; // "Tháng 4/2025"
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  sentAt?: string;
  paidAt?: string;
  contractId: string;
}

export interface OverduePayment {
  id: string;
  residentName: string;
  roomId: string;
  amount: number;
  daysOverdue: number;
  lastReminderSent?: string;
}

export interface PendingRefund {
  id: string;
  residentName: string;
  roomId: string;
  checkoutDate: string;
  depositAmount: number;
  refundAmount: number;
  status: "Calculating" | "Ready" | "Processing";
}

export interface ReconciliationResident {
  id: string;
  name: string;
  roomId: string;
  contractStart: string;
  contractEnd: string;
  depositAmount: number;
  scenario: RefundScenario;
  unpaidRent: number;
  electricity: number;
  water: number;
  damageFee: number;
  violationFine: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

// Simulated timestamps: "2025-04-20TXX:XX" = today, "2025-04-19" = yesterday, etc.
export const accTransactions: AccTransaction[] = [
  {
    id: "TX001", type: "Income", category: "Monthly Rent",
    description: "Tiền thuê tháng 4/2025 – Phòng A101",
    residentName: "Nguyễn Văn An", roomId: "A101",
    amount: 3500000, createdAt: "2025-04-20T08:30:00", dueAt: "2025-04-20",
    status: "Confirmed", receiptFile: "receipt_A101_T4.pdf",
  },
  {
    id: "TX002", type: "Income", category: "Monthly Rent",
    description: "Tiền thuê tháng 4/2025 – Phòng A102",
    residentName: "Trần Thị Bình", roomId: "A102",
    amount: 4500000, createdAt: "2025-04-19T09:15:00", dueAt: "2025-04-20",
    status: "Pending", note: "Khách hẹn thanh toán chiều 20/4",
  },
  {
    id: "TX003", type: "Income", category: "Deposit",
    description: "Tiền đặt cọc – Hồ Ngọc Hà (từ Sales)",
    residentName: "Hồ Ngọc Hà", roomId: "A201",
    amount: 7600000, createdAt: "2025-04-18T14:00:00", dueAt: "2025-04-19",
    status: "Overdue", note: "Chuyển khoản chưa khớp số tài khoản",
  },
  {
    id: "TX004", type: "Income", category: "Monthly Rent",
    description: "Tiền thuê tháng 4/2025 – Phòng B101",
    residentName: "Đinh Thị Nam", roomId: "B101",
    amount: 3200000, createdAt: "2025-04-20T10:00:00",
    status: "Confirmed", receiptFile: "receipt_B101_T4.pdf",
  },
  {
    id: "TX005", type: "Income", category: "Move-in Fee",
    description: "Phí nhận phòng – Bùi Thị Lan",
    residentName: "Bùi Thị Lan", roomId: "A402",
    amount: 500000, createdAt: "2025-04-20T11:00:00",
    status: "Pending",
  },
  {
    id: "TX006", type: "Income", category: "Check-out Settlement",
    description: "Thanh lý hợp đồng – Tô Thị Oanh",
    residentName: "Tô Thị Oanh", roomId: "A102",
    amount: 1200000, createdAt: "2025-04-19T15:30:00", dueAt: "2025-04-20",
    status: "Pending",
  },
  {
    id: "TX007", type: "Income", category: "Monthly Rent",
    description: "Tiền thuê tháng 4/2025 – Phòng B302",
    residentName: "Phạm Ngọc Dung", roomId: "B302",
    amount: 4600000, createdAt: "2025-04-17T08:00:00",
    status: "Confirmed", receiptFile: "receipt_B302_T4.pdf",
  },
  {
    id: "TX008", type: "Income", category: "Deposit",
    description: "Tiền đặt cọc – Đinh Công Thành (từ Sales)",
    residentName: "Đinh Công Thành", roomId: "B301",
    amount: 7200000, createdAt: "2025-04-18T09:00:00", dueAt: "2025-04-19",
    status: "Overdue",
  },
  {
    id: "TX009", type: "Expense", category: "Deposit Refund",
    description: "Hoàn cọc – Vũ Thanh Hà (check-out 15/4)",
    residentName: "Vũ Thanh Hà", roomId: "A301",
    amount: 6840000, createdAt: "2025-04-20T09:00:00",
    status: "Pending",
  },
  {
    id: "TX010", type: "Expense", category: "Deposit Refund",
    description: "Hoàn cọc – Lê Hoàng Cường (check-out 10/4)",
    residentName: "Lê Hoàng Cường", roomId: "A104",
    amount: 9350000, createdAt: "2025-04-15T14:00:00",
    status: "Confirmed", receiptFile: "refund_A104.pdf",
  },
];

export const invoices: Invoice[] = [
  { id: "INV001", residentName: "Nguyễn Văn An", roomId: "A101", period: "Tháng 4/2025", amount: 3500000, dueDate: "2025-04-20", status: "Paid", sentAt: "2025-04-01", paidAt: "2025-04-05", contractId: "CT001" },
  { id: "INV002", residentName: "Trần Thị Bình", roomId: "A102", period: "Tháng 4/2025", amount: 4500000, dueDate: "2025-04-20", status: "Sent", sentAt: "2025-04-01", contractId: "CT002" },
  { id: "INV003", residentName: "Lê Hoàng Cường", roomId: "A104", period: "Tháng 4/2025", amount: 5500000, dueDate: "2025-04-15", status: "Overdue", sentAt: "2025-04-01", contractId: "CT003" },
  { id: "INV004", residentName: "Phạm Ngọc Dung", roomId: "A202", period: "Tháng 4/2025", amount: 4800000, dueDate: "2025-04-20", status: "Paid", sentAt: "2025-04-01", paidAt: "2025-04-06", contractId: "CT004" },
  { id: "INV005", residentName: "Hoàng Minh Đức", roomId: "A203", period: "Tháng 4/2025", amount: 3800000, dueDate: "2025-04-20", status: "Paid", sentAt: "2025-04-01", paidAt: "2025-04-07", contractId: "CT005" },
  { id: "INV006", residentName: "Vũ Thanh Hà", roomId: "A301", period: "Tháng 4/2025", amount: 3800000, dueDate: "2025-04-20", status: "Sent", sentAt: "2025-04-01", contractId: "CT006" },
  { id: "INV007", residentName: "Đặng Văn Hùng", roomId: "A304", period: "Tháng 4/2025", amount: 5800000, dueDate: "2025-04-10", status: "Overdue", sentAt: "2025-04-01", contractId: "CT007" },
  { id: "INV008", residentName: "Bùi Thị Lan", roomId: "A402", period: "Tháng 4/2025", amount: 4000000, dueDate: "2025-04-20", status: "Not Sent", contractId: "CT008" },
  { id: "INV009", residentName: "Ngô Quốc Minh", roomId: "A404", period: "Tháng 4/2025", amount: 5000000, dueDate: "2025-04-20", status: "Sent", sentAt: "2025-04-01", contractId: "CT009" },
  { id: "INV010", residentName: "Đinh Thị Nam", roomId: "B101", period: "Tháng 4/2025", amount: 3200000, dueDate: "2025-04-20", status: "Paid", sentAt: "2025-04-01", paidAt: "2025-04-08", contractId: "CT010" },
  { id: "INV011", residentName: "Trần Thị Bình", roomId: "B202", period: "Tháng 4/2025", amount: 4400000, dueDate: "2025-04-20", status: "Not Sent", contractId: "CT012" },
  { id: "INV012", residentName: "Phạm Ngọc Dung", roomId: "B302", period: "Tháng 4/2025", amount: 4600000, dueDate: "2025-04-20", status: "Paid", sentAt: "2025-04-01", paidAt: "2025-04-08", contractId: "CT014" },
];

export const overduePayments: OverduePayment[] = [
  { id: "OD001", residentName: "Lê Hoàng Cường", roomId: "A104", amount: 5500000, daysOverdue: 5, lastReminderSent: "2025-04-17" },
  { id: "OD002", residentName: "Đặng Văn Hùng", roomId: "A304", amount: 5800000, daysOverdue: 10 },
  { id: "OD003", residentName: "Trần Thị Bình", roomId: "A102", amount: 4500000, daysOverdue: 1 },
  { id: "OD004", residentName: "Ngô Quốc Minh", roomId: "A404", amount: 5000000, daysOverdue: 3, lastReminderSent: "2025-04-19" },
];

export const pendingRefunds: PendingRefund[] = [
  { id: "RF001", residentName: "Vũ Thanh Hà", roomId: "A301", checkoutDate: "2025-04-15", depositAmount: 7600000, refundAmount: 6840000, status: "Ready" },
  { id: "RF002", residentName: "Tô Thị Oanh", roomId: "A102", checkoutDate: "2025-04-20", depositAmount: 9000000, refundAmount: 0, status: "Calculating" },
  { id: "RF003", residentName: "Lê Hoàng Cường", roomId: "A104", checkoutDate: "2025-04-10", depositAmount: 11000000, refundAmount: 9350000, status: "Processing" },
];

export const reconciliationResidents: ReconciliationResident[] = [
  {
    id: "RES001", name: "Tô Thị Oanh", roomId: "A102",
    contractStart: "2024-04-01", contractEnd: "2025-04-20",
    depositAmount: 9000000, scenario: "Expired",
    unpaidRent: 0, electricity: 320000, water: 85000,
    damageFee: 500000, violationFine: 0,
  },
  {
    id: "RES002", name: "Vũ Thanh Hà", roomId: "A301",
    contractStart: "2024-05-01", contractEnd: "2025-04-15",
    depositAmount: 7600000, scenario: "Long Stay",
    unpaidRent: 0, electricity: 180000, water: 60000,
    damageFee: 0, violationFine: 200000,
  },
  {
    id: "RES003", name: "Lê Hoàng Cường", roomId: "A104",
    contractStart: "2024-06-01", contractEnd: "2025-04-10",
    depositAmount: 11000000, scenario: "Short Stay",
    unpaidRent: 5500000, electricity: 220000, water: 75000,
    damageFee: 1200000, violationFine: 0,
  },
  {
    id: "RES004", name: "Đinh Công Thành", roomId: "B301",
    contractStart: "2025-04-01", contractEnd: "2025-04-20",
    depositAmount: 7200000, scenario: "Cancelled",
    unpaidRent: 0, electricity: 0, water: 0,
    damageFee: 0, violationFine: 0,
  },
];

export const refundScaleMap: Record<RefundScenario, { label: string; pct: number; description: string; color: string }> = {
  Cancelled:   { label: "Huỷ / Chưa ký HĐ",           pct: 80, description: "Hoàn 80% tiền cọc",  color: "text-red-600" },
  "Short Stay": { label: "Đã ký & ở < 6 tháng",         pct: 50, description: "Hoàn 50% tiền cọc",  color: "text-amber-600" },
  "Long Stay":  { label: "Đã ký & ở ≥ 6 tháng",         pct: 70, description: "Hoàn 70% tiền cọc",  color: "text-blue-600" },
  Expired:     { label: "Hết hạn HĐ (đúng kỳ)",        pct: 100, description: "Hoàn 100% tiền cọc", color: "text-emerald-600" },
};
