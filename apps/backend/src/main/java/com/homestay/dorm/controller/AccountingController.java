package com.homestay.dorm.controller;

import com.homestay.dorm.dto.response.AccountingWorkflowsResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.service.AccountingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
public class AccountingController {

    private final AccountingService accountingService;

    @GetMapping("/workflows")
    public ApiResponse<AccountingWorkflowsResponse> getWorkflows() {
        return ApiResponse.ok(accountingService.getWorkflows());
    }
}