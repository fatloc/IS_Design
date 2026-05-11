SELECT COUNT(*) INTO @TrangThaiYeuCauExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'YEUCAUDANGKY'
    AND COLUMN_NAME = 'TrangThaiYeuCau';

SET @sql = IF(
        @TrangThaiYeuCauExists = 0,
        'ALTER TABLE YEUCAUDANGKY ADD COLUMN TrangThaiYeuCau VARCHAR(30) NOT NULL DEFAULT ''Yeu cau moi''',
        'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @MaYeuCauExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'LICHXEMPHONG'
    AND COLUMN_NAME = 'MaYeuCau';

SET @sql = IF(
    @MaYeuCauExists = 0,
    'ALTER TABLE LICHXEMPHONG ADD COLUMN MaYeuCau CHAR(6) NULL AFTER KhachHangXem',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @LichXemPhongMaYeuCauFkExists
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LICHXEMPHONG'
  AND COLUMN_NAME = 'MaYeuCau'
  AND REFERENCED_TABLE_NAME = 'YEUCAUDANGKY';

SET @sql = IF(
    @LichXemPhongMaYeuCauFkExists = 0,
    'ALTER TABLE LICHXEMPHONG ADD CONSTRAINT fk_lichxemphong_mayeucau FOREIGN KEY (MaYeuCau) REFERENCES YEUCAUDANGKY(MaYeuCau)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @LichXemPhongMaYeuCauUniqueExists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LICHXEMPHONG'
  AND INDEX_NAME = 'uk_lichxemphong_mayeucau';

SET @sql = IF(
    @LichXemPhongMaYeuCauUniqueExists = 0,
    'ALTER TABLE LICHXEMPHONG ADD UNIQUE KEY uk_lichxemphong_mayeucau (MaYeuCau)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create BIENBANTRAPHONG if not exists or update it
CREATE TABLE IF NOT EXISTS BIENBANTRAPHONG (
    MaBienBanTraPhong CHAR(6) PRIMARY KEY,
    MaHopDongThue CHAR(6),
    FOREIGN KEY (MaBienBanTraPhong) REFERENCES CHUNGTU(MaVanBan)
);

-- Try to add column if table exists without it
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'BIENBANTRAPHONG' AND COLUMN_NAME = 'MaHopDongThue') = 0,
    'ALTER TABLE BIENBANTRAPHONG ADD COLUMN MaHopDongThue CHAR(6)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create BANGDOISOAT table if not exists
CREATE TABLE IF NOT EXISTS BANGDOISOAT (
    MaBangDoiSoat CHAR(7) PRIMARY KEY,
    MaHopDongThue CHAR(6),
    TiLeHoanCoc INT,
    TongKhauTru DECIMAL(12,2),
    SoTienThucTe DECIMAL(12,2),
    NgayLap DATE,
    TrangThai VARCHAR(50),
    FOREIGN KEY (MaHopDongThue) REFERENCES HOPDONGTHUE(MaHopDongThue)
);


-- Thêm ThoiHanThue vào YEUCAUDANGKY (idempotent)
SELECT COUNT(*) INTO @ThoiHanThueExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'YEUCAUDANGKY'
  AND COLUMN_NAME = 'ThoiHanThue';

SET @sql = IF(
  @ThoiHanThueExists = 0,
  'ALTER TABLE YEUCAUDANGKY ADD COLUMN ThoiHanThue INT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Thêm MaYeuCau vào THANHVIENNHOM (idempotent)
SELECT COUNT(*) INTO @MaYeuCauTVNExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'THANHVIENNHOM'
  AND COLUMN_NAME = 'MaYeuCau';

SET @sql = IF(
  @MaYeuCauTVNExists = 0,
  'ALTER TABLE THANHVIENNHOM ADD COLUMN MaYeuCau CHAR(6) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Thêm FK từ THANHVIENNHOM.MaYeuCau → YEUCAUDANGKY (idempotent)
SELECT COUNT(*) INTO @TVNFKExists
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'THANHVIENNHOM'
  AND COLUMN_NAME = 'MaYeuCau'
  AND REFERENCED_TABLE_NAME = 'YEUCAUDANGKY';

SET @sql = IF(
  @TVNFKExists = 0,
  'ALTER TABLE THANHVIENNHOM ADD CONSTRAINT fk_thanhviennhom_mayeucau FOREIGN KEY (MaYeuCau) REFERENCES YEUCAUDANGKY(MaYeuCau)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Thêm MaPhongDeXuat vào YEUCAUDANGKY (idempotent)
SELECT COUNT(*) INTO @MaPhongDeXuatExists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'YEUCAUDANGKY'
  AND COLUMN_NAME = 'MaPhongDeXuat';

SET @sql = IF(
  @MaPhongDeXuatExists = 0,
  'ALTER TABLE YEUCAUDANGKY ADD COLUMN MaPhongDeXuat CHAR(6) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
-- Add SoTienGiaoDich to PHIEUTHANHTOAN if missing
SET @sql = IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PHIEUTHANHTOAN' AND COLUMN_NAME = 'SoTienGiaoDich') = 0,
    'ALTER TABLE PHIEUTHANHTOAN ADD COLUMN SoTienGiaoDich DECIMAL(12,2)',
    'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- ============================================
-- Performance Optimization: Dashboard Indexes
-- ============================================

-- Index cho PHONG.TrangThai để tăng tốc các query đếm theo trạng thái
SELECT COUNT(*) INTO @PhongTrangThaiIdxExists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'PHONG'
  AND INDEX_NAME = 'idx_phong_trangthai';

SET @sql = IF(
    @PhongTrangThaiIdxExists = 0,
    'CREATE INDEX idx_phong_trangthai ON PHONG(TrangThai)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho YEUCAUDANGKY.TrangThaiYeuCau để tăng tốc query đếm yêu cầu chờ duyệt
SELECT COUNT(*) INTO @YeuCauTrangThaiIdxExists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'YEUCAUDANGKY'
  AND INDEX_NAME = 'idx_yeucau_trangthai';

SET @sql = IF(
    @YeuCauTrangThaiIdxExists = 0,
    'CREATE INDEX idx_yeucau_trangthai ON YEUCAUDANGKY(TrangThaiYeuCau)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho LICHXEMPHONG.NgayHen để tăng tốc query lịch hẹn
SELECT COUNT(*) INTO @LichHenNgayHenIdxExists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'LICHXEMPHONG'
  AND INDEX_NAME = 'idx_lichhen_ngayhen';

SET @sql = IF(
    @LichHenNgayHenIdxExists = 0,
    'CREATE INDEX idx_lichhen_ngayhen ON LICHXEMPHONG(NgayHen)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index cho HOPDONGTHUE.TrangThaiThanhLy để tăng tốc query hợp đồng active
SELECT COUNT(*) INTO @HopDongTrangThaiIdxExists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'HOPDONGTHUE'
  AND INDEX_NAME = 'idx_hopdong_trangthai';

SET @sql = IF(
    @HopDongTrangThaiIdxExists = 0,
    'CREATE INDEX idx_hopdong_trangthai ON HOPDONGTHUE(TrangThaiThanhLy)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Composite index cho CHITIETTHUEPHONG.MaHopDongThue để tăng tốc JOIN
SELECT COUNT(*) INTO @ChiTietHopDongIdxExists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'CHITIETTHUEPHONG'
  AND INDEX_NAME = 'idx_chitiet_hopdong';

SET @sql = IF(
    @ChiTietHopDongIdxExists = 0,
    'CREATE INDEX idx_chitiet_hopdong ON CHITIETTHUEPHONG(MaHopDongThue)',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
