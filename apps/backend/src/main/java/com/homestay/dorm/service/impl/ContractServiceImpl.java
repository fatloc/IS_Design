package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ContractDetailResponse;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.repository.ChiTietThueGiuongRepository;
import com.homestay.dorm.repository.ChiTietThuePhongRepository;
import com.homestay.dorm.repository.HopDongThueRepository;
import com.homestay.dorm.repository.ThanhVienNhomRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final HopDongThueRepository repository;
    private final JdbcTemplate jdbcTemplate;
    private final ChiTietThuePhongRepository chiTietThuePhongRepository;
    private final ChiTietThueGiuongRepository chiTietThueGiuongRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;

    @Override
    public ApiListResponse<HopDongThue> getContracts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HopDongThue> pageData = repository.findAll(pageable);
        return ApiListResponse.fromPage(pageData);
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
            + " (SELECT hdc.MucTienCoc"
            + "  FROM HOSODATCOC hdc"
            + "  JOIN CHUNGTU cdc ON cdc.MaVanBan = hdc.MaHoSoDatCoc"
            + "  WHERE cdc.KhachHangSoHuu = c.KhachHangSoHuu"
            + "  ORDER BY cdc.NgayLap DESC, cdc.GioLap DESC, hdc.MaHoSoDatCoc DESC LIMIT 1) AS MucTienCoc,"
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
    public ContractDetailResponse getContractDetails(String maHopDongThue) {
        // Dùng SQL trực tiếp để lấy phòng, giường, thành viên — đảm bảo khớp với data thực tế
        String danhSachPhongStr = jdbcTemplate.queryForObject(
                "SELECT GROUP_CONCAT(MaPhong ORDER BY MaPhong SEPARATOR ',') FROM CHITIETTHUEPHONG WHERE MaHopDongThue = ?",
                String.class, maHopDongThue);
        List<String> danhSachPhong = (danhSachPhongStr != null && !danhSachPhongStr.isBlank())
                ? java.util.Arrays.asList(danhSachPhongStr.split(","))
                : java.util.Collections.emptyList();

        String danhSachGiuongStr = jdbcTemplate.queryForObject(
                "SELECT GROUP_CONCAT(MaGiuong ORDER BY MaGiuong SEPARATOR ',') FROM CHITIETTHUEGIUONG WHERE MaHopDongThue = ?",
                String.class, maHopDongThue);
        List<String> danhSachGiuong = (danhSachGiuongStr != null && !danhSachGiuongStr.isBlank())
                ? java.util.Arrays.asList(danhSachGiuongStr.split(","))
                : java.util.Collections.emptyList();

        // Thành viên nhóm — join với KHACHHANG để lấy tên đầy đủ nếu có
        List<ContractDetailResponse.ThanhVienInfo> thanhVienList = jdbcTemplate.query(
                "SELECT tv.MaThanhVien, tv.HoTen, tv.SoDienThoai, tv.Phai, tv.CCCD, tv.QuocTich, tv.NguoiDaiDien " +
                "FROM THANHVIENNHOM tv WHERE tv.MaHopDongThue = ? ORDER BY tv.NguoiDaiDien DESC, tv.MaThanhVien ASC",
                (rs, rowNum) -> ContractDetailResponse.ThanhVienInfo.builder()
                        .maThanhVien(rs.getString("MaThanhVien"))
                        .hoTen(rs.getString("HoTen"))
                        .soDienThoai(rs.getString("SoDienThoai"))
                        .phai(rs.getString("Phai"))
                        .cccd(rs.getString("CCCD"))
                        .quocTich(rs.getString("QuocTich"))
                        .nguoiDaiDien(rs.getString("NguoiDaiDien") != null)
                        .build(),
                maHopDongThue);

        return ContractDetailResponse.builder()
                .maHopDongThue(maHopDongThue)
                .danhSachPhong(danhSachPhong)
                .danhSachGiuong(danhSachGiuong)
                .thanhVienList(thanhVienList)
                .build();
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
    public java.util.Map<String, Long> getContractStats() {
        // Đếm theo LoaiVanBan trong CHUNGTU join HOPDONGTHUE
        java.util.Map<String, Long> stats = new java.util.LinkedHashMap<>();
        stats.put("total", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM HOPDONGTHUE", Long.class));
        stats.put("contract", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM CHUNGTU WHERE LoaiVanBan LIKE '%Hợp đồng%' OR LoaiVanBan LIKE '%Hop dong%'", Long.class));
        stats.put("handover", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM CHUNGTU WHERE LoaiVanBan LIKE '%Bàn giao%' OR LoaiVanBan LIKE '%Ban giao%'", Long.class));
        stats.put("deposit", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM CHUNGTU WHERE LoaiVanBan LIKE '%đặt cọc%' OR LoaiVanBan LIKE '%dat coc%' OR LoaiVanBan LIKE '%Hồ sơ%'", Long.class));
        return stats;
    }

    @Override
    public void deleteContract(String maHopDongThue) {
        HopDongThue hk = getContractById(maHopDongThue);
        repository.delete(hk);
    }

    @Override
    public String seedSettlementStatus() {
        // Đếm tổng số hợp đồng
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
}
