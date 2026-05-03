package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.entity.LichXemPhong;
import com.homestay.dorm.repository.*;
import com.homestay.dorm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PhongRepository phongRepository;
    private final YeuCauDangKyRepository yeuCauDangKyRepository;
    private final LichXemPhongRepository lichXemPhongRepository;
    private final PhieuThanhToanRepository phieuThanhToanRepository;

    @Override
    public DashboardResponse getDashboardStats() {
        // Optimization: Use direct counts instead of fetching all records
        long totalRooms = phongRepository.count();
        
        Map<String, Long> roomStatusCounts = new HashMap<>();
        String[] statuses = {"Trống", "Đang có người", "Đã đặt cọc", "Đang bảo trì"};
        for (String s : statuses) {
            roomStatusCounts.put(s, phongRepository.countByTrangThai(s));
        }

        // Fetch ALL pending counts as requested for data accuracy
        long pendingRequests = yeuCauDangKyRepository.count();
        long pendingAppointments = lichXemPhongRepository.count();
        long pendingTransactions = phieuThanhToanRepository.count();

        // Mocked revenue
        double revenue = 47800000.0; 

        // Fetch top tasks for display (limit to 3/2 items but from all records)
        List<DashboardResponse.DashboardTask> tasks = new ArrayList<>();
        
        yeuCauDangKyRepository.findAll(PageRequest.of(0, 3)).forEach(req -> {
            tasks.add(DashboardResponse.DashboardTask.builder()
                    .id("req-" + req.getMaYeuCau())
                    .title("Duyệt hồ sơ thuê phòng")
                    .desc("Khách hàng: " + req.getKhachHangYeuCau() + " · Khu vực: " + req.getKhuVuc())
                    .source("approvals")
                    .priority("high")
                    .time(req.getThoiGianBatDauThueDuKien() != null ? req.getThoiGianBatDauThueDuKien().toString() : "Mới")
                    .tag("Duyệt thuê")
                    .build());
        });

        lichXemPhongRepository.findAll(PageRequest.of(0, 2)).forEach(app -> {
            tasks.add(DashboardResponse.DashboardTask.builder()
                    .id("app-" + app.getMaLichHen())
                    .title("Lịch xem phòng khách hàng")
                    .desc("Khách hàng đang chờ xác nhận lịch hẹn #" + app.getMaLichHen())
                    .source("approvals")
                    .priority("medium")
                    .time(app.getNgayHen() != null ? app.getNgayHen().toString() : "Hôm nay")
                    .tag("Lịch hẹn")
                    .build());
        });

        return DashboardResponse.builder()
                .totalRooms(totalRooms)
                .roomStatusCounts(roomStatusCounts)
                .pendingRequests(pendingRequests)
                .pendingAppointments(pendingAppointments)
                .pendingTransactions(pendingTransactions)
                .monthlyRevenue(revenue)
                .urgentTasks(tasks)
                .build();
    }
}
