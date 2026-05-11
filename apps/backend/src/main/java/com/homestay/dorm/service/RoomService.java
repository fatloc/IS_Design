package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateRoomRequest;
import com.homestay.dorm.dto.request.UpdateRoomRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.Phong;

import java.math.BigDecimal;
import java.util.List;

public interface RoomService {
    ApiListResponse<Phong> getRooms(int page, int size, String search);
    Phong getRoomById(String id);
    Phong createRoom(CreateRoomRequest request);
    Phong updateRoom(String id, UpdateRoomRequest request);
    void deleteRoom(String id);

    /**
     * Tìm phòng khả dụng theo loại phòng, khu vực, mức giá và số lượng người.
     *
     * @param loaiPhong    "Toàn phòng" hoặc "Ghép giường"
     * @param mucGia       giá thuê tối đa (phải > 0)
     * @param soLuongNguoi số người cần ở (phải > 0)
     * @return danh sách phòng phù hợp (có thể rỗng)
     */
    List<Phong> getAvailableRooms(String loaiPhong, BigDecimal mucGia, Integer soLuongNguoi);
}
