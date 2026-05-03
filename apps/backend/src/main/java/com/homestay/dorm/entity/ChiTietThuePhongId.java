package com.homestay.dorm.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietThuePhongId implements Serializable {
    private String maPhong;
    private String maHopDongThue;
}