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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private static final String DEFAULT_REQUEST_STATUS = "Yêu cầu mới";

    private final YeuCauDangKyRepository yeuCauRepository;

    @Override
    public ApiListResponse<YeuCauDangKy> getRequests(int page, int size, String nhanVienPhuTrach, String trangThaiYeuCau) {
        Pageable pageable = PageRequest.of(page, size);
        Page<YeuCauDangKy> yeuCauPage;

        boolean hasNhanVien = nhanVienPhuTrach != null && !nhanVienPhuTrach.isEmpty();
        boolean hasTrangThai = trangThaiYeuCau != null && !trangThaiYeuCau.isEmpty();

        if (hasNhanVien && hasTrangThai) {
            yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndTrangThaiYeuCau(nhanVienPhuTrach, trangThaiYeuCau, pageable);
        } else if (hasNhanVien) {
            yeuCauPage = yeuCauRepository.findByNhanVienPhuTrach(nhanVienPhuTrach, pageable);
        } else if (hasTrangThai) {
            yeuCauPage = yeuCauRepository.findByTrangThaiYeuCau(trangThaiYeuCau, pageable);
        } else {
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
