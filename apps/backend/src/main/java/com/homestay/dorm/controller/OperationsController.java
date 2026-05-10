package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CheckoutRequest;
import com.homestay.dorm.dto.request.HandoverRequest;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.OperationsResponse;
import com.homestay.dorm.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;

    @GetMapping
    public ApiResponse<OperationsResponse> getOperations() {
        return ApiResponse.ok(operationsService.getOperations());
    }

    @PostMapping("/handover")
    public ApiResponse<Void> confirmHandover(@RequestBody HandoverRequest request) {
        operationsService.confirmHandover(request);
        return ApiResponse.ok(null);
    }

    @PostMapping("/checkout")
    public ApiResponse<Void> confirmCheckout(@RequestBody CheckoutRequest request) {
        operationsService.confirmCheckout(request);
        return ApiResponse.ok(null);
    }

    @PostMapping("/finish-checkout/{id}")
    public ApiResponse<Void> finishCheckout(@PathVariable String id) {
        operationsService.finishCheckout(id);
        return ApiResponse.ok(null);
    }
}