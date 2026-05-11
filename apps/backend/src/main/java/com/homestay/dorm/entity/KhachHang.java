package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "KHACHHANG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang {
    @Id
    @Column(name = "MaKhachHang", length = 6)
    private String maKhachHang;

    @Column(name = "HoTen", length = 50)
    private String hoTen;

    @Column(name = "SoDienThoai", length = 10, unique = true)
    private String soDienThoai;

    @Column(name = "Email", length = 50, unique = true)
    private String email;

    @Column(name = "Phai", length = 3)
    private String phai;

    @Column(name = "CCCD", length = 12, unique = true)
    private String cccd;

    @Column(name = "QuocTich", length = 30)
    private String quocTich;
}
