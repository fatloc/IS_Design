package com.homestay.dorm.controller;

import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.CacheManager;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CacheManager cacheManager;

    @GetMapping("/stats")
    public ApiResponse<DashboardResponse> getStats() {
        return ApiResponse.ok(dashboardService.getDashboardStats());
    }

    @DeleteMapping("/cache")
    public ApiResponse<String> clearCache() {
        var cache = cacheManager.getCache("dashboardStats");
        if (cache != null) {
            cache.clear();
            return ApiResponse.ok("Dashboard cache cleared successfully");
        }
        return ApiResponse.ok("Cache not found");
    }
}
