import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = pymysql.connect(
        host='127.0.0.1',
        user='root',
        password='',
        port=3306
    )
    print("SUCCESS: Connected to MySQL server!")
    
    with conn.cursor() as cursor:
        cursor.execute("CREATE DATABASE IF NOT EXISTS rideshare")
        print("SUCCESS: Database 'rideshare' exists or created.")
    
    conn.close()
except Exception as e:
    print(f"FAILURE: {e}")
