import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        db=os.getenv('DB_NAME', 'rideshare'),
        port=int(os.getenv('DB_PORT', 3306))
    )
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"Tables in {os.getenv('DB_NAME')}:")
        for table in tables:
            print(table[0])
            
        cursor.execute("SELECT COUNT(*) FROM api_user")
        count = cursor.fetchone()
        print(f"\nTotal users in api_user table: {count[0]}")
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
