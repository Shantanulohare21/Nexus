import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./ordersync.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // 1. Create Tables sequentially
      console.log('Ensuring tables exist...');
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
        sentiment TEXT DEFAULT 'Neutral',
        createdAt INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS dismissed_notifications (
        id TEXT PRIMARY KEY,
        dismissedAt INTEGER
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT,
        unit TEXT,
        stock REAL,
        minLevel REAL
      )`);

      // 2. Migrations
      db.run("ALTER TABLE orders ADD COLUMN sentiment TEXT DEFAULT 'Neutral'", () => {});
      db.run("ALTER TABLE orders ADD COLUMN createdAt INTEGER", () => {
         db.run("UPDATE orders SET createdAt = strftime('%s', 'now') * 1000 WHERE createdAt IS NULL");
      });

      // 3. Seed logic (Safe check)
      console.log('Checking if seeding is required...');
      db.get("SELECT COUNT(*) AS count FROM orders", (err, row) => {
        if (!err && row && row.count === 0) {
          console.log("Seeding initial orders...");
          const stmt = db.prepare("INSERT INTO orders (id, customerName, item, quantity, date, time, source, status, priority, total, isScam, sentiment, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
          const now = Date.now();
          stmt.run('ORD-1001', 'Acme Corp', 'Executive Lunch Boxes', 50, new Date().toISOString().split('T')[0], '12:30 PM', 'Website', 'Pending', 'High', 1250, 0, 'Neutral', now);
          stmt.run('ORD-1002', 'Stark Industries', 'Coffee & Pastry', 20, new Date().toISOString().split('T')[0], '09:00 AM', 'WhatsApp', 'Preparing', 'Medium', 300, 0, 'Neutral', now);
          stmt.finalize();
        }
      });

      db.get("SELECT COUNT(*) AS count FROM inventory", (err, row) => {
        if (!err && row && row.count === 0) {
          console.log("Seeding initial inventory...");
          const stmt = db.prepare("INSERT INTO inventory VALUES (?, ?, ?, ?, ?)");
          stmt.run('INV-001', 'Protein (Chicken/Beef)', 'kg', 45.0, 10.0);
          stmt.run('INV-002', 'Rice/Base', 'kg', 80.0, 20.0);
          stmt.run('INV-003', 'Fresh Produce', 'kg', 25.0, 15.0);
          stmt.run('INV-004', 'Dairy/Cheese', 'kg', 12.0, 5.0);
          stmt.finalize();
        }
      });
      
      console.log('Database initialization complete.');
    });
  }
});

export default db;
