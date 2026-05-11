package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "THANHVIENNHOM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhVienNhom {

    @Id
    @Column(name = "MaThanhVien", length = 5)
    private String maThanhVien;

    @Column(name = "HoTen", length = 50)
    private String hoTen;

    @Column(name = "SoDienThoai", length = 10)
    private String soDienThoai;

    @Column(name = "Phai", length = 3)
    private String phai;

    @Column(name = "CCCD", length = 12)
    private String cccd;

    @Column(name = "QuocTich", length = 30)
    private String quocTich;

    @Column(name = "MaHopDongThue", length = 6)
    private String maHopDongThue;

    @Column(name = "NguoiDaiDien", length = 6)
    private String nguoiDaiDien;

    @Column(name = "MaYeuCau", length = 6)
    private String maYeuCau;
}
