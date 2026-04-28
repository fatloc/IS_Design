package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HopDongThue;

public interface ContractService {
    ApiListResponse<HopDongThue> getContracts(int page, int size);
    HopDongThue getContractById(String maHopDongThue);
    HopDongThue createContract(CreateContractRequest request);
    HopDongThue updateContract(String maHopDongThue, UpdateContractRequest request);
    void deleteContract(String maHopDongThue);
}
