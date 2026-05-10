package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "LICHXEMPHONG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichXemPhong {

    @Id
    @Column(name = "MaLichHen", length = 6)
    private String maLichHen;

    @Column(name = "ThoiGianHen")
    private LocalTime thoiGianHen;

    @Column(name = "TrangThaiHen", length = 20)
    private String trangThaiHen;

    @Column(name = "NgayHen")
    private LocalDate ngayHen;

    @Column(name = "KhachHangXem", length = 6)
    private String khachHangXem;

    @Column(name = "MaYeuCau", length = 6)
    private String maYeuCau;

    @Column(name = "NhanVienPhuTrach", length = 4)
    private String nhanVienPhuTrach;

    @jakarta.persistence.Transient
    private String maPhong;
}
