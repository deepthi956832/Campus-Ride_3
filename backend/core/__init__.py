import pymysql

pymysql.version_info = (2, 2, 1, 'final', 0)  # Faked for modern Django
pymysql.install_as_MySQLdb()
