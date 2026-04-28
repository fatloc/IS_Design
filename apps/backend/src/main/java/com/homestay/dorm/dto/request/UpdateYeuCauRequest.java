package com.homestay.dorm.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateYeuCauRequest {
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
}
