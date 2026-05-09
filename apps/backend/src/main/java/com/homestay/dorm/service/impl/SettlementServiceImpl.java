package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateReconciliationRequest;
import com.homestay.dorm.entity.BangDoiSoat;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.entity.PhieuThanhToan;
import com.homestay.dorm.repository.BangDoiSoatRepository;
import com.homestay.dorm.repository.HopDongThueRepository;
import com.homestay.dorm.repository.PhieuThanhToanRepository;
import com.homestay.dorm.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    private final BangDoiSoatRepository bangDoiSoatRepository;
    private final HopDongThueRepository hopDongThueRepository;
    private final PhieuThanhToanRepository phieuThanhToanRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public BangDoiSoat reconcile(CreateReconciliationRequest request) {
        // 1. Get deposit from latest HOSODATCOC for this contract's customer
        String getDepositSql = """
                SELECT h.MucTienCoc 
                FROM HOSODATCOC h
                JOIN CHUNGTU c ON c.MaVanBan = h.MaHoSoDatCoc
                JOIN CHUNGTU con ON con.KhachHangSoHuu = c.KhachHangSoHuu
                WHERE con.MaVanBan = ?
                ORDER BY c.NgayLap DESC LIMIT 1
                """;
        
        List<BigDecimal> deposits = jdbcTemplate.queryForList(getDepositSql, BigDecimal.class, request.getContractId());
        BigDecimal deposit = deposits.isEmpty() ? BigDecimal.ZERO : deposits.get(0);
        if (deposit == null) deposit = BigDecimal.ZERO;

        // 2. Calculate net
        BigDecimal refundAmount = deposit.multiply(BigDecimal.valueOf(request.getRatePercent()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal net = refundAmount.subtract(request.getDeductions());

        // 3. Create BangDoiSoat
        String dsId = "DS" + UUID.randomUUID().toString().replace("-", "").substring(0, 5).toUpperCase();
        BangDoiSoat ds = BangDoiSoat.builder()
                .maBangDoiSoat(dsId)
                .maHopDongThue(request.getContractId())
                .tiLeHoanCoc(request.getRatePercent())
                .tongKhauTru(request.getDeductions())
                .soTienThucTe(net)
                .ngayLap(LocalDate.now())
                .trangThai("Chờ xử lý thanh toán")
                .build();
        
        return bangDoiSoatRepository.save(ds);
    }

    @Override
    public List<BangDoiSoat> getPendingPayments() {
        return bangDoiSoatRepository.findByTrangThai("Chờ xử lý thanh toán");
    }

    @Override
    @Transactional
    public void processPayment(String settlementId, String action) {
        BangDoiSoat ds = bangDoiSoatRepository.findById(settlementId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bản đối soát: " + settlementId));
        
        // Create transaction
        String ptId = "PT" + UUID.randomUUID().toString().replace("-", "").substring(0, 5).toUpperCase();
        PhieuThanhToan ptt = new PhieuThanhToan();
        ptt.setMaPhieuThanhToan(ptId);
        ptt.setMaChungTu(ds.getMaHopDongThue());
        ptt.setNgayGiaoDich(LocalDate.now());
        ptt.setGioGiaoDich(LocalTime.now());
        ptt.setSoTienGiaoDich(ds.getSoTienThucTe().abs());
        ptt.setTrangThai("Hoàn tất");
        ptt.setLoaiGiaoDich(ds.getSoTienThucTe().compareTo(BigDecimal.ZERO) < 0 ? "Thu bù đối soát" : "Hoàn cọc đối soát");
        ptt.setGhiChu("Thanh lý hợp đồng " + ds.getMaHopDongThue() + " qua biên bản " + ds.getMaBangDoiSoat());
        
        phieuThanhToanRepository.save(ptt);

        // Update settlement status
        ds.setTrangThai("Đã hoàn tất");
        bangDoiSoatRepository.save(ds);
    }
}
