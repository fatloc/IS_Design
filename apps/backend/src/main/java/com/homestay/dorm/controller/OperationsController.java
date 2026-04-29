package com.homestay.dorm.controller;

import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.OperationsResponse;
import com.homestay.dorm.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;

    @GetMapping
    public ApiResponse<OperationsResponse> getOperations() {
        return ApiResponse.ok(operationsService.getOperations());
    }
}