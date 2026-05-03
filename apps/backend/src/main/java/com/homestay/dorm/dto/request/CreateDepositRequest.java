package com.homestay.dorm.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateDepositRequest {
    private String loaiVanBan;
    private LocalDate ngayLap;
    private LocalTime gioLap;
    private String chiNhanh;
    private String nhanVienLap;
    private String khachHangSoHuu;
    private BigDecimal mucTienCoc;
    private String maPhong;
    private List<String> danhSachMaGiuong;
}
