package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CheckoutRequest;
import com.homestay.dorm.dto.request.HandoverRequest;
import com.homestay.dorm.dto.response.OperationAssetResponse;
import com.homestay.dorm.dto.response.OperationCheckinResponse;
import com.homestay.dorm.dto.response.OperationCheckoutResponse;
import com.homestay.dorm.dto.response.OperationsResponse;
import com.homestay.dorm.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OperationsServiceImpl implements OperationsService {

    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final JdbcTemplate jdbcTemplate;

    // ── Trạng thái TrangThaiThanhLy ──────────────────────────────────────────
    // null / không có          → "Chờ thanh lý"   (manager chưa khởi tạo)
    // "Chờ đối soát"           → "Chờ đối soát"   (manager đã bấm Thanh lý, kế toán chưa xử lý)
    // "Đã đối soát"            → "Đã đối soát"    (kế toán đã tạo bảng đối soát)
    // "Hoàn tất"               → bị lọc ra khỏi danh sách (manager đã ký bàn giao)

    @Override
    @Transactional
    public void confirmHandover(HandoverRequest request) {
        String bbId = "BB" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();

        // 1. Tạo CHUNGTU
        jdbcTemplate.update(
                "INSERT INTO CHUNGTU (MaVanBan, LoaiVanBan, NgayLap, GioLap) VALUES (?, ?, ?, ?)",
                bbId, "Biên bản bàn giao", Date.valueOf(LocalDate.now()), Time.valueOf(LocalTime.now()));

        // 2. Tạo BIENBANBANGIAOTAISAN
        jdbcTemplate.update("INSERT INTO BIENBANBANGIAOTAISAN (MaBienBanBanGiao) VALUES (?)", bbId);

        // 3. Tạo CHITIETBANGIAO cho từng tài sản
        for (OperationAssetResponse asset : request.getAssets()) {
            List<String> assetIds = jdbcTemplate.queryForList(
                    "SELECT MaTaiSan FROM TAISAN WHERE TenTaiSan = ? LIMIT 1",
                    String.class, asset.getAsset());
            String assetId = assetIds.isEmpty() ? "TS0001" : assetIds.get(0);
            jdbcTemplate.update(
                    "INSERT INTO CHITIETBANGIAO (MaBienBanBanGiao, MaTaiSanBanGiao, SoLuong) VALUES (?, ?, ?)",
                    bbId, assetId, 1);
        }

        // 4. Cập nhật trạng thái phòng
        jdbcTemplate.update("UPDATE PHONG SET TrangThai = 'Da thue' WHERE MaPhong = ?", request.getRoom());
    }

    @Override
    @Transactional
    public void confirmCheckout(CheckoutRequest request) {
        String bbId = "BT" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();

        // 1. Tạo CHUNGTU
        jdbcTemplate.update(
                "INSERT INTO CHUNGTU (MaVanBan, LoaiVanBan, NgayLap, GioLap) VALUES (?, ?, ?, ?)",
                bbId, "Biên bản trả phòng", Date.valueOf(LocalDate.now()), Time.valueOf(LocalTime.now()));

        // 2. Tạo BIENBANTRAPHONG liên kết với hợp đồng
        jdbcTemplate.update(
                "INSERT INTO BIENBANTRAPHONG (MaBienBanTraPhong, MaHopDongThue) VALUES (?, ?)",
                bbId, request.getId());

        // 3. Cập nhật TrangThaiThanhLy → "Dang doi soat" để kế toán xử lý
        jdbcTemplate.update(
                "UPDATE HOPDONGTHUE SET TrangThaiThanhLy = 'Dang doi soat' WHERE MaHopDongThue = ?",
                request.getId());
    }

    @Override
    @Transactional
    public void finishCheckout(String id) {
        // Manager ký bàn giao → set "Hoan tat" → biến mất khỏi danh sách
        jdbcTemplate.update(
                "UPDATE HOPDONGTHUE SET TrangThaiThanhLy = 'Hoan tat' WHERE MaHopDongThue = ?", id);
    }

    @Override
    public OperationsResponse getOperations() {
        List<OperationAssetResponse> assetTemplate = loadAssetTemplate();
        Map<String, BigDecimal> latestDepositByCustomer = loadLatestDepositsByCustomer();

        List<OperationCheckinResponse> checkins = loadCheckins(assetTemplate);
        List<OperationCheckoutResponse> checkouts = loadCheckouts(assetTemplate, latestDepositByCustomer);

        return OperationsResponse.builder()
                .checkins(checkins)
                .checkouts(checkouts)
                .build();
    }

    // ── Load checkins ─────────────────────────────────────────────────────────
    private List<OperationCheckinResponse> loadCheckins(List<OperationAssetResponse> assetTemplate) {
        String sql = """
                SELECT h.MaHoSoDatCoc AS id,
                       c.NgayLap AS ngayLap,
                       c.GioLap AS gioLap,
                       c.KhachHangSoHuu AS customerId,
                       COALESCE(k.HoTen, c.KhachHangSoHuu) AS customerName,
                       h.MucTienCoc AS deposit
                FROM HOSODATCOC h
                JOIN CHUNGTU c ON c.MaVanBan = h.MaHoSoDatCoc
                LEFT JOIN KHACHHANG k ON k.MaKhachHang = c.KhachHangSoHuu
                ORDER BY c.NgayLap DESC, c.GioLap DESC, h.MaHoSoDatCoc DESC
                """;

        List<RawDocumentRow> depositRows = jdbcTemplate.query(sql, (rs, rowNum) -> new RawDocumentRow(
                rs.getString("id"),
                toLocalDate(rs.getDate("ngayLap")),
                toLocalTime(rs.getTime("gioLap")),
                rs.getString("customerId"),
                rs.getString("customerName"),
                rs.getBigDecimal("deposit")
        ));

        Map<String, List<String>> roomsByDeposit = jdbcTemplate.query(
                "SELECT MaHoSoCoc, MaPhong FROM CHITIETCOCPHONG",
                rs -> {
                    Map<String, List<String>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("MaHoSoCoc"), k -> new ArrayList<>())
                                .add(rs.getString("MaPhong"));
                    }
                    return map;
                });

        Map<String, List<RawBedLinkRow>> bedsByDeposit = jdbcTemplate.query(
                "SELECT c.MaHoSoCoc AS depositId, c.MaGiuong AS bedId, g.MaPhongChua AS roomId "
                        + "FROM CHITIETCOCGIUONG c LEFT JOIN GIUONG g ON g.MaGiuong = c.MaGiuong",
                rs -> {
                    Map<String, List<RawBedLinkRow>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("depositId"), k -> new ArrayList<>())
                                .add(new RawBedLinkRow(rs.getString("bedId"), rs.getString("roomId")));
                    }
                    return map;
                });

        List<OperationCheckinResponse> items = new ArrayList<>();
        for (RawDocumentRow deposit : depositRows) {
            List<String> rooms = roomsByDeposit.getOrDefault(deposit.id(), List.of());
            List<RawBedLinkRow> beds = bedsByDeposit.getOrDefault(deposit.id(), List.of());

            if (rooms.isEmpty() && beds.isEmpty()) {
                items.add(buildCheckinItem(deposit, deposit.id(), "Toàn phòng", assetTemplate));
                continue;
            }
            for (String roomId : rooms) {
                items.add(buildCheckinItem(deposit, roomId, "Toàn phòng", assetTemplate));
            }
            for (RawBedLinkRow bed : beds) {
                String displayRoom = bed.roomId() != null && !bed.roomId().isBlank()
                        ? bed.roomId() + " / " + bed.bedId() : bed.bedId();
                items.add(buildCheckinItem(deposit, displayRoom, "Ghép giường", assetTemplate));
            }
        }
        return items;
    }

    private OperationCheckinResponse buildCheckinItem(
            RawDocumentRow deposit, String roomLabel, String roomType,
            List<OperationAssetResponse> assetTemplate) {
        return OperationCheckinResponse.builder()
                .id(deposit.id())
                .room(roomLabel)
                .tenant(defaultText(deposit.customerName(), deposit.customerId()))
                .avatar(initialsOf(defaultText(deposit.customerName(), deposit.customerId())))
                .roomType(roomType)
                .moveIn(formatDate(deposit.date()))
                .deposit(zeroIfNull(deposit.deposit()))
                .status("Chờ bàn giao")
                .assets(cloneAssets(assetTemplate))
                .build();
    }

    // ── Load checkouts ────────────────────────────────────────────────────────
    private List<OperationCheckoutResponse> loadCheckouts(
            List<OperationAssetResponse> assetTemplate,
            Map<String, BigDecimal> latestDepositByCustomer) {

        // Lấy toàn bộ hợp đồng cần thanh lý (trừ "Hoan tat")
        String sql = """
                SELECT h.MaHopDongThue AS id,
                       c.NgayLap AS ngayLap, c.GioLap AS gioLap,
                       c.KhachHangSoHuu AS customerId,
                       COALESCE(k.HoTen, c.KhachHangSoHuu) AS customerName,
                       h.HinhThucThue AS hinhThucThue,
                       h.NgayKetThuc AS ngayKetThuc,
                       h.TrangThaiThanhLy AS trangThaiThanhLy
                FROM HOPDONGTHUE h
                JOIN CHUNGTU c ON c.MaVanBan = h.MaHopDongThue
                LEFT JOIN KHACHHANG k ON k.MaKhachHang = c.KhachHangSoHuu
                WHERE h.TrangThaiThanhLy IN ('Chua thanh ly', 'Dang doi soat', 'Da doi soat')
                ORDER BY h.NgayKetThuc ASC
                """;

        List<RawContractRow> contractRows = jdbcTemplate.query(sql, (rs, rowNum) -> new RawContractRow(
                rs.getString("id"),
                toLocalDate(rs.getDate("ngayLap")),
                toLocalTime(rs.getTime("gioLap")),
                rs.getString("customerId"),
                rs.getString("customerName"),
                toLocalDate(rs.getDate("ngayKetThuc")),
                rs.getString("trangThaiThanhLy")
        ));

        Map<String, List<String>> roomsByContract = jdbcTemplate.query(
                "SELECT MaHopDongThue, MaPhong FROM CHITIETTHUEPHONG",
                rs -> {
                    Map<String, List<String>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("MaHopDongThue"), k -> new ArrayList<>())
                                .add(rs.getString("MaPhong"));
                    }
                    return map;
                });

        Map<String, List<RawBedLinkRow>> bedsByContract = jdbcTemplate.query(
                "SELECT c.MaHopDongThue AS contractId, c.MaGiuong AS bedId, g.MaPhongChua AS roomId "
                        + "FROM CHITIETTHUEGIUONG c LEFT JOIN GIUONG g ON g.MaGiuong = c.MaGiuong",
                rs -> {
                    Map<String, List<RawBedLinkRow>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("contractId"), k -> new ArrayList<>())
                                .add(new RawBedLinkRow(rs.getString("bedId"), rs.getString("roomId")));
                    }
                    return map;
                });

        // Lấy số tiền đối soát từ PHIEUTHANHTOAN (LoaiGiaoDich = 'Doi soat')
        Map<String, BigDecimal> doiSoatAmtByContract = jdbcTemplate.query(
                "SELECT MaChungTu, SoTienGiaoDich FROM PHIEUTHANHTOAN "
                        + "WHERE LoaiGiaoDich = 'Doi soat' ORDER BY NgayGiaoDich DESC",
                rs -> {
                    Map<String, BigDecimal> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        String maHD = rs.getString("MaChungTu");
                        if (!map.containsKey(maHD)) {
                            map.put(maHD, rs.getBigDecimal("SoTienGiaoDich"));
                        }
                    }
                    return map;
                });

        List<OperationCheckoutResponse> items = new ArrayList<>();
        for (RawContractRow contract : contractRows) {
            List<String> rooms = roomsByContract.getOrDefault(contract.id(), List.of());
            List<RawBedLinkRow> beds = bedsByContract.getOrDefault(contract.id(), List.of());
            BigDecimal deposit = latestDepositByCustomer.getOrDefault(contract.customerId(), BigDecimal.ZERO);
            BigDecimal netAmount = doiSoatAmtByContract.get(contract.id());

            // Tính ngày hết hạn và số ngày còn lại
            LocalDate dueDate = contract.ngayKetThuc() != null
                    ? contract.ngayKetThuc()
                    : (contract.date() != null ? contract.date().plusDays(180) : LocalDate.now());
            int daysLeft = (int) Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), dueDate));

            // Map trạng thái từ DB (không dấu) sang frontend (có dấu)
            String raw = contract.trangThaiThanhLy() != null ? contract.trangThaiThanhLy().trim() : "";
            String status;
            if ("Da doi soat".equalsIgnoreCase(raw) || "Đã đối soát".equals(raw)) {
                status = "Đã đối soát";
            } else if ("Dang doi soat".equalsIgnoreCase(raw) || "Chờ đối soát".equals(raw)) {
                status = "Chờ đối soát";
            } else {
                status = "Chờ thanh lý";
            }

            if (rooms.isEmpty() && beds.isEmpty()) {
                items.add(buildCheckoutItem(contract, contract.id(), "Toàn phòng",
                        dueDate, daysLeft, deposit, netAmount, assetTemplate, status));
                continue;
            }
            for (String roomId : rooms) {
                items.add(buildCheckoutItem(contract, roomId, "Toàn phòng",
                        dueDate, daysLeft, deposit, netAmount, assetTemplate, status));
            }
            for (RawBedLinkRow bed : beds) {
                String displayRoom = bed.roomId() != null && !bed.roomId().isBlank()
                        ? bed.roomId() + " / " + bed.bedId() : bed.bedId();
                items.add(buildCheckoutItem(contract, displayRoom, "Ghép giường",
                        dueDate, daysLeft, deposit, netAmount, assetTemplate, status));
            }
        }
        return items;
    }

    private OperationCheckoutResponse buildCheckoutItem(
            RawContractRow contract, String roomLabel, String roomType,
            LocalDate dueDate, int daysLeft, BigDecimal deposit, BigDecimal netAmount,
            List<OperationAssetResponse> assetTemplate, String status) {
        return OperationCheckoutResponse.builder()
                .id(contract.id())
                .room(roomLabel)
                .tenant(defaultText(contract.customerName(), contract.customerId()))
                .avatar(initialsOf(defaultText(contract.customerName(), contract.customerId())))
                .roomType(roomType)
                .moveOut(formatDate(dueDate))
                .deposit(zeroIfNull(deposit).setScale(0, RoundingMode.HALF_UP))
                .netAmount(netAmount != null ? netAmount.setScale(0, RoundingMode.HALF_UP) : null)
                .daysLeft(daysLeft)
                .status(status)
                .assets(cloneAssets(assetTemplate))
                .build();
    }

    // ── Asset template ────────────────────────────────────────────────────────
    private List<OperationAssetResponse> loadAssetTemplate() {
        String sql = """
                SELECT bb.MaBienBanBanGiao AS handoverId,
                       ct.MaTaiSanBanGiao AS assetId,
                       COALESCE(ts.TenTaiSan, ct.MaTaiSanBanGiao) AS assetName,
                       COALESCE(ts.TinhTrang, 'Tot') AS assetCondition,
                       ct.SoLuong AS quantity
                FROM BIENBANBANGIAOTAISAN bb
                LEFT JOIN CHITIETBANGIAO ct ON ct.MaBienBanBanGiao = bb.MaBienBanBanGiao
                LEFT JOIN TAISAN ts ON ts.MaTaiSan = ct.MaTaiSanBanGiao
                ORDER BY bb.MaBienBanBanGiao DESC, ct.MaTaiSanBanGiao ASC
                """;

        Map<String, List<OperationAssetResponse>> grouped = new LinkedHashMap<>();
        jdbcTemplate.query(sql, rs -> {
            while (rs.next()) {
                String handoverId = rs.getString("handoverId");
                grouped.computeIfAbsent(handoverId, k -> new ArrayList<>())
                        .add(OperationAssetResponse.builder()
                                .asset(defaultText(rs.getString("assetName"), rs.getString("assetId")))
                                .present(true)
                                .condition(mapCondition(rs.getString("assetCondition")))
                                .notes(rs.getObject("quantity") == null ? "" : "Số lượng: " + rs.getInt("quantity"))
                                .build());
            }
            return null;
        });

        return grouped.values().stream()
                .filter(list -> !list.isEmpty())
                .findFirst()
                .map(this::cloneAssets)
                .orElseGet(this::defaultAssetTemplate);
    }

    private Map<String, BigDecimal> loadLatestDepositsByCustomer() {
        String sql = """
                SELECT c.KhachHangSoHuu AS customerId,
                       h.MucTienCoc AS deposit,
                       c.NgayLap AS ngayLap,
                       c.GioLap AS gioLap
                FROM HOSODATCOC h
                JOIN CHUNGTU c ON c.MaVanBan = h.MaHoSoDatCoc
                ORDER BY c.NgayLap DESC, c.GioLap DESC, h.MaHoSoDatCoc DESC
                """;

        Map<String, BigDecimal> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, rs -> {
            while (rs.next()) {
                String customerId = rs.getString("customerId");
                if (customerId != null && !customerId.isBlank() && !map.containsKey(customerId)) {
                    map.put(customerId, zeroIfNull(rs.getBigDecimal("deposit")));
                }
            }
            return null;
        });
        return map;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private List<OperationAssetResponse> cloneAssets(List<OperationAssetResponse> source) {
        return source.stream()
                .map(item -> OperationAssetResponse.builder()
                        .asset(item.getAsset())
                        .present(item.isPresent())
                        .condition(item.getCondition())
                        .notes(item.getNotes())
                        .build())
                .toList();
    }

    private List<OperationAssetResponse> defaultAssetTemplate() {
        return List.of(
                OperationAssetResponse.builder().asset("Giường").present(true).condition("Tốt").notes("").build(),
                OperationAssetResponse.builder().asset("Nệm").present(true).condition("Tốt").notes("").build(),
                OperationAssetResponse.builder().asset("Tủ đầu giường").present(true).condition("Tốt").notes("").build(),
                OperationAssetResponse.builder().asset("Chìa khóa/Thẻ từ").present(true).condition("Tốt").notes("").build()
        );
    }

    private String mapCondition(String value) {
        if (value == null) return "Tốt";
        String n = value.trim().toLowerCase(Locale.ROOT)
                .replaceAll("\\p{M}+", "").replaceAll("[^a-z0-9]+", "");
        if (n.contains("bad") || n.contains("huhong") || n.contains("cansua")) return "Cần sửa chữa";
        if (n.contains("kha") || n.contains("binhthuong")) return "Bình thường";
        return "Tốt";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "--" : DISPLAY_DATE.format(date);
    }

    private LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

    private java.time.LocalTime toLocalTime(java.sql.Time time) {
        return time == null ? null : time.toLocalTime();
    }

    private String defaultText(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) return primary;
        return fallback == null || fallback.isBlank() ? "Khách hàng" : fallback;
    }

    private String initialsOf(String text) {
        String[] parts = text.trim().split("\\s+");
        String first = parts.length > 0 ? parts[0] : "KH";
        String second = parts.length > 1 ? parts[parts.length - 1] : "";
        String initials = (first.substring(0, 1) + (second.isEmpty() ? "" : second.substring(0, 1)))
                .toUpperCase(Locale.ROOT);
        return initials.length() > 2 ? initials.substring(0, 2) : initials;
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    // ── Records ───────────────────────────────────────────────────────────────
    private record RawDocumentRow(
            String id, LocalDate date, java.time.LocalTime time,
            String customerId, String customerName, BigDecimal deposit) {}

    private record RawContractRow(
            String id, LocalDate date, java.time.LocalTime time,
            String customerId, String customerName,
            LocalDate ngayKetThuc, String trangThaiThanhLy) {}

    private record RawBedLinkRow(String bedId, String roomId) {}
}
