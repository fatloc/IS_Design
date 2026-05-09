package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "PHIEUTHANHTOAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhieuThanhToan {

    @Id
    @Column(name = "MaPhieuThanhToan", length = 7)
    private String maPhieuThanhToan;

    @Column(name = "HinhThucThanhToan", length = 30)
    private String hinhThucThanhToan;

    @Column(name = "GhiChu", length = 255)
    private String ghiChu;

    @Column(name = "GioGiaoDich")
    private LocalTime gioGiaoDich;

    @Column(name = "NgayGiaoDich")
    private LocalDate ngayGiaoDich;

    @Column(name = "TrangThai", length = 30)
    private String trangThai;

    @Column(name = "LoaiGiaoDich", length = 30)
    private String loaiGiaoDich;

    @Column(name = "KeToanLapPhieu", length = 4)
    private String keToanLapPhieu;

    @Column(name = "QuanLyDoiChung", length = 4)
    private String quanLyDoiChung;

    @Column(name = "MaChungTu", length = 6)
    private String maChungTu;

    @Column(name = "SoTienGiaoDich")
    private java.math.BigDecimal soTienGiaoDich;
}
