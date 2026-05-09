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
import java.util.*;
import java.util.stream.Collectors;

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

    @Override
    public com.homestay.dorm.dto.response.SaleDashboardResponse getSaleDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        List<YeuCauDangKy> requests = yeuCauDangKyRepository.findAll();
        List<LichXemPhong> appointments = lichXemPhongRepository.findAll();
        List<com.homestay.dorm.entity.HoSoDatCoc> deposits = hoSoDatCocRepository.findAll();
        
        Map<String, String> customerMap = khachHangRepository.findAll().stream()
                .collect(Collectors.toMap(com.homestay.dorm.entity.KhachHang::getMaKhachHang, 
                         c -> c.getHoTen() != null ? c.getHoTen() : ""));
        Map<String, String> employeeMap = nhanVienRepository.findAll().stream()
                .collect(Collectors.toMap(com.homestay.dorm.entity.NhanVien::getMaNhanVien, 
                         e -> e.getHoTen() != null ? e.getHoTen() : ""));

        // Helper to map DB request status to Sale dashboard status
        java.util.function.Function<String, String> toDashboardStatus = (status) -> {
            if (status == null) return "Pending";
            switch (status.trim()) {
                case "Yêu cầu mới": return "Pending";
                case "Đã lên lịch xem": return "Scheduled";
                case "Đã xem phòng": return "Shown";
                case "Đặt cọc thành công": return "Deposited";
                case "Đã hủy": return "Cancelled";
                default: return "Pending";
            }
        };

        // Map requests to DTO and counts
        Map<String, Long> requestStatusCounts = new HashMap<>();
        Map<String, Long> requestRentalModeCounts = new HashMap<>();
        Map<String, Long> requestGenderCounts = new HashMap<>();
        List<com.homestay.dorm.dto.response.SaleDashboardResponse.RequestDto> mappedRequests = new ArrayList<>();

        for (YeuCauDangKy r : requests) {
            String dbStatus = r.getTrangThaiYeuCau();
            String dashStatus = toDashboardStatus.apply(dbStatus);
            requestStatusCounts.put(dashStatus, requestStatusCounts.getOrDefault(dashStatus, 0L) + 1);

            String rMode = (r.getSoLuongNguoi() != null && r.getSoLuongNguoi() > 1) ? "Whole Room" : "Shared Bed";
            requestRentalModeCounts.put(rMode, requestRentalModeCounts.getOrDefault(rMode, 0L) + 1);

            String gender = "Any";
            if ("Nam".equalsIgnoreCase(r.getGioiTinhYeuCau())) gender = "Male";
            else if ("Nữ".equalsIgnoreCase(r.getGioiTinhYeuCau())) gender = "Female";
            requestGenderCounts.put(gender, requestGenderCounts.getOrDefault(gender, 0L) + 1);

            String budgetStr = "Chưa cập nhật";
            if (r.getMucGiaMongMuon() != null) {
                budgetStr = String.format("%.1fM", r.getMucGiaMongMuon().doubleValue() / 1000000.0);
            }
            
            String clientName = customerMap.getOrDefault(r.getKhachHangYeuCau(), r.getKhachHangYeuCau());

            mappedRequests.add(com.homestay.dorm.dto.response.SaleDashboardResponse.RequestDto.builder()
                    .id(r.getMaYeuCau())
                    .date(r.getThoiGianBatDauThueDuKien() != null ? r.getThoiGianBatDauThueDuKien().toString() : "")
                    .clientName(clientName != null ? clientName : "Khách hàng")
                    .phone("--") // Not pulling all phones now for speed
                    .rentalMode(rMode)
                    .headcount(r.getSoLuongNguoi() != null ? r.getSoLuongNguoi() : 1)
                    .gender(gender)
                    .budget(budgetStr)
                    .status(dashStatus)
                    .note(r.getCacTieuChiKhac() != null ? r.getCacTieuChiKhac() : "")
                    .criteria(r.getCacTieuChiKhac() != null ? List.of(r.getCacTieuChiKhac()) : List.of())
                    .build());
        }

        List<com.homestay.dorm.dto.response.SaleDashboardResponse.RequestDto> pendingList = mappedRequests.stream()
                .filter(r -> "Pending".equals(r.getStatus()))
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
        List<com.homestay.dorm.dto.response.SaleDashboardResponse.RequestDto> visiblePendingRequests = 
                pendingList.size() > 5 ? pendingList.subList(0, 5) : pendingList;

        // Appointments
        List<com.homestay.dorm.dto.response.SaleDashboardResponse.AppointmentDto> todayApps = new ArrayList<>();
        long yesterdayAppointmentsCount = 0;

        for (LichXemPhong a : appointments) {
            if (today.equals(a.getNgayHen())) {
                String cName = customerMap.getOrDefault(a.getKhachHangXem(), a.getKhachHangXem());
                String eName = employeeMap.getOrDefault(a.getNhanVienPhuTrach(), a.getNhanVienPhuTrach());
                String dashStatus = "Đã xem".equalsIgnoreCase(a.getTrangThaiHen()) ? "Shown" :
                                   "Đã hủy".equalsIgnoreCase(a.getTrangThaiHen()) ? "Cancelled" : "Pending";

                todayApps.add(com.homestay.dorm.dto.response.SaleDashboardResponse.AppointmentDto.builder()
                        .id(a.getMaLichHen())
                        .time(a.getThoiGianHen() != null ? a.getThoiGianHen().toString().substring(0,5) : "--:--")
                        .clientName(cName != null ? cName : "Khách hàng")
                        .rentalMode("Shared Bed")
                        .targetAssetLabel("Lịch hẹn " + a.getMaLichHen())
                        .staffName(eName != null ? eName : "--")
                        .status(dashStatus)
                        .notes("")
                        .build());
            } else if (yesterday.equals(a.getNgayHen())) {
                yesterdayAppointmentsCount++;
            }
        }

        // Deposits
        long depositedTodayCount = 0;
        long yesterdayDepositsCount = 0;
        // In the mock earlier, mapped deposits count used HoSoDatCoc.ngayLap or ChungTu.ngayLap
        Map<String, Long> depositedByRentalModeCounts = new HashMap<>(); // Usually mapping deposit -> request is needed
        
        for (com.homestay.dorm.entity.HoSoDatCoc d : deposits) {
            LocalDate dDate = d.getNgayLap();
            if (today.equals(dDate)) {
                depositedTodayCount++;
                // Check if it belongs to a whole room or shared bed. Defaults to Shared Bed.
                depositedByRentalModeCounts.put("Shared Bed", depositedByRentalModeCounts.getOrDefault("Shared Bed", 0L) + 1);
            } else if (yesterday.equals(dDate)) {
                yesterdayDepositsCount++;
            }
        }

        return com.homestay.dorm.dto.response.SaleDashboardResponse.builder()
                .requestStatusCounts(requestStatusCounts)
                .requestRentalModeCounts(requestRentalModeCounts)
                .depositedByRentalModeCounts(depositedByRentalModeCounts)
                .requestGenderCounts(requestGenderCounts)
                .todayAppointments(todayApps)
                .visiblePendingRequests(visiblePendingRequests)
                .pendingRequestsCount(requestStatusCounts.getOrDefault("Pending", 0L) + requestStatusCounts.getOrDefault("Scheduled", 0L))
                .depositedTodayCount(depositedTodayCount)
                .yesterdayAppointmentsCount(yesterdayAppointmentsCount)
                .yesterdayDepositsCount(yesterdayDepositsCount)
                .build();
    }
}
