package com.homestay.dorm.dto.request;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String hoTen;
    private String tenDangNhap;
    private String soDienThoai;
    private String email;
    private String matKhau;
    private String phai;
    private String cccd;
    private String loaiNhanVien;
}
