package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.KhachHang;
import com.homestay.dorm.repository.KhachHangRepository;
import com.homestay.dorm.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final KhachHangRepository khachHangRepository;

    @Override
    public ApiListResponse<KhachHang> getCustomers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("maKhachHang").ascending());
        Page<KhachHang> pageData;
        if (search != null && !search.isBlank()) {
            pageData = khachHangRepository.searchCustomers(search.trim(), pageable);
        } else {
            pageData = khachHangRepository.findAll(pageable);
        }
        return ApiListResponse.fromPage(pageData);
    }

    @Override
    public KhachHang getCustomerById(String maKhachHang) {
        return khachHangRepository.findById(maKhachHang)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng: " + maKhachHang));
    }

    @Override
    public KhachHang updateCustomer(String maKhachHang, KhachHang data) {
        KhachHang kh = getCustomerById(maKhachHang);
        if (data.getHoTen() != null)      kh.setHoTen(data.getHoTen());
        if (data.getSoDienThoai() != null) kh.setSoDienThoai(data.getSoDienThoai());
        if (data.getEmail() != null)       kh.setEmail(data.getEmail());
        if (data.getPhai() != null)        kh.setPhai(data.getPhai());
        if (data.getCccd() != null)        kh.setCccd(data.getCccd());
        if (data.getQuocTich() != null)    kh.setQuocTich(data.getQuocTich());
        return khachHangRepository.save(kh);
    }

    @Override
    public KhachHang createCustomer(KhachHang data) {
        // 1. Validate hoTen
        if (data.getHoTen() == null || data.getHoTen().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Họ tên không được để trống");
        }
        // 2. Validate soDienThoai length
        if (data.getSoDienThoai() != null && data.getSoDienThoai().length() > 10) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Số điện thoại không được vượt quá 10 ký tự");
        }
        // 3. Validate cccd length
        if (data.getCccd() != null && data.getCccd().length() > 12) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "CCCD không được vượt quá 12 ký tự");
        }
        // 4. Check duplicate soDienThoai
        if (data.getSoDienThoai() != null && khachHangRepository.existsBySoDienThoai(data.getSoDienThoai())) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT, "Số điện thoại đã được đăng ký trong hệ thống");
        }
        // 5. Check duplicate cccd
        if (data.getCccd() != null && !data.getCccd().isBlank() && khachHangRepository.existsByCccd(data.getCccd())) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT, "CCCD đã được đăng ký trong hệ thống");
        }
        // 6. Auto-generate maKhachHang KH#### with retry
        String newId = null;
        for (int i = 0; i < 10; i++) {
            String candidate = String.format("KH%04d", new java.util.Random().nextInt(10000));
            if (!khachHangRepository.existsById(candidate)) {
                newId = candidate;
                break;
            }
        }
        if (newId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo mã khách hàng, vui lòng thử lại");
        }
        data.setMaKhachHang(newId);
        return khachHangRepository.save(data);
    }

    @Override
    public void deleteCustomer(String maKhachHang) {
        KhachHang kh = getCustomerById(maKhachHang);
        try {
            khachHangRepository.delete(kh);
            khachHangRepository.flush(); // Force immediate check of constraints
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT, 
                "Không thể xóa khách hàng này vì đang trong quá trình thuê hoặc có dữ liệu liên quan (hợp đồng, hóa đơn...)."
            );
        }
    }
}
