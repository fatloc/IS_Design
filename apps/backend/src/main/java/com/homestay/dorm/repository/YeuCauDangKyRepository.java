package com.homestay.dorm.repository;

import com.homestay.dorm.entity.YeuCauDangKy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface YeuCauDangKyRepository extends JpaRepository<YeuCauDangKy, String> {
    Page<YeuCauDangKy> findByNhanVienPhuTrach(String nhanVienPhuTrach, Pageable pageable);
    Page<YeuCauDangKy> findByTrangThaiYeuCau(String trangThaiYeuCau, Pageable pageable);
    Page<YeuCauDangKy> findByNhanVienPhuTrachAndTrangThaiYeuCau(String nhanVienPhuTrach, String trangThaiYeuCau, Pageable pageable);
    
    long countByThoiGianBatDauThueDuKienAfter(LocalDate date);
    Page<YeuCauDangKy> findByThoiGianBatDauThueDuKienAfter(LocalDate date, Pageable pageable);
    
    // Date filtering queries
    Page<YeuCauDangKy> findByNgayTao(LocalDate ngayTao, Pageable pageable);
    
    @Query("SELECT y FROM YeuCauDangKy y WHERE YEAR(y.ngayTao) = :year AND MONTH(y.ngayTao) = :month")
    Page<YeuCauDangKy> findByYearAndMonth(@Param("year") int year, @Param("month") int month, Pageable pageable);
    
    @Query(value = "SELECT y FROM YeuCauDangKy y LEFT JOIN FETCH y.khachHang k WHERE " +
           "(:nhanVienPhuTrach IS NULL OR y.nhanVienPhuTrach = :nhanVienPhuTrach) AND " +
           "(:trangThaiYeuCau IS NULL OR y.trangThaiYeuCau = :trangThaiYeuCau) AND " +
           "(:ngayTao IS NULL OR y.ngayTao = :ngayTao) AND " +
           "(:search IS NULL OR LOWER(y.maYeuCau) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY y.ngayTao DESC, y.maYeuCau DESC",
           countQuery = "SELECT COUNT(y) FROM YeuCauDangKy y LEFT JOIN y.khachHang k WHERE " +
           "(:nhanVienPhuTrach IS NULL OR y.nhanVienPhuTrach = :nhanVienPhuTrach) AND " +
           "(:trangThaiYeuCau IS NULL OR y.trangThaiYeuCau = :trangThaiYeuCau) AND " +
           "(:ngayTao IS NULL OR y.ngayTao = :ngayTao) AND " +
           "(:search IS NULL OR LOWER(y.maYeuCau) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<YeuCauDangKy> findByFiltersWithSearch(
        @Param("nhanVienPhuTrach") String nhanVienPhuTrach,
        @Param("trangThaiYeuCau") String trangThaiYeuCau,
        @Param("ngayTao") LocalDate ngayTao,
        @Param("search") String search,
        Pageable pageable
    );
    
    @Query(value = "SELECT y FROM YeuCauDangKy y LEFT JOIN FETCH y.khachHang k WHERE " +
           "(:nhanVienPhuTrach IS NULL OR y.nhanVienPhuTrach = :nhanVienPhuTrach) AND " +
           "(:trangThaiYeuCau IS NULL OR y.trangThaiYeuCau = :trangThaiYeuCau) AND " +
           "YEAR(y.ngayTao) = :year AND MONTH(y.ngayTao) = :month AND " +
           "(:search IS NULL OR LOWER(y.maYeuCau) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY y.ngayTao DESC, y.maYeuCau DESC",
           countQuery = "SELECT COUNT(y) FROM YeuCauDangKy y LEFT JOIN y.khachHang k WHERE " +
           "(:nhanVienPhuTrach IS NULL OR y.nhanVienPhuTrach = :nhanVienPhuTrach) AND " +
           "(:trangThaiYeuCau IS NULL OR y.trangThaiYeuCau = :trangThaiYeuCau) AND " +
           "YEAR(y.ngayTao) = :year AND MONTH(y.ngayTao) = :month AND " +
           "(:search IS NULL OR LOWER(y.maYeuCau) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<YeuCauDangKy> findByFiltersAndMonthWithSearch(
        @Param("nhanVienPhuTrach") String nhanVienPhuTrach,
        @Param("trangThaiYeuCau") String trangThaiYeuCau,
        @Param("year") int year,
        @Param("month") int month,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT y.trangThaiYeuCau, COUNT(y) FROM YeuCauDangKy y GROUP BY y.trangThaiYeuCau")
    List<Object[]> countByStatus();

    @Query("SELECT y.gioiTinhYeuCau, COUNT(y) FROM YeuCauDangKy y GROUP BY y.gioiTinhYeuCau")
    List<Object[]> countByGender();

    @Query("SELECT CASE WHEN y.soLuongNguoi > 1 THEN 'Whole Room' ELSE 'Shared Bed' END, COUNT(y) FROM YeuCauDangKy y GROUP BY CASE WHEN y.soLuongNguoi > 1 THEN 'Whole Room' ELSE 'Shared Bed' END")
    List<Object[]> countByRentalMode();
}
