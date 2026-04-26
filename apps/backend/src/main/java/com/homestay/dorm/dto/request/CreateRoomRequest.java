package com.homestay.dorm.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateRoomRequest {
    @NotBlank(message = "Mã phòng không được để trống")
    private String maPhong;

    private Integer sucChuaToiDa;
    private BigDecimal giaThuePhong;
    
    @NotBlank(message = "Trạng thái không được để trống")
    private String trangThai;
    
    @NotBlank(message = "Chi nhánh không được để trống")
    private String chiNhanh;
}
