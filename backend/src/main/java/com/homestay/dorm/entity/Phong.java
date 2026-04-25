package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "PHONG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phong {
    @Id
    @Column(name = "MaPhong", length = 4)
    private String maPhong;

    @Column(name = "SucChuaToiDa")
    private Integer sucChuaToiDa;

    @Column(name = "GiaThuePhong", precision = 12, scale = 2)
    private BigDecimal giaThuePhong;

    @Column(name = "TrangThai", length = 50)
    private String trangThai;

    @Column(name = "ChiNhanh", length = 4)
    private String chiNhanh;
}
