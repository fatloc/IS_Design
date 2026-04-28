package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.LoginRequest;
import com.homestay.dorm.dto.request.RegisterRequest;
import com.homestay.dorm.dto.response.AuthResponse;
import com.homestay.dorm.dto.response.UserDTO;
import com.homestay.dorm.entity.NhanVien;
import com.homestay.dorm.repository.NhanVienRepository;
import com.homestay.dorm.security.JwtTokenProvider;
import com.homestay.dorm.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
            .user(getCurrentUser(authentication.getName()))
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (nhanVienRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        String requestedUsername = request.getUsername() == null ? "" : request.getUsername().trim();
        String finalUsername;
        if (!requestedUsername.isEmpty()) {
            if (nhanVienRepository.existsByTenDangNhap(requestedUsername)) {
                throw new RuntimeException("Tên đăng nhập đã được sử dụng!");
            }
            finalUsername = requestedUsername;
        } else {
            finalUsername = generateUniqueUsername(request.getEmail());
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        NhanVien nhanVien = NhanVien.builder()
                .maNhanVien(UUID.randomUUID().toString().substring(0, 4))
                .hoTen(request.getFullName())
                .email(request.getEmail())
                .tenDangNhap(finalUsername)
                .loaiNhanVien(request.getRole())
                .matKhau(encodedPassword)
                .build();
        nhanVien = nhanVienRepository.save(nhanVien);
        UserDTO userDTO = mapToUserDTO(nhanVien);

        // Auto login
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(finalUsername, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .user(userDTO)
                .build();
    }

    @Override
    public UserDTO getCurrentUser(String username) {
        Optional<NhanVien> emp = nhanVienRepository.findByTenDangNhap(username);
        if (emp.isEmpty()) {
            emp = nhanVienRepository.findByEmail(username);
        }
        if (emp.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }
        return mapToUserDTO(emp.get());
    }

    private UserDTO mapToUserDTO(NhanVien nhanVien) {
        return UserDTO.builder()
                .maNhanVien(nhanVien.getMaNhanVien())
                .hoTen(nhanVien.getHoTen())
                .soDienThoai(nhanVien.getSoDienThoai())
                .email(nhanVien.getEmail())
                .tenDangNhap(nhanVien.getTenDangNhap())
                .phai(nhanVien.getPhai())
                .cccd(nhanVien.getCccd())
                .loaiNhanVien(nhanVien.getLoaiNhanVien())
                .role(nhanVien.getLoaiNhanVien())
                .build();
    }

    private String generateUniqueUsername(String email) {
        String base = "nv";
        if (email != null && email.contains("@")) {
            String candidate = email.substring(0, email.indexOf("@")).trim();
            if (!candidate.isEmpty()) {
                base = candidate;
            }
        }

        String username = base;
        int suffix = 1;
        while (nhanVienRepository.existsByTenDangNhap(username)) {
            username = base + suffix;
            suffix++;
        }
        return username;
    }
}
