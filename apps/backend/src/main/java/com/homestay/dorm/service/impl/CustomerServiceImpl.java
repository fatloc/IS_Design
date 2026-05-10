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
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private static final Logger log = LoggerFactory.getLogger(CustomerServiceImpl.class);
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
    @Transactional
    public KhachHang createCustomer(KhachHang data) {
        log.info("Bắt đầu tạo khách hàng mới: {}", data.getHoTen());
        if (data.getHoTen() != null && data.getHoTen().length() > 50) {
            throw new RuntimeException("Họ tên không được vượt quá 50 ký tự.");
        }
        if (data.getSoDienThoai() != null && data.getSoDienThoai().length() > 10) {
            throw new RuntimeException("Số điện thoại không được vượt quá 10 ký tự.");
        }
        if (data.getCccd() != null && data.getCccd().length() > 12) {
            throw new RuntimeException("CCCD không được vượt quá 12 ký tự.");
        }
        
        String newId = String.format("KH%04d", new java.util.Random().nextInt(10000));
        data.setMaKhachHang(newId);
        log.info("Dự kiến lưu khách hàng với ID: {}", newId);
        
        KhachHang saved = khachHangRepository.save(data);
        log.info("Đã lưu thành công khách hàng: {} vào database.", saved.getMaKhachHang());
        return saved;
    }
}
