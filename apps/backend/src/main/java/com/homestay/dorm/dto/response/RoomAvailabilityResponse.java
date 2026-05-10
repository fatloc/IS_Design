package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO hiển thị thông tin phòng kèm số slot trống (công suất hiện tại).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailabilityResponse {
    private String maPhong;
    private Integer sucChuaToiDa;       // Sức chứa tối đa
    private Integer soNguoiHienTai;     // Số người đang ở (hợp đồng active)
    private Integer slotsTrong;         // = sucChuaToiDa - soNguoiHienTai
    private BigDecimal giaThuePhong;
    private String trangThai;
    private String chiNhanh;
}
