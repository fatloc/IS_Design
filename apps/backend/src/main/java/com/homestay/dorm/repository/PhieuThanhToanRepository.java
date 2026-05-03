package com.homestay.dorm.repository;

import com.homestay.dorm.entity.PhieuThanhToan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhieuThanhToanRepository extends JpaRepository<PhieuThanhToan, String> {
    Page<PhieuThanhToan> findByLoaiGiaoDichAndTrangThai(String loaiGiaoDich, String trangThai, Pageable pageable);
    Page<PhieuThanhToan> findByLoaiGiaoDich(String loaiGiaoDich, Pageable pageable);
    Page<PhieuThanhToan> findByTrangThai(String trangThai, Pageable pageable);
}
