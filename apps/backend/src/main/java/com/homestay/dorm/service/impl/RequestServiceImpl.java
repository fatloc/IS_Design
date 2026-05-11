package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateYeuCauRequest;
import com.homestay.dorm.dto.request.ThanhVienDto;
import com.homestay.dorm.dto.request.UpdateYeuCauRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.ThanhVienNhom;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.repository.ThanhVienNhomRepository;
import com.homestay.dorm.repository.YeuCauDangKyRepository;
import com.homestay.dorm.service.RequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private static final String DEFAULT_REQUEST_STATUS = "Yêu cầu mới";

    private final YeuCauDangKyRepository yeuCauRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;

    @Override
    public ApiListResponse<YeuCauDangKy> getRequests(int page, int size, String nhanVienPhuTrach, String trangThaiYeuCau, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<YeuCauDangKy> yeuCauPage;

        boolean hasNhanVien = nhanVienPhuTrach != null && !nhanVienPhuTrach.isEmpty();
        boolean hasTrangThai = trangThaiYeuCau != null && !trangThaiYeuCau.isEmpty();
        boolean hasSearch = search != null && !search.isEmpty();

        if (hasSearch) {
            if (hasNhanVien && hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndTrangThaiYeuCauAndKhachHangYeuCauContaining(nhanVienPhuTrach, trangThaiYeuCau, search, pageable);
            } else if (hasNhanVien) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndKhachHangYeuCauContaining(nhanVienPhuTrach, search, pageable);
            } else if (hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByTrangThaiYeuCauAndKhachHangYeuCauContaining(trangThaiYeuCau, search, pageable);
            } else {
                yeuCauPage = yeuCauRepository.findByKhachHangYeuCauContaining(search, pageable);
            }
        } else {
            if (hasNhanVien && hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndTrangThaiYeuCau(nhanVienPhuTrach, trangThaiYeuCau, pageable);
            } else if (hasNhanVien) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrach(nhanVienPhuTrach, pageable);
            } else if (hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByTrangThaiYeuCau(trangThaiYeuCau, pageable);
            } else {
                yeuCauPage = yeuCauRepository.findAll(pageable);
            }
        }

        return ApiListResponse.fromPage(yeuCauPage);
    }

    @Override
    public YeuCauDangKy getRequestById(String maYeuCau) {
        return yeuCauRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu: " + maYeuCau));
    }

    @Transactional
    @Override
    public YeuCauDangKy createRequest(CreateYeuCauRequest req) {
        // Validate thoiHanThue
        if (req.getThoiHanThue() != null) {
            Set<Integer> validValues = Set.of(1, 3, 6);
            if (!validValues.contains(req.getThoiHanThue())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Thời hạn thuê phải là 1, 3 hoặc 6 tháng");
            }
        }

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
                .thoiHanThue(req.getThoiHanThue())
                .ngayTao(java.time.LocalDate.now())
                .maPhongDeXuat(req.getMaPhongDeXuat())
                .build();

        yeuCauRepository.save(yeuCau);

        // Lưu thành viên nhóm
        if (req.getThanhVienList() != null && !req.getThanhVienList().isEmpty()) {
            for (ThanhVienDto tvDto : req.getThanhVienList()) {
                String tvId = String.format("TV%03d", new java.util.Random().nextInt(1000));
                ThanhVienNhom tv = ThanhVienNhom.builder()
                        .maThanhVien(tvId)
                        .hoTen(tvDto.hoTen())
                        .soDienThoai(tvDto.soDienThoai())
                        .phai(tvDto.phai())
                        .cccd(tvDto.cccd())
                        .quocTich(tvDto.quocTich())
                        .maYeuCau(yeuCau.getMaYeuCau())
                        .maHopDongThue(null)
                        .nguoiDaiDien(null)
                        .build();
                thanhVienNhomRepository.save(tv);
            }
        }

        return yeuCau;
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
