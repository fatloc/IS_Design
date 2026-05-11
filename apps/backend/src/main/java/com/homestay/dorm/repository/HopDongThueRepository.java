package com.homestay.dorm.repository;

import com.homestay.dorm.entity.HopDongThue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HopDongThueRepository extends JpaRepository<HopDongThue, String> {

    /**
     * Tổng số người đang thuê = sum(soLuongThanhVien) từ các hợp đồng chưa hoàn tất
     */
    @Query("SELECT COALESCE(SUM(h.soLuongThanhVien), 0) FROM HopDongThue h " +
           "WHERE h.trangThaiThanhLy NOT IN ('Hoan tat') OR h.trangThaiThanhLy IS NULL")
    long sumActiveTenants();
}
