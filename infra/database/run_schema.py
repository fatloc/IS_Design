"""MySQL Schema Runner.

Executes ScriptDB_05.sql to reset the database schema.
Requires: pip install mysql-connector-python
"""

import mysql.connector
import os

DB_CONFIG = {
    "host": "mysql-39bc739c-ltbaongoc-300b.j.aivencloud.com",
    "port": 23343,
    "user": "avnadmin",
    "password": "AVNS_DK-vPpuOQSZqc2HrN8h",
    "database": "defaultdb",
}

def run_sql_file(filename, connection):
    cursor = connection.cursor()
    print(f"Reading {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Split by semicolon, but be careful with triggers/procedures if any 
    # (ScriptDB_05 doesn't seem to have DELIMITER changes)
    statements = sql_content.split(';')
    
    total = len(statements)
    executed = 0
    
    print(f"Executing {total} statements...")
    for statement in statements:
        stmt = statement.strip()
        if not stmt:
            continue
            
        try:
            cursor.execute(stmt)
            executed += 1
            if executed % 10 == 0:
                print(f"  Progress: {executed}/{total}")
        except mysql.connector.Error as err:
            print(f"Error in statement: {stmt[:50]}...")
            print(f"Message: {err}")
            # Continue or stop? Usually stop on schema error
            raise err

    connection.commit()
    cursor.close()
    print(f"Successfully executed {executed} statements.")

def main():
    script_path = os.path.join(os.path.dirname(__file__), "ScriptDB_05.sql")
    
    print("Connecting to MySQL server...")
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        run_sql_file(script_path, conn)
        print("Schema reset completed successfully.")
    except Exception as e:
        print(f"Failed to run schema script: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
