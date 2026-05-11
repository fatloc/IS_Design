package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateRoomRequest;
import com.homestay.dorm.dto.request.UpdateRoomRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.repository.PhongRepository;
import com.homestay.dorm.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final PhongRepository phongRepository;

    @Override
    public ApiListResponse<Phong> getRooms(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Phong> phongPage;
        if (search != null && !search.isEmpty()) {
            phongPage = phongRepository.findByTrangThaiContainingIgnoreCase(search, pageable);
        } else {
            phongPage = phongRepository.findAll(pageable);
        }

        return ApiListResponse.fromPage(phongPage);
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
