package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ContractDetailResponse;
import com.homestay.dorm.entity.HopDongThue;

public interface ContractService {
    ApiListResponse<HopDongThue> getContracts(int page, int size);
    HopDongThue getContractById(String maHopDongThue);
    ContractDetailResponse getContractDetails(String maHopDongThue);
    java.util.Map<String, Long> getContractStats();
    java.util.List<java.util.Map<String, Object>> getOperationalContracts(int page, int size);
    java.util.List<java.util.Map<String, Object>> getSettlementContracts(String trangThai);
    HopDongThue updateSettlementStatus(String maHopDongThue, String trangThai);
    String seedSettlementStatus();
    HopDongThue createContract(CreateContractRequest request);
    HopDongThue updateContract(String maHopDongThue, UpdateContractRequest request);
    void deleteContract(String maHopDongThue);
}
