package com.homestay.dorm.repository;

import com.homestay.dorm.entity.Phong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {
    Page<Phong> findByTrangThaiContainingIgnoreCase(String trangThai, Pageable pageable);

    long countByTrangThai(String trangThai);

    /** Tổng sức chứa tất cả phòng */
    @Query("SELECT COALESCE(SUM(p.sucChuaToiDa), 0) FROM Phong p")
    long sumTotalCapacity();

    /**
     * Tìm phòng trống (Toàn phòng): trangThai = 'Trống', giá <= mucGia.
     */
    @Query("SELECT p FROM Phong p WHERE p.trangThai = 'Trống' " +
           "AND p.giaThuePhong <= :mucGia")
    List<Phong> findAvailableFullRooms(@Param("mucGia") BigDecimal mucGia);

    /**
     * Tìm phòng ghép giường: sức chứa còn lại >= soLuongNguoi, giá <= mucGia.
     * Đếm số người hiện tại qua ChiTietThuePhong.
     */
    @Query("SELECT p FROM Phong p WHERE p.giaThuePhong <= :mucGia " +
           "AND (p.sucChuaToiDa - (" +
           "  SELECT COUNT(ct) FROM ChiTietThuePhong ct WHERE ct.maPhong = p.maPhong" +
           ")) >= :soLuongNguoi")
    List<Phong> findAvailableSharedRooms(@Param("mucGia") BigDecimal mucGia,
                                          @Param("soLuongNguoi") Integer soLuongNguoi);
}
