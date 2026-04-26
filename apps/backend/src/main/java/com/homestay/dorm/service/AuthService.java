package com.homestay.dorm.service;

import com.homestay.dorm.dto.request.LoginRequest;
import com.homestay.dorm.dto.request.RegisterRequest;
import com.homestay.dorm.dto.response.AuthResponse;
import com.homestay.dorm.dto.response.UserDTO;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    UserDTO getCurrentUser(String email);
}
