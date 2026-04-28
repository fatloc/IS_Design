package com.homestay.dorm.repository;

import com.homestay.dorm.entity.PhieuThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhieuThanhToanRepository extends JpaRepository<PhieuThanhToan, String> {
}
