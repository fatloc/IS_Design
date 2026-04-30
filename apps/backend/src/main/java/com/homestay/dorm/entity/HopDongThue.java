package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "HOPDONGTHUE")
@PrimaryKeyJoinColumn(name = "MaHopDongThue", referencedColumnName = "MaVanBan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HopDongThue extends ChungTu {

    @Column(name = "HinhThucThue", length = 50)
    private String hinhThucThue;

    @Column(name = "KyThanhToan", length = 50)
    private String kyThanhToan;

    @Column(name = "SoLuongThanhVien")
    private Integer soLuongThanhVien;

    @Column(name = "NgayKetThuc")
    private LocalDate ngayKetThuc;

}
