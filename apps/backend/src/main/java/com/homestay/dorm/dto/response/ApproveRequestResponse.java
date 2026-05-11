package com.homestay.dorm.dto.response;

import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.entity.YeuCauDangKy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveRequestResponse {
    private YeuCauDangKy yeuCau;
    private HopDongThue hopDong;
    private String message;
}
