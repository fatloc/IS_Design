package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateRoomRequest;
import com.homestay.dorm.dto.request.UpdateRoomRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.RoomAvailabilityResponse;
import com.homestay.dorm.entity.Phong;

import java.util.List;

public interface RoomService {
    ApiListResponse<Phong> getRooms(int page, int size, String search);
    Phong getRoomById(String id);
    Phong createRoom(CreateRoomRequest request);
    Phong updateRoom(String id, UpdateRoomRequest request);
    void deleteRoom(String id);

    /** Trả về danh sách tất cả phòng kèm số slot trống */
    List<RoomAvailabilityResponse> getRoomAvailability();
}
