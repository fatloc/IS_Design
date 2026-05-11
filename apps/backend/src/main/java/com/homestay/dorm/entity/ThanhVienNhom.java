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

    @Column(name = "CCCD", length = 12)
    private String cccd;

    @Column(name = "SoDienThoai", length = 10)
    private String soDienThoai;

    @Column(name = "Phai", length = 3)
    private String phai;

    @Column(name = "QuocTich", length = 30)
    private String quocTich;

    @Column(name = "MaYeuCau", length = 6)
    private String maYeuCau;

    @Column(name = "NguoiDaiDien", length = 6)
    private String nguoiDaiDien;

    @Column(name = "MaHopDongThue", length = 6)
    private String maHopDongThue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaHopDongThue", referencedColumnName = "MaHopDongThue", insertable = false, updatable = false)
    private HopDongThue hopDongThue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NguoiDaiDien", referencedColumnName = "MaKhachHang", insertable = false, updatable = false)
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MaYeuCau", referencedColumnName = "MaYeuCau", insertable = false, updatable = false)
    private YeuCauDangKy yeuCauDangKy;
}
