# Seed 200k Fake Data (Faker)

Script: `infra/database/seed_fake_data.py`

Runner nhanh (khong can truyen tham so): `infra/database/run_seed_mysql.py`

## 1) Cai thu vien

```bash
pip install Faker mysql-connector-python
```

## 2) Dam bao schema da tao xong

Chay file `infra/database/ScriptDB_05.sql` truoc.

## 3) Chay script seed

```bash
python infra/database/seed_fake_data.py --host localhost --port 3306 --user root --password 123456 --database is_design
```

Hoac chay runner da khai bao san ket noi:

```bash
python infra/database/run_seed_mysql.py
```

Luu y: sua `DB_CONFIG` trong file `infra/database/run_seed_mysql.py` truoc khi chay.

Script se:
- truncate du lieu cu (theo dung thu tu khoa ngoai)
- sinh fake data co y nghia theo nghiep vu
- insert theo batch de toi uu toc do
- tong so dong mac dinh ~200,000 dong

## 4) Kiem tra nhanh

```sql
SELECT COUNT(*) FROM KHACHHANG;
SELECT COUNT(*) FROM CHUNGTU;
SELECT COUNT(*) FROM HOPDONGTHUE;
SELECT COUNT(*) FROM DICHVU_HOPDONGTHUE;
```

## Tuy chinh quy mo

Mo file `infra/database/seed_fake_data.py` va sua bien `ROW_PLAN`.
Tong so dong duoc tinh bang tong tat ca gia tri trong `ROW_PLAN`.
