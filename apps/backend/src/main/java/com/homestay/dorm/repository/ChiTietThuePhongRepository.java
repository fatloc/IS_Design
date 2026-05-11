package com.homestay.dorm.repository;

import com.homestay.dorm.entity.ChiTietThuePhong;
import com.homestay.dorm.entity.ChiTietThuePhongId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietThuePhongRepository extends JpaRepository<ChiTietThuePhong, ChiTietThuePhongId> {
    // Hàm này giúp Kế toán tìm xem hợp đồng đó thuê những phòng nào
    List<ChiTietThuePhong> findByMaHopDongThue(String maHopDongThue);

    /**
     * Lấy số người đang thuê mỗi phòng = SoLuongThanhVien của hợp đồng active gắn với phòng đó.
     * Dùng DISTINCT MaHopDongThue để tránh nhân đôi nếu 1 hợp đồng có nhiều phòng.
     */
    @Query(value =
           "SELECT ct.MaPhong, COALESCE(SUM(h.SoLuongThanhVien), 0) AS soNguoi " +
           "FROM CHITIETTHUEPHONG ct " +
           "JOIN HOPDONGTHUE h ON h.MaHopDongThue = ct.MaHopDongThue " +
           "WHERE (h.TrangThaiThanhLy NOT IN ('Hoan tat') OR h.TrangThaiThanhLy IS NULL) " +
           "GROUP BY ct.MaPhong",
           nativeQuery = true)
    List<Object[]> countActiveContractsByRoom();
}
