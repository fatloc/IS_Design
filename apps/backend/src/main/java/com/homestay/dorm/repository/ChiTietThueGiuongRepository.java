package com.homestay.dorm.repository;

import com.homestay.dorm.entity.ChiTietThueGiuong;
import com.homestay.dorm.entity.ChiTietThueGiuongId; // Dùng cái Khóa kép lúc nãy
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietThueGiuongRepository extends JpaRepository<ChiTietThueGiuong, ChiTietThueGiuongId> {
    List<ChiTietThueGiuong> findByMaHopDongThue(String maHopDongThue);
}