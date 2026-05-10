#!/usr/bin/env python3
"""
Migration script to add blob_balance column to users table
"""
import sqlite3
import os
import sys

def migrate_database(db_path):
    """Add blob_balance column to users table if it doesn't exist"""
    print(f"Migrating database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'blob_balance' in columns:
            print("✓ blob_balance column already exists")
        else:
            print("Adding blob_balance column...")
            cursor.execute("ALTER TABLE users ADD COLUMN blob_balance REAL DEFAULT 0")
            conn.commit()
            print("✓ blob_balance column added successfully")

        # Verify the column was added
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"✓ Database has {user_count} users")

        # Update any NULL values to 0
        cursor.execute("UPDATE users SET blob_balance = 0 WHERE blob_balance IS NULL")
        conn.commit()
        print("✓ Initialized blob_balance for all users")

    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()

    print("✓ Migration completed successfully")

if __name__ == "__main__":
    # Find database file
    possible_paths = [
        "blobis.db",
        "database.db",
        "/tmp/blobis.db"
    ]

    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break

    if db_path:
        migrate_database(db_path)
    else:
        print("Database file not found. The migration will run automatically on next server start.")
        print("If you need to migrate an existing database, specify the path:")
        print("  python migrate_add_blob_balance.py /path/to/database.db")

        if len(sys.argv) > 1:
            migrate_database(sys.argv[1])
