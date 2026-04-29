package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateTransactionRequest;
import com.homestay.dorm.dto.request.UpdateTransactionRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.PhieuThanhToan;

public interface TransactionService {
    ApiListResponse<PhieuThanhToan> getTransactions(int page, int size, String loaiGiaoDich, String trangThai);
    PhieuThanhToan getTransactionById(String maPhieuThanhToan);
    PhieuThanhToan createTransaction(CreateTransactionRequest request);
    PhieuThanhToan updateTransaction(String maPhieuThanhToan, UpdateTransactionRequest request);
    void deleteTransaction(String maPhieuThanhToan);
}
