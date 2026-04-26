package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.CreateUserRequest;
import com.homestay.dorm.dto.request.UpdateUserRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.NhanVien;
import com.homestay.dorm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiListResponse<NhanVien> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return userService.getUsers(page, size);
    }

    @GetMapping("/{maNhanVien}")
    public ApiResponse<NhanVien> getUserById(@PathVariable String maNhanVien) {
        return ApiResponse.ok(userService.getUserById(maNhanVien));
    }

    @PostMapping
    public ApiResponse<NhanVien> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.ok(userService.createUser(request));
    }

    @PutMapping("/{maNhanVien}")
    public ApiResponse<NhanVien> updateUser(
            @PathVariable String maNhanVien,
            @Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.ok(userService.updateUser(maNhanVien, request));
    }

    @DeleteMapping("/{maNhanVien}")
    public ApiResponse<Void> deleteUser(@PathVariable String maNhanVien) {
        userService.deleteUser(maNhanVien);
        return ApiResponse.ok(null);
    }
}
