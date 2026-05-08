package com.homestay.dorm.repository;

import com.homestay.dorm.entity.YeuCauDangKy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    @Query("SELECT y FROM YeuCauDangKy y WHERE " +
           "(:nhanVienPhuTrach IS NULL OR y.nhanVienPhuTrach = :nhanVienPhuTrach) AND " +
           "(:trangThaiYeuCau IS NULL OR y.trangThaiYeuCau = :trangThaiYeuCau) AND " +
           "(:ngayTao IS NULL OR y.ngayTao = :ngayTao)")
    Page<YeuCauDangKy> findByFilters(
        @Param("nhanVienPhuTrach") String nhanVienPhuTrach,
        @Param("trangThaiYeuCau") String trangThaiYeuCau,
        @Param("ngayTao") LocalDate ngayTao,
        Pageable pageable
    );
    
    @Query("SELECT y FROM YeuCauDangKy y WHERE " +
           "(:nhanVienPhuTrach IS NULL OR y.nhanVienPhuTrach = :nhanVienPhuTrach) AND " +
           "(:trangThaiYeuCau IS NULL OR y.trangThaiYeuCau = :trangThaiYeuCau) AND " +
           "YEAR(y.ngayTao) = :year AND MONTH(y.ngayTao) = :month")
    Page<YeuCauDangKy> findByFiltersAndMonth(
        @Param("nhanVienPhuTrach") String nhanVienPhuTrach,
        @Param("trangThaiYeuCau") String trangThaiYeuCau,
        @Param("year") int year,
        @Param("month") int month,
        Pageable pageable
    );
}
