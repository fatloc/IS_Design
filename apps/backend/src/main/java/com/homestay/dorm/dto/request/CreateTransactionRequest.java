package com.homestay.dorm.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateTransactionRequest {
    private String hinhThucThanhToan;
    private String ghiChu;
    private LocalTime gioGiaoDich;
    private LocalDate ngayGiaoDich;
    private String trangThai;
    private String loaiGiaoDich;
    private String keToanLapPhieu;
    private String quanLyDoiChung;
    private String maChungTu;
    private BigDecimal soTienGiaoDich;
}
