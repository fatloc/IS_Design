package com.homestay.dorm.repository;

import com.homestay.dorm.entity.ThanhVienNhom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhVienNhomRepository extends JpaRepository<ThanhVienNhom, String> {
    List<ThanhVienNhom> findByMaHopDongThue(String maHopDongThue);
    List<ThanhVienNhom> findByNguoiDaiDien(String nguoiDaiDien);
}
