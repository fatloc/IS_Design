package com.homestay.dorm.controller;

import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApiResponse;
import com.homestay.dorm.entity.KhachHang;
import com.homestay.dorm.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ApiListResponse<KhachHang> getCustomers(
            @RequestParam(defaultValue = "0")   int    page,
            @RequestParam(defaultValue = "10")  int    size,
            @RequestParam(required = false)     String search) {
        return customerService.getCustomers(page, size, search);
    }

    @GetMapping("/{maKhachHang}")
    public ApiResponse<KhachHang> getCustomerById(@PathVariable String maKhachHang) {
        return ApiResponse.ok(customerService.getCustomerById(maKhachHang));
    }

    @PutMapping("/{maKhachHang}")
    public ApiResponse<KhachHang> updateCustomer(
            @PathVariable String maKhachHang,
            @RequestBody KhachHang data) {
        return ApiResponse.ok(customerService.updateCustomer(maKhachHang, data));
    }

    @PostMapping
    public ApiResponse<KhachHang> createCustomer(@RequestBody KhachHang data) {
        return ApiResponse.ok(customerService.createCustomer(data));
    }

    @DeleteMapping("/{maKhachHang}")
    public ApiResponse<Void> deleteCustomer(@PathVariable String maKhachHang) {
        customerService.deleteCustomer(maKhachHang);
        return ApiResponse.ok(null);
    }
}
