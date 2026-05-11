package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateYeuCauRequest;
import com.homestay.dorm.dto.request.UpdateYeuCauRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.repository.YeuCauDangKyRepository;
import com.homestay.dorm.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private static final Logger log = LoggerFactory.getLogger(RequestServiceImpl.class);
    private static final String DEFAULT_REQUEST_STATUS = "Yêu cầu mới";
    private static final java.time.ZoneId VN_ZONE = java.time.ZoneId.of("Asia/Ho_Chi_Minh");

    private final YeuCauDangKyRepository yeuCauRepository;
    private final com.homestay.dorm.repository.ThanhVienNhomRepository thanhVienRepository;

    @Override
    public ApiListResponse<YeuCauDangKy> getRequests(int page, int size, String nhanVienPhuTrach, String trangThaiYeuCau, String ngayTao, String thang, String search) {
        // Sorting is handled inside Repository @Query for ABS(DATEDIFF)
        Pageable pageable = PageRequest.of(page, size);
        
        Page<YeuCauDangKy> yeuCauPage;

        boolean hasNhanVien = nhanVienPhuTrach != null && !nhanVienPhuTrach.isEmpty();
        boolean hasTrangThai = trangThaiYeuCau != null && !trangThaiYeuCau.isEmpty();
        boolean hasNgayTao = ngayTao != null && !ngayTao.isEmpty();
        boolean hasThang = thang != null && !thang.isEmpty();

        // Parse ngayTao if provided (format: YYYY-MM-DD)
        LocalDate ngayTaoDate = null;
        if (hasNgayTao) {
            try {
                ngayTaoDate = LocalDate.parse(ngayTao);
            } catch (Exception e) {
                throw new RuntimeException("Invalid date format for ngayTao. Expected: YYYY-MM-DD");
            }
        }

        // Parse thang if provided (format: YYYY-MM)
        Integer year = null;
        Integer month = null;
        if (hasThang) {
            try {
                String[] parts = thang.split("-");
                year = Integer.parseInt(parts[0]);
                month = Integer.parseInt(parts[1]);
            } catch (Exception e) {
                throw new RuntimeException("Invalid month format. Expected: YYYY-MM");
            }
        }

        // Apply filters based on provided parameters
        if (hasThang) {
            // Filter by month
            yeuCauPage = yeuCauRepository.findByFiltersAndMonthWithSearch(
                hasNhanVien ? nhanVienPhuTrach : null,
                hasTrangThai ? trangThaiYeuCau : null,
                year,
                month,
                search,
                pageable
            );
        } else {
            // Filter by specific date and/or other filters and/or search
            yeuCauPage = yeuCauRepository.findByFiltersWithSearch(
                hasNhanVien ? nhanVienPhuTrach : null,
                hasTrangThai ? trangThaiYeuCau : null,
                ngayTaoDate,
                search,
                pageable
            );
        }

        yeuCauPage.forEach(req -> {
            boolean overdue = false;
            if ("Yêu cầu mới".equals(req.getTrangThaiYeuCau()) && req.getThoiGianBatDauThueDuKien() != null) {
                if (req.getThoiGianBatDauThueDuKien().isBefore(LocalDate.now(VN_ZONE))) {
                    overdue = true;
                }
            }
            req.setIsOverdue(overdue);
        });

        return ApiListResponse.fromPage(yeuCauPage);
    }

    @Override
    public YeuCauDangKy getRequestById(String maYeuCau) {
        return yeuCauRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu: " + maYeuCau));
    }

    @Override
    @Transactional
    public YeuCauDangKy createRequest(CreateYeuCauRequest req) {
        log.info("Bắt đầu tạo yêu cầu thuê mới cho khách hàng ID: {}", req.getKhachHangYeuCau());
        String newId = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        
        YeuCauDangKy yeuCau = YeuCauDangKy.builder()
                .maYeuCau(newId)
                .ngayTao(LocalDate.now(VN_ZONE)) // Auto-set creation date (VN Time)
                .soLuongNguoi(req.getSoLuongNguoi())
                .gioiTinhYeuCau(req.getGioiTinhYeuCau())
                .thoiGianBatDauThueDuKien(req.getThoiGianBatDauThueDuKien())
                .thoiGianBanGiaoPhongDuKien(req.getThoiGianBanGiaoPhongDuKien())
                .coDieuHoa(req.getCoDieuHoa())
                .khuVuc(req.getKhuVuc())
                .mucGiaMongMuon(req.getMucGiaMongMuon())
                .coBaiGuiXe(req.getCoBaiGuiXe())
                .cacTieuChiKhac(req.getCacTieuChiKhac())
                .khachHangYeuCau(req.getKhachHangYeuCau())
                .nhanVienPhuTrach(req.getNhanVienPhuTrach())
                .trangThaiYeuCau(req.getTrangThaiYeuCau() != null ? req.getTrangThaiYeuCau() : DEFAULT_REQUEST_STATUS)
                .build();
        
        log.info("Dự kiến lưu yêu cầu với ID: {}", newId);
        YeuCauDangKy saved = yeuCauRepository.save(yeuCau);

        // Lưu danh sách thành viên nhóm nếu có
        if (req.getDanhSachThanhVien() != null && !req.getDanhSachThanhVien().isEmpty()) {
            for (com.homestay.dorm.dto.request.ThanhVienRequest tvReq : req.getDanhSachThanhVien()) {
                String tvId = "TV" + UUID.randomUUID().toString().replace("-", "").substring(0, 3).toUpperCase();
                com.homestay.dorm.entity.ThanhVienNhom tv = com.homestay.dorm.entity.ThanhVienNhom.builder()
                        .maThanhVien(tvId)
                        .hoTen(tvReq.getHoTen())
                        .cccd(tvReq.getCccd())
                        .soDienThoai(tvReq.getSoDienThoai())
                        .phai(tvReq.getPhai())
                        .quocTich(tvReq.getQuocTich())
                        .maYeuCau(saved.getMaYeuCau())
                        .nguoiDaiDien(saved.getKhachHangYeuCau())
                        .build();
                thanhVienRepository.save(tv);
            }
        }

        log.info("Đã lưu thành công yêu cầu: {} vào database.", saved.getMaYeuCau());
        return saved;
    }

    @Override
    public YeuCauDangKy updateRequest(String maYeuCau, UpdateYeuCauRequest req) {
        YeuCauDangKy yeuCau = getRequestById(maYeuCau);
        
        if (req.getSoLuongNguoi() != null) yeuCau.setSoLuongNguoi(req.getSoLuongNguoi());
        if (req.getGioiTinhYeuCau() != null) yeuCau.setGioiTinhYeuCau(req.getGioiTinhYeuCau());
        if (req.getThoiGianBatDauThueDuKien() != null) yeuCau.setThoiGianBatDauThueDuKien(req.getThoiGianBatDauThueDuKien());
        if (req.getThoiGianBanGiaoPhongDuKien() != null) yeuCau.setThoiGianBanGiaoPhongDuKien(req.getThoiGianBanGiaoPhongDuKien());
        if (req.getCoDieuHoa() != null) yeuCau.setCoDieuHoa(req.getCoDieuHoa());
        if (req.getKhuVuc() != null) yeuCau.setKhuVuc(req.getKhuVuc());
        if (req.getMucGiaMongMuon() != null) yeuCau.setMucGiaMongMuon(req.getMucGiaMongMuon());
        if (req.getCoBaiGuiXe() != null) yeuCau.setCoBaiGuiXe(req.getCoBaiGuiXe());
        if (req.getCacTieuChiKhac() != null) yeuCau.setCacTieuChiKhac(req.getCacTieuChiKhac());
        if (req.getNhanVienPhuTrach() != null) yeuCau.setNhanVienPhuTrach(req.getNhanVienPhuTrach());
        if (req.getTrangThaiYeuCau() != null) yeuCau.setTrangThaiYeuCau(req.getTrangThaiYeuCau());
        
        return yeuCauRepository.save(yeuCau);
    }

    @Override
    public void deleteRequest(String maYeuCau) {
        YeuCauDangKy yeuCau = getRequestById(maYeuCau);
        yeuCauRepository.delete(yeuCau);
    }

    @Override
    public Map<String, Long> getRequestStatusCounts() {
        List<Object[]> results = yeuCauRepository.countByStatus();
        return results.stream().collect(Collectors.toMap(
            r -> r[0] != null ? r[0].toString().trim() : "Pending",
            r -> (Long) r[1]
        ));
    }
}
