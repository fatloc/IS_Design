package com.homestay.dorm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    // Shared structure for both Customer & Employee as per frontend types
    private String maNhanVien; // Mapped dynamically if Employee
    private String maKhachHang; // Mapped dynamically if Customer
    private String hoTen;
    private String tenDangNhap;
    private String email;
    private String phai;
    private String soDienThoai;
    private String cccd;
    private String loaiNhanVien; // For employee
    private String quocTich;     // For customer
    
    // Explicit generic role to make frontend logic easier
    private String role;
}
