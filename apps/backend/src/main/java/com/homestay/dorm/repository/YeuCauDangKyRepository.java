package com.homestay.dorm.repository;

import com.homestay.dorm.entity.YeuCauDangKy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface YeuCauDangKyRepository extends JpaRepository<YeuCauDangKy, String> {
    Page<YeuCauDangKy> findByNhanVienPhuTrach(String nhanVienPhuTrach, Pageable pageable);
}
