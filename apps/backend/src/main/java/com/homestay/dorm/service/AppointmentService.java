package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateAppointmentRequest;
import com.homestay.dorm.dto.request.UpdateAppointmentRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.LichXemPhong;

public interface AppointmentService {
    ApiListResponse<LichXemPhong> getAppointments(int page, int size, Integer month, Integer year);
    LichXemPhong getAppointmentById(String maLichHen);
    LichXemPhong createAppointment(CreateAppointmentRequest request);
    LichXemPhong updateAppointment(String maLichHen, UpdateAppointmentRequest request);
    void deleteAppointment(String maLichHen);
}
