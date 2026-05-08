package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateAppointmentRequest;
import com.homestay.dorm.dto.request.UpdateAppointmentRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.LichXemPhong;
import com.homestay.dorm.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SALE', 'MANAGER')")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public ApiListResponse<LichXemPhong> getAppointments(
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "100")  int size,
            @RequestParam(required = false)      Integer month,
            @RequestParam(required = false)      Integer year) {
        return appointmentService.getAppointments(page, size, month, year);
    }

    @GetMapping("/{maLichHen}")
    public ApiResponse<LichXemPhong> getAppointmentById(@PathVariable String maLichHen) {
        return ApiResponse.ok(appointmentService.getAppointmentById(maLichHen));
    }

    @PostMapping
    public ApiResponse<LichXemPhong> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        return ApiResponse.ok(appointmentService.createAppointment(request));
    }

    @PutMapping("/{maLichHen}")
    public ApiResponse<LichXemPhong> updateAppointment(
            @PathVariable String maLichHen,
            @Valid @RequestBody UpdateAppointmentRequest request) {
        return ApiResponse.ok(appointmentService.updateAppointment(maLichHen, request));
    }

    @DeleteMapping("/{maLichHen}")
    public ApiResponse<Void> deleteAppointment(@PathVariable String maLichHen) {
        appointmentService.deleteAppointment(maLichHen);
        return ApiResponse.ok(null);
    }
}
