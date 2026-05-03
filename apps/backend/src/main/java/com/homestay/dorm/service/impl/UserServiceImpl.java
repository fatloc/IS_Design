package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateUserRequest;
import com.homestay.dorm.dto.request.UpdateUserRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.NhanVien;
import com.homestay.dorm.repository.NhanVienRepository;
import com.homestay.dorm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final NhanVienRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiListResponse<NhanVien> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NhanVien> pageData = repository.findAll(pageable);
        return ApiListResponse.fromPage(pageData);
    }

    @Override
    public NhanVien getUserById(String maNhanVien) {
        return repository.findById(maNhanVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên: " + maNhanVien));
    }

    @Override
    public NhanVien createUser(CreateUserRequest req) {
        String newId = "NV" + UUID.randomUUID().toString().replace("-", "").substring(0, 2).toUpperCase();
        String username = req.getTenDangNhap();
        if (username == null || username.isBlank()) {
            username = generateUniqueUsername(req.getEmail(), newId);
        }
        if (repository.existsByTenDangNhap(username)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + username);
        }
        
        NhanVien nv = new NhanVien();
        nv.setMaNhanVien(newId);
        nv.setHoTen(req.getHoTen() != null ? req.getHoTen() : "New User");
        nv.setTenDangNhap(username);
        nv.setSoDienThoai(req.getSoDienThoai());
        nv.setEmail(req.getEmail());
        nv.setPhai(req.getPhai() != null ? req.getPhai() : "Nam");
        nv.setCccd(req.getCccd());
        nv.setLoaiNhanVien(req.getLoaiNhanVien() != null ? req.getLoaiNhanVien() : "Sale");
        String rawPassword = (req.getMatKhau() == null || req.getMatKhau().isBlank()) ? "123456" : req.getMatKhau();
        nv.setMatKhau(passwordEncoder.encode(rawPassword));
        
        return repository.save(nv);
    }

    @Override
    public NhanVien updateUser(String maNhanVien, UpdateUserRequest req) {
        NhanVien nv = getUserById(maNhanVien);
        
        if (req.getHoTen() != null) nv.setHoTen(req.getHoTen());
        if (req.getTenDangNhap() != null) {
            String username = req.getTenDangNhap().trim();
            if (!username.equalsIgnoreCase(nv.getTenDangNhap()) && repository.existsByTenDangNhap(username)) {
                throw new RuntimeException("Tên đăng nhập đã tồn tại: " + username);
            }
            nv.setTenDangNhap(username);
        }
        if (req.getSoDienThoai() != null) nv.setSoDienThoai(req.getSoDienThoai());
        if (req.getEmail() != null) nv.setEmail(req.getEmail());
        if (req.getMatKhau() != null && !req.getMatKhau().isBlank()) {
            nv.setMatKhau(passwordEncoder.encode(req.getMatKhau()));
        }
        if (req.getPhai() != null) nv.setPhai(req.getPhai());
        if (req.getCccd() != null) nv.setCccd(req.getCccd());
        if (req.getLoaiNhanVien() != null) nv.setLoaiNhanVien(req.getLoaiNhanVien());
        
        return repository.save(nv);
    }

    @Override
    public void deleteUser(String maNhanVien) {
        NhanVien nv = getUserById(maNhanVien);
        repository.delete(nv);
    }

    private String generateUniqueUsername(String email, String fallbackId) {
        String base = (email != null && email.contains("@"))
                ? email.substring(0, email.indexOf('@'))
                : "nv" + fallbackId.toLowerCase();
        if (base.isBlank()) {
            base = "nv" + fallbackId.toLowerCase();
        }

        String candidate = base;
        int suffix = 1;
        while (repository.existsByTenDangNhap(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }
}
