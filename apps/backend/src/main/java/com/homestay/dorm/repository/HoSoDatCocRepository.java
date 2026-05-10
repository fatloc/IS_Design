package com.homestay.dorm.repository;

import com.homestay.dorm.entity.HoSoDatCoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface HoSoDatCocRepository extends JpaRepository<HoSoDatCoc, String> {
    java.util.Optional<HoSoDatCoc> findByKhachHangSoHuu(String khachHangSoHuu);
    long countByNgayLap(LocalDate ngayLap);
}
