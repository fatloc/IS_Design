package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CHITIETTHUEGIUONG")
@IdClass(ChiTietThueGiuongId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietThueGiuong {

    @Id
    @Column(name = "MaGiuong", columnDefinition = "char(4)")
    private String maGiuong;

    @Id
    @Column(name = "MaHopDongThue", columnDefinition = "char(6)")
    private String maHopDongThue;
}