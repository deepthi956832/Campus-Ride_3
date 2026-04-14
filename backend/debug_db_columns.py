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
        cursor.execute("DESCRIBE api_user")
        columns = cursor.fetchall()
        print(f"Columns in api_user:")
        for col in columns:
            print(f"- {col[0]} ({col[1]})")
            
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()
