package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.entity.LichXemPhong;
import com.homestay.dorm.repository.*;
import com.homestay.dorm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PhongRepository phongRepository;
    private final YeuCauDangKyRepository yeuCauDangKyRepository;
    private final LichXemPhongRepository lichXemPhongRepository;
    private final PhieuThanhToanRepository phieuThanhToanRepository;
    private final HoSoDatCocRepository hoSoDatCocRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;

    // ── Scheduled cache eviction mỗi 30 giây ──────────────────────────────
    @Scheduled(fixedRate = 30_000)
    @CacheEvict(value = {"dashboardStats", "saleDashboardStats"}, allEntries = true)
    public void evictDashboardCaches() {
        log.debug("♻ Dashboard cache evicted (scheduled every 30s)");
    }

    @Override
    @Cacheable(value = "dashboardStats")
    public DashboardResponse getDashboardStats() {
        long startTime = System.currentTimeMillis();
        
        // Chạy song song 7 tác vụ truy vấn DB
        CompletableFuture<Long> totalRoomsFuture = CompletableFuture.supplyAsync(() -> phongRepository.count());
        CompletableFuture<List<Object[]>> statusCountsFuture = CompletableFuture.supplyAsync(() -> phongRepository.countRoomsByStatus());
        CompletableFuture<Long> pendingRequestsFuture = CompletableFuture.supplyAsync(() -> yeuCauDangKyRepository.count());
        CompletableFuture<Long> pendingAppointmentsFuture = CompletableFuture.supplyAsync(() -> lichXemPhongRepository.count());
        CompletableFuture<Long> pendingTransactionsFuture = CompletableFuture.supplyAsync(() -> phieuThanhToanRepository.count());

        CompletableFuture<List<DashboardResponse.DashboardTask>> reqTasksFuture = CompletableFuture.supplyAsync(() -> {
            List<DashboardResponse.DashboardTask> list = new ArrayList<>();
            yeuCauDangKyRepository.findAll(PageRequest.of(0, 3)).forEach(req -> {
                list.add(DashboardResponse.DashboardTask.builder()
                        .id("req-" + req.getMaYeuCau())
                        .title("Duyệt hồ sơ thuê phòng")
                        .desc("Khách hàng: " + req.getKhachHangYeuCau() + " · Khu vực: " + req.getKhuVuc())
                        .source("approvals")
                        .priority("high")
                        .time(req.getThoiGianBatDauThueDuKien() != null ? req.getThoiGianBatDauThueDuKien().toString() : "Mới")
                        .tag("Duyệt thuê")
                        .build());
            });
            return list;
        });

        CompletableFuture<List<DashboardResponse.DashboardTask>> appTasksFuture = CompletableFuture.supplyAsync(() -> {
            List<DashboardResponse.DashboardTask> list = new ArrayList<>();
            lichXemPhongRepository.findAll(PageRequest.of(0, 2)).forEach(app -> {
                list.add(DashboardResponse.DashboardTask.builder()
                        .id("app-" + app.getMaLichHen())
                        .title("Lịch xem phòng khách hàng")
                        .desc("Khách hàng đang chờ xác nhận lịch hẹn #" + app.getMaLichHen())
                        .source("approvals")
                        .priority("medium")
                        .time(app.getNgayHen() != null ? app.getNgayHen().toString() : "Hôm nay")
                        .tag("Lịch hẹn")
                        .build());
            });
            return list;
        });

        // Đợi tất cả 7 luồng cùng hoàn thành
        CompletableFuture.allOf(totalRoomsFuture, statusCountsFuture, pendingRequestsFuture, 
                pendingAppointmentsFuture, pendingTransactionsFuture, reqTasksFuture, appTasksFuture).join();

        // Thu thập kết quả
        long totalRooms = totalRoomsFuture.join();
        long pendingRequests = pendingRequestsFuture.join();
        long pendingAppointments = pendingAppointmentsFuture.join();
        long pendingTransactions = pendingTransactionsFuture.join();

        Map<String, Long> roomStatusCounts = new HashMap<>();
        String[] statuses = {"Trống", "Đang có người", "Đã đặt cọc", "Đang bảo trì"};
        for (String s : statuses) {
            roomStatusCounts.put(s, 0L);
        }
        for (Object[] result : statusCountsFuture.join()) {
            String status = (String) result[0];
            Long count = (Long) result[1];
            if (roomStatusCounts.containsKey(status)) {
                roomStatusCounts.put(status, count);
            }
        }

        List<DashboardResponse.DashboardTask> tasks = new ArrayList<>();
        tasks.addAll(reqTasksFuture.join());
        tasks.addAll(appTasksFuture.join());

        double revenue = 47800000.0;

        DashboardResponse response = DashboardResponse.builder()
                .totalRooms(totalRooms)
                .roomStatusCounts(roomStatusCounts)
                .pendingRequests(pendingRequests)
                .pendingAppointments(pendingAppointments)
                .pendingTransactions(pendingTransactions)
                .monthlyRevenue(revenue)
                .urgentTasks(tasks)
                .build();
                
        long endTime = System.currentTimeMillis();
        log.info("⏱ [Performance] Dashboard stats loaded in {} ms (will be cached for 30s)", (endTime - startTime));
        
        return response;
    }

    @Override
    @Cacheable(value = "saleDashboardStats")
    public com.homestay.dorm.dto.response.SaleDashboardResponse getSaleDashboardStats() {
        long startTime = System.currentTimeMillis();
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        // 1. Chạy song song các query đếm và lấy data hiển thị
        CompletableFuture<List<Object[]>> statusCountsFuture = CompletableFuture.supplyAsync(() -> yeuCauDangKyRepository.countByStatus());
        CompletableFuture<List<Object[]>> genderCountsFuture = CompletableFuture.supplyAsync(() -> yeuCauDangKyRepository.countByGender());
        CompletableFuture<List<Object[]>> rentalModeCountsFuture = CompletableFuture.supplyAsync(() -> yeuCauDangKyRepository.countByRentalMode());
        
        CompletableFuture<Long> appsTodayFuture = CompletableFuture.supplyAsync(() -> lichXemPhongRepository.countByNgayHen(today));
        CompletableFuture<Long> appsYesterdayFuture = CompletableFuture.supplyAsync(() -> lichXemPhongRepository.countByNgayHen(yesterday));
        
        CompletableFuture<Long> depositsTodayFuture = CompletableFuture.supplyAsync(() -> hoSoDatCocRepository.countByNgayLap(today));
        CompletableFuture<Long> depositsYesterdayFuture = CompletableFuture.supplyAsync(() -> hoSoDatCocRepository.countByNgayLap(yesterday));

        // Lấy danh sách con nhỏ để hiển thị
        CompletableFuture<List<YeuCauDangKy>> pendingListFuture = CompletableFuture.supplyAsync(() -> 
                yeuCauDangKyRepository.findByTrangThaiYeuCau("Yêu cầu mới", PageRequest.of(0, 5, org.springframework.data.domain.Sort.by("maYeuCau").descending())).getContent());
                
        CompletableFuture<List<LichXemPhong>> todayAppsListFuture = CompletableFuture.supplyAsync(() -> 
                lichXemPhongRepository.findByNgayHen(today, PageRequest.of(0, 10)).getContent());

        // Đợi tất cả hoàn thành
        CompletableFuture.allOf(statusCountsFuture, genderCountsFuture, rentalModeCountsFuture, 
                appsTodayFuture, appsYesterdayFuture, depositsTodayFuture, depositsYesterdayFuture,
                pendingListFuture, todayAppsListFuture).join();

        // 2. Thu thập và map kết quả thống kê
        Map<String, Long> requestStatusCounts = new HashMap<>();
        statusCountsFuture.join().forEach(r -> {
            String dbStatus = (String) r[0];
            Long count = (Long) r[1];
            String dashStatus = toDashStatus(dbStatus);
            requestStatusCounts.put(dashStatus, requestStatusCounts.getOrDefault(dashStatus, 0L) + count);
        });

        Map<String, Long> requestGenderCounts = new HashMap<>();
        genderCountsFuture.join().forEach(r -> {
            String gender = "Any";
            if ("Nam".equalsIgnoreCase((String)r[0])) gender = "Male";
            else if ("Nữ".equalsIgnoreCase((String)r[0])) gender = "Female";
            requestGenderCounts.put(gender, (Long)r[1]);
        });

        Map<String, Long> requestRentalModeCounts = new HashMap<>();
        rentalModeCountsFuture.join().forEach(r -> {
            requestRentalModeCounts.put((String)r[0], (Long)r[1]);
        });

        // 3. Resolve tên khách hàng và nhân viên một cách hiệu quả (vừa sửa lỗi compile vừa tối ưu DB)
        List<YeuCauDangKy> pendingList = pendingListFuture.join();
        List<LichXemPhong> todayAppsList = todayAppsListFuture.join();

        java.util.Set<String> cIds = new java.util.HashSet<>();
        pendingList.forEach(r -> { if(r.getKhachHangYeuCau() != null) cIds.add(r.getKhachHangYeuCau()); });
        todayAppsList.forEach(a -> { if(a.getKhachHangXem() != null) cIds.add(a.getKhachHangXem()); });

        java.util.Set<String> eIds = new java.util.HashSet<>();
        todayAppsList.forEach(a -> { if(a.getNhanVienPhuTrach() != null) eIds.add(a.getNhanVienPhuTrach()); });

        Map<String, String> cNames = khachHangRepository.findAllById(cIds).stream()
                .collect(Collectors.toMap(com.homestay.dorm.entity.KhachHang::getMaKhachHang, 
                         c -> c.getHoTen() != null ? c.getHoTen() : ""));
        Map<String, String> eNames = nhanVienRepository.findAllById(eIds).stream()
                .collect(Collectors.toMap(com.homestay.dorm.entity.NhanVien::getMaNhanVien, 
                         e -> e.getHoTen() != null ? e.getHoTen() : ""));

        // 4. Map DTOs cho Requests
        List<com.homestay.dorm.dto.response.SaleDashboardResponse.RequestDto> visiblePendingRequests = pendingList.stream()
                .map(r -> {
                    String rMode = (r.getSoLuongNguoi() != null && r.getSoLuongNguoi() > 1) ? "Whole Room" : "Shared Bed";
                    String budgetStr = r.getMucGiaMongMuon() != null ? String.format("%.1fM", r.getMucGiaMongMuon().doubleValue() / 1000000.0) : "—";
                    return com.homestay.dorm.dto.response.SaleDashboardResponse.RequestDto.builder()
                            .id(r.getMaYeuCau())
                            .date(r.getThoiGianBatDauThueDuKien() != null ? r.getThoiGianBatDauThueDuKien().toString() : "")
                            .clientName(cNames.getOrDefault(r.getKhachHangYeuCau(), "Khách hàng"))
                            .phone("--")
                            .rentalMode(rMode)
                            .headcount(r.getSoLuongNguoi() != null ? r.getSoLuongNguoi() : 1)
                            .gender("Nam".equalsIgnoreCase(r.getGioiTinhYeuCau()) ? "Male" : "Female")
                            .budget(budgetStr)
                            .status("Pending")
                            .note(r.getCacTieuChiKhac() != null ? r.getCacTieuChiKhac() : "")
                            .build();
                }).collect(Collectors.toList());

        // 5. Map DTOs cho Appointments
        List<com.homestay.dorm.dto.response.SaleDashboardResponse.AppointmentDto> todayApps = todayAppsList.stream()
                .map(a -> {
                    String dashStatus = "Đã xem".equalsIgnoreCase(a.getTrangThaiHen()) ? "Shown" :
                                       "Đã hủy".equalsIgnoreCase(a.getTrangThaiHen()) ? "Cancelled" : "Pending";
                    return com.homestay.dorm.dto.response.SaleDashboardResponse.AppointmentDto.builder()
                            .id(a.getMaLichHen())
                            .time(a.getThoiGianHen() != null ? a.getThoiGianHen().toString().substring(0,5) : "--:--")
                            .clientName(cNames.getOrDefault(a.getKhachHangXem(), "Khách hàng"))
                            .rentalMode("Shared Bed")
                            .targetAssetLabel("Phòng " + (a.getMaPhong() != null ? a.getMaPhong() : "--"))
                            .staffName(eNames.getOrDefault(a.getNhanVienPhuTrach(), "--"))
                            .status(dashStatus)
                            .notes("")
                            .build();
                }).collect(Collectors.toList());

        long endTime = System.currentTimeMillis();
        log.info("⏱ [Performance] Sale Dashboard stats loaded in {} ms (will be cached for 30s)", (endTime - startTime));

        return com.homestay.dorm.dto.response.SaleDashboardResponse.builder()
                .requestStatusCounts(requestStatusCounts)
                .requestRentalModeCounts(requestRentalModeCounts)
                .depositedByRentalModeCounts(new HashMap<>()) // Sẽ cập nhật thêm nếu cần cụ thể theo mode
                .requestGenderCounts(requestGenderCounts)
                .todayAppointments(todayApps)
                .visiblePendingRequests(visiblePendingRequests)
                .pendingRequestsCount(requestStatusCounts.getOrDefault("Pending", 0L) + requestStatusCounts.getOrDefault("Scheduled", 0L))
                .depositedTodayCount(depositsTodayFuture.join())
                .yesterdayAppointmentsCount(appsYesterdayFuture.join())
                .yesterdayDepositsCount(depositsYesterdayFuture.join())
                .build();
    }

    private String toDashStatus(String status) {
        if (status == null) return "Pending";
        switch (status.trim()) {
            case "Yêu cầu mới": return "Pending";
            case "Đã lên lịch xem": return "Scheduled";
            case "Đã xem phòng": return "Shown";
            case "Đặt cọc thành công": return "Deposited";
            case "Đã hủy": return "Cancelled";
            default: return "Pending";
        }
    }
}
