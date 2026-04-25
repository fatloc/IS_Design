package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.CreateUserRequest;
import com.homestay.dorm.dto.request.UpdateUserRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.NhanVien;

public interface UserService {
    ApiListResponse<NhanVien> getUsers(int page, int size);
    NhanVien getUserById(String maNhanVien);
    NhanVien createUser(CreateUserRequest request);
    NhanVien updateUser(String maNhanVien, UpdateUserRequest request);
    void deleteUser(String maNhanVien);
}
