package com.homestay.dorm.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    // Optional: nhân viên có thể tự tạo hoặc được hệ thống cấp.
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Vai trò không được để trống")
    private String role; // Sale, Manager, Accountant
}
