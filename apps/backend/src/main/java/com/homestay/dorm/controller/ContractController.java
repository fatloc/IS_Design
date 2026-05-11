package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.ContractDetailResponse;
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

    @GetMapping("/stats")
    public ApiResponse<java.util.Map<String, Long>> getContractStats() {
        return ApiResponse.ok(contractService.getContractStats());
    }

    @GetMapping("/settlement")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> getSettlementContracts(
            @RequestParam(required = false) String trangThai) {
        return ApiResponse.ok(contractService.getSettlementContracts(trangThai));
    }

    @PutMapping("/{maHopDongThue}/settlement-status")
    public ApiResponse<HopDongThue> updateSettlementStatus(
            @PathVariable String maHopDongThue,
            @RequestParam String trangThai) {
        return ApiResponse.ok(contractService.updateSettlementStatus(maHopDongThue, trangThai));
    }

    @PostMapping("/seed-settlement-status")
    public ApiResponse<String> seedSettlementStatus() {
        return ApiResponse.ok(contractService.seedSettlementStatus());
    }

    @GetMapping("/operational")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> getOperationalContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(contractService.getOperationalContracts(page, size));
    }

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

    @GetMapping("/{maHopDongThue}/details")
    public ApiResponse<ContractDetailResponse> getContractDetails(@PathVariable String maHopDongThue) {
        return ApiResponse.ok(contractService.getContractDetails(maHopDongThue));
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
