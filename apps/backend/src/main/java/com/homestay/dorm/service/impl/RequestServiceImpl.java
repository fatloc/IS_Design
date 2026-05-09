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

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private static final String DEFAULT_REQUEST_STATUS = "Yêu cầu mới";

    private final YeuCauDangKyRepository yeuCauRepository;

    @Override
    public ApiListResponse<YeuCauDangKy> getRequests(int page, int size, String nhanVienPhuTrach, String trangThaiYeuCau, String ngayTao, String thang) {
        // Sort by ngayTao DESC (newest first)
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
            org.springframework.data.domain.Sort.Direction.DESC, "ngayTao"
        ));
        
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
            yeuCauPage = yeuCauRepository.findByFiltersAndMonth(
                hasNhanVien ? nhanVienPhuTrach : null,
                hasTrangThai ? trangThaiYeuCau : null,
                year,
                month,
                pageable
            );
        } else if (hasNgayTao || hasNhanVien || hasTrangThai) {
            // Filter by specific date and/or other filters
            yeuCauPage = yeuCauRepository.findByFilters(
                hasNhanVien ? nhanVienPhuTrach : null,
                hasTrangThai ? trangThaiYeuCau : null,
                ngayTaoDate,
                pageable
            );
        } else {
            // No filters - return all with sorting
            yeuCauPage = yeuCauRepository.findAll(pageable);
        }

        return ApiListResponse.fromPage(yeuCauPage);
    }

    @Override
    public YeuCauDangKy getRequestById(String maYeuCau) {
        return yeuCauRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu: " + maYeuCau));
    }

    @Override
    public YeuCauDangKy createRequest(CreateYeuCauRequest req) {
        String newId = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        
        YeuCauDangKy yeuCau = YeuCauDangKy.builder()
                .maYeuCau(newId)
                .ngayTao(LocalDate.now()) // Auto-set creation date
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
                
        return yeuCauRepository.save(yeuCau);
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
}
