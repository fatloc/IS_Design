package com.homestay.dorm.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateRoomRequest {
    private Integer sucChuaToiDa;
    private BigDecimal giaThuePhong;
    private String trangThai;
    private String chiNhanh;
}
