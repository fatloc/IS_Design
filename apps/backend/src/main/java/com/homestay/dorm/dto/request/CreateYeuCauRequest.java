package com.homestay.dorm.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateYeuCauRequest {
    private Integer soLuongNguoi;
    private String gioiTinhYeuCau;
    private LocalDate thoiGianBatDauThueDuKien;
    private LocalDate thoiGianBanGiaoPhongDuKien;
    private Boolean coDieuHoa;
    private String khuVuc;
    private BigDecimal mucGiaMongMuon;
    private Boolean coBaiGuiXe;
    private String cacTieuChiKhac;
    private String khachHangYeuCau;
    private String nhanVienPhuTrach;
    private String trangThaiYeuCau;
    private Integer thoiHanThue;
    private String maPhongDeXuat;
    private List<ThanhVienDto> thanhVienList;
}
