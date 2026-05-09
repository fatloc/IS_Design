package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.DashboardResponse;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.entity.LichXemPhong;
import com.homestay.dorm.repository.*;
import com.homestay.dorm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PhongRepository phongRepository;
    private final YeuCauDangKyRepository yeuCauDangKyRepository;
    private final LichXemPhongRepository lichXemPhongRepository;
    private final PhieuThanhToanRepository phieuThanhToanRepository;

    @Override
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
        log.info("⏱ [Performance] Dashboard stats loaded in {} ms", (endTime - startTime));
        
        return response;
    }
}
