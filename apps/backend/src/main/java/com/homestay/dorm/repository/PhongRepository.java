package com.homestay.dorm.repository;

import com.homestay.dorm.entity.Phong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {
    Page<Phong> findByTrangThaiContainingIgnoreCase(String trangThai, Pageable pageable);
    
    long countByTrangThai(String trangThai);
}
