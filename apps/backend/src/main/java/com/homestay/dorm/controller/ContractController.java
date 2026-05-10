package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.homestay.dorm.dto.response.DoiSoatResponse;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SALE', 'MANAGER', 'KETOAN')")
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
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String loaiVanBan,
            @RequestParam(required = false) String hinhThucThue) {
        return contractService.getContracts(page, size, search, loaiVanBan, hinhThucThue);
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

    @PostMapping("/{maHopDongThue}/thanh-ly")
    public ApiResponse<String> xacNhanThanhLy(@PathVariable String maHopDongThue) {
        // Gọi Service dọn phòng, đổi trạng thái phòng/giường thành "Trống"
        contractService.thanhLyHopDong(maHopDongThue);
        return ApiResponse.ok("Đã thanh lý hợp đồng và giải phóng mặt bằng thành công!");
    }
}

