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

import com.homestay.dorm.dto.response.DoiSoatResponse;
import java.math.BigDecimal;

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

    @GetMapping("/{maHopDongThue}/tien-ky-dau")
    public ApiResponse<BigDecimal> getTienThueKyDau(@PathVariable String maHopDongThue) {
        // Controller nhận mã Hợp đồng từ URL, nhờ Service tính tiền, rồi trả về cho Frontend
        BigDecimal tongTien = contractService.tinhTienThueKyDau(maHopDongThue);
        return ApiResponse.ok(tongTien);
    }

    @GetMapping("/{maHopDongThue}/doi-soat")
    public ApiResponse<DoiSoatResponse> tinhDoiSoatTraPhong(
            @PathVariable String maHopDongThue,
            @RequestParam(defaultValue = "0") BigDecimal tongTienKhauTru,
            @RequestParam(defaultValue = "false") boolean laHetHanHopDong) {
            
        // Gọi  Service để tính toán
        DoiSoatResponse ketQua = contractService.doiSoatChiPhi(maHopDongThue, tongTienKhauTru, laHetHanHopDong);
        
        // Trả kết quả ra cho Frontend
        return ApiResponse.ok(ketQua);
    }
}
