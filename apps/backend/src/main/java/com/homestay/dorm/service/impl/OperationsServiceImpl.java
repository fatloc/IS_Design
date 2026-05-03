package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.OperationAssetResponse;
import com.homestay.dorm.dto.response.OperationCheckinResponse;
import com.homestay.dorm.dto.response.OperationCheckoutResponse;
import com.homestay.dorm.dto.response.OperationsResponse;
import com.homestay.dorm.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperationsServiceImpl implements OperationsService {

    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int MAX_ITEMS = 10;

    private final JdbcTemplate jdbcTemplate;

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
                LIMIT %d
                """.formatted(MAX_ITEMS);

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
                        map.computeIfAbsent(rs.getString("MaHoSoCoc"), key -> new ArrayList<>())
                                .add(rs.getString("MaPhong"));
                    }
                    return map;
                }
        );

        Map<String, List<RawBedLinkRow>> bedsByDeposit = jdbcTemplate.query(
                "SELECT c.MaHoSoCoc AS depositId, c.MaGiuong AS bedId, g.MaPhongChua AS roomId " +
                        "FROM CHITIETCOCGIUONG c LEFT JOIN GIUONG g ON g.MaGiuong = c.MaGiuong",
                rs -> {
                    Map<String, List<RawBedLinkRow>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("depositId"), key -> new ArrayList<>())
                                .add(new RawBedLinkRow(rs.getString("bedId"), rs.getString("roomId")));
                    }
                    return map;
                }
        );

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
                        ? bed.roomId() + " / " + bed.bedId()
                        : bed.bedId();
                items.add(buildCheckinItem(deposit, displayRoom, "Ghép giường", assetTemplate));
            }
        }

        return items;
    }

    private OperationCheckinResponse buildCheckinItem(
            RawDocumentRow deposit,
            String roomLabel,
            String roomType,
            List<OperationAssetResponse> assetTemplate
    ) {
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

    private List<OperationCheckoutResponse> loadCheckouts(
            List<OperationAssetResponse> assetTemplate,
            Map<String, BigDecimal> latestDepositByCustomer
    ) {
        String sql = """
                SELECT h.MaHopDongThue AS id,
                       c.NgayLap AS ngayLap,
                       c.GioLap AS gioLap,
                       c.KhachHangSoHuu AS customerId,
                       COALESCE(k.HoTen, c.KhachHangSoHuu) AS customerName,
                       h.HinhThucThue AS hinhThucThue
                FROM HOPDONGTHUE h
                JOIN CHUNGTU c ON c.MaVanBan = h.MaHopDongThue
                LEFT JOIN KHACHHANG k ON k.MaKhachHang = c.KhachHangSoHuu
                ORDER BY c.NgayLap DESC, c.GioLap DESC, h.MaHopDongThue DESC
                LIMIT %d
                """.formatted(MAX_ITEMS);

        List<RawDocumentRow> contractRows = jdbcTemplate.query(sql, (rs, rowNum) -> new RawDocumentRow(
                rs.getString("id"),
                toLocalDate(rs.getDate("ngayLap")),
                toLocalTime(rs.getTime("gioLap")),
                rs.getString("customerId"),
                rs.getString("customerName"),
                null
        ));

        Map<String, List<String>> roomsByContract = jdbcTemplate.query(
                "SELECT MaHopDongThue, MaPhong FROM CHITIETTHUEPHONG",
                rs -> {
                    Map<String, List<String>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("MaHopDongThue"), key -> new ArrayList<>())
                                .add(rs.getString("MaPhong"));
                    }
                    return map;
                }
        );

        Map<String, List<RawBedLinkRow>> bedsByContract = jdbcTemplate.query(
                "SELECT c.MaHopDongThue AS contractId, c.MaGiuong AS bedId, g.MaPhongChua AS roomId " +
                        "FROM CHITIETTHUEGIUONG c LEFT JOIN GIUONG g ON g.MaGiuong = c.MaGiuong",
                rs -> {
                    Map<String, List<RawBedLinkRow>> map = new LinkedHashMap<>();
                    while (rs.next()) {
                        map.computeIfAbsent(rs.getString("contractId"), key -> new ArrayList<>())
                                .add(new RawBedLinkRow(rs.getString("bedId"), rs.getString("roomId")));
                    }
                    return map;
                }
        );

        List<OperationCheckoutResponse> items = new ArrayList<>();
        for (RawDocumentRow contract : contractRows) {
            List<String> rooms = roomsByContract.getOrDefault(contract.id(), List.of());
            List<RawBedLinkRow> beds = bedsByContract.getOrDefault(contract.id(), List.of());
            BigDecimal deposit = latestDepositByCustomer.getOrDefault(contract.customerId(), BigDecimal.ZERO);
            LocalDate dueDate = contract.date() == null ? LocalDate.now() : contract.date().plusDays(30);
            int daysLeft = (int) Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), dueDate));

            if (rooms.isEmpty() && beds.isEmpty()) {
                items.add(buildCheckoutItem(contract, contract.id(), "Toàn phòng", dueDate, daysLeft, deposit, assetTemplate));
                continue;
            }

            for (String roomId : rooms) {
                items.add(buildCheckoutItem(contract, roomId, "Toàn phòng", dueDate, daysLeft, deposit, assetTemplate));
            }
            for (RawBedLinkRow bed : beds) {
                String displayRoom = bed.roomId() != null && !bed.roomId().isBlank()
                        ? bed.roomId() + " / " + bed.bedId()
                        : bed.bedId();
                items.add(buildCheckoutItem(contract, displayRoom, "Ghép giường", dueDate, daysLeft, deposit, assetTemplate));
            }
        }

        return items;
    }

    private OperationCheckoutResponse buildCheckoutItem(
            RawDocumentRow contract,
            String roomLabel,
            String roomType,
            LocalDate dueDate,
            int daysLeft,
            BigDecimal deposit,
            List<OperationAssetResponse> assetTemplate
    ) {
        return OperationCheckoutResponse.builder()
                .id(contract.id())
                .room(roomLabel)
                .tenant(defaultText(contract.customerName(), contract.customerId()))
                .avatar(initialsOf(defaultText(contract.customerName(), contract.customerId())))
                .roomType(roomType)
                .moveOut(formatDate(dueDate))
                .deposit(zeroIfNull(deposit).setScale(0, RoundingMode.HALF_UP))
                .daysLeft(daysLeft)
                .status("Chờ thanh lý")
                .assets(cloneAssets(assetTemplate))
                .build();
    }

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
                grouped.computeIfAbsent(handoverId, key -> new ArrayList<>())
                        .add(OperationAssetResponse.builder()
                                .asset(defaultText(rs.getString("assetName"), rs.getString("assetId")))
                                .present(true)
                                .condition(mapCondition(rs.getString("assetCondition")))
                                .notes(rs.getObject("quantity") == null ? "" : "Số lượng: " + rs.getInt("quantity"))
                                .build());
            }
            return null;
        });

        List<OperationAssetResponse> firstTemplate = grouped.values().stream()
                .filter(list -> !list.isEmpty())
                .findFirst()
                .orElseGet(this::defaultAssetTemplate);

        return cloneAssets(firstTemplate);
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
        if (value == null) {
            return "Tốt";
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT)
                .replaceAll("\\p{M}+", "")
                .replaceAll("[^a-z0-9]+", "");

        if (normalized.contains("bad") || normalized.contains("huhong") || normalized.contains("cansua")) {
            return "Cần sửa chữa";
        }
        if (normalized.contains("kha") || normalized.contains("binhthuong")) {
            return "Bình thường";
        }
        return "Tốt";
    }

    private String formatDate(LocalDate date) {
        return date == null ? "--" : DISPLAY_DATE.format(date);
    }

    private LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

    private java.time.LocalTime toLocalTime(Time time) {
        return time == null ? null : time.toLocalTime();
    }

    private String defaultText(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback == null || fallback.isBlank() ? "Khách hàng" : fallback;
    }

    private String initialsOf(String text) {
        String[] parts = text.trim().split("\\s+");
        String first = parts.length > 0 ? parts[0] : "KH";
        String second = parts.length > 1 ? parts[parts.length - 1] : "";
        String initials = (first.substring(0, 1) + (second.isEmpty() ? "" : second.substring(0, 1))).toUpperCase(Locale.ROOT);
        return initials.length() > 2 ? initials.substring(0, 2) : initials;
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private record RawDocumentRow(
            String id,
            LocalDate date,
            java.time.LocalTime time,
            String customerId,
            String customerName,
            BigDecimal deposit
    ) {
    }

    private record RawBedLinkRow(String bedId, String roomId) {
    }
}