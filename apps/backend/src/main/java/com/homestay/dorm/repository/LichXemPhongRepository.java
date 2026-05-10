package com.homestay.dorm.repository;

import com.homestay.dorm.entity.LichXemPhong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface LichXemPhongRepository extends JpaRepository<LichXemPhong, String> {
    Page<LichXemPhong> findByNgayHenBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    long countByNgayHenAfter(LocalDate date);
    Page<LichXemPhong> findByNgayHenAfter(LocalDate date, Pageable pageable);

    long countByNgayHen(LocalDate ngayHen);
    Page<LichXemPhong> findByNgayHen(LocalDate ngayHen, Pageable pageable);

    java.util.Optional<LichXemPhong> findFirstByMaYeuCau(String maYeuCau);
}
