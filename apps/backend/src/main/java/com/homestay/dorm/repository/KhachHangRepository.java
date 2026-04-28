package com.homestay.dorm.repository;

import com.homestay.dorm.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    Optional<KhachHang> findByEmail(String email);
    boolean existsByEmail(String email);
}
