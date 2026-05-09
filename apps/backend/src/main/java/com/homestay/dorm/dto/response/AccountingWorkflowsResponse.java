package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountingWorkflowsResponse {
    private Summary summary;
    private List<DepositQueueItem> depositQueue;
    private List<MoveInPaymentItem> moveInPayments;
    private List<ReconciliationItem> reconciliationQueue;
    private List<CheckoutItem> checkoutQueue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private long pendingDepositRequests;
        private long pendingMoveInPayments;
        private long pendingReconciliations;
        private long pendingCheckoutSettlements;
        private BigDecimal expectedDepositAmount;
        private BigDecimal expectedMoveInAmount;
        private BigDecimal expectedRefundAmount;
        private BigDecimal expectedCollectionAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepositQueueItem {
        private String requestId;
        private String customerId;
        private String customerName;
        private String staffId;
        private String area;
        private String requestStatus;
        private Integer bedCount;
        private BigDecimal monthlyRent;
        private BigDecimal depositAmount;
        private String requestedStartDate;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoveInPaymentItem {
        private String contractId;
        private String customerId;
        private String customerName;
        private String rentType;
        private Integer memberCount;
        private BigDecimal monthlyRent;
        private BigDecimal moveInAmount;
        private String contractDate;
        private String paymentCycle;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationItem {
        private String contractId;
        private String customerId;
        private String customerName;
        private String roomRef;
        private BigDecimal depositAmount;
        private BigDecimal refundRate;
        private BigDecimal refundableAmount;
        private BigDecimal totalDeduction;
        private BigDecimal finalBalance;
        private String scenario;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutItem {
        private String checkoutId;
        private String customerId;
        private String customerName;
        private String roomRef;
        private BigDecimal depositAmount;
        private BigDecimal finalBalance;
        private String status;
        private String moveOutDate;
        private String note;
    }
}