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


ROW_PLAN = {
    "CHINHANH": 20,
    "PHONG": 1800,
    "GIUONG": 7200,
    "TAISAN": 9000,
    "KHACHHANG": 25000,
    "NHANVIEN": 500,
    "CHUNGTU": 26000,
    "HOPDONGTHUE": 9000,
    "THANHVIENNHOM": 15000,
    "YEUCAUDANGKY": 9000,
    "LICHXEMPHONG": 7000,
    "CHITIETLICHXEM": 10000,
    "HOSODATCOC": 6000,
    "CHITIETCOCPHONG": 4500,
    "CHITIETCOCGIUONG": 5500,
    "CHITIETTHUEPHONG": 8000,
    "CHITIETTHUEGIUONG": 11000,
    "PHIEUTHANHTOAN": 9000,
    "BIENBANBANGIAOTAISAN": 3000,
    "BIENBANTRAPHONG": 3000,
    "CHITIETBANGIAO": 8000,
    "DICHVU": 30,
    "DICHVU_HOPDONGTHUE": 24450,
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
            f"Chi nhanh {cid}",
            fake.address().replace("\n", ", ")[:100],
        )
        for cid in chinhanh_ids
    ]

    phong_ids = [id_code(i, 4) for i in range(1, ROW_PLAN["PHONG"] + 1)]
    trang_thai_phong = ["Trong", "Da dat", "Dang thue", "Bao tri"]
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
    trang_thai_giuong = ["Trong", "Da dat", "Dang su dung", "Bao tri"]
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
        "Dieu hoa",
        "Quat treo tuong",
        "Ban hoc",
        "Ghe nhua",
        "Tu quan ao",
        "Den ban",
        "Rem cua",
        "Binh nong lanh",
        "May giat",
        "Tu lanh mini",
    ]
    taisan_ids = [id_code(i, 6) for i in range(1, ROW_PLAN["TAISAN"] + 1)]
    tinh_trang_taisan = ["Tot", "Kha", "Can sua", "Hu hong"]
    taisan_rows = []
    for tid in taisan_ids:
        name = random.choice(tai_san_names)
        taisan_rows.append(
            (
                tid,
                name,
                f"{name} tai phong {random.choice(phong_ids)}",
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
                random.choice(["Viet Nam", "Han Quoc", "Nhat Ban", "Singapore", "Thai Lan"]),
            )
        )

    nhanvien_ids = [id_code(i, 4) for i in range(1, ROW_PLAN["NHANVIEN"] + 1)]
    nhanvien_rows = []
    loai_nhan_vien = ["Tu van", "Le tan", "Ke toan", "Quan ly", "Ky thuat"]
    fixed_roles = {
        1: "Quan ly",
        2: "Tu van",
        3: "Ke toan",
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
    loai_van_ban_pool = ["Hop dong thue", "Ho so dat coc", "Ban giao tai san", "Bien ban tra phong", "Chung tu khac"]
    chungtu_rows = []
    start_d = date(2026, 5, 1)
    end_d = date(2026, 6, 10)
    for cid in chungtu_ids:
        loai = random.choices(loai_van_ban_pool, weights=[35, 23, 12, 12, 18], k=1)[0]
        d = random_date(start_d, end_d)
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

    hinh_thuc_thue = ["Theo phong", "Theo giuong", "Ket hop"]
    ky_thanh_toan = ["Thang", "Quy", "6 thang"]
    hopdong_rows = [
        (
            hid,
            random.choice(hinh_thuc_thue),
            random.choice(ky_thanh_toan),
            random.randint(1, 8),
            random_date(date(2026, 6, 11), date(2027, 12, 31)),  # NgayKetThuc (luon sau khi seed dải ngày)
            random.choice(["Chua thanh ly", "Dang doi soat", "Da thanh ly"])
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
                random.choice(["Viet Nam", "Lao", "Campuchia", "Nhat Ban"]),
                random.choice(contract_ids),
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
        # NgayTao phải trước ThoiGianBatDauThueDuKien
        ngay_tao = random_date(start_d, end_d - timedelta(days=5))
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
                random.choice(["Gan trung tam", "Quan 7", "Thu Duc", "Binh Thanh", "Tan Binh"]),
                Decimal(random.randint(1_500_000, 12_000_000)),
                random.randint(0, 1),
                random.choice([
                    "Uu tien phong co cua so",
                    "Can noi de xe may",
                    "Can bep rieng",
                    "Gan cho va sieu thi",
                    "Can bao ve 24/7",
                ]),
                random.choice(khachhang_ids),
                random.choice(nhanvien_ids),
                random.choice(yeu_cau_statuses) if i <= 7000 else "Mới tạo",
            )
        )

    lichxem_ids = [id_code(i, 6) for i in range(1, ROW_PLAN["LICHXEMPHONG"] + 1)]
    linked_request_ids = [row[0] for row in yeu_cau_rows if row[13] != "Mới tạo"]
    if len(linked_request_ids) < len(lichxem_ids):
        used_ids = set(linked_request_ids)
        linked_request_ids.extend(row[0] for row in yeu_cau_rows if row[0] not in used_ids)
    linked_request_ids = linked_request_ids[: len(lichxem_ids)]
    lich_xem_rows = []
    for lid, req_id in zip(lichxem_ids, linked_request_ids):
        request_row = next(row for row in yeu_cau_rows if row[0] == req_id)
        # Lịch xem phải sau hoặc cùng ngày với ngày tạo yêu cầu
        d = random_date(request_row[1], end_d)
        lich_xem_rows.append(
            (
                lid,
                random_time(),
                random.choice(["Da xac nhan", "Cho xac nhan", "Da huy", "Da xem"]),
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

    hinh_thuc_tt = ["Tien mat", "Chuyen khoan", "The ngan hang", "Vi dien tu"]
    trang_thai_tt = ["Thanh cong", "Cho xu ly", "That bai", "Hoan tien"]
    loai_giao_dich = ["Thu tien coc", "Thu tien thue", "Phu thu", "Hoan coc"]
    phieu_rows = []
    # Tạo map để tra cứu ngày của chứng từ
    chungtu_date_map = {row[0]: row[2] for row in chungtu_rows}
    for i in range(1, ROW_PLAN["PHIEUTHANHTOAN"] + 1):
        pid = id_code(i, 7)
        target_chungtu = random.choice(chungtu_ids)
        ct_date = chungtu_date_map[target_chungtu]
        
        # Ngày thanh toán thường là sau hoặc cùng ngày với chứng từ
        d = random_date(ct_date, end_d)
        phieu_rows.append(
            (
                pid,
                random.choice(hinh_thuc_tt),
                random.choice(["", "Thu dung han", "Da doi soat", "Can kiem tra lai"]),
                random_time(),
                d,
                random.choice(trang_thai_tt),
                random.choice(loai_giao_dich),
                random.choice(nhanvien_ids),
                random.choice(nhanvien_ids),
                target_chungtu,
            )
        )

    bbbg_rows = [(x,) for x in handover_ids]
    bbtp_rows = [(x,) for x in return_ids]

    chitiet_bangiao_pairs = pick_pairs(handover_ids, taisan_ids, ROW_PLAN["CHITIETBANGIAO"])
    chitiet_bangiao_rows = [(bb, ts, random.randint(1, 4)) for (bb, ts) in chitiet_bangiao_pairs]

    dichvu_rows = []
    service_names = [
        "Giu xe",
        "Internet",
        "Ve sinh",
        "Giat ui",
        "Dien",
        "Nuoc",
        "Thang may",
        "Bao tri",
        "Don phong",
        "An ninh",
    ]
    for i in range(1, ROW_PLAN["DICHVU"] + 1):
        sid = id_code(i, 3)
        name = random.choice(service_names) + f" {i}"
        unit = random.choice(["Lan", "Thang", "kWh", "m3", "Suat"])
        dichvu_rows.append((sid, name[:100], Decimal(random.randint(10_000, 500_000)), unit))

    dichvu_ids = [row[0] for row in dichvu_rows]
    dv_hd_pairs = pick_pairs(dichvu_ids, contract_ids, ROW_PLAN["DICHVU_HOPDONGTHUE"])
    dv_hd_rows = [(dv, hd, random.randint(1, 10)) for dv, hd in dv_hd_pairs]

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
        "THANHVIENNHOM": "INSERT INTO THANHVIENNHOM (MaThanhVien, HoTen, CCCD, SoDienThoai, Phai, QuocTich, MaHopDongThue, NguoiDaiDien) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        "YEUCAUDANGKY": "INSERT INTO YEUCAUDANGKY (MaYeuCau, NgayTao, SoLuongNguoi, GioiTinhYeuCau, ThoiGianBatDauThueDuKien, ThoiGianBanGiaoPhongDuKien, CoDieuHoa, KhuVuc, MucGiaMongMuon, CoBaiGuiXe, CacTieuChiKhac, KhachHangYeuCau, NhanVienPhuTrach, TrangThaiYeuCau) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "LICHXEMPHONG": "INSERT INTO LICHXEMPHONG (MaLichHen, ThoiGianHen, TrangThaiHen, NgayHen, KhachHangXem, MaYeuCau, NhanVienPhuTrach) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        "CHITIETLICHXEM": "INSERT INTO CHITIETLICHXEM (LichXemPhong, MaPhongDuocXem) VALUES (%s, %s)",
        "HOSODATCOC": "INSERT INTO HOSODATCOC (MaHoSoDatCoc, MucTienCoc) VALUES (%s, %s)",
        "CHITIETCOCPHONG": "INSERT INTO CHITIETCOCPHONG (MaPhong, MaHoSoCoc) VALUES (%s, %s)",
        "CHITIETCOCGIUONG": "INSERT INTO CHITIETCOCGIUONG (MaGiuong, MaHoSoCoc) VALUES (%s, %s)",
        "CHITIETTHUEPHONG": "INSERT INTO CHITIETTHUEPHONG (MaPhong, MaHopDongThue) VALUES (%s, %s)",
        "CHITIETTHUEGIUONG": "INSERT INTO CHITIETTHUEGIUONG (MaGiuong, MaHopDongThue) VALUES (%s, %s)",
        "PHIEUTHANHTOAN": "INSERT INTO PHIEUTHANHTOAN (MaPhieuThanhToan, HinhThucThanhToan, GhiChu, GioGiaoDich, NgayGiaoDich, TrangThai, LoaiGiaoDich, KeToanLapPhieu, QuanLyDoiChung, MaChungTu) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        "BIENBANBANGIAOTAISAN": "INSERT INTO BIENBANBANGIAOTAISAN (MaBienBanBanGiao) VALUES (%s)",
        "BIENBANTRAPHONG": "INSERT INTO BIENBANTRAPHONG (MaBienBanTraPhong) VALUES (%s)",
        "CHITIETBANGIAO": "INSERT INTO CHITIETBANGIAO (MaBienBanBanGiao, MaTaiSanBanGiao, SoLuong) VALUES (%s, %s, %s)",
        "DICHVU": "INSERT INTO DICHVU (MaDichVu, TenDichVu, DonGia, DonViTinh) VALUES (%s, %s, %s, %s)",
        "DICHVU_HOPDONGTHUE": "INSERT INTO DICHVU_HOPDONGTHUE (MaDichVu, MaHopDongThue, SoLuongDichVu) VALUES (%s, %s, %s)",
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
    for table in ["KHACHHANG", "CHUNGTU", "HOPDONGTHUE", "PHIEUTHANHTOAN", "DICHVU_HOPDONGTHUE"]:
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
