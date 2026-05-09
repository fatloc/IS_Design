package com.homestay.dorm.service;

import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.KhachHang;

public interface CustomerService {
    ApiListResponse<KhachHang> getCustomers(int page, int size, String search);
    KhachHang getCustomerById(String maKhachHang);
    KhachHang updateCustomer(String maKhachHang, KhachHang data);
    KhachHang createCustomer(KhachHang data);
}
