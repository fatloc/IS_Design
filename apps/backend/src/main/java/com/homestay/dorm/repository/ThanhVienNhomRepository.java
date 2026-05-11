package com.homestay.dorm.repository;

import com.homestay.dorm.entity.ThanhVienNhom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThanhVienNhomRepository extends JpaRepository<ThanhVienNhom, String> {
    List<ThanhVienNhom> findByMaYeuCau(String maYeuCau);
    List<ThanhVienNhom> findByMaHopDongThue(String maHopDongThue);
}
