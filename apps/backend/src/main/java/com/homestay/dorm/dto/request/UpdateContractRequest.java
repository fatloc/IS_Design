package com.homestay.dorm.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdateContractRequest {
    private String loaiVanBan;
    private LocalDate ngayLap;
    private LocalTime gioLap;
    private String chiNhanh;
    private String nhanVienLap;
    private String khachHangSoHuu;
    
    private String hinhThucThue;
    private String kyThanhToan;
    private Integer soLuongThanhVien;
    private LocalDate ngayKetThuc;
}
