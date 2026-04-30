package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateContractRequest;
import com.homestay.dorm.dto.request.UpdateContractRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.repository.HopDongThueRepository;
import com.homestay.dorm.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import java.time.temporal.ChronoUnit;
import com.homestay.dorm.dto.response.DoiSoatResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

// Kéo toàn bộ Entity và Repository vào để xài cho gọn, khỏi báo lỗi thiếu
import com.homestay.dorm.entity.*;
import com.homestay.dorm.repository.*;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final HopDongThueRepository repository;

    private final ChiTietThuePhongRepository chiTietThuePhongRepository;
    private final ChiTietThueGiuongRepository chiTietThueGiuongRepository;
    private final DichVuHopDongRepository dichVuHopDongRepository;
    private final PhongRepository phongRepository;
    private final GiuongRepository giuongRepository;
    private final DichVuRepository dichVuRepository;

    @Override
    public ApiListResponse<HopDongThue> getContracts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<HopDongThue> pageData = repository.findAll(pageable);
        return ApiListResponse.fromPage(pageData);
    }

    @Override
    public HopDongThue getContractById(String maHopDongThue) {
        return repository.findById(maHopDongThue)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Hợp đồng: " + maHopDongThue));
    }

    @Override
    @Transactional
    public HopDongThue createContract(CreateContractRequest req) {
        // 1. TẠO HỢP ĐỒNG CHÍNH
        String newId = "HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        
        HopDongThue hk = new HopDongThue();
        hk.setMaVanBan(newId);
        hk.setLoaiVanBan(req.getLoaiVanBan() != null ? req.getLoaiVanBan() : "[STATUS:Active]");
        hk.setNgayLap(req.getNgayLap() != null ? req.getNgayLap() : LocalDate.now());
        hk.setGioLap(req.getGioLap() != null ? req.getGioLap() : LocalTime.now());
        hk.setChiNhanh(req.getChiNhanh());
        hk.setNhanVienLap(req.getNhanVienLap());
        hk.setKhachHangSoHuu(req.getKhachHangSoHuu());
        
        hk.setHinhThucThue(req.getHinhThucThue());
        hk.setKyThanhToan(req.getKyThanhToan());
        hk.setSoLuongThanhVien(req.getSoLuongThanhVien() != null ? req.getSoLuongThanhVien() : 1);
        hk.setNgayKetThuc(req.getNgayKetThuc());

        HopDongThue savedContract = repository.save(hk);

        // 2. LƯU CHI TIẾT PHÒNG HOẶC GIƯỜNG KHÁCH THUÊ
        if (req.getMaPhong() != null && !req.getMaPhong().isEmpty()) {
            ChiTietThuePhong ctp = new ChiTietThuePhong();
            ctp.setMaPhong(req.getMaPhong());
            ctp.setMaHopDongThue(newId);
            chiTietThuePhongRepository.save(ctp);
        } else if (req.getDanhSachMaGiuong() != null && !req.getDanhSachMaGiuong().isEmpty()) {
            for (String maGiuong : req.getDanhSachMaGiuong()) {
                ChiTietThueGiuong ctg = new ChiTietThueGiuong();
                ctg.setMaGiuong(maGiuong);
                ctg.setMaHopDongThue(newId);
                chiTietThueGiuongRepository.save(ctg);
            }
        } else {
            throw new RuntimeException("Hợp đồng phải có ít nhất 1 phòng hoặc 1 giường!");
        }

        // 3. LƯU DỊCH VỤ KHÁCH ĐĂNG KÝ (Điện, Nước, Xe máy...)
        // Giả sử Frontend gửi lên một Map<Mã dịch vụ, Số lượng>
        if (req.getDanhSachDichVu() != null && !req.getDanhSachDichVu().isEmpty()) {
            for (Map.Entry<String, Integer> entry : req.getDanhSachDichVu().entrySet()) {
                DichVu_HopDongThue dv = new DichVu_HopDongThue();
                dv.setMaHopDongThue(newId);
                dv.setMaDichVu(entry.getKey());
                dv.setSoLuongDichVu(entry.getValue());
                dichVuHopDongRepository.save(dv);
            }
        }

        return savedContract;
    }

    @Override
    public HopDongThue updateContract(String maHopDongThue, UpdateContractRequest req) {
        HopDongThue hk = getContractById(maHopDongThue);
        
        if (req.getLoaiVanBan() != null) hk.setLoaiVanBan(req.getLoaiVanBan());
        if (req.getNgayLap() != null) hk.setNgayLap(req.getNgayLap());
        if (req.getGioLap() != null) hk.setGioLap(req.getGioLap());
        if (req.getChiNhanh() != null) hk.setChiNhanh(req.getChiNhanh());
        if (req.getNhanVienLap() != null) hk.setNhanVienLap(req.getNhanVienLap());
        if (req.getKhachHangSoHuu() != null) hk.setKhachHangSoHuu(req.getKhachHangSoHuu());
        
        if (req.getHinhThucThue() != null) hk.setHinhThucThue(req.getHinhThucThue());
        if (req.getKyThanhToan() != null) hk.setKyThanhToan(req.getKyThanhToan());
        if (req.getSoLuongThanhVien() != null) hk.setSoLuongThanhVien(req.getSoLuongThanhVien());
        
        return repository.save(hk);
    }

    @Override
    public void deleteContract(String maHopDongThue) {
        HopDongThue hk = getContractById(maHopDongThue);
        repository.delete(hk);
    }

    public BigDecimal tinhTienThueKyDau(String maHopDongThue) {
        HopDongThue hopDong = getContractById(maHopDongThue);
        BigDecimal tongTien = BigDecimal.ZERO;

        // 1. Phân tích Kỳ thanh toán (Ví dụ chuỗi là "3 Thang" -> lấy số 3)
        int soThangThuTruoc = 1; 
        if (hopDong.getKyThanhToan() != null) {
            if (hopDong.getKyThanhToan().contains("3")) soThangThuTruoc = 3;
            else if (hopDong.getKyThanhToan().contains("6")) soThangThuTruoc = 6;
            // Bạn có thể tùy chỉnh logic cắt chuỗi regex ở đây tùy cách nhóm lưu data
        }

        // 2. Tính tiền Phòng / Giường
        if ("Thuê phòng".equalsIgnoreCase(hopDong.getHinhThucThue())) {
            List<ChiTietThuePhong> dsPhong = chiTietThuePhongRepository.findByMaHopDongThue(maHopDongThue);
            for (ChiTietThuePhong ctp : dsPhong) {
                Phong phong = phongRepository.findById(ctp.getMaPhong()).orElse(null);
                if (phong != null && phong.getGiaThuePhong() != null) {
                    tongTien = tongTien.add(phong.getGiaThuePhong().multiply(new BigDecimal(soThangThuTruoc)));
                }
            }
        } else {
            List<ChiTietThueGiuong> dsGiuong = chiTietThueGiuongRepository.findByMaHopDongThue(maHopDongThue);
            for (ChiTietThueGiuong ctg : dsGiuong) {
                Giuong giuong = giuongRepository.findById(ctg.getMaGiuong()).orElse(null);
                if (giuong != null && giuong.getGiaThue() != null) {
                    tongTien = tongTien.add(giuong.getGiaThue().multiply(new BigDecimal(soThangThuTruoc)));
                }
            }
        }

        // 3. Tính tiền Dịch vụ phát sinh (Gửi xe, Wifi...)
        List<DichVu_HopDongThue> dsDichVu = dichVuHopDongRepository.findByMaHopDongThue(maHopDongThue);
        for(DichVu_HopDongThue dvDangKy : dsDichVu) {
            DichVu thongTinDichVu = dichVuRepository.findById(dvDangKy.getMaDichVu()).orElse(null);
            if(thongTinDichVu != null && thongTinDichVu.getDonGia() != null) {
                BigDecimal donGia = thongTinDichVu.getDonGia();
                BigDecimal soLuong = new BigDecimal(dvDangKy.getSoLuongDichVu());
                // Cộng dồn: Đơn giá * Số lượng * Số tháng
                tongTien = tongTien.add(donGia.multiply(soLuong).multiply(new BigDecimal(soThangThuTruoc)));
            }
        }
        
        return tongTien;
    }

    public DoiSoatResponse doiSoatChiPhi(String maHopDongThue, BigDecimal tongTienKhauTru, boolean laHetHanHopDong) {
        // 1. Lấy thông tin Hợp đồng
        HopDongThue hopDong = getContractById(maHopDongThue);

        // 2. Tìm lại số tiền cọc ban đầu (Tạm thời fix cứng 6 triệu để test, 
        // sau này bạn có thể viết hàm móc qua bảng HoSoDatCoc của khách hàng này để lấy số thật)
        BigDecimal tienCocBanDau = new BigDecimal("6000000"); 
        
        // 3. Tính thời gian khách đã ở (Từ Ngày Lập HĐ đến hôm nay)
        LocalDate ngayVaoO = hopDong.getNgayLap();
        LocalDate ngayTraPhong = LocalDate.now();
        
        // Dùng ChronoUnit để đếm xem khách ở được mấy tháng rồi
        long soThangDaO = ChronoUnit.MONTHS.between(ngayVaoO, ngayTraPhong);

        // 4. Xác định tỷ lệ hoàn cọc cơ bản theo luật của Ký túc xá
        BigDecimal tyLeHoan = BigDecimal.ZERO;
        String chuoiTyLe = "0%";

        if (laHetHanHopDong) {
            // Nếu quản lý tick chọn là "Đã ở hết hạn hợp đồng" -> Trả đủ 100% cọc
            tyLeHoan = new BigDecimal("1.0"); 
            chuoiTyLe = "100%";
        } else {
            // Nếu trả phòng trước hạn, xét xem ở được lâu chưa
            if (soThangDaO < 6) {
                tyLeHoan = new BigDecimal("0.5"); // Ở dưới 6 tháng -> Hoàn 50%
                chuoiTyLe = "50%";
            } else {
                tyLeHoan = new BigDecimal("0.7"); // Ở trên 6 tháng -> Hoàn 70%
                chuoiTyLe = "70%";
            }
        }

        // 5. Tính tiền cọc được hoàn lại (Tiền cọc x Tỷ lệ hoàn)
        BigDecimal tienCocDuocHoanCoBan = tienCocBanDau.multiply(tyLeHoan);

        // 6. Chốt con số cuối cùng: Lấy tiền hoàn trừ đi các khoản nợ, phạt (Quản lý nhập vào)
        if (tongTienKhauTru == null) {
            tongTienKhauTru = BigDecimal.ZERO;
        }
        BigDecimal soTienThucTe = tienCocDuocHoanCoBan.subtract(tongTienKhauTru);

        // 7. Xác định xem Kế toán phải CHI tiền (trả khách) hay THU thêm tiền (khách nợ lố cả tiền cọc)
        String loaiGiaoDich;
        if (soTienThucTe.compareTo(BigDecimal.ZERO) >= 0) {
            loaiGiaoDich = "Chi trả khách (Hoàn cọc)";
        } else {
            loaiGiaoDich = "Thu thêm của khách (Bù lỗ)";
        }

        // 8. Trình bày ra "cái đĩa" DTO để trả về cho Frontend
        return DoiSoatResponse.builder()
                .maHopDong(maHopDongThue)
                .tienCocBanDau(tienCocBanDau)
                .tyLeHoanCoc(chuoiTyLe)
                .tienCocDuocHoanCoBan(tienCocDuocHoanCoBan)
                .tongTienKhauTru(tongTienKhauTru)
                .soTienThucTe(soTienThucTe.abs()) // Dùng abs() để luôn hiện số dương trên màn hình cho đẹp
                .loaiGiaoDich(loaiGiaoDich)
                .build();
    }
}

