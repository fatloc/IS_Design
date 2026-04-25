package com.homestay.dorm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "HOSODATCOC")
@PrimaryKeyJoinColumn(name = "MaHoSoDatCoc", referencedColumnName = "MaVanBan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HoSoDatCoc extends ChungTu {

    @Column(name = "MucTienCoc", precision = 12, scale = 2)
    private BigDecimal mucTienCoc;

}
