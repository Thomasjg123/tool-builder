import sqlite3
import os

def connect_to_db():
    # Get the directory where the script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'mydatabase.db')

    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Insert a sample user
        cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)", ("Alice", "alice@example.com"))
        conn.commit()
        
        # Retrieve the user
        cursor.execute("SELECT * FROM users")
        user = cursor.fetchone()
        print(f"Inserted user: {user}")
        
        conn.close()
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    connect_to_db()
