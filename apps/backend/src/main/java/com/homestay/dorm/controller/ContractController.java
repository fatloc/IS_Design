package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    public ApiListResponse<HopDongThue> getContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return contractService.getContracts(page, size);
    }

    @GetMapping("/{maHopDongThue}")
    public ApiResponse<HopDongThue> getContractById(@PathVariable String maHopDongThue) {
        return ApiResponse.ok(contractService.getContractById(maHopDongThue));
    }

    @PostMapping
    public ApiResponse<HopDongThue> createContract(@Valid @RequestBody CreateContractRequest request) {
        return ApiResponse.ok(contractService.createContract(request));
    }

    @PutMapping("/{maHopDongThue}")
    public ApiResponse<HopDongThue> updateContract(
            @PathVariable String maHopDongThue,
            @Valid @RequestBody UpdateContractRequest request) {
        return ApiResponse.ok(contractService.updateContract(maHopDongThue, request));
    }

    @DeleteMapping("/{maHopDongThue}")
    public ApiResponse<Void> deleteContract(@PathVariable String maHopDongThue) {
        contractService.deleteContract(maHopDongThue);
        return ApiResponse.ok(null);
    }
}
