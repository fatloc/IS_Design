package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.repository.HopDongThueRepository;
import com.homestay.dorm.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final HopDongThueRepository repository;

    @Override
    public ApiListResponse<HopDongThue> getContracts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HopDongThue> pageData = repository.findAll(pageable);
        return ApiListResponse.fromPage(pageData);
    }

    @Override
    public HopDongThue getContractById(String maHopDongThue) {
        return repository.findById(maHopDongThue)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Hợp đồng: " + maHopDongThue));
    }

    @Override
    public HopDongThue createContract(CreateContractRequest req) {
        String newId = "HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        
        HopDongThue hk = new HopDongThue();
        hk.setMaVanBan(newId);
        hk.setLoaiVanBan(req.getLoaiVanBan() != null ? req.getLoaiVanBan() : "[STATUS:Active]");
        hk.setNgayLap(req.getNgayLap() != null ? req.getNgayLap() : LocalDate.now());
        hk.setGioLap(req.getGioLap() != null ? req.getGioLap() : LocalTime.now());
        hk.setChiNhanh(req.getChiNhanh());
        hk.setNhanVienLap(req.getNhanVienLap());
        hk.setKhachHangSoHuu(req.getKhachHangSoHuu());
        
        hk.setHinhThucThue(req.getHinhThucThue());
        hk.setKyThanhToan(req.getKyThanhToan());
        hk.setSoLuongThanhVien(req.getSoLuongThanhVien() != null ? req.getSoLuongThanhVien() : 1);
        
        return repository.save(hk);
    }

    @Override
    public HopDongThue updateContract(String maHopDongThue, UpdateContractRequest req) {
        HopDongThue hk = getContractById(maHopDongThue);
        
        if (req.getLoaiVanBan() != null) hk.setLoaiVanBan(req.getLoaiVanBan());
        if (req.getNgayLap() != null) hk.setNgayLap(req.getNgayLap());
        if (req.getGioLap() != null) hk.setGioLap(req.getGioLap());
        if (req.getChiNhanh() != null) hk.setChiNhanh(req.getChiNhanh());
        if (req.getNhanVienLap() != null) hk.setNhanVienLap(req.getNhanVienLap());
        if (req.getKhachHangSoHuu() != null) hk.setKhachHangSoHuu(req.getKhachHangSoHuu());
        
        if (req.getHinhThucThue() != null) hk.setHinhThucThue(req.getHinhThucThue());
        if (req.getKyThanhToan() != null) hk.setKyThanhToan(req.getKyThanhToan());
        if (req.getSoLuongThanhVien() != null) hk.setSoLuongThanhVien(req.getSoLuongThanhVien());
        
        return repository.save(hk);
    }

    @Override
    public void deleteContract(String maHopDongThue) {
        HopDongThue hk = getContractById(maHopDongThue);
        repository.delete(hk);
    }
}
