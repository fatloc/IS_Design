package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.LoginRequest;
import com.homestay.dorm.dto.request.RegisterRequest;
import com.homestay.dorm.dto.response.AuthResponse;
import com.homestay.dorm.dto.response.UserDTO;
import com.homestay.dorm.entity.KhachHang;
import com.homestay.dorm.entity.NhanVien;
import com.homestay.dorm.repository.KhachHangRepository;
import com.homestay.dorm.repository.NhanVienRepository;
import com.homestay.dorm.security.CustomUserDetails;
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
    private final KhachHangRepository khachHangRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .user(getCurrentUser(request.getEmail()))
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (nhanVienRepository.existsByEmail(request.getEmail()) || khachHangRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        String role = request.getRole().toUpperCase();
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        UserDTO userDTO = new UserDTO();
        
        if (role.equals("CUSTOMER") || role.equals("KHACH")) {
            KhachHang khachHang = KhachHang.builder()
                    .maKhachHang(UUID.randomUUID().toString().substring(0, 6)) // Dummy PK generation
                    .hoTen(request.getFullName())
                    .email(request.getEmail())
                    .matKhau(encodedPassword)
                    .build();
            khachHang = khachHangRepository.save(khachHang);
            
            userDTO = mapToUserDTO(khachHang);
        } else {
            NhanVien nhanVien = NhanVien.builder()
                    .maNhanVien(UUID.randomUUID().toString().substring(0, 4)) // Dummy PK generation
                    .hoTen(request.getFullName())
                    .email(request.getEmail())
                    .loaiNhanVien(request.getRole())
                    .matKhau(encodedPassword)
                    .build();
            nhanVien = nhanVienRepository.save(nhanVien);
            
            userDTO = mapToUserDTO(nhanVien);
        }

        // Auto login
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .user(userDTO)
                .build();
    }

    @Override
    public UserDTO getCurrentUser(String email) {
        Optional<NhanVien> emp = nhanVienRepository.findByEmail(email);
        if (emp.isPresent()) {
            return mapToUserDTO(emp.get());
        }

        Optional<KhachHang> cus = khachHangRepository.findByEmail(email);
        if (cus.isPresent()) {
            return mapToUserDTO(cus.get());
        }

        throw new UsernameNotFoundException("User not found");
    }

    private UserDTO mapToUserDTO(NhanVien nhanVien) {
        return UserDTO.builder()
                .maNhanVien(nhanVien.getMaNhanVien())
                .hoTen(nhanVien.getHoTen())
                .soDienThoai(nhanVien.getSoDienThoai())
                .email(nhanVien.getEmail())
                .phai(nhanVien.getPhai())
                .cccd(nhanVien.getCccd())
                .loaiNhanVien(nhanVien.getLoaiNhanVien())
                .role(nhanVien.getLoaiNhanVien())
                .build();
    }

    private UserDTO mapToUserDTO(KhachHang khachHang) {
        return UserDTO.builder()
                .maKhachHang(khachHang.getMaKhachHang())
                .hoTen(khachHang.getHoTen())
                .soDienThoai(khachHang.getSoDienThoai())
                .email(khachHang.getEmail())
                .phai(khachHang.getPhai())
                .cccd(khachHang.getCccd())
                .quocTich(khachHang.getQuocTich())
                .role("Customer")
                .build();
    }
}
