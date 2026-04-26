package com.homestay.dorm.repository;

import com.homestay.dorm.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, String> {
	Optional<NhanVien> findByEmail(String email);

	boolean existsByEmail(String email);
}
