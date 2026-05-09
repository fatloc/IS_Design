package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "BANGDOISOAT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BangDoiSoat {

    @Id
    @Column(name = "MaBangDoiSoat", length = 7)
    private String maBangDoiSoat;

    @Column(name = "MaHopDongThue", length = 6)
    private String maHopDongThue;

    @Column(name = "TiLeHoanCoc")
    private Integer tiLeHoanCoc;

    @Column(name = "TongKhauTru")
    private BigDecimal tongKhauTru;

    @Column(name = "SoTienThucTe")
    private BigDecimal soTienThucTe;

    @Column(name = "NgayLap")
    private LocalDate ngayLap;

    @Column(name = "TrangThai", length = 50)
    private String trangThai;
}
