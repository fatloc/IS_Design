package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateDepositRequest;
import com.homestay.dorm.dto.request.UpdateDepositRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.HoSoDatCoc;
import com.homestay.dorm.service.DepositService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final DepositService depositService;

    @GetMapping
    public ApiListResponse<HoSoDatCoc> getDeposits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return depositService.getDeposits(page, size);
    }

    @GetMapping("/{maHoSoDatCoc}")
    public ApiResponse<HoSoDatCoc> getDepositById(@PathVariable String maHoSoDatCoc) {
        return ApiResponse.ok(depositService.getDepositById(maHoSoDatCoc));
    }

    @PostMapping
    public ApiResponse<HoSoDatCoc> createDeposit(@Valid @RequestBody CreateDepositRequest request) {
        return ApiResponse.ok(depositService.createDeposit(request));
    }

    @PutMapping("/{maHoSoDatCoc}")
    public ApiResponse<HoSoDatCoc> updateDeposit(
            @PathVariable String maHoSoDatCoc,
            @Valid @RequestBody UpdateDepositRequest request) {
        return ApiResponse.ok(depositService.updateDeposit(maHoSoDatCoc, request));
    }

    @DeleteMapping("/{maHoSoDatCoc}")
    public ApiResponse<Void> deleteDeposit(@PathVariable String maHoSoDatCoc) {
        depositService.deleteDeposit(maHoSoDatCoc);
        return ApiResponse.ok(null);
    }
}
