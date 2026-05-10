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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import java.time.temporal.ChronoUnit;
import com.homestay.dorm.dto.response.DoiSoatResponse;

import java.math.BigDecimal;
import org.springframework.transaction.annotation.Transactional;

// Kéo toàn bộ Entity và Repository vào để xài cho gọn, khỏi báo lỗi thiếu
import com.homestay.dorm.entity.*;
import com.homestay.dorm.repository.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final HopDongThueRepository repository;
    private final JdbcTemplate jdbcTemplate;

    private final ChiTietThuePhongRepository chiTietThuePhongRepository;
    private final ChiTietThueGiuongRepository chiTietThueGiuongRepository;
    private final DichVuHopDongRepository dichVuHopDongRepository;
    private final PhongRepository phongRepository;
    private final GiuongRepository giuongRepository;
    private final DichVuRepository dichVuRepository;
    private final HoSoDatCocRepository hoSoDatCocRepository;

    @Override
    public ApiListResponse<HopDongThue> getContracts(int page, int size, String search, String loaiVanBan, String kyThanhToan) {
        long startTime = System.currentTimeMillis();
        
        // Normalize filters (UI Vietnamese -> Seeded DB plain text)
        String q = (search != null && !search.isBlank()) ? search.trim() : null;
        
        String type = null;
        if ("Hợp đồng thuê".equals(loaiVanBan)) type = "Hop dong thue";
        else if ("Biên bản bàn giao".equals(loaiVanBan)) type = "Ban giao tai san";
        else if ("Biên bản trả phòng".equals(loaiVanBan)) type = "Bien ban tra phong";
        else if ("Hồ sơ đặt cọc".equals(loaiVanBan)) type = "Ho so dat coc";
        else if (loaiVanBan != null && !"Tất cả".equals(loaiVanBan)) type = loaiVanBan;

        String term = null;
        if ("1 Tháng".equals(kyThanhToan)) term = "Thang";
        else if ("3 Tháng".equals(kyThanhToan)) term = "Quy";
        else if ("6 Tháng".equals(kyThanhToan)) term = "6 thang";
        else if (kyThanhToan != null && !"Tất cả".equals(kyThanhToan)) term = kyThanhToan;

        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "ngayLap"
        ));
        
        Page<HopDongThue> pageData = repository.searchContracts(q, type, term, pageable);
        
        ApiListResponse<HopDongThue> response = ApiListResponse.fromPage(pageData);
        long endTime = System.currentTimeMillis();
        log.info("⏱ [Performance] Contracts loaded in {} ms with search='{}', type='{}'", (endTime - startTime), q, type);
        return response;
    }

    @Override
    public List<Map<String, Object>> getOperationalContracts(int page, int size) {
        int offset = page * size;
        String sql = """
            SELECT
                h.MaHopDongThue,
                h.HinhThucThue,
                h.KyThanhToan,
                h.SoLuongThanhVien,
                h.NgayKetThuc,
                c.NgayLap,
                c.KhachHangSoHuu,
                c.NhanVienLap,
                c.ChiNhanh,
                k.HoTen AS TenKhachHang,
                k.SoDienThoai,
                (SELECT GROUP_CONCAT(tp.MaPhong SEPARATOR ', ')
                 FROM CHITIETTHUEPHONG tp WHERE tp.MaHopDongThue = h.MaHopDongThue) AS DanhSachPhong,
                (SELECT GROUP_CONCAT(tg.MaGiuong SEPARATOR ', ')
                 FROM CHITIETTHUEGIUONG tg WHERE tg.MaHopDongThue = h.MaHopDongThue) AS DanhSachGiuong,
                (SELECT p.GiaThuePhong
                 FROM CHITIETTHUEPHONG tp2
                 JOIN PHONG p ON p.MaPhong = tp2.MaPhong
                 WHERE tp2.MaHopDongThue = h.MaHopDongThue LIMIT 1) AS GiaThuePhong,
                (SELECT COALESCE(SUM(g.GiaThue), 0)
                 FROM CHITIETTHUEGIUONG tg2
                 JOIN GIUONG g ON g.MaGiuong = tg2.MaGiuong
                 WHERE tg2.MaHopDongThue = h.MaHopDongThue) AS TongGiaThueGiuong,
                (SELECT pt.TrangThai
                 FROM PHIEUTHANHTOAN pt
                 WHERE pt.MaChungTu = h.MaHopDongThue
                 ORDER BY pt.NgayGiaoDich DESC, pt.GioGiaoDich DESC, pt.MaPhieuThanhToan DESC LIMIT 1) AS TrangThaiThanhToan,
                (SELECT pt2.SoTienGiaoDich
                 FROM PHIEUTHANHTOAN pt2
                 WHERE pt2.MaChungTu = h.MaHopDongThue
                 ORDER BY pt2.NgayGiaoDich DESC, pt2.GioGiaoDich DESC, pt2.MaPhieuThanhToan DESC LIMIT 1) AS SoTienThuGanNhat
            FROM HOPDONGTHUE h
            JOIN CHUNGTU c ON c.MaVanBan = h.MaHopDongThue
            LEFT JOIN KHACHHANG k ON k.MaKhachHang = c.KhachHangSoHuu
            ORDER BY c.NgayLap DESC
            LIMIT ? OFFSET ?
            """;
        return jdbcTemplate.queryForList(sql, size, offset);
    }

    @Override
    public List<Map<String, Object>> getSettlementContracts(String trangThai) {
        String whereClause;
        if (trangThai != null && !trangThai.isEmpty()) {
            // Map từ format có dấu sang không dấu nếu cần
            String normalized = trangThai;
            if ("Chờ đối soát".equals(trangThai)) normalized = "Dang doi soat";
            else if ("Đã đối soát".equals(trangThai)) normalized = "Da doi soat";
            else if ("Chờ thanh lý".equals(trangThai)) normalized = "Chua thanh ly";
            whereClause = "WHERE h.TrangThaiThanhLy = '" + normalized.replace("'", "''") + "'";
        } else {
            // Kế toán thấy hợp đồng đang đối soát hoặc đã đối soát
            whereClause = "WHERE h.TrangThaiThanhLy IN ('Dang doi soat', 'Da doi soat')";
        }
        String sql = "SELECT"
            + " h.MaHopDongThue, h.HinhThucThue, h.KyThanhToan, h.NgayKetThuc, h.TrangThaiThanhLy,"
            + " c.NgayLap, c.KhachHangSoHuu, c.NhanVienLap,"
            + " k.HoTen AS TenKhachHang, k.SoDienThoai,"
            + " (SELECT GROUP_CONCAT(tp.MaPhong SEPARATOR ', ')"
            + "  FROM CHITIETTHUEPHONG tp WHERE tp.MaHopDongThue = h.MaHopDongThue) AS DanhSachPhong,"
            + " (SELECT GROUP_CONCAT(tg.MaGiuong SEPARATOR ', ')"
            + "  FROM CHITIETTHUEGIUONG tg WHERE tg.MaHopDongThue = h.MaHopDongThue) AS DanhSachGiuong,"
            + " (SELECT b.MaBienBanTraPhong FROM BIENBANTRAPHONG b"
            + "  WHERE b.MaHopDongThue = h.MaHopDongThue LIMIT 1) AS MaBienBanTraPhong,"
            + " (SELECT p.SoTienGiaoDich FROM PHIEUTHANHTOAN p"
            + "  WHERE p.MaChungTu = h.MaHopDongThue AND p.LoaiGiaoDich = 'Doi soat'"
            + "  ORDER BY p.NgayGiaoDich DESC LIMIT 1) AS SoTienDoiSoat"
            + " FROM HOPDONGTHUE h"
            + " JOIN CHUNGTU c ON c.MaVanBan = h.MaHopDongThue"
            + " LEFT JOIN KHACHHANG k ON k.MaKhachHang = c.KhachHangSoHuu"
            + " " + whereClause
            + " ORDER BY c.NgayLap DESC";
        return jdbcTemplate.queryForList(sql);
    }

    @Override
    public HopDongThue updateSettlementStatus(String maHopDongThue, String trangThai) {
        HopDongThue hk = getContractById(maHopDongThue);
        // Normalize về format không dấu để đồng nhất với dữ liệu trong DB
        String normalized = trangThai;
        if ("Chờ đối soát".equals(trangThai))  normalized = "Dang doi soat";
        else if ("Đã đối soát".equals(trangThai))   normalized = "Da doi soat";
        else if ("Hoàn tất".equals(trangThai))      normalized = "Hoan tat";
        else if ("Chờ thanh lý".equals(trangThai))  normalized = "Chua thanh ly";
        hk.setTrangThaiThanhLy(normalized);
        return repository.save(hk);
    }

    @Override
    public HopDongThue getContractById(String maHopDongThue) {
        return repository.findById(maHopDongThue)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Hợp đồng: " + maHopDongThue));
    }

    @Override
    @Transactional
    public HopDongThue createContract(CreateContractRequest req) {
        // 1. TẠO HỢP ĐỒNG CHÍNH
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

    @Override
    public String seedSettlementStatus() {
        Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM HOPDONGTHUE", Integer.class);
        if (total == null || total == 0) {
            return "Không có hợp đồng nào trong database";
        }

        int perGroup = total / 3;

        // Đặt tất cả về "Chờ thanh lý" (không dùng NULL nữa)
        jdbcTemplate.update("UPDATE HOPDONGTHUE SET TrangThaiThanhLy = 'Chờ thanh lý'");

        // Set 1/3 đầu thành "Chờ đối soát"
        jdbcTemplate.update(
            "UPDATE HOPDONGTHUE SET TrangThaiThanhLy = 'Chờ đối soát' " +
            "WHERE MaHopDongThue IN (" +
            "  SELECT MaHopDongThue FROM (" +
            "    SELECT MaHopDongThue FROM HOPDONGTHUE " +
            "    ORDER BY NgayKetThuc ASC LIMIT ?" +
            "  ) AS tmp" +
            ")", perGroup
        );

        // Set 1/3 tiếp theo thành "Đã đối soát"
        jdbcTemplate.update(
            "UPDATE HOPDONGTHUE SET TrangThaiThanhLy = 'Đã đối soát' " +
            "WHERE MaHopDongThue IN (" +
            "  SELECT MaHopDongThue FROM (" +
            "    SELECT MaHopDongThue FROM HOPDONGTHUE " +
            "    WHERE TrangThaiThanhLy = 'Chờ thanh lý' " +
            "    ORDER BY NgayKetThuc ASC LIMIT ?" +
            "  ) AS tmp" +
            ")", perGroup
        );

        // Đếm kết quả
        Integer choThanhLy = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM HOPDONGTHUE WHERE TrangThaiThanhLy = 'Chờ thanh lý'", Integer.class);
        Integer choDoiSoat = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM HOPDONGTHUE WHERE TrangThaiThanhLy = 'Chờ đối soát'", Integer.class);
        Integer daDoiSoat = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM HOPDONGTHUE WHERE TrangThaiThanhLy = 'Đã đối soát'", Integer.class);

        return String.format(
            "Đã cập nhật trạng thái thanh lý: Chờ thanh lý=%d, Chờ đối soát=%d, Đã đối soát=%d",
            choThanhLy, choDoiSoat, daDoiSoat
        );
    }

    @Override
    public java.math.BigDecimal tinhTienThueKyDau(String maHopDongThue) {
        // Stub — tính tiền thuê kỳ đầu dựa trên hợp đồng
        HopDongThue hopDong = getContractById(maHopDongThue);
        // Lấy giá thuê từ CHITIETTHUEPHONG hoặc CHITIETTHUEGIUONG qua jdbcTemplate
        java.math.BigDecimal giaThue = jdbcTemplate.queryForObject(
            "SELECT COALESCE(" +
            "  (SELECT p.GiaThuePhong FROM CHITIETTHUEPHONG tp JOIN PHONG p ON p.MaPhong = tp.MaPhong WHERE tp.MaHopDongThue = ? LIMIT 1)," +
            "  (SELECT COALESCE(SUM(g.GiaThue),0) FROM CHITIETTHUEGIUONG tg JOIN GIUONG g ON g.MaGiuong = tg.MaGiuong WHERE tg.MaHopDongThue = ?)" +
            ", 0)",
            java.math.BigDecimal.class, maHopDongThue, maHopDongThue
        );
        return giaThue != null ? giaThue : java.math.BigDecimal.ZERO;
    }

    @Override
    public com.homestay.dorm.dto.response.DoiSoatResponse doiSoatChiPhi(
            String maHopDongThue, java.math.BigDecimal tongTienKhauTru, boolean laHetHanHopDong) {
        // Stub — trả về kết quả đối soát cơ bản
        if (tongTienKhauTru == null) tongTienKhauTru = java.math.BigDecimal.ZERO;
        java.math.BigDecimal tienCoc = java.math.BigDecimal.valueOf(5000000);
        java.math.BigDecimal tyLe = laHetHanHopDong ? java.math.BigDecimal.ONE : new java.math.BigDecimal("0.7");
        java.math.BigDecimal hoan = tienCoc.multiply(tyLe).subtract(tongTienKhauTru);
        return com.homestay.dorm.dto.response.DoiSoatResponse.builder()
            .maHopDong(maHopDongThue)
            .tienCocBanDau(tienCoc)
            .tyLeHoanCoc(laHetHanHopDong ? "100%" : "70%")
            .tienCocDuocHoanCoBan(tienCoc.multiply(tyLe))
            .tongTienKhauTru(tongTienKhauTru)
            .soTienThucTe(hoan.abs())
            .loaiGiaoDich(hoan.compareTo(java.math.BigDecimal.ZERO) >= 0 ? "Hoàn cọc" : "Thu thêm")
            .build();
    }

    @Override
    public void thanhLyHopDong(String maHopDongThue) {
        // Cập nhật trạng thái thanh lý thành "Hoàn tất"
        jdbcTemplate.update(
            "UPDATE HOPDONGTHUE SET TrangThaiThanhLy = 'Hoàn tất', NgayKetThuc = ? WHERE MaHopDongThue = ?",
            java.time.LocalDate.now(), maHopDongThue
        );
    }
    @Override
    public java.util.Map<String, Long> getContractStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", repository.count());
        stats.put("contract", repository.countByLoaiVanBan("Hop dong thue"));
        stats.put("handover", repository.countByLoaiVanBan("Ban giao tai san"));
        stats.put("deposit", repository.countByLoaiVanBan("Ho so dat coc"));
        return stats;
    }
}
