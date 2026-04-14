import pymysql
pymysql.version_info = (1, 4, 6, "final", 0)
pymysql.install_as_MySQLdb()
import MySQLdb
print(f"MySQLdb version_info: {MySQLdb.version_info}")
try:
    from django.core.management import execute_from_command_line
    print("Django management imported successfully.")
except Exception as e:
    print(f"Django import error: {e}")
