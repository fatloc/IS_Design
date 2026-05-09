package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "GIUONG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Giuong {

    @Id
    @Column(name = "MaGiuong", columnDefinition = "char(4)")
    private String maGiuong;

    @Column(name = "GiaThue", precision = 12, scale = 2)
    private BigDecimal giaThue;

    @Column(name = "TrangThai", length = 50)
    private String trangThai;

    @Column(name = "MaPhongChua", columnDefinition = "char(4)")
    private String maPhongChua;
}