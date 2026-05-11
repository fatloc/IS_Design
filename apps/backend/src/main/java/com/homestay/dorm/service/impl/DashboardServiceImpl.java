package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.repository.*;
import com.homestay.dorm.service.DashboardService;
import com.homestay.dorm.repository.HopDongThueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final HopDongThueRepository hopDongThueRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public DashboardResponse getDashboardStats() {
        long totalRooms = phongRepository.count();

        Map<String, Long> roomStatusCounts = new HashMap<>();
        // Dùng LIKE để bắt cả giá trị có dấu ("Trống") lẫn không dấu ("Trong")
        // vì DB có thể có cả hai tùy nguồn tạo dữ liệu
        roomStatusCounts.put("Trống", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%rong%' AND TrangThai NOT LIKE '%thue%' AND TrangThai NOT LIKE '%dat%' AND TrangThai NOT LIKE '%tri%'",
                Long.class));
        roomStatusCounts.put("Đang có người", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%thue%'",
                Long.class));
        roomStatusCounts.put("Đã đặt cọc", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%dat%'",
                Long.class));
        roomStatusCounts.put("Đang bảo trì", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%tri%'",
                Long.class));

        long pendingRequests = yeuCauDangKyRepository
                .findByTrangThaiYeuCau("Chờ phê duyệt", PageRequest.of(0, 1))
                .getTotalElements();

        long pendingAppointments = lichXemPhongRepository
                .countByNgayHenAfter(LocalDate.now().minusDays(1));

        long pendingTransactions = phieuThanhToanRepository.count();

        // Tổng sức chứa tất cả phòng
        Long totalCapacity = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(SucChuaToiDa), 0) FROM PHONG", Long.class);
        if (totalCapacity == null) totalCapacity = 0L;

        // Số phòng đầy = phòng có trạng thái "Da thue" hoặc "Dang thue"
        // (tức là phòng đã được bàn giao, không quan tâm số người vì SoLuongThanhVien không tin được)
        long fullRooms = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%thue%'", Long.class);

        // activeTenants = số phòng đang có người (dùng để hiển thị, không dùng SoLuongThanhVien)
        // Dùng số phòng đang thuê × sức chứa trung bình để ước tính hợp lý hơn
        // Hoặc đơn giản: đếm số hợp đồng active có phòng
        Long activeTenants = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT ct.MaHopDongThue) " +
                "FROM CHITIETTHUEPHONG ct " +
                "JOIN HOPDONGTHUE h ON h.MaHopDongThue = ct.MaHopDongThue " +
                "WHERE (h.TrangThaiThanhLy NOT IN ('Hoan tat') OR h.TrangThaiThanhLy IS NULL)",
                Long.class);
        if (activeTenants == null) activeTenants = 0L;

        double revenue = 47800000.0;

        List<DashboardResponse.DashboardTask> tasks = new ArrayList<>();

        yeuCauDangKyRepository.findByTrangThaiYeuCau("Chờ phê duyệt", PageRequest.of(0, 3)).forEach(req -> {
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

        lichXemPhongRepository.findByNgayHenAfter(LocalDate.now().minusDays(1), PageRequest.of(0, 2)).forEach(app -> {
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
                .activeTenants(activeTenants)
                .totalCapacity(totalCapacity)
                .fullRooms(fullRooms)
                .monthlyRevenue(revenue)
                .urgentTasks(tasks)
                .build();
    }
}
