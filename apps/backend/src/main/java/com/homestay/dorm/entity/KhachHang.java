package com.homestay.dorm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "KHACHHANG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang {
    @Id
    @Column(name = "MaKhachHang", length = 6)
    private String maKhachHang;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 50, message = "Họ tên tối đa 50 ký tự")
    @Column(name = "HoTen", length = 50)
    private String hoTen;

    @Size(max = 10, message = "Số điện thoại tối đa 10 ký tự")
    @Pattern(regexp = "^[0-9]*$", message = "Số điện thoại chỉ được chứa chữ số")
    @Column(name = "SoDienThoai", length = 10, unique = true)
    private String soDienThoai;

    @Size(max = 50, message = "Email tối đa 50 ký tự")
    @Email(message = "Email không đúng định dạng")
    @Column(name = "Email", length = 50, unique = true)
    private String email;

    @Size(max = 3)
    @Column(name = "Phai", length = 3)
    private String phai;

    @Size(max = 12, message = "CCCD tối đa 12 ký tự")
    @Column(name = "CCCD", length = 12, unique = true)
    private String cccd;

    @Size(max = 30)
    @Column(name = "QuocTich", length = 30)
    private String quocTich;
}
