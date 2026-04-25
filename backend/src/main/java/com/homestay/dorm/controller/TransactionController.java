package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateTransactionRequest;
import com.homestay.dorm.dto.request.UpdateTransactionRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.PhieuThanhToan;
import com.homestay.dorm.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ApiListResponse<PhieuThanhToan> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return transactionService.getTransactions(page, size);
    }

    @GetMapping("/{maPhieuThanhToan}")
    public ApiResponse<PhieuThanhToan> getTransactionById(@PathVariable String maPhieuThanhToan) {
        return ApiResponse.ok(transactionService.getTransactionById(maPhieuThanhToan));
    }

    @PostMapping
    public ApiResponse<PhieuThanhToan> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        return ApiResponse.ok(transactionService.createTransaction(request));
    }

    @PutMapping("/{maPhieuThanhToan}")
    public ApiResponse<PhieuThanhToan> updateTransaction(
            @PathVariable String maPhieuThanhToan,
            @Valid @RequestBody UpdateTransactionRequest request) {
        return ApiResponse.ok(transactionService.updateTransaction(maPhieuThanhToan, request));
    }

    @DeleteMapping("/{maPhieuThanhToan}")
    public ApiResponse<Void> deleteTransaction(@PathVariable String maPhieuThanhToan) {
        transactionService.deleteTransaction(maPhieuThanhToan);
        return ApiResponse.ok(null);
    }
}
