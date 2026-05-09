package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateReconciliationRequest;
import com.homestay.dorm.entity.BangDoiSoat;
import java.util.List;

public interface SettlementService {
    BangDoiSoat reconcile(CreateReconciliationRequest request);
    List<BangDoiSoat> getPendingPayments();
    void processPayment(String settlementId, String action);
}
