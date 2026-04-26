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
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final NhanVienRepository repository;

    @Override
    public ApiListResponse<NhanVien> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NhanVien> pageData = repository.findAll(pageable);
        return ApiListResponse.ok(pageData.getContent(), pageData.getTotalElements());
    }

    @Override
    public NhanVien getUserById(String maNhanVien) {
        return repository.findById(maNhanVien)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên: " + maNhanVien));
    }

    @Override
    public NhanVien createUser(CreateUserRequest req) {
        String newId = "NV" + UUID.randomUUID().toString().replace("-", "").substring(0, 2).toUpperCase();
        
        NhanVien nv = new NhanVien();
        nv.setMaNhanVien(newId);
        nv.setHoTen(req.getHoTen() != null ? req.getHoTen() : "New User");
        nv.setSoDienThoai(req.getSoDienThoai());
        nv.setEmail(req.getEmail());
        nv.setPhai(req.getPhai() != null ? req.getPhai() : "Nam");
        nv.setCccd(req.getCccd());
        nv.setLoaiNhanVien(req.getLoaiNhanVien() != null ? req.getLoaiNhanVien() : "Sale [STATUS:Pending]");
        
        return repository.save(nv);
    }

    @Override
    public NhanVien updateUser(String maNhanVien, UpdateUserRequest req) {
        NhanVien nv = getUserById(maNhanVien);
        
        if (req.getHoTen() != null) nv.setHoTen(req.getHoTen());
        if (req.getSoDienThoai() != null) nv.setSoDienThoai(req.getSoDienThoai());
        if (req.getEmail() != null) nv.setEmail(req.getEmail());
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
}
