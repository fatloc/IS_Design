package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateRoomRequest;
import com.homestay.dorm.dto.request.UpdateRoomRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.RoomAvailabilityResponse;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.repository.ChiTietThuePhongRepository;
import com.homestay.dorm.repository.PhongRepository;
import com.homestay.dorm.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final PhongRepository phongRepository;
    private final ChiTietThuePhongRepository chiTietThuePhongRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public ApiListResponse<RoomAvailabilityResponse> getRooms(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Phong> phongPage;
        if (search != null && !search.isEmpty()) {
            phongPage = phongRepository.findByTrangThaiContainingIgnoreCase(search, pageable);
        } else {
            phongPage = phongRepository.findAll(pageable);
        }

        // Lấy số người đang thuê mỗi phòng (từ hợp đồng active)
        Map<String, Long> tenantCountByRoom = buildTenantCountMap();

        List<RoomAvailabilityResponse> content = phongPage.getContent().stream()
                .map(p -> toAvailabilityResponse(p, tenantCountByRoom))
                .collect(Collectors.toList());

        Page<RoomAvailabilityResponse> resultPage = new PageImpl<>(content, pageable, phongPage.getTotalElements());
        return ApiListResponse.fromPage(resultPage);
    }

    private Map<String, Long> buildTenantCountMap() {
        Map<String, Long> map = new HashMap<>();
        chiTietThuePhongRepository.countActiveContractsByRoom()
                .forEach(row -> {
                    String maPhong = (String) row[0];
                    // MySQL native query trả về BigInteger hoặc Long tùy driver
                    long soNguoi = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                    map.put(maPhong, soNguoi);
                });
        return map;
    }

    private RoomAvailabilityResponse toAvailabilityResponse(Phong p, Map<String, Long> tenantCountByRoom) {
        int sucChua = p.getSucChuaToiDa() != null ? p.getSucChuaToiDa() : 0;
        // Cap soNguoi tại sucChua để tránh hiển thị vượt sức chứa do data seed
        int soNguoiRaw = tenantCountByRoom.getOrDefault(p.getMaPhong(), 0L).intValue();
        int soNguoi = sucChua > 0 ? Math.min(soNguoiRaw, sucChua) : soNguoiRaw;
        int slotsTrong = Math.max(0, sucChua - soNguoi);
        return RoomAvailabilityResponse.builder()
                .maPhong(p.getMaPhong())
                .sucChuaToiDa(sucChua)
                .soNguoiHienTai(soNguoi)
                .slotsTrong(slotsTrong)
                .giaThuePhong(p.getGiaThuePhong())
                .trangThai(p.getTrangThai())
                .chiNhanh(p.getChiNhanh())
                .build();
    }

    @Override
    public java.util.Map<String, Long> getRoomStatusCounts() {
        // Dùng LIKE để bắt cả giá trị có dấu lẫn không dấu
        java.util.Map<String, Long> counts = new HashMap<>();
        counts.put("Trống", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%rong%' AND TrangThai NOT LIKE '%thue%' AND TrangThai NOT LIKE '%dat%' AND TrangThai NOT LIKE '%tri%'",
                Long.class));
        counts.put("Đang thuê", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%thue%'",
                Long.class));
        counts.put("Đã đặt", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%dat%'",
                Long.class));
        counts.put("Bảo trì", jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PHONG WHERE TrangThai LIKE '%tri%'",
                Long.class));
        return counts;
    }

    @Override
    public Phong getRoomById(String id) {
        return phongRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng id: " + id));
    }

    @Override
    public Phong createRoom(CreateRoomRequest request) {
        if (phongRepository.existsById(request.getMaPhong())) {
            throw new RuntimeException("Mã phòng đã tồn tại!");
        }
        Phong phong = Phong.builder()
                .maPhong(request.getMaPhong())
                .sucChuaToiDa(request.getSucChuaToiDa())
                .giaThuePhong(request.getGiaThuePhong())
                .trangThai(request.getTrangThai())
                .chiNhanh(request.getChiNhanh())
                .build();
        return phongRepository.save(phong);
    }

    @Override
    public Phong updateRoom(String id, UpdateRoomRequest request) {
        Phong phong = getRoomById(id);
        if (request.getSucChuaToiDa() != null) phong.setSucChuaToiDa(request.getSucChuaToiDa());
        if (request.getGiaThuePhong() != null) phong.setGiaThuePhong(request.getGiaThuePhong());
        if (request.getTrangThai() != null) phong.setTrangThai(request.getTrangThai());
        if (request.getChiNhanh() != null) phong.setChiNhanh(request.getChiNhanh());
        return phongRepository.save(phong);
    }

    @Override
    public void deleteRoom(String id) {
        Phong phong = getRoomById(id);
        phongRepository.delete(phong);
    }

    @Override
    public List<Phong> getAvailableRooms(String loaiPhong, BigDecimal mucGia, Integer soLuongNguoi) {
        if (mucGia == null || mucGia.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mức giá phải lớn hơn 0");
        }
        if (soLuongNguoi == null || soLuongNguoi <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng người phải lớn hơn 0");
        }
        if ("Toàn phòng".equals(loaiPhong)) {
            return phongRepository.findAvailableFullRooms(mucGia);
        } else if ("Ghép giường".equals(loaiPhong)) {
            return phongRepository.findAvailableSharedRooms(mucGia, soLuongNguoi);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại phòng không hợp lệ");
        }
    }
}
