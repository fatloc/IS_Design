package com.homestay.dorm.controller;

import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.dto.response.SaleDashboardResponse;
import com.homestay.dorm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardResponse> getStats() {
        return ApiResponse.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/sale/stats")
    public ApiResponse<SaleDashboardResponse> getSaleStats() {
        return ApiResponse.ok(dashboardService.getSaleDashboardStats());
    }
}
