package com.homestay.dorm.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateAppointmentRequest {
    private LocalTime thoiGianHen;
    private String trangThaiHen;
    private LocalDate ngayHen;
    private String khachHangXem;
    private String nhanVienPhuTrach;
}
