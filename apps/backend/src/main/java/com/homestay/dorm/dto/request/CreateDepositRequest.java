package com.homestay.dorm.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateDepositRequest {
    private String loaiVanBan;
    private LocalDate ngayLap;
    private LocalTime gioLap;
    private String chiNhanh;
    private String nhanVienLap;
    private String khachHangSoHuu;
    private BigDecimal mucTienCoc;
}
