package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.repository.*;
import com.homestay.dorm.service.DashboardService;
import com.homestay.dorm.repository.HopDongThueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
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
    @Cacheable(value = "dashboardStats", unless = "#result == null")
    public DashboardResponse getDashboardStats() {
        // Gộp tất cả các thống kê phòng vào 1 query duy nhất
        Map<String, Object> roomStats = jdbcTemplate.queryForMap(
                "SELECT " +
                "COUNT(*) as totalRooms, " +
                "SUM(CASE WHEN TrangThai LIKE '%rong%' AND TrangThai NOT LIKE '%thue%' AND TrangThai NOT LIKE '%dat%' AND TrangThai NOT LIKE '%tri%' THEN 1 ELSE 0 END) as emptyRooms, " +
                "SUM(CASE WHEN TrangThai LIKE '%thue%' THEN 1 ELSE 0 END) as occupiedRooms, " +
                "SUM(CASE WHEN TrangThai LIKE '%dat%' THEN 1 ELSE 0 END) as depositedRooms, " +
                "SUM(CASE WHEN TrangThai LIKE '%tri%' THEN 1 ELSE 0 END) as maintenanceRooms, " +
                "COALESCE(SUM(SucChuaToiDa), 0) as totalCapacity " +
                "FROM PHONG"
        );

        long totalRooms = ((Number) roomStats.get("totalRooms")).longValue();
        long fullRooms = ((Number) roomStats.get("occupiedRooms")).longValue();
        long totalCapacity = ((Number) roomStats.get("totalCapacity")).longValue();

        Map<String, Long> roomStatusCounts = new HashMap<>();
        roomStatusCounts.put("Trống", ((Number) roomStats.get("emptyRooms")).longValue());
        roomStatusCounts.put("Đang có người", fullRooms);
        roomStatusCounts.put("Đã đặt cọc", ((Number) roomStats.get("depositedRooms")).longValue());
        roomStatusCounts.put("Đang bảo trì", ((Number) roomStats.get("maintenanceRooms")).longValue());

        // Gộp các thống kê đếm vào 1 query
        Map<String, Object> countStats = jdbcTemplate.queryForMap(
                "SELECT " +
                "(SELECT COUNT(*) FROM YEUCAUDANGKY WHERE TrangThaiYeuCau = 'Chờ phê duyệt') as pendingRequests, " +
                "(SELECT COUNT(*) FROM LICHXEMPHONG WHERE NgayHen > ?) as pendingAppointments, " +
                "(SELECT COUNT(*) FROM PHIEUTHANHTOAN) as pendingTransactions, " +
                "(SELECT COUNT(DISTINCT ct.MaHopDongThue) FROM CHITIETTHUEPHONG ct " +
                "JOIN HOPDONGTHUE h ON h.MaHopDongThue = ct.MaHopDongThue " +
                "WHERE (h.TrangThaiThanhLy NOT IN ('Hoan tat') OR h.TrangThaiThanhLy IS NULL)) as activeTenants",
                LocalDate.now().minusDays(1)
        );

        long pendingRequests = ((Number) countStats.get("pendingRequests")).longValue();
        long pendingAppointments = ((Number) countStats.get("pendingAppointments")).longValue();
        long pendingTransactions = ((Number) countStats.get("pendingTransactions")).longValue();
        long activeTenants = ((Number) countStats.get("activeTenants")).longValue();

        double revenue = 47800000.0;

        // Lấy tasks - KHÔNG dùng Page để tránh count query chậm
        List<DashboardResponse.DashboardTask> tasks = new ArrayList<>();

        // Lấy top 3 yêu cầu chờ duyệt - dùng LIMIT thay vì Page
        jdbcTemplate.query(
                "SELECT MaYeuCau, KhachHangYeuCau, KhuVuc, ThoiGianBatDauThueDuKien " +
                "FROM YEUCAUDANGKY " +
                "WHERE TrangThaiYeuCau = 'Chờ phê duyệt' " +
                "ORDER BY ThoiGianBatDauThueDuKien DESC " +
                "LIMIT 3",
                (rs, rowNum) -> {
                    tasks.add(DashboardResponse.DashboardTask.builder()
                            .id("req-" + rs.getString("MaYeuCau"))
                            .title("Duyệt hồ sơ thuê phòng")
                            .desc("Khách hàng: " + rs.getString("KhachHangYeuCau") + " · Khu vực: " + rs.getString("KhuVuc"))
                            .source("approvals")
                            .priority("high")
                            .time(rs.getDate("ThoiGianBatDauThueDuKien") != null ? 
                                  rs.getDate("ThoiGianBatDauThueDuKien").toString() : "Mới")
                            .tag("Duyệt thuê")
                            .build());
                    return null;
                }
        );

        // Lấy top 2 lịch hẹn - dùng LIMIT thay vì Page
        jdbcTemplate.query(
                "SELECT MaLichHen, NgayHen " +
                "FROM LICHXEMPHONG " +
                "WHERE NgayHen > ? " +
                "ORDER BY NgayHen ASC " +
                "LIMIT 2",
                new Object[]{LocalDate.now().minusDays(1)},
                (rs, rowNum) -> {
                    tasks.add(DashboardResponse.DashboardTask.builder()
                            .id("app-" + rs.getString("MaLichHen"))
                            .title("Lịch xem phòng khách hàng")
                            .desc("Khách hàng đang chờ xác nhận lịch hẹn #" + rs.getString("MaLichHen"))
                            .source("approvals")
                            .priority("medium")
                            .time(rs.getDate("NgayHen") != null ? 
                                  rs.getDate("NgayHen").toString() : "Hôm nay")
                            .tag("Lịch hẹn")
                            .build());
                    return null;
                }
        );

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
