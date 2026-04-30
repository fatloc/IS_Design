package com.homestay.dorm.repository;

import com.homestay.dorm.entity.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, String> {
    Optional<KhachHang> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT k FROM KhachHang k WHERE " +
           "LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "k.soDienThoai LIKE CONCAT('%', :q, '%') OR " +
           "k.cccd LIKE CONCAT('%', :q, '%') OR " +
           "k.maKhachHang LIKE CONCAT('%', :q, '%')")
    Page<KhachHang> searchCustomers(@Param("q") String q, Pageable pageable);
}

