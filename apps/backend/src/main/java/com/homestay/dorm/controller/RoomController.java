package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateRoomRequest;
import com.homestay.dorm.dto.request.UpdateRoomRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ApiListResponse<Phong> getRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String search) {
        return roomService.getRooms(page, size, search);
    }

    @GetMapping("/available")
    public ApiResponse<List<Phong>> getAvailableRooms(
            @RequestParam String loaiPhong,
            @RequestParam BigDecimal mucGia,
            @RequestParam Integer soLuongNguoi) {
        return ApiResponse.ok(roomService.getAvailableRooms(loaiPhong, mucGia, soLuongNguoi));
    }

    @GetMapping("/{id}")
    public ApiResponse<Phong> getRoomById(@PathVariable String id) {
        Phong phong = roomService.getRoomById(id);
        return ApiResponse.ok(phong);
    }

    @PostMapping
    public ApiResponse<Phong> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        Phong phong = roomService.createRoom(request);
        return ApiResponse.ok(phong);
    }

    @PutMapping("/{id}")
    public ApiResponse<Phong> updateRoom(@PathVariable String id, @Valid @RequestBody UpdateRoomRequest request) {
        Phong phong = roomService.updateRoom(id, request);
        return ApiResponse.ok(phong);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ApiResponse.ok(null);
    }
}
