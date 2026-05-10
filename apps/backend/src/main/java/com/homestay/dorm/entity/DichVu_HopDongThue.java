package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DICHVU_HOPDONGTHUE")
@IdClass(DichVuHopDongThueId.class) // Khai báo sử dụng khóa chính kép
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DichVu_HopDongThue {

    @Id
    @Column(name = "MaDichVu", columnDefinition = "char(3)")
    private String maDichVu;

    @Id
    @Column(name = "MaHopDongThue", columnDefinition = "char(6)")
    private String maHopDongThue;

    @Column(name = "SoLuongDichVu")
    private Integer soLuongDichVu;
}