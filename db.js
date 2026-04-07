import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./ordersync.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Orders Table (updated with sentiment)
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerName TEXT,
      item TEXT,
      quantity INTEGER,
      date TEXT,
      time TEXT,
      source TEXT,
      status TEXT,
      priority TEXT,
      total REAL,
      isScam INTEGER DEFAULT 0,
      sentiment TEXT DEFAULT 'Neutral'
    )`, (err) => {
      if (err) {
        console.error("Error creating table", err);
      } else {
        // Migration for existing tables
        db.run("ALTER TABLE orders ADD COLUMN sentiment TEXT DEFAULT 'Neutral'", (err) => {
          // Ignore error if column already exists
        });
        // Seeds some dummy data if empty
        db.get("SELECT COUNT(*) AS count FROM orders", (err, row) => {
          if (row.count === 0) {
            console.log("Seeding initial data...");
            const stmt = db.prepare("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            stmt.run('ORD-1001', 'Acme Corp', 'Executive Lunch Boxes', 50, new Date().toISOString().split('T')[0], '12:30', 'Website', 'Pending', 'High', 1250, 0);
            stmt.run('ORD-1002', 'Stark Industries', 'Coffee & Pastry', 20, new Date().toISOString().split('T')[0], '09:00', 'WhatsApp', 'Preparing', 'Medium', 300, 0);
            stmt.finalize();
          }
        });
      }
    });
  }
});

export default db;
