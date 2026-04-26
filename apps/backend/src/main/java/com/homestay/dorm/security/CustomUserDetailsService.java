package com.homestay.dorm.security;

import com.homestay.dorm.entity.KhachHang;
import com.homestay.dorm.entity.NhanVien;
import com.homestay.dorm.repository.KhachHangRepository;
import com.homestay.dorm.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final NhanVienRepository nhanVienRepository;
    private final KhachHangRepository khachHangRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Check Employee first
        Optional<NhanVien> employeeOpt = nhanVienRepository.findByEmail(email);
        if (employeeOpt.isPresent()) {
            NhanVien emp = employeeOpt.get();
            String role = (emp.getLoaiNhanVien() != null) ? emp.getLoaiNhanVien() : "SALE";
            return new CustomUserDetails(emp.getMaNhanVien(), emp.getEmail(), emp.getMatKhau(), role);
        }

        // Check Customer
        Optional<KhachHang> customerOpt = khachHangRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            KhachHang cus = customerOpt.get();
            return new CustomUserDetails(cus.getMaKhachHang(), cus.getEmail(), cus.getMatKhau(), "CUSTOMER");
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
