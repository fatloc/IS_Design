package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.request.CreateDepositRequest;
import com.homestay.dorm.dto.request.UpdateDepositRequest;
import com.homestay.dorm.dto.response.ApiListResponse;
import com.homestay.dorm.entity.HoSoDatCoc;
import com.homestay.dorm.entity.Phong;
import com.homestay.dorm.entity.Giuong;
import com.homestay.dorm.repository.HoSoDatCocRepository;
import com.homestay.dorm.repository.PhongRepository;
import com.homestay.dorm.repository.GiuongRepository;
import com.homestay.dorm.service.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepositServiceImpl implements DepositService {

    private final HoSoDatCocRepository repository;

    private final PhongRepository phongRepository;
    private final GiuongRepository giuongRepository;

    @Override
    public ApiListResponse<HoSoDatCoc> getDeposits(int page, int size) {
        long startTime = System.currentTimeMillis();
        Pageable pageable = PageRequest.of(page, size);
        Page<HoSoDatCoc> pageData = repository.findAll(pageable);
        ApiListResponse<HoSoDatCoc> response = ApiListResponse.fromPage(pageData);
        long endTime = System.currentTimeMillis();
        log.info("⏱ [Performance] Deposits loaded in {} ms", (endTime - startTime));
        return response;
    }

    @Override
    public HoSoDatCoc getDepositById(String maHoSoDatCoc) {
        return repository.findById(maHoSoDatCoc)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Hồ sơ đặt cọc: " + maHoSoDatCoc));
    }

    @Override
    @Transactional
    public HoSoDatCoc createDeposit(CreateDepositRequest req) {
        String newId = "DC" + UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        
        HoSoDatCoc deposit = new HoSoDatCoc();
        deposit.setMaVanBan(newId);
        deposit.setLoaiVanBan(req.getLoaiVanBan() != null ? req.getLoaiVanBan() : "Hồ sơ đặt cọc");
        deposit.setNgayLap(req.getNgayLap() != null ? req.getNgayLap() : LocalDate.now());
        deposit.setGioLap(req.getGioLap() != null ? req.getGioLap() : LocalTime.now());
        deposit.setChiNhanh(req.getChiNhanh());
        deposit.setNhanVienLap(req.getNhanVienLap());
        deposit.setKhachHangSoHuu(req.getKhachHangSoHuu());
        deposit.setMucTienCoc(req.getMucTienCoc());

        BigDecimal tongTienCoc = BigDecimal.ZERO;

        // Trường hợp 1: Khách thuê nguyên PHÒNG
        if (req.getMaPhong() != null && !req.getMaPhong().isEmpty()) {
            Phong phong = phongRepository.findById(req.getMaPhong())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng: " + req.getMaPhong()));
            
            if (phong.getGiaThuePhong() != null) {
                // Lấy giá thuê phòng nhân 2 tháng
                tongTienCoc = phong.getGiaThuePhong().multiply(new BigDecimal("2"));
            }
        } 
        // Trường hợp 2: Khách thuê GIƯỜNG (Ở ghép)
        else if (req.getDanhSachMaGiuong() != null && !req.getDanhSachMaGiuong().isEmpty()) {
            List<Giuong> danhSachGiuong = giuongRepository.findAllById(req.getDanhSachMaGiuong());
            
            if (danhSachGiuong.isEmpty()) {
                throw new RuntimeException("Không tìm thấy thông tin giường hợp lệ!");
            }

            // Cộng dồn: (Giá thuê từng giường * 2)
            for (Giuong giuong : danhSachGiuong) {
                if (giuong.getGiaThue() != null) {
                    BigDecimal tienCocGiuong = giuong.getGiaThue().multiply(new BigDecimal("2"));
                    tongTienCoc = tongTienCoc.add(tienCocGiuong);
                }
            }
        } else {
            throw new RuntimeException("Nghiệp vụ lỗi: Khách hàng phải chọn ít nhất 1 phòng hoặc 1 giường để đặt cọc!");
        }

        // CHỐT: Gán số tiền cọc mà Kế toán (Hệ thống) vừa tự tính vào hồ sơ thay vì tin dữ liệu Frontend
        deposit.setMucTienCoc(tongTienCoc);        
        
        return repository.save(deposit);
    }

    @Override
    @Transactional
    public HoSoDatCoc updateDeposit(String maHoSoDatCoc, UpdateDepositRequest req) {
        HoSoDatCoc deposit = getDepositById(maHoSoDatCoc);
        
        if (req.getLoaiVanBan() != null) deposit.setLoaiVanBan(req.getLoaiVanBan());
        if (req.getNgayLap() != null) deposit.setNgayLap(req.getNgayLap());
        if (req.getGioLap() != null) deposit.setGioLap(req.getGioLap());
        if (req.getChiNhanh() != null) deposit.setChiNhanh(req.getChiNhanh());
        if (req.getNhanVienLap() != null) deposit.setNhanVienLap(req.getNhanVienLap());
        if (req.getKhachHangSoHuu() != null) deposit.setKhachHangSoHuu(req.getKhachHangSoHuu());
        // if (req.getMucTienCoc() != null) deposit.setMucTienCoc(req.getMucTienCoc());
        
        return repository.save(deposit);
    }

    @Override
    @Transactional
    public void deleteDeposit(String maHoSoDatCoc) {
        HoSoDatCoc deposit = getDepositById(maHoSoDatCoc);
        repository.delete(deposit);
    }
}
