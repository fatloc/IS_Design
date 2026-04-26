package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "NHANVIEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanVien {

    @Id
    @Column(name = "MaNhanVien", length = 4)
    private String maNhanVien;

    @Column(name = "HoTen", length = 50)
    private String hoTen;

    @Column(name = "SoDienThoai", length = 10)
    private String soDienThoai;

    @Column(name = "Email", length = 30)
    private String email;

    @Column(name = "Phai", length = 3)
    private String phai;

    @Column(name = "CCCD", length = 12)
    private String cccd;

    @Column(name = "LoaiNhanVien", length = 30)
    private String loaiNhanVien;

    @Column(name = "MatKhau", length = 255)
    private String matKhau;
}
