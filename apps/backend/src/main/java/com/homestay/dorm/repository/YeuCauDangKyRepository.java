package com.homestay.dorm.repository;

import com.homestay.dorm.entity.YeuCauDangKy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface YeuCauDangKyRepository extends JpaRepository<YeuCauDangKy, String> {
    Page<YeuCauDangKy> findByNhanVienPhuTrach(String nhanVienPhuTrach, Pageable pageable);
    Page<YeuCauDangKy> findByTrangThaiYeuCau(String trangThaiYeuCau, Pageable pageable);
    Page<YeuCauDangKy> findByNhanVienPhuTrachAndTrangThaiYeuCau(String nhanVienPhuTrach, String trangThaiYeuCau, Pageable pageable);
    
    long countByThoiGianBatDauThueDuKienAfter(LocalDate date);
    Page<YeuCauDangKy> findByThoiGianBatDauThueDuKienAfter(LocalDate date, Pageable pageable);

    // Search methods
    Page<YeuCauDangKy> findByKhachHangYeuCauContaining(String search, Pageable pageable);
    Page<YeuCauDangKy> findByNhanVienPhuTrachAndKhachHangYeuCauContaining(String nhanVienPhuTrach, String search, Pageable pageable);
    Page<YeuCauDangKy> findByTrangThaiYeuCauAndKhachHangYeuCauContaining(String trangThaiYeuCau, String search, Pageable pageable);
    Page<YeuCauDangKy> findByNhanVienPhuTrachAndTrangThaiYeuCauAndKhachHangYeuCauContaining(String nhanVienPhuTrach, String trangThaiYeuCau, String search, Pageable pageable);
}
