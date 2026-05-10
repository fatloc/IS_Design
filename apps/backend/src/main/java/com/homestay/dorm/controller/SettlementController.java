package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateReconciliationRequest;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.BangDoiSoat;
import com.homestay.dorm.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('KETOAN', 'MANAGER')")
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping("/reconcile")
    public ApiResponse<BangDoiSoat> reconcile(@RequestBody CreateReconciliationRequest request) {
        return ApiResponse.ok(settlementService.reconcile(request));
    }

    @GetMapping("/pending")
    public ApiResponse<List<BangDoiSoat>> getPending() {
        return ApiResponse.ok(settlementService.getPendingPayments());
    }

    @PostMapping("/{id}/pay")
    public ApiResponse<Void> processPayment(@PathVariable String id, @RequestParam String action) {
        settlementService.processPayment(id, action);
        return ApiResponse.ok(null);
    }
}
