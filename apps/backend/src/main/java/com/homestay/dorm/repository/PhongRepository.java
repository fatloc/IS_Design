package com.homestay.dorm.repository;

import com.homestay.dorm.entity.Phong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PhongRepository extends JpaRepository<Phong, String> {
    Page<Phong> findByTrangThaiContainingIgnoreCase(String trangThai, Pageable pageable);
    
    long countByTrangThai(String trangThai);

    @Query("SELECT p.trangThai, COUNT(p) FROM Phong p GROUP BY p.trangThai")
    List<Object[]> countRoomsByStatus();

    @Query(value = "SELECT ctp.MaPhong, COALESCE(SUM(h.SoLuongThanhVien), 0) AS soNguoiHienTai " +
                   "FROM CHITIETTHUEPHONG ctp " +
                   "JOIN HOPDONGTHUE h ON ctp.MaHopDongThue = h.MaHopDongThue " +
                   "JOIN CHUNGTU ct ON h.MaHopDongThue = ct.MaVanBan " +
                   "WHERE (ct.LoaiVanBan = 'Hop dong thue' OR ct.LoaiVanBan = 'Hợp đồng thuê') " +
                   "  AND (h.TrangThaiThanhLy IS NULL OR h.TrangThaiThanhLy NOT IN ('Đã thanh lý', 'Đã trả phòng', 'Hoàn tất', 'Hoan tat', 'Đã đối soát', 'Da doi soat')) " +
                   "  AND (h.NgayKetThuc IS NULL OR h.NgayKetThuc >= CURRENT_DATE) " +
                   "GROUP BY ctp.MaPhong", nativeQuery = true)
    List<Object[]> countCurrentOccupantsPerRoom();


    @Query(value = "SELECT p.*, " +
                   "  (p.SucChuaToiDa - COALESCE(occ.soNguoi, 0)) AS slotsTrong " +
                   "FROM PHONG p " +
                   "LEFT JOIN ( " +
                   "  SELECT ctp.MaPhong, SUM(h.SoLuongThanhVien) AS soNguoi " +
                   "  FROM CHITIETTHUEPHONG ctp " +
                   "  JOIN HOPDONGTHUE h ON ctp.MaHopDongThue = h.MaHopDongThue " +
                   "  JOIN CHUNGTU ct ON h.MaHopDongThue = ct.MaVanBan " +
                   "  WHERE (ct.LoaiVanBan = 'Hop dong thue' OR ct.LoaiVanBan = 'Hợp đồng thuê') " +
                   "    AND (h.TrangThaiThanhLy IS NULL OR h.TrangThaiThanhLy NOT IN ('Đã thanh lý', 'Đã trả phòng', 'Hoàn tất', 'Hoan tat', 'Đã đối soát', 'Da doi soat')) " +
                   "    AND (h.NgayKetThuc IS NULL OR h.NgayKetThuc >= CURRENT_DATE) " +
                   "  GROUP BY ctp.MaPhong " +
                   ") occ ON p.MaPhong = occ.MaPhong " +
                   "WHERE p.TrangThai NOT IN ('Đang bảo trì') " +
                   "  AND (p.SucChuaToiDa - COALESCE(occ.soNguoi, 0)) >= :soNguoi " +
                   "ORDER BY (p.SucChuaToiDa - COALESCE(occ.soNguoi, 0)) DESC", nativeQuery = true)
    List<Phong> findRoomsWithAvailableSlots(@Param("soNguoi") int soNguoi);
}
