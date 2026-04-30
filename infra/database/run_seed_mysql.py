"""Simple MySQL runner for fake-data seeding.

Edit DB_CONFIG below, then run:
    python infra/database/run_seed_mysql.py
"""

from __future__ import annotations

import mysql.connector

from seed_fake_data import generate_data, insert_all


DB_CONFIG = {
    "host": "mysql-39bc739c-ltbaongoc-300b.j.aivencloud.com",
    "port": 23343,
    "user": "avnadmin",
    "password": "AVNS_DK-vPpuOQSZqc2HrN8h",
    "database": "defaultdb",
}


def ensure_employee_login_schema(conn) -> None:
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'NHANVIEN'
            """,
            (DB_CONFIG["database"],),
        )
        existing_columns = {row[0] for row in cursor.fetchall()}

        if "TenDangNhap" not in existing_columns:
            cursor.execute(
                "ALTER TABLE NHANVIEN ADD COLUMN TenDangNhap VARCHAR(50) NULL AFTER Email"
            )

        if "MatKhau" not in existing_columns:
            cursor.execute(
                "ALTER TABLE NHANVIEN ADD COLUMN MatKhau VARCHAR(255) NULL AFTER TenDangNhap"
            )

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'NHANVIEN' AND INDEX_NAME = 'UK_NHANVIEN_TENDANGNHAP'
            """,
            (DB_CONFIG["database"],),
        )
        has_username_index = cursor.fetchone()[0] > 0
        if not has_username_index:
            cursor.execute(
                "ALTER TABLE NHANVIEN ADD UNIQUE INDEX UK_NHANVIEN_TENDANGNHAP (TenDangNhap)"
            )

        conn.commit()
    finally:
        cursor.close()


def main() -> None:
    print("Connecting to MySQL server...")
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        print("Ensuring employee login schema exists...")
        ensure_employee_login_schema(conn)

        print("Generating fake data in memory...")
        data = generate_data()

        insert_all(conn, data)
        print("Seed completed successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
