package com.homestay.dorm.service;

import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.dto.response.SaleDashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardStats();
    SaleDashboardResponse getSaleDashboardStats();
}
