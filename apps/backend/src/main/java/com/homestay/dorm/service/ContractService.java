package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.dto.response.DoiSoatResponse;
import java.math.BigDecimal;

public interface ContractService {
    ApiListResponse<HopDongThue> getContracts(int page, int size, String search, String loaiVanBan, String kyThanhToan);
    HopDongThue getContractById(String maHopDongThue);
    java.util.List<java.util.Map<String, Object>> getOperationalContracts(int page, int size);
    java.util.List<java.util.Map<String, Object>> getSettlementContracts(String trangThai);
    HopDongThue updateSettlementStatus(String maHopDongThue, String trangThai);
    String seedSettlementStatus();
    HopDongThue createContract(CreateContractRequest request);
    HopDongThue updateContract(String maHopDongThue, UpdateContractRequest request);
    void deleteContract(String maHopDongThue);

    BigDecimal tinhTienThueKyDau(String maHopDongThue);
    DoiSoatResponse doiSoatChiPhi(String maHopDongThue, BigDecimal tongTienKhauTru, boolean laHetHanHopDong);
    void thanhLyHopDong(String maHopDongThue);
    java.util.Map<String, Long> getContractStats();
}
