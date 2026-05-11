package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateYeuCauRequest;
import com.homestay.dorm.dto.request.ThanhVienDto;
import com.homestay.dorm.dto.request.UpdateYeuCauRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.dto.response.ApproveRequestResponse;
import com.homestay.dorm.entity.ChiTietThuePhong;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.entity.ThanhVienNhom;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.repository.ChiTietThuePhongRepository;
import com.homestay.dorm.repository.HopDongThueRepository;
import com.homestay.dorm.repository.ThanhVienNhomRepository;
import com.homestay.dorm.repository.YeuCauDangKyRepository;
import com.homestay.dorm.service.RequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {
    private static final String DEFAULT_REQUEST_STATUS = "Yêu cầu mới";

    private final YeuCauDangKyRepository yeuCauRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final HopDongThueRepository hopDongThueRepository;
    private final ChiTietThuePhongRepository chiTietThuePhongRepository;

    @Override
    public ApiListResponse<YeuCauDangKy> getRequests(int page, int size, String nhanVienPhuTrach, String trangThaiYeuCau, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<YeuCauDangKy> yeuCauPage;

        boolean hasNhanVien = nhanVienPhuTrach != null && !nhanVienPhuTrach.isEmpty();
        boolean hasTrangThai = trangThaiYeuCau != null && !trangThaiYeuCau.isEmpty();
        boolean hasSearch = search != null && !search.isEmpty();

        if (hasSearch) {
            if (hasNhanVien && hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndTrangThaiYeuCauAndKhachHangYeuCauContaining(nhanVienPhuTrach, trangThaiYeuCau, search, pageable);
            } else if (hasNhanVien) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndKhachHangYeuCauContaining(nhanVienPhuTrach, search, pageable);
            } else if (hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByTrangThaiYeuCauAndKhachHangYeuCauContaining(trangThaiYeuCau, search, pageable);
            } else {
                yeuCauPage = yeuCauRepository.findByKhachHangYeuCauContaining(search, pageable);
            }
        } else {
            if (hasNhanVien && hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrachAndTrangThaiYeuCau(nhanVienPhuTrach, trangThaiYeuCau, pageable);
            } else if (hasNhanVien) {
                yeuCauPage = yeuCauRepository.findByNhanVienPhuTrach(nhanVienPhuTrach, pageable);
            } else if (hasTrangThai) {
                yeuCauPage = yeuCauRepository.findByTrangThaiYeuCau(trangThaiYeuCau, pageable);
            } else {
                yeuCauPage = yeuCauRepository.findAll(pageable);
            }
        }

        return ApiListResponse.fromPage(yeuCauPage);
    }

    @Override
    public YeuCauDangKy getRequestById(String maYeuCau) {
        return yeuCauRepository.findById(maYeuCau)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu: " + maYeuCau));
    }

    @Transactional
    @Override
    public YeuCauDangKy createRequest(CreateYeuCauRequest req) {
        // Validate thoiHanThue
        if (req.getThoiHanThue() != null) {
            Set<Integer> validValues = Set.of(1, 3, 6);
            if (!validValues.contains(req.getThoiHanThue())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Thời hạn thuê phải là 1, 3 hoặc 6 tháng");
            }
        }

        String newId = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();

        YeuCauDangKy yeuCau = YeuCauDangKy.builder()
                .maYeuCau(newId)
                .soLuongNguoi(req.getSoLuongNguoi())
                .gioiTinhYeuCau(req.getGioiTinhYeuCau())
                .thoiGianBatDauThueDuKien(req.getThoiGianBatDauThueDuKien())
                .thoiGianBanGiaoPhongDuKien(req.getThoiGianBanGiaoPhongDuKien())
                .coDieuHoa(req.getCoDieuHoa())
                .khuVuc(req.getKhuVuc())
                .mucGiaMongMuon(req.getMucGiaMongMuon())
                .coBaiGuiXe(req.getCoBaiGuiXe())
                .cacTieuChiKhac(req.getCacTieuChiKhac())
                .khachHangYeuCau(req.getKhachHangYeuCau())
                .nhanVienPhuTrach(req.getNhanVienPhuTrach())
                .trangThaiYeuCau(req.getTrangThaiYeuCau() != null ? req.getTrangThaiYeuCau() : DEFAULT_REQUEST_STATUS)
                .thoiHanThue(req.getThoiHanThue())
                .ngayTao(java.time.LocalDate.now())
                .maPhongDeXuat(req.getMaPhongDeXuat())
                .build();

        yeuCauRepository.save(yeuCau);

        // Lưu thành viên nhóm
        if (req.getThanhVienList() != null && !req.getThanhVienList().isEmpty()) {
            for (ThanhVienDto tvDto : req.getThanhVienList()) {
                String tvId = String.format("TV%03d", new java.util.Random().nextInt(1000));
                ThanhVienNhom tv = ThanhVienNhom.builder()
                        .maThanhVien(tvId)
                        .hoTen(tvDto.hoTen())
                        .soDienThoai(tvDto.soDienThoai())
                        .phai(tvDto.phai())
                        .cccd(tvDto.cccd())
                        .quocTich(tvDto.quocTich())
                        .maYeuCau(yeuCau.getMaYeuCau())
                        .maHopDongThue(null)
                        .nguoiDaiDien(null)
                        .build();
                thanhVienNhomRepository.save(tv);
            }
        }

        return yeuCau;
    }

    @Override
    public YeuCauDangKy updateRequest(String maYeuCau, UpdateYeuCauRequest req) {
        YeuCauDangKy yeuCau = getRequestById(maYeuCau);
        
        if (req.getSoLuongNguoi() != null) yeuCau.setSoLuongNguoi(req.getSoLuongNguoi());
        if (req.getGioiTinhYeuCau() != null) yeuCau.setGioiTinhYeuCau(req.getGioiTinhYeuCau());
        if (req.getThoiGianBatDauThueDuKien() != null) yeuCau.setThoiGianBatDauThueDuKien(req.getThoiGianBatDauThueDuKien());
        if (req.getThoiGianBanGiaoPhongDuKien() != null) yeuCau.setThoiGianBanGiaoPhongDuKien(req.getThoiGianBanGiaoPhongDuKien());
        if (req.getCoDieuHoa() != null) yeuCau.setCoDieuHoa(req.getCoDieuHoa());
        if (req.getKhuVuc() != null) yeuCau.setKhuVuc(req.getKhuVuc());
        if (req.getMucGiaMongMuon() != null) yeuCau.setMucGiaMongMuon(req.getMucGiaMongMuon());
        if (req.getCoBaiGuiXe() != null) yeuCau.setCoBaiGuiXe(req.getCoBaiGuiXe());
        if (req.getCacTieuChiKhac() != null) yeuCau.setCacTieuChiKhac(req.getCacTieuChiKhac());
        if (req.getNhanVienPhuTrach() != null) yeuCau.setNhanVienPhuTrach(req.getNhanVienPhuTrach());
        if (req.getTrangThaiYeuCau() != null) yeuCau.setTrangThaiYeuCau(req.getTrangThaiYeuCau());
        
        return yeuCauRepository.save(yeuCau);
    }

    @Override
    public void deleteRequest(String maYeuCau) {
        YeuCauDangKy yeuCau = getRequestById(maYeuCau);
        yeuCauRepository.delete(yeuCau);
    }

    @Transactional
    @Override
    public ApproveRequestResponse approveRequest(String maYeuCau) {
        YeuCauDangKy yeuCau = getRequestById(maYeuCau);

        // Kiểm tra trạng thái hợp lệ để duyệt
        String trangThai = yeuCau.getTrangThaiYeuCau();
        if ("Đã phê duyệt".equals(trangThai) || "Từ chối".equals(trangThai)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Yêu cầu đã được xử lý trước đó (trạng thái: " + trangThai + ")");
        }

        // Tạo mã hợp đồng mới
        String maHopDong = "HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();

        // Tính ngày kết thúc dựa trên thời hạn thuê
        LocalDate ngayBatDau = yeuCau.getThoiGianBatDauThueDuKien() != null
                ? yeuCau.getThoiGianBatDauThueDuKien()
                : LocalDate.now();
        LocalDate ngayKetThuc = null;
        if (yeuCau.getThoiHanThue() != null) {
            ngayKetThuc = ngayBatDau.plusMonths(yeuCau.getThoiHanThue());
        }

        // Tạo HopDongThue từ thông tin YeuCauDangKy
        HopDongThue hopDong = new HopDongThue();
        hopDong.setMaVanBan(maHopDong);
        hopDong.setLoaiVanBan("[STATUS:Active]");
        hopDong.setNgayLap(LocalDate.now());
        hopDong.setGioLap(LocalTime.now());
        hopDong.setChiNhanh(null);
        hopDong.setNhanVienLap(yeuCau.getNhanVienPhuTrach());
        hopDong.setKhachHangSoHuu(yeuCau.getKhachHangYeuCau());
        hopDong.setHinhThucThue(yeuCau.getSoLuongNguoi() != null && yeuCau.getSoLuongNguoi() > 1
                ? "Toàn phòng" : "Ghép giường");
        hopDong.setKyThanhToan("Hàng tháng");
        hopDong.setSoLuongThanhVien(yeuCau.getSoLuongNguoi() != null ? yeuCau.getSoLuongNguoi() : 1);
        hopDong.setNgayKetThuc(ngayKetThuc);
        hopDong.setTrangThaiThanhLy("Chua thanh ly");
        hopDongThueRepository.save(hopDong);

        // Liên kết phòng đề xuất vào hợp đồng nếu có
        if (yeuCau.getMaPhongDeXuat() != null && !yeuCau.getMaPhongDeXuat().isBlank()) {
            ChiTietThuePhong chiTiet = new ChiTietThuePhong();
            chiTiet.setMaPhong(yeuCau.getMaPhongDeXuat());
            chiTiet.setMaHopDongThue(maHopDong);
            chiTietThuePhongRepository.save(chiTiet);
        }

        // Chuyển thành viên nhóm từ yêu cầu sang hợp đồng
        List<ThanhVienNhom> thanhVienList = thanhVienNhomRepository.findByMaYeuCau(maYeuCau);
        for (ThanhVienNhom tv : thanhVienList) {
            tv.setMaHopDongThue(maHopDong);
            thanhVienNhomRepository.save(tv);
        }

        // Cập nhật trạng thái yêu cầu
        yeuCau.setTrangThaiYeuCau("Đã phê duyệt");
        yeuCauRepository.save(yeuCau);

        return new ApproveRequestResponse(yeuCau, hopDong,
                "Yêu cầu đã được duyệt. Hợp đồng thuê " + maHopDong + " đã được tạo thành công.");
    }

    @Transactional
    @Override
    public YeuCauDangKy rejectRequest(String maYeuCau, String lyDo) {        YeuCauDangKy yeuCau = getRequestById(maYeuCau);
        if ("Đã phê duyệt".equals(yeuCau.getTrangThaiYeuCau())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Không thể từ chối yêu cầu đã được phê duyệt");
        }
        yeuCau.setTrangThaiYeuCau("Từ chối");
        if (lyDo != null && !lyDo.isBlank()) {
            String ghiChuHienTai = yeuCau.getCacTieuChiKhac() != null ? yeuCau.getCacTieuChiKhac() : "";
            yeuCau.setCacTieuChiKhac(ghiChuHienTai.isBlank()
                    ? "[Từ chối] " + lyDo
                    : ghiChuHienTai + " | [Từ chối] " + lyDo);
        }
        return yeuCauRepository.save(yeuCau);
    }

    @Override
    public java.util.Map<String, Long> getRequestStatusCounts() {
        java.util.Map<String, Long> counts = new java.util.LinkedHashMap<>();
        String[] statuses = {
            "Yêu cầu mới", "Đã lên lịch xem", "Đã xem phòng",
            "Chờ phê duyệt", "Đặt cọc thành công", "Đã phê duyệt", "Từ chối"
        };
        for (String s : statuses) {
            counts.put(s, yeuCauRepository.findByTrangThaiYeuCau(s, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements());
        }
        return counts;
    }
}
