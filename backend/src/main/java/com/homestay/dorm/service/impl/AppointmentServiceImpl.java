package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateAppointmentRequest;
import com.homestay.dorm.dto.request.UpdateAppointmentRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.LichXemPhong;
import com.homestay.dorm.repository.LichXemPhongRepository;
import com.homestay.dorm.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final LichXemPhongRepository lichXemPhongRepository;

    @Override
    public ApiListResponse<LichXemPhong> getAppointments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LichXemPhong> appointmentPage = lichXemPhongRepository.findAll(pageable);
        return ApiListResponse.ok(appointmentPage.getContent(), appointmentPage.getTotalElements());
    }

    @Override
    public LichXemPhong getAppointmentById(String maLichHen) {
        return lichXemPhongRepository.findById(maLichHen)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + maLichHen));
    }

    @Override
    public LichXemPhong createAppointment(CreateAppointmentRequest req) {
        String newId = "LH" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        
        LichXemPhong lichHen = LichXemPhong.builder()
                .maLichHen(newId)
                .thoiGianHen(req.getThoiGianHen())
                .trangThaiHen(req.getTrangThaiHen() != null ? req.getTrangThaiHen() : "Pending")
                .ngayHen(req.getNgayHen())
                .khachHangXem(req.getKhachHangXem())
                .nhanVienPhuTrach(req.getNhanVienPhuTrach())
                .build();
                
        return lichXemPhongRepository.save(lichHen);
    }

    @Override
    public LichXemPhong updateAppointment(String maLichHen, UpdateAppointmentRequest req) {
        LichXemPhong lichHen = getAppointmentById(maLichHen);
        
        if (req.getThoiGianHen() != null) lichHen.setThoiGianHen(req.getThoiGianHen());
        if (req.getTrangThaiHen() != null) lichHen.setTrangThaiHen(req.getTrangThaiHen());
        if (req.getNgayHen() != null) lichHen.setNgayHen(req.getNgayHen());
        if (req.getKhachHangXem() != null) lichHen.setKhachHangXem(req.getKhachHangXem());
        if (req.getNhanVienPhuTrach() != null) lichHen.setNhanVienPhuTrach(req.getNhanVienPhuTrach());
        
        return lichXemPhongRepository.save(lichHen);
    }

    @Override
    public void deleteAppointment(String maLichHen) {
        LichXemPhong lichHen = getAppointmentById(maLichHen);
        lichXemPhongRepository.delete(lichHen);
    }
}
