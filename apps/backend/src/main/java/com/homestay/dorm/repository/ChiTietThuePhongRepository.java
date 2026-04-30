package com.homestay.dorm.repository;

import com.homestay.dorm.entity.ChiTietThuePhong;
import com.homestay.dorm.entity.ChiTietThuePhongId; // Dùng cái Khóa kép lúc nãy
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietThuePhongRepository extends JpaRepository<ChiTietThuePhong, ChiTietThuePhongId> {
    // Hàm này giúp Kế toán tìm xem hợp đồng đó thuê những phòng nào
    List<ChiTietThuePhong> findByMaHopDongThue(String maHopDongThue);
}
