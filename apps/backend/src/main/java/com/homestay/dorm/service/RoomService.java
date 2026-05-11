package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateRoomRequest;
import com.homestay.dorm.dto.request.UpdateRoomRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.RoomAvailabilityResponse;
import com.homestay.dorm.entity.Phong;

import java.math.BigDecimal;
import java.util.List;

public interface RoomService {
    ApiListResponse<RoomAvailabilityResponse> getRooms(int page, int size, String search);
    java.util.Map<String, Long> getRoomStatusCounts();
    Phong getRoomById(String id);
    Phong createRoom(CreateRoomRequest request);
    Phong updateRoom(String id, UpdateRoomRequest request);
    void deleteRoom(String id);
    List<Phong> getAvailableRooms(String loaiPhong, BigDecimal mucGia, Integer soLuongNguoi);
}
