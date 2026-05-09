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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final LichXemPhongRepository lichXemPhongRepository;
    private final JdbcTemplate jdbcTemplate;

    private void populateMaPhong(LichXemPhong lichHen) {
        if (lichHen == null) return;
        try {
            String sql = "SELECT MaPhongDuocXem FROM CHITIETLICHXEM WHERE LichXemPhong = ? LIMIT 1";
            String maPhong = jdbcTemplate.queryForObject(sql, String.class, lichHen.getMaLichHen());
            lichHen.setMaPhong(maPhong);
        } catch (Exception e) {
            // No room assigned or other error
        }
    }

    @Override
    public ApiListResponse<LichXemPhong> getAppointments(int page, int size, Integer month, Integer year) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "ngayHen"
        ));
        Page<LichXemPhong> appointmentPage;
        if (month != null && year != null) {
            // month is 1-indexed (January=1)
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            appointmentPage = lichXemPhongRepository.findByNgayHenBetween(startDate, endDate, pageable);
        } else {
            appointmentPage = lichXemPhongRepository.findAll(pageable);
        }
        appointmentPage.getContent().forEach(apt -> {
            this.populateMaPhong(apt);
            boolean overdue = false;
            if (("Pending".equalsIgnoreCase(apt.getTrangThaiHen()) || "Chờ xử lý".equalsIgnoreCase(apt.getTrangThaiHen())) && apt.getNgayHen() != null) {
                if (apt.getNgayHen().isBefore(LocalDate.now())) {
                    overdue = true;
                }
            }
            apt.setIsOverdue(overdue);
        });
        return ApiListResponse.fromPage(appointmentPage);
    }

    @Override
    public LichXemPhong getAppointmentByMaYeuCau(String maYeuCau) {
        LichXemPhong lichHen = lichXemPhongRepository.findFirstByMaYeuCau(maYeuCau)
                .orElse(null);
        if (lichHen != null) populateMaPhong(lichHen);
        return lichHen;
    }

    @Override
    public LichXemPhong getAppointmentById(String maLichHen) {
        LichXemPhong lichHen = lichXemPhongRepository.findById(maLichHen)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn: " + maLichHen));
        populateMaPhong(lichHen);
        return lichHen;
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
            .maYeuCau(req.getMaYeuCau())
                .nhanVienPhuTrach(req.getNhanVienPhuTrach())
                .build();
                
        LichXemPhong saved = lichXemPhongRepository.save(lichHen);
        
        if (req.getMaPhong() != null && !req.getMaPhong().trim().isEmpty()) {
            try {
                jdbcTemplate.update("INSERT INTO CHITIETLICHXEM (LichXemPhong, MaPhongDuocXem) VALUES (?, ?) ON DUPLICATE KEY UPDATE MaPhongDuocXem = VALUES(MaPhongDuocXem)", 
                    saved.getMaLichHen(), req.getMaPhong().trim());
            } catch (Exception e) {
                // ignore if room doesn't exist or already exists
            }
        }
        
        populateMaPhong(saved);
        return saved;
    }

    @Override
    public LichXemPhong updateAppointment(String maLichHen, UpdateAppointmentRequest req) {
        LichXemPhong lichHen = getAppointmentById(maLichHen);
        
        if (req.getThoiGianHen() != null) lichHen.setThoiGianHen(req.getThoiGianHen());
        if (req.getTrangThaiHen() != null) lichHen.setTrangThaiHen(req.getTrangThaiHen());
        if (req.getNgayHen() != null) lichHen.setNgayHen(req.getNgayHen());
        if (req.getKhachHangXem() != null) lichHen.setKhachHangXem(req.getKhachHangXem());
        if (req.getMaYeuCau() != null) lichHen.setMaYeuCau(req.getMaYeuCau());
        if (req.getNhanVienPhuTrach() != null) lichHen.setNhanVienPhuTrach(req.getNhanVienPhuTrach());
        
        LichXemPhong saved = lichXemPhongRepository.save(lichHen);
        populateMaPhong(saved);
        return saved;
    }

    @Override
    public void deleteAppointment(String maLichHen) {
        LichXemPhong lichHen = getAppointmentById(maLichHen);
        jdbcTemplate.update("DELETE FROM CHITIETLICHXEM WHERE LichXemPhong = ?", lichHen.getMaLichHen());
        lichXemPhongRepository.delete(lichHen);
    }
}
