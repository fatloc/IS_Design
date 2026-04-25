package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateDepositRequest;
import com.homestay.dorm.dto.request.UpdateDepositRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HoSoDatCoc;
import com.homestay.dorm.repository.HoSoDatCocRepository;
import com.homestay.dorm.service.DepositService;
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
public class DepositServiceImpl implements DepositService {

    private final HoSoDatCocRepository repository;

    @Override
    public ApiListResponse<HoSoDatCoc> getDeposits(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HoSoDatCoc> pageData = repository.findAll(pageable);
        return ApiListResponse.ok(pageData.getContent(), pageData.getTotalElements());
    }

    @Override
    public HoSoDatCoc getDepositById(String maHoSoDatCoc) {
        return repository.findById(maHoSoDatCoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Hồ sơ đặt cọc: " + maHoSoDatCoc));
    }

    @Override
    public HoSoDatCoc createDeposit(CreateDepositRequest req) {
        String newId = "DC" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        
        HoSoDatCoc deposit = new HoSoDatCoc();
        deposit.setMaVanBan(newId);
        deposit.setLoaiVanBan(req.getLoaiVanBan() != null ? req.getLoaiVanBan() : "[STATUS:Pending Approval]");
        deposit.setNgayLap(req.getNgayLap() != null ? req.getNgayLap() : LocalDate.now());
        deposit.setGioLap(req.getGioLap() != null ? req.getGioLap() : LocalTime.now());
        deposit.setChiNhanh(req.getChiNhanh());
        deposit.setNhanVienLap(req.getNhanVienLap());
        deposit.setKhachHangSoHuu(req.getKhachHangSoHuu());
        deposit.setMucTienCoc(req.getMucTienCoc());
        
        return repository.save(deposit);
    }

    @Override
    public HoSoDatCoc updateDeposit(String maHoSoDatCoc, UpdateDepositRequest req) {
        HoSoDatCoc deposit = getDepositById(maHoSoDatCoc);
        
        if (req.getLoaiVanBan() != null) deposit.setLoaiVanBan(req.getLoaiVanBan());
        if (req.getNgayLap() != null) deposit.setNgayLap(req.getNgayLap());
        if (req.getGioLap() != null) deposit.setGioLap(req.getGioLap());
        if (req.getChiNhanh() != null) deposit.setChiNhanh(req.getChiNhanh());
        if (req.getNhanVienLap() != null) deposit.setNhanVienLap(req.getNhanVienLap());
        if (req.getKhachHangSoHuu() != null) deposit.setKhachHangSoHuu(req.getKhachHangSoHuu());
        if (req.getMucTienCoc() != null) deposit.setMucTienCoc(req.getMucTienCoc());
        
        return repository.save(deposit);
    }

    @Override
    public void deleteDeposit(String maHoSoDatCoc) {
        HoSoDatCoc deposit = getDepositById(maHoSoDatCoc);
        repository.delete(deposit);
    }
}
