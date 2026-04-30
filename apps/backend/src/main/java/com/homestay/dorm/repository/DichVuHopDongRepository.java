package com.homestay.dorm.repository;

import com.homestay.dorm.entity.DichVu_HopDongThue;
import com.homestay.dorm.entity.DichVuHopDongThueId; // Dùng cái Khóa kép lúc nãy
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DichVuHopDongRepository extends JpaRepository<DichVu_HopDongThue, DichVuHopDongThueId> {
    List<DichVu_HopDongThue> findByMaHopDongThue(String maHopDongThue);
}