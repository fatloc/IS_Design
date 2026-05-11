package com.homestay.dorm.dto.response;

import com.homestay.dorm.entity.ThanhVienNhom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Chi tiết hợp đồng kèm thông tin lưu trú:
 * danh sách phòng, giường và thành viên nhóm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractDetailResponse {

    private String maHopDongThue;

    /** Danh sách mã phòng đang thuê */
    private List<String> danhSachPhong;

    /** Danh sách mã giường đang thuê */
    private List<String> danhSachGiuong;

    /** Danh sách thành viên trong nhóm */
    private List<ThanhVienInfo> thanhVienList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThanhVienInfo {
        private String maThanhVien;
        private String hoTen;
        private String soDienThoai;
        private String phai;
        private String cccd;
        private String quocTich;
        private Boolean nguoiDaiDien;
    }
}
