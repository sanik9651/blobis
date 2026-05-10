import sqlite3

conn = sqlite3.connect('blobis.db')
cursor = conn.cursor()
cursor.execute('SELECT id, username, coins, blob_balance FROM users')

print('ID | Username | BC | BLOB')
print('-' * 50)
for row in cursor.fetchall():
    print(f'{row[0]} | {row[1]} | {row[2]:.2f} | {row[3]:.4f}')

conn.close()
