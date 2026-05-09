import api, { type ApiResponse } from "./api";

export type AccountingSummary = {
  pendingDepositRequests: number;
  pendingMoveInPayments: number;
  pendingReconciliations: number;
  pendingCheckoutSettlements: number;
  expectedDepositAmount: number;
  expectedMoveInAmount: number;
  expectedRefundAmount: number;
  expectedCollectionAmount: number;
};

export type DepositQueueItem = {
  requestId: string;
  customerId: string | null;
  customerName: string;
  staffId: string | null;
  area: string | null;
  requestStatus: string | null;
  bedCount: number;
  monthlyRent: number;
  depositAmount: number;
  requestedStartDate: string | null;
  note: string | null;
};

export type MoveInPaymentItem = {
  contractId: string;
  customerId: string | null;
  customerName: string;
  rentType: string | null;
  memberCount: number;
  monthlyRent: number;
  moveInAmount: number;
  contractDate: string | null;
  paymentCycle: string | null;
  note: string | null;
};

export type ReconciliationItem = {
  contractId: string;
  customerId: string | null;
  customerName: string;
  roomRef: string | null;
  depositAmount: number;
  refundRate: number;
  refundableAmount: number;
  totalDeduction: number;
  finalBalance: number;
  scenario: string;
  note: string | null;
};

export type CheckoutItem = {
  checkoutId: string;
  customerId: string | null;
  customerName: string;
  roomRef: string | null;
  depositAmount: number;
  finalBalance: number;
  status: string | null;
  moveOutDate: string | null;
  note: string | null;
};

export type AccountingWorkflows = {
  summary: AccountingSummary;
  depositQueue: DepositQueueItem[];
  moveInPayments: MoveInPaymentItem[];
  reconciliationQueue: ReconciliationItem[];
  checkoutQueue: CheckoutItem[];
};

export async function getAccountingWorkflows() {
  const response = await api.get<ApiResponse<AccountingWorkflows>>("/accounting/workflows");
  return response.data.data;
}

export const money = (value: number | null | undefined) => `${Math.round(value ?? 0).toLocaleString("vi-VN")} đ`;