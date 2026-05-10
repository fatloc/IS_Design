package com.homestay.dorm.repository;

import com.homestay.dorm.entity.HopDongThue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HopDongThueRepository extends JpaRepository<HopDongThue, String> {

    @Query("SELECT h FROM HopDongThue h " +
           "LEFT JOIN KhachHang k ON h.khachHangSoHuu = k.maKhachHang " +
           "WHERE (:loaiVanBan IS NULL OR h.loaiVanBan IN :loaiVanBan) " +
           "AND (:kyThanhToan IS NULL OR h.kyThanhToan = :kyThanhToan) " +
           "AND (:q IS NULL OR :q = '' OR " +
           "     LOWER(h.maVanBan) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "     LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "     k.soDienThoai LIKE CONCAT('%', :q, '%') OR " +
           "     k.cccd LIKE CONCAT('%', :q, '%'))")
    Page<HopDongThue> searchContracts(
            @Param("q") String q,
            @Param("loaiVanBan") java.util.List<String> loaiVanBan,
            @Param("kyThanhToan") String kyThanhToan,
            Pageable pageable);

    @Query("SELECT COUNT(h) FROM HopDongThue h WHERE h.loaiVanBan = :loai")
    long countByLoaiVanBan(@Param("loai") String loai);

    @Query("SELECT COUNT(h) FROM HopDongThue h WHERE h.loaiVanBan IN :loaiList")
    long countByLoaiVanBanIn(@Param("loaiList") java.util.List<String> loaiList);
}
