"""Seed large fake dataset (~200,000 rows) for ScriptDB_05 schema.

Usage:
    python seed_fake_data.py --host localhost --port 3306 --user root --password 123456 --database is_design

Required packages:
    pip install Faker mysql-connector-python
"""

from __future__ import annotations

import argparse
import itertools
import random
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Iterable, List, Sequence, Tuple

import mysql.connector
from faker import Faker


fake = Faker("vi_VN")
random.seed(42)
Faker.seed(42)

# Default password for seeded users (development only).
# With Spring DelegatingPasswordEncoder this is treated as plain text and validated correctly.
DEFAULT_SEEDED_PASSWORD = "{noop}123456"

PRESENTATION_DATE = date(2026, 5, 12)

ROW_PLAN = {
    "CHINHANH": 25,
    "PHONG": 2000,
    "GIUONG": 8000,
    "TAISAN": 10000,
    "KHACHHANG": 30000,
    "NHANVIEN": 600,
    "CHUNGTU": 35000,
    "HOPDONGTHUE": 12000,
    "THANHVIENNHOM": 20000,
    "YEUCAUDANGKY": 12000,
    "LICHXEMPHONG": 10000,
    "CHITIETLICHXEM": 15000,
    "HOSODATCOC": 8000,
    "CHITIETCOCPHONG": 6000,
    "CHITIETCOCGIUONG": 7000,
    "CHITIETTHUEPHONG": 10000,
    "CHITIETTHUEGIUONG": 14000,
    "PHIEUTHANHTOAN": 15000,
    "BIENBANBANGIAOTAISAN": 4000,
    "BIENBANTRAPHONG": 4000,
    "CHITIETBANGIAO": 12000,
    "DICHVU": 40,
    "DICHVU_HOPDONGTHUE": 35000,
    "BANGDOISOAT": 2000,
}


def id_code(num: int, width: int) -> str:
    return f"{num:0{width}d}"


def unique_phone(index: int) -> str:
    # 10-digit Vietnam-like phone number, guaranteed unique by index.
    return f"09{index:08d}"[:10]


def unique_cccd(index: int) -> str:
    return str(100_000_000_000 + index)


def chunked(rows: Sequence[Tuple], size: int) -> Iterable[Sequence[Tuple]]:
    for i in range(0, len(rows), size):
        yield rows[i : i + size]


def bulk_insert(cursor, sql: str, rows: Sequence[Tuple], batch_size: int = 2000) -> None:
    if not rows:
        return
    for part in chunked(rows, batch_size):
        cursor.executemany(sql, part)


def random_date(start: date, end: date) -> date:
    delta_days = (end - start).days
    return start + timedelta(days=random.randint(0, max(0, delta_days)))


def weighted_random_date(start: date, end: date, target_date: date, weight: float = 0.3) -> date:
    """Returns target_date with 'weight' probability, else random_date."""
    if random.random() < weight:
        return target_date
    return random_date(start, end)


def random_time() -> time:
    return time(hour=random.randint(7, 20), minute=random.choice([0, 15, 30, 45]), second=0)


def pick_pairs(left_ids: Sequence[str], right_ids: Sequence[str], count: int) -> List[Tuple[str, str]]:
    # Build unique pairs for bridge tables with low collision rate.
    used = set()
    pairs = []
    while len(pairs) < count:
        a = random.choice(left_ids)
        b = random.choice(right_ids)
        key = (a, b)
        if key in used:
            continue
        used.add(key)
        pairs.append(key)
    return pairs


def generate_data():
    # Master data tables.
    chinhanh_ids = [id_code(i, 4) for i in range(1, ROW_PLAN["CHINHANH"] + 1)]
    chi_nhanh_rows = [
        (
            cid,
            f"Chi nhánh {cid} - {fake.city()}",
            fake.address().replace("\n", ", ")[:100],
        )
        for cid in chinhanh_ids
    ]

    phong_ids = [id_code(i, 4) for i in range(1, ROW_PLAN["PHONG"] + 1)]
    trang_thai_phong = ["Trống", "Đã đặt", "Đang thuê", "Bảo trì"]
    phong_rows = []
    for pid in phong_ids:
        max_people = random.choice([2, 3, 4, 6, 8])
        room_price = Decimal(random.randint(2_000_000, 15_000_000))
        phong_rows.append(
            (
                pid,
                max_people,
                room_price,
                random.choices(trang_thai_phong, weights=[45, 20, 30, 5], k=1)[0],
                random.choice(chinhanh_ids),
            )
        )

    giuong_ids = [id_code(i, 4) for i in range(1, ROW_PLAN["GIUONG"] + 1)]
    trang_thai_giuong = ["Trống", "Đã đặt", "Đang sử dụng", "Bảo trì"]
    giuong_rows = []
    for gid in giuong_ids:
        giuong_rows.append(
            (
                gid,
                Decimal(random.randint(700_000, 3_000_000)),
                random.choices(trang_thai_giuong, weights=[40, 20, 35, 5], k=1)[0],
                random.choice(phong_ids),
            )
        )

    tai_san_names = [
        "Điều hòa",
        "Quạt treo tường",
        "Bàn học",
        "Ghế nhựa",
        "Tủ quần áo",
        "Đèn bàn",
        "Rèm cửa",
        "Bình nóng lạnh",
        "Máy giặt",
        "Tủ lạnh mini",
    ]
    taisan_ids = [id_code(i, 6) for i in range(1, ROW_PLAN["TAISAN"] + 1)]
    tinh_trang_taisan = ["Tốt", "Khá", "Cần sửa", "Hư hỏng"]
    taisan_rows = []
    for tid in taisan_ids:
        name = random.choice(tai_san_names)
        taisan_rows.append(
            (
                tid,
                name,
                f"{name} tại phòng {random.choice(phong_ids)}",
                random.choices(tinh_trang_taisan, weights=[55, 25, 15, 5], k=1)[0],
                Decimal(random.randint(200_000, 6_000_000)),
                random.choice(phong_ids),
            )
        )

    khachhang_ids = [id_code(i, 6) for i in range(1, ROW_PLAN["KHACHHANG"] + 1)]
    khachhang_rows = []
    for i, kid in enumerate(khachhang_ids, start=1):
        gender = random.choice(["Nam", "Nữ"])
        khachhang_rows.append(
            (
                kid,
                fake.name()[:50],
                unique_phone(i),
                f"kh{kid.lower()}@mail.vn"[:30],
                gender,
                unique_cccd(i),
                random.choice(["Việt Nam", "Hàn Quốc", "Nhật Bản", "Singapore", "Thái Lan"]),
            )
        )

    nhanvien_ids = [id_code(i, 4) for i in range(1, ROW_PLAN["NHANVIEN"] + 1)]
    nhanvien_rows = []
    loai_nhan_vien = ["Tư vấn", "Lễ tân", "Kế toán", "Quản lý", "Kỹ thuật"]
    fixed_roles = {
        1: "Quản lý",
        2: "Tư vấn",
        3: "Kế toán",
    }
    base_idx = 70_000
    for i, nid in enumerate(nhanvien_ids, start=1):
        gender = random.choice(["Nam", "Nữ"])
        nhanvien_rows.append(
            (
                nid,
                fake.name()[:50],
                unique_phone(base_idx + i),
                f"nv{nid.lower()}@company.vn"[:30],
                f"nv{nid.lower()}",
                DEFAULT_SEEDED_PASSWORD,
                gender,
                unique_cccd(base_idx + i),
                fixed_roles.get(i, random.choice(loai_nhan_vien)),
            )
        )

    # Transaction documents and dependent subtypes.
    chungtu_ids = [id_code(i, 6) for i in range(1, ROW_PLAN["CHUNGTU"] + 1)]
    loai_van_ban_pool = ["Hợp đồng thuê", "Hồ sơ đặt cọc", "Bàn giao tài sản", "Biên bản trả phòng", "Chứng từ khác"]
    chungtu_rows = []
    start_d = date(2026, 4, 1)
    end_d = date(2026, 6, 30)
    for cid in chungtu_ids:
        loai = random.choices(loai_van_ban_pool, weights=[35, 23, 12, 12, 18], k=1)[0]
        # Make a high density of documents on the presentation date
        d = weighted_random_date(start_d, end_d, PRESENTATION_DATE, weight=0.4)
        chungtu_rows.append(
            (
                cid,
                loai,
                d,
                random_time(),
                random.choice(chinhanh_ids),
                random.choice(nhanvien_ids),
                random.choice(khachhang_ids),
            )
        )

    # Fixed subtype mappings to preserve PK=FK design.
    contract_ids = chungtu_ids[: ROW_PLAN["HOPDONGTHUE"]]
    deposit_ids = chungtu_ids[ROW_PLAN["HOPDONGTHUE"] : ROW_PLAN["HOPDONGTHUE"] + ROW_PLAN["HOSODATCOC"]]
    handover_ids = chungtu_ids[
        ROW_PLAN["HOPDONGTHUE"] + ROW_PLAN["HOSODATCOC"] : ROW_PLAN["HOPDONGTHUE"]
        + ROW_PLAN["HOSODATCOC"]
        + ROW_PLAN["BIENBANBANGIAOTAISAN"]
    ]
    return_ids = chungtu_ids[
        ROW_PLAN["HOPDONGTHUE"]
        + ROW_PLAN["HOSODATCOC"]
        + ROW_PLAN["BIENBANBANGIAOTAISAN"] : ROW_PLAN["HOPDONGTHUE"]
        + ROW_PLAN["HOSODATCOC"]
        + ROW_PLAN["BIENBANBANGIAOTAISAN"]
        + ROW_PLAN["BIENBANTRAPHONG"]
    ]

    hinh_thuc_thue = ["Theo phòng", "Theo giường", "Kết hợp"]
    ky_thanh_toan = ["Tháng", "Quý", "6 tháng"]
    hopdong_rows = [
        (
            hid,
            random.choice(hinh_thuc_thue),
            random.choice(ky_thanh_toan),
            random.randint(1, 8),
            random_date(date(2026, 6, 11), date(2027, 12, 31)),  # NgayKetThuc (luôn sau khi seed dải ngày)
            random.choices(["Chua thanh ly", "Dang doi soat", "Da doi soat"], weights=[60, 25, 15], k=1)[0]
        )
        for hid in contract_ids
    ]

    thanhvien_rows = []
    for i in range(1, ROW_PLAN["THANHVIENNHOM"] + 1):
        tv_id = id_code(i, 5)
        rep = random.choice(khachhang_ids)
        thanhvien_rows.append(
            (
                tv_id,
                fake.name()[:50],
                unique_cccd(200_000 + i),
                unique_phone(200_000 + i),
                random.choice(["Nam", "Nữ"]),
                random.choice(["Việt Nam", "Lào", "Campuchia", "Nhật Bản"]),
                random.choice(contract_ids),
                None,  # MaYeuCau - will be linked later if needed
                rep,
            )
        )

    yeu_cau_rows = []
    yeu_cau_statuses = [
        "Yêu cầu mới",
        "Đã lên lịch xem",
        "Đã xem phòng",
        "Chờ phê duyệt",
        "Đặt cọc thành công",
    ]
    for i in range(1, ROW_PLAN["YEUCAUDANGKY"] + 1):
        yid = id_code(i, 6)
        # NgayTao focus on presentation date
        ngay_tao = weighted_random_date(start_d, end_d - timedelta(days=5), PRESENTATION_DATE, weight=0.3)
        start_rent = random_date(ngay_tao + timedelta(days=1), ngay_tao + timedelta(days=30))
        handover_date = start_rent + timedelta(days=random.randint(0, 7))
        yeu_cau_rows.append(
            (
                yid,
                ngay_tao,
                random.randint(1, 6),
                random.choice(["Nam", "Nữ", "" ]),
                start_rent,
                handover_date,
                random.randint(0, 1),
                random.choice(["Gần trung tâm", "Quận 7", "Thủ Đức", "Bình Thạnh", "Tân Bình"]),
                Decimal(random.randint(1_500_000, 12_000_000)),
                random.randint(0, 1),
                random.choice([
                    "Ưu tiên phòng có cửa sổ",
                    "Cần nơi để xe máy",
                    "Cần bếp riêng",
                    "Gần chợ và siêu thị",
                    "Cần bảo vệ 24/7",
                ]),
                random.choice(khachhang_ids),
                random.choice(nhanvien_ids),
                random.choice(yeu_cau_statuses) if i <= 10000 else "Yêu cầu mới",
                random.choice([1, 3, 6, None]),  # ThoiHanThue
                random.choice(phong_ids) if random.random() < 0.4 else None,  # MaPhongDeXuat
            )
        )

    lichxem_ids = [id_code(i, 6) for i in range(1, ROW_PLAN["LICHXEMPHONG"] + 1)]
    linked_request_ids = [row[0] for row in yeu_cau_rows if row[13] != "Yêu cầu mới"]
    if len(linked_request_ids) < len(lichxem_ids):
        used_ids = set(linked_request_ids)
        linked_request_ids.extend(row[0] for row in yeu_cau_rows if row[0] not in used_ids)
    linked_request_ids = linked_request_ids[: len(lichxem_ids)]
    lich_xem_rows = []
    for lid, req_id in zip(lichxem_ids, linked_request_ids):
        request_row = next(row for row in yeu_cau_rows if row[0] == req_id)
        # Lịch xem focus on presentation date
        d = weighted_random_date(request_row[1], end_d, PRESENTATION_DATE, weight=0.5)
        lich_xem_rows.append(
            (
                lid,
                random_time(),
                random.choice(["Đã xác nhận", "Chờ xác nhận", "Đã hủy", "Đã xem"]),
                d,
                request_row[11],
                req_id,
                random.choice(nhanvien_ids),
            )
        )

    chitiet_lichxem_pairs = pick_pairs(lichxem_ids, phong_ids, ROW_PLAN["CHITIETLICHXEM"])

    hosodc_rows = [(did, Decimal(random.randint(1_000_000, 15_000_000))) for did in deposit_ids]

    coc_phong_pairs = pick_pairs(phong_ids, deposit_ids, ROW_PLAN["CHITIETCOCPHONG"])
    coc_giuong_pairs = pick_pairs(giuong_ids, deposit_ids, ROW_PLAN["CHITIETCOCGIUONG"])

    thue_phong_pairs = pick_pairs(phong_ids, contract_ids, ROW_PLAN["CHITIETTHUEPHONG"])
    thue_giuong_pairs = pick_pairs(giuong_ids, contract_ids, ROW_PLAN["CHITIETTHUEGIUONG"])

    hinh_thuc_tt = ["Tiền mặt", "Chuyển khoản", "Thẻ ngân hàng", "Ví điện tử"]
    trang_thai_tt = ["Thành công", "Chờ xử lý", "Thất bại", "Hoàn tiền"]
    loai_giao_dich = ["Thu tiền cọc", "Thu tiền thuê", "Phụ thu", "Hoàn cọc", "Doi soat"]
    phieu_rows = []
    # Tạo map để tra cứu ngày của chứng từ
    chungtu_date_map = {row[0]: row[2] for row in chungtu_rows}
    for i in range(1, ROW_PLAN["PHIEUTHANHTOAN"] + 1):
        pid = id_code(i, 7)
        target_chungtu = random.choice(chungtu_ids)
        ct_date = chungtu_date_map[target_chungtu]
        
        # Ngày thanh toán focus on presentation date
        d = weighted_random_date(ct_date, end_d, PRESENTATION_DATE, weight=0.4)
        phieu_rows.append(
            (
                pid,
                random.choice(hinh_thuc_tt),
                random.choice(["", "Thu đúng hạn", "Đã đối soát", "Cần kiểm tra lại"]),
                random_time(),
                d,
                random.choice(trang_thai_tt),
                random.choice(loai_giao_dich),
                random.choice(nhanvien_ids),
                random.choice(nhanvien_ids),
                target_chungtu,
                Decimal(random.randint(100_000, 20_000_000)), # SoTienGiaoDich
            )
        )

    bbbg_rows = [(x,) for x in handover_ids]
    # Fixed: BIENBANTRAPHONG needs MaHopDongThue
    bbtp_rows = [(x, random.choice(contract_ids)) for x in return_ids]

    chitiet_bangiao_pairs = pick_pairs(handover_ids, taisan_ids, ROW_PLAN["CHITIETBANGIAO"])
    chitiet_bangiao_rows = [(bb, ts, random.randint(1, 4)) for (bb, ts) in chitiet_bangiao_pairs]

    dichvu_rows = []
    service_names = [
        "Giữ xe",
        "Internet",
        "Vệ sinh",
        "Giặt ủi",
        "Điện",
        "Nước",
        "Thang máy",
        "Bảo trì",
        "Dọn phòng",
        "An ninh",
    ]
    for i in range(1, ROW_PLAN["DICHVU"] + 1):
        sid = id_code(i, 3)
        name = random.choice(service_names) + f" {i}"
        unit = random.choice(["Lần", "Tháng", "kWh", "m3", "Suất"])
        dichvu_rows.append((sid, name[:100], Decimal(random.randint(10_000, 500_000)), unit))

    dichvu_ids = [row[0] for row in dichvu_rows]
    dv_hd_pairs = pick_pairs(dichvu_ids, contract_ids, ROW_PLAN["DICHVU_HOPDONGTHUE"])
    dv_hd_rows = [(dv, hd, random.randint(1, 10)) for dv, hd in dv_hd_pairs]

    # Added: BANGDOISOAT
    bang_doi_soat_rows = []
    for i in range(1, ROW_PLAN["BANGDOISOAT"] + 1):
        bid = id_code(i, 7)
        hd_id = random.choice(contract_ids)
        ti_le = random.randint(50, 100)
        tong_khau_tru = Decimal(random.randint(0, 2_000_000))
        so_tien_thuc_te = Decimal(random.randint(1_000_000, 10_000_000))
        # Focus on presentation date
        ngay_lap = weighted_random_date(start_d, end_d, PRESENTATION_DATE, weight=0.6)
        status = random.choice(["Chờ đối soát", "Đã đối soát", "Đã hoàn tất"])
        bang_doi_soat_rows.append((bid, hd_id, ti_le, tong_khau_tru, so_tien_thuc_te, ngay_lap, status))

    return {
        "CHINHANH": chi_nhanh_rows,
        "PHONG": phong_rows,
        "GIUONG": giuong_rows,
        "TAISAN": taisan_rows,
        "KHACHHANG": khachhang_rows,
        "NHANVIEN": nhanvien_rows,
        "CHUNGTU": chungtu_rows,
        "HOPDONGTHUE": hopdong_rows,
        "THANHVIENNHOM": thanhvien_rows,
        "YEUCAUDANGKY": yeu_cau_rows,
        "LICHXEMPHONG": lich_xem_rows,
        "CHITIETLICHXEM": chitiet_lichxem_pairs,
        "HOSODATCOC": hosodc_rows,
        "CHITIETCOCPHONG": coc_phong_pairs,
        "CHITIETCOCGIUONG": coc_giuong_pairs,
        "CHITIETTHUEPHONG": thue_phong_pairs,
        "CHITIETTHUEGIUONG": thue_giuong_pairs,
        "PHIEUTHANHTOAN": phieu_rows,
        "BIENBANBANGIAOTAISAN": bbbg_rows,
        "BIENBANTRAPHONG": bbtp_rows,
        "CHITIETBANGIAO": chitiet_bangiao_rows,
        "DICHVU": dichvu_rows,
        "DICHVU_HOPDONGTHUE": dv_hd_rows,
        "BANGDOISOAT": bang_doi_soat_rows,
    }


def insert_all(connection, data):
    cursor = connection.cursor()

    # Delete child tables first when reseeding.
    truncate_order = [
        "DICHVU_HOPDONGTHUE",
        "DICHVU",
        "CHITIETBANGIAO",
        "BIENBANTRAPHONG",
        "BIENBANBANGIAOTAISAN",
        "PHIEUTHANHTOAN",
        "CHITIETTHUEGIUONG",
        "CHITIETTHUEPHONG",
        "CHITIETCOCGIUONG",
        "CHITIETCOCPHONG",
        "HOSODATCOC",
        "CHITIETLICHXEM",
        "LICHXEMPHONG",
        "YEUCAUDANGKY",
        "BANGDOISOAT",
        "THANHVIENNHOM",
        "HOPDONGTHUE",
        "CHUNGTU",
        "NHANVIEN",
        "KHACHHANG",
        "TAISAN",
        "GIUONG",
        "PHONG",
        "CHINHANH",
    ]

    print("[1/4] Truncating old data...")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    for table in truncate_order:
        cursor.execute(f"TRUNCATE TABLE {table}")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    connection.commit()

    print("[2/4] Inserting new fake data...")

    sql_map = {
        "CHINHANH": "INSERT INTO CHINHANH (MaChiNhanh, TenChiNhanh, DiaChi) VALUES (%s, %s, %s)",
        "PHONG": "INSERT INTO PHONG (MaPhong, SucChuaToiDa, GiaThuePhong, TrangThai, ChiNhanh) VALUES (%s, %s, %s, %s, %s)",
        "GIUONG": "INSERT INTO GIUONG (MaGiuong, GiaThue, TrangThai, MaPhongChua) VALUES (%s, %s, %s, %s)",
        "TAISAN": "INSERT INTO TAISAN (MaTaiSan, TenTaiSan, GhiChu, TinhTrang, GiaBoiThuong, MaPhongChua) VALUES (%s, %s, %s, %s, %s, %s)",
        "KHACHHANG": "INSERT INTO KHACHHANG (MaKhachHang, HoTen, SoDienThoai, Email, Phai, CCCD, QuocTich) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        "NHANVIEN": "INSERT INTO NHANVIEN (MaNhanVien, HoTen, SoDienThoai, Email, TenDangNhap, MatKhau, Phai, CCCD, LoaiNhanVien) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "CHUNGTU": "INSERT INTO CHUNGTU (MaVanBan, LoaiVanBan, NgayLap, GioLap, ChiNhanh, NhanVienLap, KhachHangSoHuu) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        "HOPDONGTHUE": "INSERT INTO HOPDONGTHUE (MaHopDongThue, HinhThucThue, KyThanhToan, SoLuongThanhVien, NgayKetThuc, TrangThaiThanhLy) VALUES (%s, %s, %s, %s, %s, %s)",
        "THANHVIENNHOM": "INSERT INTO THANHVIENNHOM (MaThanhVien, HoTen, CCCD, SoDienThoai, Phai, QuocTich, MaHopDongThue, MaYeuCau, NguoiDaiDien) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "YEUCAUDANGKY": "INSERT INTO YEUCAUDANGKY (MaYeuCau, NgayTao, SoLuongNguoi, GioiTinhYeuCau, ThoiGianBatDauThueDuKien, ThoiGianBanGiaoPhongDuKien, CoDieuHoa, KhuVuc, MucGiaMongMuon, CoBaiGuiXe, CacTieuChiKhac, KhachHangYeuCau, NhanVienPhuTrach, TrangThaiYeuCau, ThoiHanThue, MaPhongDeXuat) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "LICHXEMPHONG": "INSERT INTO LICHXEMPHONG (MaLichHen, ThoiGianHen, TrangThaiHen, NgayHen, KhachHangXem, MaYeuCau, NhanVienPhuTrach) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        "CHITIETLICHXEM": "INSERT INTO CHITIETLICHXEM (LichXemPhong, MaPhongDuocXem) VALUES (%s, %s)",
        "HOSODATCOC": "INSERT INTO HOSODATCOC (MaHoSoDatCoc, MucTienCoc) VALUES (%s, %s)",
        "CHITIETCOCPHONG": "INSERT INTO CHITIETCOCPHONG (MaPhong, MaHoSoCoc) VALUES (%s, %s)",
        "CHITIETCOCGIUONG": "INSERT INTO CHITIETCOCGIUONG (MaGiuong, MaHoSoCoc) VALUES (%s, %s)",
        "CHITIETTHUEPHONG": "INSERT INTO CHITIETTHUEPHONG (MaPhong, MaHopDongThue) VALUES (%s, %s)",
        "CHITIETTHUEGIUONG": "INSERT INTO CHITIETTHUEGIUONG (MaGiuong, MaHopDongThue) VALUES (%s, %s)",
        "PHIEUTHANHTOAN": "INSERT INTO PHIEUTHANHTOAN (MaPhieuThanhToan, HinhThucThanhToan, GhiChu, GioGiaoDich, NgayGiaoDich, TrangThai, LoaiGiaoDich, KeToanLapPhieu, QuanLyDoiChung, MaChungTu, SoTienGiaoDich) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "BIENBANBANGIAOTAISAN": "INSERT INTO BIENBANBANGIAOTAISAN (MaBienBanBanGiao) VALUES (%s)",
        "BIENBANTRAPHONG": "INSERT INTO BIENBANTRAPHONG (MaBienBanTraPhong, MaHopDongThue) VALUES (%s, %s)",
        "CHITIETBANGIAO": "INSERT INTO CHITIETBANGIAO (MaBienBanBanGiao, MaTaiSanBanGiao, SoLuong) VALUES (%s, %s, %s)",
        "DICHVU": "INSERT INTO DICHVU (MaDichVu, TenDichVu, DonGia, DonViTinh) VALUES (%s, %s, %s, %s)",
        "DICHVU_HOPDONGTHUE": "INSERT INTO DICHVU_HOPDONGTHUE (MaDichVu, MaHopDongThue, SoLuongDichVu) VALUES (%s, %s, %s)",
        "BANGDOISOAT": "INSERT INTO BANGDOISOAT (MaBangDoiSoat, MaHopDongThue, TiLeHoanCoc, TongKhauTru, SoTienThucTe, NgayLap, TrangThai) VALUES (%s, %s, %s, %s, %s, %s, %s)",
    }

    insert_order = [
        "CHINHANH",
        "PHONG",
        "GIUONG",
        "TAISAN",
        "KHACHHANG",
        "NHANVIEN",
        "CHUNGTU",
        "HOPDONGTHUE",
        "THANHVIENNHOM",
        "YEUCAUDANGKY",
        "LICHXEMPHONG",
        "CHITIETLICHXEM",
        "HOSODATCOC",
        "CHITIETCOCPHONG",
        "CHITIETCOCGIUONG",
        "CHITIETTHUEPHONG",
        "CHITIETTHUEGIUONG",
        "PHIEUTHANHTOAN",
        "BIENBANBANGIAOTAISAN",
        "BIENBANTRAPHONG",
        "CHITIETBANGIAO",
        "DICHVU",
        "DICHVU_HOPDONGTHUE",
        "BANGDOISOAT",
    ]

    total = 0
    for table in insert_order:
        rows = data[table]
        bulk_insert(cursor, sql_map[table], rows)
        total += len(rows)
        print(f"  - {table}: {len(rows):,} rows")

    connection.commit()
    print(f"[3/4] Commit done. Total inserted: {total:,} rows")

    print("[4/4] Quick table counts:")
    for table in ["KHACHHANG", "CHUNGTU", "HOPDONGTHUE", "PHIEUTHANHTOAN", "DICHVU_HOPDONGTHUE", "BANGDOISOAT"]:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"  - {table}: {cursor.fetchone()[0]:,}")

    cursor.close()


def parse_args():
    parser = argparse.ArgumentParser(description="Seed fake data for IS_Design schema")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--database", required=True)
    return parser.parse_args()


def main():
    args = parse_args()
    print("Generating fake dataset in memory...")
    data = generate_data()

    conn = mysql.connector.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        database=args.database,
    )
    try:
        insert_all(conn, data)
        print("Seeding completed successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
