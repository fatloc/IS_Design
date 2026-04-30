package com.homestay.dorm.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;


@Data
public class CreateContractRequest {
    private String loaiVanBan; 
    private LocalDate ngayLap;
    private LocalTime gioLap;
    private String chiNhanh;
    private String nhanVienLap;
    private String khachHangSoHuu;
    
    private String hinhThucThue;
    private String kyThanhToan;
    private Integer soLuongThanhVien;
    private String maPhong; 
    private LocalDate ngayKetThuc;
    // Dùng khi khách thuê giường lẻ (Ở ghép)
    private List<String> danhSachMaGiuong; 
    // Dùng để lưu Dịch vụ khách chọn. 
    // Key (String) là Mã dịch vụ, Value (Integer) là Số lượng. Ví dụ: "DV1": 2 (Gửi 2 chiếc xe)
    private Map<String, Integer> danhSachDichVu;
}
