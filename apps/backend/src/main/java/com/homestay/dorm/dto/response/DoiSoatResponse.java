package com.homestay.dorm.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DoiSoatResponse {
    private String maHopDong;
    private BigDecimal tienCocBanDau;
    private String tyLeHoanCoc; // "50%", "70%", "100%"
    private BigDecimal tienCocDuocHoanCoBan; // Tiền cọc x Tỷ lệ
    private BigDecimal tongTienKhauTru; // Nợ điện nước + Phạt hư hỏng
    private BigDecimal soTienThucTe; // Tiền cọc được hoàn - Tổng khấu trừ
    private String loaiGiaoDich; // "Chi trả khách" hoặc "Thu thêm của khách"
}