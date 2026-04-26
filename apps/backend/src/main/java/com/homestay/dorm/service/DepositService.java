package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateDepositRequest;
import com.homestay.dorm.dto.request.UpdateDepositRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HoSoDatCoc;

public interface DepositService {
    ApiListResponse<HoSoDatCoc> getDeposits(int page, int size);
    HoSoDatCoc getDepositById(String maHoSoDatCoc);
    HoSoDatCoc createDeposit(CreateDepositRequest request);
    HoSoDatCoc updateDeposit(String maHoSoDatCoc, UpdateDepositRequest request);
    void deleteDeposit(String maHoSoDatCoc);
}
