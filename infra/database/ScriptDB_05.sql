-- Tạm tắt kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng nếu chúng đang tồn tại
DROP TABLE IF EXISTS DICHVU_HOPDONGTHUE;
DROP TABLE IF EXISTS DICHVU;

DROP TABLE IF EXISTS CHITIETBANGIAO;
DROP TABLE IF EXISTS BIENBANTRAPHONG;
DROP TABLE IF EXISTS BIENBANBANGIAOTAISAN;
DROP TABLE IF EXISTS PHIEUTHANHTOAN;

DROP TABLE IF EXISTS CHITIETTHUEGIUONG;
DROP TABLE IF EXISTS CHITIETTHUEPHONG;

DROP TABLE IF EXISTS CHITIETCOCGIUONG;
DROP TABLE IF EXISTS CHITIETCOCPHONG;
DROP TABLE IF EXISTS HOSODATCOC;

DROP TABLE IF EXISTS CHITIETLICHXEM;
DROP TABLE IF EXISTS LICHXEMPHONG;
DROP TABLE IF EXISTS YEUCAUDANGKY;

DROP TABLE IF EXISTS THANHVIENNHOM;
DROP TABLE IF EXISTS HOPDONGTHUE;
DROP TABLE IF EXISTS CHUNGTU;

DROP TABLE IF EXISTS NHANVIEN;
DROP TABLE IF EXISTS KHACHHANG;

DROP TABLE IF EXISTS TAISAN;
DROP TABLE IF EXISTS GIUONG;
DROP TABLE IF EXISTS PHONG;
DROP TABLE IF EXISTS CHINHANH;

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Phân hệ Quản lý Cơ sở vật chất
CREATE TABLE CHINHANH (
    MaChiNhanh CHAR(4) PRIMARY KEY,
    TenChiNhanh VARCHAR(100),
    DiaChi VARCHAR(100)
);

CREATE TABLE PHONG (
    MaPhong CHAR(4) PRIMARY KEY,
    SucChuaToiDa INT,
    GiaThuePhong DECIMAL(12,2),
    TrangThai VARCHAR(50),
    ChiNhanh CHAR(4),
    FOREIGN KEY (ChiNhanh) REFERENCES CHINHANH(MaChiNhanh)
);

CREATE TABLE GIUONG (
    MaGiuong CHAR(4) PRIMARY KEY,
    GiaThue DECIMAL(12,2),
    TrangThai VARCHAR(50),
    MaPhongChua CHAR(4),
    FOREIGN KEY (MaPhongChua) REFERENCES PHONG(MaPhong)
);

CREATE TABLE TAISAN (
    MaTaiSan CHAR(6) PRIMARY KEY,
    TenTaiSan VARCHAR(100),
    GhiChu VARCHAR(255),
    TinhTrang VARCHAR(50),
    GiaBoiThuong DECIMAL(12,2),
    MaPhongChua CHAR(4),
    FOREIGN KEY (MaPhongChua) REFERENCES PHONG(MaPhong)
);

-- 2. Phân hệ Quản lý Người dùng
CREATE TABLE KHACHHANG (
    MaKhachHang CHAR(6) PRIMARY KEY,
    HoTen VARCHAR(50),
    SoDienThoai CHAR(10),
    Email VARCHAR(30),
    Phai VARCHAR(3) CHECK (Phai IN ('Nam', 'Nữ')),
    CCCD CHAR(12),
    QuocTich VARCHAR(30)
);

CREATE TABLE NHANVIEN (
    MaNhanVien CHAR(4) PRIMARY KEY,
    HoTen VARCHAR(50),
    SoDienThoai CHAR(10),
    Email VARCHAR(30),
    Phai VARCHAR(3) CHECK (Phai IN ('Nam', 'Nữ')),
    CCCD CHAR(12),
    LoaiNhanVien VARCHAR(30)
);

-- 4. Phân hệ Giao dịch & Hợp đồng 
CREATE TABLE CHUNGTU (
    MaVanBan CHAR(6) PRIMARY KEY,
    LoaiVanBan VARCHAR(30),
    NgayLap DATE,
    GioLap TIME,
    ChiNhanh CHAR(4),
    NhanVienLap CHAR(4),
    KhachHangSoHuu CHAR(6),
    FOREIGN KEY (ChiNhanh) REFERENCES CHINHANH(MaChiNhanh),
    FOREIGN KEY (NhanVienLap) REFERENCES NHANVIEN(MaNhanVien),
    FOREIGN KEY (KhachHangSoHuu) REFERENCES KHACHHANG(MaKhachHang)
);

CREATE TABLE HOPDONGTHUE (
    MaHopDongThue CHAR(6) PRIMARY KEY,
    HinhThucThue VARCHAR(50),
    KyThanhToan VARCHAR(50),
    SoLuongThanhVien INT,
    FOREIGN KEY (MaHopDongThue) REFERENCES CHUNGTU(MaVanBan)
);


CREATE TABLE THANHVIENNHOM (
    MaThanhVien CHAR(5) PRIMARY KEY,
    HoTen VARCHAR(50),
    CCCD VARCHAR(12),
    SoDienThoai VARCHAR(10),
    Phai VARCHAR(3) CHECK (Phai IN ('Nam', 'Nữ')),
    QuocTich VARCHAR(30),
    MaHopDongThue CHAR(6),
    NguoiDaiDien CHAR(6),
    FOREIGN KEY (MaHopDongThue) REFERENCES HOPDONGTHUE(MaHopDongThue),
    FOREIGN KEY (NguoiDaiDien) REFERENCES KHACHHANG(MaKhachHang)
);

-- 3. Phân hệ Nghiệp vụ Trước thuê
CREATE TABLE YEUCAUDANGKY (
    MaYeuCau CHAR(6) PRIMARY KEY,
    SoLuongNguoi INT,
    GioiTinhYeuCau VARCHAR(3),
    ThoiGianBatDauThueDuKien DATE,
    ThoiGianBanGiaoPhongDuKien DATE,
    CoDieuHoa BIT,
    KhuVuc VARCHAR(30),
    MucGiaMongMuon DECIMAL(12,2),
    CoBaiGuiXe BIT,
    CacTieuChiKhac VARCHAR(255),
    KhachHangYeuCau CHAR(6),
    NhanVienPhuTrach CHAR(4),
    FOREIGN KEY (KhachHangYeuCau) REFERENCES KHACHHANG(MaKhachHang),
    FOREIGN KEY (NhanVienPhuTrach) REFERENCES NHANVIEN(MaNhanVien)
);

CREATE TABLE LICHXEMPHONG (
    MaLichHen CHAR(6) PRIMARY KEY,
    ThoiGianHen TIME,
    TrangThaiHen VARCHAR(50),
    NgayHen DATE,
    KhachHangXem CHAR(6),
    NhanVienPhuTrach CHAR(4),
    FOREIGN KEY (KhachHangXem) REFERENCES KHACHHANG(MaKhachHang),
    FOREIGN KEY (NhanVienPhuTrach) REFERENCES NHANVIEN(MaNhanVien)
);

CREATE TABLE CHITIETLICHXEM (
    LichXemPhong CHAR(6),
    MaPhongDuocXem CHAR(4),
    PRIMARY KEY (LichXemPhong, MaPhongDuocXem),
    FOREIGN KEY (LichXemPhong) REFERENCES LICHXEMPHONG(MaLichHen),
    FOREIGN KEY (MaPhongDuocXem) REFERENCES PHONG(MaPhong)
);

CREATE TABLE HOSODATCOC (
    MaHoSoDatCoc CHAR(6) PRIMARY KEY,
    MucTienCoc DECIMAL(12,2),
    FOREIGN KEY (MaHoSoDatCoc) REFERENCES CHUNGTU(MaVanBan)
);

CREATE TABLE CHITIETCOCPHONG (
    MaPhong CHAR(4),
    MaHoSoCoc CHAR(6),
    PRIMARY KEY (MaPhong, MaHoSoCoc),
    FOREIGN KEY (MaPhong) REFERENCES PHONG(MaPhong),
    FOREIGN KEY (MaHoSoCoc) REFERENCES HOSODATCOC(MaHoSoDatCoc)
);

CREATE TABLE CHITIETCOCGIUONG (
    MaGiuong CHAR(4),
    MaHoSoCoc CHAR(6),
    PRIMARY KEY (MaGiuong, MaHoSoCoc),
    FOREIGN KEY (MaGiuong) REFERENCES GIUONG(MaGiuong),
    FOREIGN KEY (MaHoSoCoc) REFERENCES HOSODATCOC(MaHoSoDatCoc)
);

-- Tiếp tục Phân hệ 4: Giao dịch & Hợp đồng
CREATE TABLE CHITIETTHUEPHONG (
    MaPhong CHAR(4),
    MaHopDongThue CHAR(6),
    PRIMARY KEY (MaPhong, MaHopDongThue),
    FOREIGN KEY (MaPhong) REFERENCES PHONG(MaPhong),
    FOREIGN KEY (MaHopDongThue) REFERENCES HOPDONGTHUE(MaHopDongThue)
);

CREATE TABLE CHITIETTHUEGIUONG (
    MaGiuong CHAR(4),
    MaHopDongThue CHAR(6),
    PRIMARY KEY (MaGiuong, MaHopDongThue),
    FOREIGN KEY (MaGiuong) REFERENCES GIUONG(MaGiuong),
    FOREIGN KEY (MaHopDongThue) REFERENCES HOPDONGTHUE(MaHopDongThue)
);

CREATE TABLE PHIEUTHANHTOAN (
    MaPhieuThanhToan CHAR(7) PRIMARY KEY,
    HinhThucThanhToan VARCHAR(30),
    GhiChu VARCHAR(255),
    GioGiaoDich TIME,
    NgayGiaoDich DATE,
    TrangThai VARCHAR(30),
    LoaiGiaoDich VARCHAR(30),
    KeToanLapPhieu CHAR(4),
    QuanLyDoiChung CHAR(4),
    MaChungTu CHAR(6),
    FOREIGN KEY (KeToanLapPhieu) REFERENCES NHANVIEN(MaNhanVien),
    FOREIGN KEY (QuanLyDoiChung) REFERENCES NHANVIEN(MaNhanVien),
    FOREIGN KEY (MaChungTu) REFERENCES CHUNGTU(MaVanBan)
);

CREATE TABLE BIENBANBANGIAOTAISAN (
    MaBienBanBanGiao CHAR(6) PRIMARY KEY,
    FOREIGN KEY (MaBienBanBanGiao) REFERENCES CHUNGTU(MaVanBan)
);

CREATE TABLE BIENBANTRAPHONG (
    MaBienBanTraPhong CHAR(6) PRIMARY KEY,
    FOREIGN KEY (MaBienBanTraPhong) REFERENCES CHUNGTU(MaVanBan)
);

CREATE TABLE CHITIETBANGIAO (
    MaBienBanBanGiao CHAR(6),
    MaTaiSanBanGiao CHAR(6),
    SoLuong INT,
    PRIMARY KEY (MaBienBanBanGiao, MaTaiSanBanGiao),
    FOREIGN KEY (MaBienBanBanGiao) REFERENCES BIENBANBANGIAOTAISAN(MaBienBanBanGiao),
    FOREIGN KEY (MaTaiSanBanGiao) REFERENCES TAISAN(MaTaiSan)
);

-- 5. Phân hệ Dịch vụ
CREATE TABLE DICHVU (
    MaDichVu CHAR(3) PRIMARY KEY,
    TenDichVu VARCHAR(100),
    DonGia DECIMAL(12,2),
    DonViTinh VARCHAR(20)
);

CREATE TABLE DICHVU_HOPDONGTHUE (
    MaDichVu CHAR(3),
    MaHopDongThue CHAR(6),
    SoLuongDichVu INT,
    PRIMARY KEY (MaDichVu, MaHopDongThue),
    FOREIGN KEY (MaDichVu) REFERENCES DICHVU(MaDichVu),
    FOREIGN KEY (MaHopDongThue) REFERENCES HOPDONGTHUE(MaHopDongThue)
);

-- 1. Index cho bảng PHONG: Tối ưu lọc phòng theo trạng thái và chi nhánh
CREATE INDEX idx_phong_trangthai_chinhanh 
ON PHONG (TrangThai, ChiNhanh);

-- 2. Index cho bảng GIUONG: Tối ưu lọc giường theo trạng thái trong từng phòng
CREATE INDEX idx_giuong_trangthai_maphong 
ON GIUONG (TrangThai, MaPhongChua);

-- 3. Unique Index cho KHACHHANG (Số điện thoại): Tìm kiếm cực nhanh và chống trùng lặp
CREATE UNIQUE INDEX uq_khachhang_sdt 
ON KHACHHANG (SoDienThoai);

-- 4. Unique Index cho KHACHHANG (CCCD): Tìm kiếm cực nhanh và chống trùng lặp
CREATE UNIQUE INDEX uq_khachhang_cccd 
ON KHACHHANG (CCCD);

-- 5. Index cho bảng CHUNGTU: Tối ưu lọc và thống kê theo ngày lập
CREATE INDEX idx_chungtu_ngaylap 
ON CHUNGTU (NgayLap);

-- 6. Index cho bảng CHUNGTU: Tối ưu tra cứu chứng từ theo chi nhánh và nhân viên
CREATE INDEX idx_chungtu_chinhanh_nhanvien 
ON CHUNGTU (ChiNhanh, NhanVienLap);

-- 7. Index cho bảng PHIEUTHANHTOAN: Tối ưu tính toán doanh thu theo ngày
CREATE INDEX idx_phieuthanhtoan_ngaygiaodich 
ON PHIEUTHANHTOAN (NgayGiaoDich);

-- 8. Index cho bảng PHIEUTHANHTOAN: Tối ưu lọc các phiếu bị lỗi / chờ xử lý
CREATE INDEX idx_phieuthanhtoan_trangthai 
ON PHIEUTHANHTOAN (TrangThai);

-- 9. Index cho bảng LICHXEMPHONG: Tối ưu lấy danh sách lịch hẹn theo ngày và trạng thái
CREATE INDEX idx_lichxemphong_ngayhen_trangthai 
ON LICHXEMPHONG (NgayHen, TrangThaiHen);

-- 10. Index cho bảng YEUCAUDANGKY: Tối ưu tra cứu lịch sử yêu cầu của một khách hàng
CREATE INDEX idx_yeucaudangky_khachhang 
ON YEUCAUDANGKY (KhachHangYeuCau);

