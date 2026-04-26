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


def main() -> None:
    print("Generating fake data in memory...")
    data = generate_data()

    print("Connecting to MySQL server...")
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        insert_all(conn, data)
        print("Seed completed successfully.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
