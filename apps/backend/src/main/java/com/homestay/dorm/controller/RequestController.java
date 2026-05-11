package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateYeuCauRequest;
import com.homestay.dorm.dto.request.UpdateYeuCauRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.ApproveRequestResponse;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @GetMapping
    public ApiListResponse<YeuCauDangKy> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String nhanVienPhuTrach,
            @RequestParam(required = false) String trangThaiYeuCau,
            @RequestParam(required = false) String search) {
        return requestService.getRequests(page, size, nhanVienPhuTrach, trangThaiYeuCau, search);
    }

    @GetMapping("/{maYeuCau}")
    public ApiResponse<YeuCauDangKy> getRequestById(@PathVariable String maYeuCau) {
        return ApiResponse.ok(requestService.getRequestById(maYeuCau));
    }

    @PostMapping
    public ApiResponse<YeuCauDangKy> createRequest(@Valid @RequestBody CreateYeuCauRequest request) {
        return ApiResponse.ok(requestService.createRequest(request));
    }

    @PutMapping("/{maYeuCau}")
    public ApiResponse<YeuCauDangKy> updateRequest(
            @PathVariable String maYeuCau,
            @Valid @RequestBody UpdateYeuCauRequest request) {
        return ApiResponse.ok(requestService.updateRequest(maYeuCau, request));
    }

    @DeleteMapping("/{maYeuCau}")
    public ApiResponse<Void> deleteRequest(@PathVariable String maYeuCau) {
        requestService.deleteRequest(maYeuCau);
        return ApiResponse.ok(null);
    }

    /**
     * Duyệt yêu cầu thuê → tự động tạo HopDongThue
     */
    @PostMapping("/{maYeuCau}/approve")
    public ApiResponse<ApproveRequestResponse> approveRequest(@PathVariable String maYeuCau) {
        return ApiResponse.ok(requestService.approveRequest(maYeuCau));
    }

    /**
     * Từ chối yêu cầu thuê
     */
    @PostMapping("/{maYeuCau}/reject")
    public ApiResponse<YeuCauDangKy> rejectRequest(
            @PathVariable String maYeuCau,
            @RequestBody(required = false) Map<String, String> body) {
        String lyDo = body != null ? body.get("lyDo") : null;
        return ApiResponse.ok(requestService.rejectRequest(maYeuCau, lyDo));
    }
}
