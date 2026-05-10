package com.homestay.dorm.security;

import com.homestay.dorm.entity.NhanVien;
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

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<NhanVien> employeeOpt = nhanVienRepository.findByTenDangNhap(username);
        if (employeeOpt.isEmpty()) {
            employeeOpt = nhanVienRepository.findByEmail(username);
        }
        if (employeeOpt.isEmpty()) {
            throw new UsernameNotFoundException("User not found with username/email: " + username);
        }

        NhanVien emp = employeeOpt.get();
        String role = normalizeRole(emp.getLoaiNhanVien());
        return new CustomUserDetails(emp.getMaNhanVien(), emp.getTenDangNhap(), emp.getMatKhau(), role);
    }

    private String normalizeRole(String loaiNhanVien) {
        if (loaiNhanVien == null) {
            return "Sale";
        }

        String normalized = java.text.Normalizer.normalize(loaiNhanVien, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "");

        if (normalized.contains("manager") || normalized.contains("quanly")) {
            return "Manager";
        }

        if (normalized.contains("accountant") || normalized.contains("ketoan")) {
            return "Accountant";
        }

        return "Sale";
    }
}
