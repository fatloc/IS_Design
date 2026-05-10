package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "YEUCAUDANGKY")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YeuCauDangKy {

    @Id
    @Column(name = "MaYeuCau", length = 6)
    private String maYeuCau;

    @Column(name = "NgayTao")
    private LocalDate ngayTao;

    @Column(name = "SoLuongNguoi")
    private Integer soLuongNguoi;

    @Column(name = "GioiTinhYeuCau", length = 3)
    private String gioiTinhYeuCau;

    @Column(name = "ThoiGianBatDauThueDuKien")
    private LocalDate thoiGianBatDauThueDuKien;

    @Column(name = "ThoiGianBanGiaoPhongDuKien")
    private LocalDate thoiGianBanGiaoPhongDuKien;

    @Column(name = "CoDieuHoa")
    private Boolean coDieuHoa;

    @Column(name = "KhuVuc", length = 30)
    private String khuVuc;

    @Column(name = "MucGiaMongMuon", precision = 12, scale = 2)
    private BigDecimal mucGiaMongMuon;

    @Column(name = "CoBaiGuiXe")
    private Boolean coBaiGuiXe;

    @Column(name = "CacTieuChiKhac", length = 255)
    private String cacTieuChiKhac;

    @Column(name = "KhachHangYeuCau", length = 6)
    private String khachHangYeuCau;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "KhachHangYeuCau", referencedColumnName = "MaKhachHang", insertable = false, updatable = false)
    private KhachHang khachHang;

    @Column(name = "NhanVienPhuTrach", length = 4)
    private String nhanVienPhuTrach;

    @Column(name = "TrangThaiYeuCau", length = 30)
    private String trangThaiYeuCau;

    @Transient
    private Boolean isOverdue;
}
