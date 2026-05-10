package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateTransactionRequest;
import com.homestay.dorm.dto.request.UpdateTransactionRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.PhieuThanhToan;
import com.homestay.dorm.repository.PhieuThanhToanRepository;
import com.homestay.dorm.service.TransactionService;
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
public class TransactionServiceImpl implements TransactionService {

    private final PhieuThanhToanRepository repository;

    @Override
    public ApiListResponse<PhieuThanhToan> getTransactions(int page, int size, String loaiGiaoDich, String trangThai) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PhieuThanhToan> pageData;
        
        boolean hasLoai = loaiGiaoDich != null && !loaiGiaoDich.isEmpty();
        boolean hasTrangThai = trangThai != null && !trangThai.isEmpty();
        
        if (hasLoai && hasTrangThai) {
            pageData = repository.findByLoaiGiaoDichAndTrangThai(loaiGiaoDich, trangThai, pageable);
        } else if (hasLoai) {
            pageData = repository.findByLoaiGiaoDich(loaiGiaoDich, pageable);
        } else if (hasTrangThai) {
            pageData = repository.findByTrangThai(trangThai, pageable);
        } else {
            pageData = repository.findAll(pageable);
        }
        
        return ApiListResponse.fromPage(pageData);
    }

    @Override
    public PhieuThanhToan getTransactionById(String maPhieuThanhToan) {
        return repository.findById(maPhieuThanhToan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Giao dịch: " + maPhieuThanhToan));
    }

    @Override
    public PhieuThanhToan createTransaction(CreateTransactionRequest req) {
        String newId = "PT" + UUID.randomUUID().toString().replace("-", "").substring(0, 5).toUpperCase();
        
        PhieuThanhToan ptt = new PhieuThanhToan();
        ptt.setMaPhieuThanhToan(newId);
        ptt.setHinhThucThanhToan(req.getHinhThucThanhToan() != null ? req.getHinhThucThanhToan() : "Chuyển khoản");
        ptt.setGhiChu(req.getGhiChu());
        ptt.setGioGiaoDich(req.getGioGiaoDich() != null ? req.getGioGiaoDich() : LocalTime.now());
        ptt.setNgayGiaoDich(req.getNgayGiaoDich() != null ? req.getNgayGiaoDich() : LocalDate.now());
        ptt.setTrangThai(req.getTrangThai() != null ? req.getTrangThai() : "Pending");
        ptt.setLoaiGiaoDich(req.getLoaiGiaoDich() != null ? req.getLoaiGiaoDich() : "Thu");
        ptt.setKeToanLapPhieu(req.getKeToanLapPhieu());
        ptt.setQuanLyDoiChung(req.getQuanLyDoiChung());
        ptt.setMaChungTu(req.getMaChungTu());
        ptt.setSoTienGiaoDich(req.getSoTienGiaoDich());
        
        return repository.save(ptt);
    }

    @Override
    public PhieuThanhToan updateTransaction(String maPhieuThanhToan, UpdateTransactionRequest req) {
        PhieuThanhToan ptt = getTransactionById(maPhieuThanhToan);
        
        if (req.getHinhThucThanhToan() != null) ptt.setHinhThucThanhToan(req.getHinhThucThanhToan());
        if (req.getGhiChu() != null) ptt.setGhiChu(req.getGhiChu());
        if (req.getGioGiaoDich() != null) ptt.setGioGiaoDich(req.getGioGiaoDich());
        if (req.getNgayGiaoDich() != null) ptt.setNgayGiaoDich(req.getNgayGiaoDich());
        if (req.getTrangThai() != null) ptt.setTrangThai(req.getTrangThai());
        if (req.getLoaiGiaoDich() != null) ptt.setLoaiGiaoDich(req.getLoaiGiaoDich());
        if (req.getKeToanLapPhieu() != null) ptt.setKeToanLapPhieu(req.getKeToanLapPhieu());
        if (req.getQuanLyDoiChung() != null) ptt.setQuanLyDoiChung(req.getQuanLyDoiChung());
        if (req.getMaChungTu() != null) ptt.setMaChungTu(req.getMaChungTu());
        
        return repository.save(ptt);
    }

    @Override
    public void deleteTransaction(String maPhieuThanhToan) {
        PhieuThanhToan ptt = getTransactionById(maPhieuThanhToan);
        repository.delete(ptt);
    }
}
