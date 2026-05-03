package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "DICHVU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DichVu {

    @Id
    @Column(name = "MaDichVu", columnDefinition = "char(3)")
    private String maDichVu;

    @Column(name = "TenDichVu", length = 100)
    private String tenDichVu;

    @Column(name = "DonGia", precision = 12, scale = 2)
    private BigDecimal donGia;

    @Column(name = "DonViTinh", length = 20)
    private String donViTinh;
}