package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "CHUNGTU")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChungTu {
    
    @Id
    @Column(name = "MaVanBan", length = 6)
    private String maVanBan;

    @Column(name = "LoaiVanBan", length = 30)
    private String loaiVanBan;

    @Column(name = "NgayLap")
    private LocalDate ngayLap;

    @Column(name = "GioLap")
    private LocalTime gioLap;

    @Column(name = "ChiNhanh", length = 4)
    private String chiNhanh;

    @Column(name = "NhanVienLap", length = 4)
    private String nhanVienLap;

    @Column(name = "KhachHangSoHuu", length = 6)
    private String khachHangSoHuu;
}
