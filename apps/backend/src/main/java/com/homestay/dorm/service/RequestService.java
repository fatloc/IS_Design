package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateYeuCauRequest;
import com.homestay.dorm.dto.request.UpdateYeuCauRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApproveRequestResponse;
import com.homestay.dorm.entity.YeuCauDangKy;

public interface RequestService {
    ApiListResponse<YeuCauDangKy> getRequests(int page, int size, String nhanVienPhuTrach, String trangThaiYeuCau, String search);
    YeuCauDangKy getRequestById(String maYeuCau);
    YeuCauDangKy createRequest(CreateYeuCauRequest request);
    YeuCauDangKy updateRequest(String maYeuCau, UpdateYeuCauRequest request);
    void deleteRequest(String maYeuCau);
    ApproveRequestResponse approveRequest(String maYeuCau);
    YeuCauDangKy rejectRequest(String maYeuCau, String lyDo);
    java.util.Map<String, Long> getRequestStatusCounts();
}
