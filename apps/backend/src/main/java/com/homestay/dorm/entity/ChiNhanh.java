package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "CHINHANH")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiNhanh {
    @Id
    @Column(name = "MaChiNhanh", length = 4)
    private String maChiNhanh;

    @Column(name = "TenChiNhanh", length = 100)
    private String tenChiNhanh;

    @Column(name = "DiaChi", length = 100)
    private String diaChi;
}
