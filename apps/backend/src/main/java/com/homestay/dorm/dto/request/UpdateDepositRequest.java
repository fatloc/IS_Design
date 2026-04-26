package com.homestay.dorm.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateDepositRequest {
    private String loaiVanBan; // Co the chua trang thai
    private LocalDate ngayLap;
    private LocalTime gioLap;
    private String chiNhanh;
    private String nhanVienLap;
    private String khachHangSoHuu;
    private BigDecimal mucTienCoc;
}
