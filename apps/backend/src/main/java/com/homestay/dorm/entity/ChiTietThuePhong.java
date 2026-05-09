package com.homestay.dorm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CHITIETTHUEPHONG")
@IdClass(ChiTietThuePhongId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietThuePhong {

    @Id
    @Column(name = "MaPhong", columnDefinition = "char(4)") 
    private String maPhong;

    @Id
    @Column(name = "MaHopDongThue", columnDefinition = "char(6)")
    private String maHopDongThue;
}