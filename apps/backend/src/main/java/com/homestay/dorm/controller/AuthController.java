package com.homestay.dorm.controller;

import com.homestay.dorm.dto.request.LoginRequest;
import com.homestay.dorm.dto.request.RegisterRequest;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.dto.response.AuthResponse;
import com.homestay.dorm.dto.response.UserDTO;
import com.homestay.dorm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.ok(response);
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.ok(response);
    }

    @GetMapping("/me")
    public ApiResponse<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        UserDTO user = authService.getCurrentUser(authentication.getName());
        return ApiResponse.ok(user);
    }
}
