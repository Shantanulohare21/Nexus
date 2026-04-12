import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// AI INTELLIGENCE & HEURISTICS
// ==========================================

const detectSentiment = (text) => {
  const lower = text.toLowerCase();
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'change', 'cancel', 'wrong', 'late', 'fast'];
  const negativeKeywords = ['bad', 'terrible', 'disappointed', 'complaint', 'horrible', 'not happy'];

  if (urgentKeywords.some(k => lower.includes(k))) return 'Urgent';
  if (negativeKeywords.some(k => lower.includes(k))) return 'Negative';
  return 'Neutral';
};

const extractOrderData = (rawText) => {
  const text = rawText.toLowerCase();
  
  // Improved Regex for quantities and items
  const qtyMatch = text.match(/\b(\d+)\s*(?:x|units|pieces|boxes|burgers|pizzas|lunch|items)?\b/) || text.match(/(?:need|want|get)\s+(\d+)/);
  const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
  
  const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm|o'clock)?)\b/i);
  let time = timeMatch ? timeMatch[1].toUpperCase() : "12:00 PM";

  let item = "Standard Package";
  if (text.includes('lunch') || text.includes('box')) item = "Executive Lunch Boxes";
  if (text.includes('burger')) item = "Gourmet Burgers";
  if (text.includes('pizza')) item = "Artisan Pizza";
  if (text.includes('coffee') || text.includes('drink')) item = "Beverage Service";

  return { quantity, time, item };
};

const detectScam = (order) => {
  if (order.quantity > 500 && (order.source.toLowerCase() === 'email' || order.source.toLowerCase() === 'whatsapp')) return 1;
  if (order.customerName?.toLowerCase().includes('scam')) return 1;
  return 0;
};

const detectPriority = (orderTime) => {
  const now = new Date();
  const currentHour = now.getHours();
  let ordHour = 12;
  try {
    if (orderTime.includes('AM') || orderTime.includes('PM')) {
      ordHour = parseInt(orderTime.split(':')[0]);
      if (orderTime.includes('PM') && ordHour !== 12) ordHour += 12;
      if (orderTime.includes('AM') && ordHour === 12) ordHour = 0;
    } else {
      ordHour = parseInt(orderTime.split(':')[0]);
    }
  } catch (e) { }
  return Math.abs(ordHour - currentHour) <= 2 ? 'High' : 'Medium';
};

// ==========================================
// GMAIL LIVE CONNECTOR
// ==========================================

const gmailConfig = {
  imap: {
    user: process.env.GMAIL_USER || 'tanaymeshram5@gmail.com',
    password: process.env.GMAIL_APP_PASSWORD || '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 3000
  }
};

const pollGmail = async () => {

  const sql = `INSERT INTO orders (id, customerName, item, quantity, date, time, source, status, priority, total, isScam, sentiment, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  try {
    const connection = await imaps.connect(gmailConfig);
    await connection.openBox('INBOX');
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const item of messages) {
      const all = item.bodies.find(b => b.which === 'TEXT');
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: " + id + "\r\n";
      const mail = await simpleParser(idHeader + all.body);

      const body = mail.text || '';
      const subject = mail.subject || '';
      const from = mail.from?.text || 'Gmail Client';

      const sentiment = detectSentiment(body + " " + subject);
      const { quantity, time, item: product } = extractOrderData(body + " " + subject);

      const orderId = `GM-${Math.floor(Math.random() * 9000) + 1000}`;
      const total = quantity * 25;
      const isScam = detectScam({ quantity, source: 'email', customerName: from });
      const priority = detectPriority(time);
      let status = 'Pending';
      if (total > 500) status = 'Awaiting Approval';
      if (isScam) status = 'SCAM ALERT';

      const createdAt = Date.now();
      db.run(sql, [orderId, from, product, quantity, new Date().toISOString().split('T')[0], time, 'Email', status, priority, total, isScam, sentiment, createdAt], () => {
        simulateWhatsAppAlert({ id: orderId, customerName: from, priority, sentiment });
      });
      console.log(`[GMAIL] Auto-Captured Order: ${orderId} | Sentiment: ${sentiment}`);
    }
    connection.end();
  } catch (err) {
    if (!err.message.includes('auth')) {
      console.error("[GMAIL] Polling Error:", err.message);
    }
  }
};

setInterval(pollGmail, 30000); // Check for mail every 30s

// ==========================================
// REST API ROUTES
// ==========================================

app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const o = req.body;
  const isScam = detectScam(o);
  const priority = detectPriority(o.time);
  const total = o.total || (o.quantity * 25);
  let status = o.status || 'Pending';
  if (total > 500 && !isScam) status = 'Awaiting Approval';
  if (isScam) status = 'SCAM ALERT';

  const sentiment = o.sentiment || detectSentiment(o.item);
  const createdAt = Date.now();
  const sql = `INSERT INTO orders (id, customerName, item, quantity, date, time, source, status, priority, total, isScam, sentiment, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  db.run(sql, [o.id, o.customerName, o.item, o.quantity, o.date, o.time, o.source, status, priority, total, isScam, sentiment, createdAt], (err) => {
    simulateWhatsAppAlert({ id: o.id, customerName: o.customerName, priority, sentiment });
    res.json({ id: o.id, isScam: isScam === 1, status, priority, sentiment });
  });
});

app.put('/api/orders/:id/approve', (req, res) => {
  db.run(`UPDATE orders SET status = 'Pending', createdAt = ? WHERE id = ? AND status = 'Awaiting Approval'`, [Date.now(), req.params.id], function (err) {
    res.json({ success: true, changes: this.changes });
  });
});

app.put('/api/orders/:id/status', (req, res) => {
  db.run(`UPDATE orders SET status = ? WHERE id = ?`, [req.body.status, req.params.id], (err) => {
    res.json({ changes: this.changes });
  });
});

app.post('/api/twilio/whatsapp', (req, res) => {
  const incomingMsg = req.body.Body || '';
  const profileName = req.body.ProfileName || 'WhatsApp User';
  const sentiment = detectSentiment(incomingMsg);
  const { quantity, time, item } = extractOrderData(incomingMsg);

  const total = quantity * 25;
  const isScam = detectScam({ quantity, source: 'whatsapp', customerName: profileName });
  const priority = detectPriority(time);
  let status = 'Pending';
  if (total > 500 && !isScam) status = 'Awaiting Approval';
  if (isScam) status = 'SCAM ALERT';

  const orderId = `WA-${Math.floor(Math.random() * 9000) + 1000}`;
  const replyText = isScam
    ? `⚠️ OrderSync: Flagged for review.`
    : status === 'Awaiting Approval'
      ? `📋 OrderSync: Estimate for $${total} is awaiting approval.`
      : `✅ OrderSync: Confirmed! ${orderId}. Tone: ${sentiment}`;

  const createdAt = Date.now();
  db.run(`INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [orderId, profileName, item, quantity, new Date().toISOString().split('T')[0], time, 'WhatsApp', status, priority, total, isScam, sentiment, createdAt], () => {
    simulateWhatsAppAlert({ id: orderId, customerName: profileName, priority, sentiment });
    res.type('text/xml').send(`<Response><Message>${replyText}</Message></Response>`);
  });
});

app.post('/api/webhooks/:source', (req, res) => {
  const source = req.params.source.toUpperCase();
  const payload = req.body;
  const quantity = payload.quantity || 1;
  const total = quantity * 25;
  const isScam = detectScam({ quantity, source: source.toLowerCase(), customerName: payload.customerName });
  let status = total > 500 ? 'Awaiting Approval' : 'Pending';
  if (isScam) status = 'SCAM ALERT';

  const sentiment = detectSentiment(payload.item || '');
  const orderId = `EXT-${Math.floor(Math.random() * 9000) + 1000}`;
  const createdAt = Date.now();
  db.run(`INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [orderId, payload.customerName || 'External', payload.item || 'Lunch Boxes', quantity, new Date().toISOString().split('T')[0], '12:00 PM', source, status, 'Medium', total, isScam, sentiment, createdAt], () => {
    simulateWhatsAppAlert({ id: orderId, customerName: payload.customerName, priority: 'Medium', sentiment });
    res.json({ success: true, orderId, status });
  });
});

const simulateWhatsAppAlert = (order) => {
  if (order.priority === 'High' || order.sentiment === 'Urgent') {
    console.log(`[WHATSAPP-AI] 📱 Automated Alert Sent to Warehouse: New ${order.priority} Order ${order.id} from ${order.customerName}.`);
  }
};

// ==========================================
// NOTIFICATIONS & ALERTS
// ==========================================

app.get('/api/notifications', (req, res) => {
  const alerts = [];
  
  // 1. Detect Delays (Orders pending > 5 mins)
  const fiveMinsAgo = Date.now() - (5 * 60 * 1000);
  db.all("SELECT * FROM orders WHERE status = 'Pending' AND createdAt < ?", [fiveMinsAgo], (err, rows) => {
    if (rows && rows.length > 0) {
      alerts.push({
        id: 'delay-' + Date.now(),
        type: 'delay',
        title: 'Delayed Orders Detected',
        message: `${rows.length} orders have been pending for more than 5 minutes.`,
        severity: 'high'
      });
    }

    // 2. Detect Scams
    db.all("SELECT * FROM orders WHERE status = 'SCAM ALERT' AND date = ?", [new Date().toISOString().split('T')[0]], (err, scamRows) => {
      if (scamRows && scamRows.length > 0) {
        alerts.push({
          id: 'scam-' + Date.now(),
          type: 'scam',
          title: 'Security Alert: Scam Detected',
          message: `${scamRows.length} order(s) blocked by fraud engine.`,
          severity: 'critical'
        });
      }

      // 3. Urgent Sentiment
      db.all("SELECT * FROM orders WHERE sentiment = 'Urgent' AND status != 'Delivered'", [], (err, urgentRows) => {
        if (urgentRows && urgentRows.length > 0) {
          alerts.push({
            id: 'urgent-' + Date.now(),
            type: 'urgent',
            title: 'Urgent Client Requests',
            message: `${urgentRows.length} urgent orders require immediate response.`,
            severity: 'medium'
          });
        }

        // Filter out dismissed alerts
        db.all("SELECT id FROM dismissed_notifications", (err, dRows) => {
          const dIds = dRows.map(r => r.id);
          const filtered = alerts.filter(a => !dIds.includes(a.id));
          res.json(filtered);
        });
      });
    });
  });
});

app.post('/api/notifications/:id/dismiss', (req, res) => {
  db.run(`INSERT OR IGNORE INTO dismissed_notifications (id, dismissedAt) VALUES (?, ?)`, [req.params.id, Date.now()], (err) => {
    res.json({ success: true });
  });
});


app.post('/api/zoho/sync', (req, res) => {
  const { orderId } = req.body;
  console.log(`[ZOHO-INTEGRATION] Syncing Order ${orderId} to Zoho CRM/Inventory...`);
  // Simulate network delay
  setTimeout(() => {
    res.json({ success: true, zohoId: `ZOHO-${Math.floor(Math.random() * 10000)}`, message: 'Synced to Zoho successfully' });
  }, 1000);
});

app.get('/api/stats', (req, res) => {
  const statsSql = `
    SELECT 
      date, 
      SUM(total) as revenue, 
      COUNT(*) as count,
      source
    FROM orders 
    GROUP BY date, source
    ORDER BY date ASC
  `;
  
  db.all(statsSql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Aggregate for the frontend chart (simple 7-day view)
    const dailyRev = {};
    const sources = { Email: 0, WhatsApp: 0, Manual: 0, Website: 0, EXTERNAL: 0, Call: 0 };
    
    rows.forEach(r => {
      dailyRev[r.date] = (dailyRev[r.date] || 0) + r.revenue;
      sources[r.source] = (sources[r.source] || 0) + r.count;
    });

    res.json({
      revenueSeries: Object.entries(dailyRev).map(([label, value]) => ({ label, value })).slice(-7),
      sourceDistribution: Object.entries(sources).map(([label, value]) => ({ label, value })),
      totalRevenue: rows.reduce((sum, r) => sum + r.revenue, 0),
      orderCount: rows.reduce((sum, r) => sum + r.count, 0)
    });
  });
});

app.get('/api/churn-risks', (req, res) => {
  const sql = `
    SELECT customerName, MAX(createdAt) as lastDate, COUNT(*) as totalOrders 
    FROM orders 
    GROUP BY customerName
  `;
  db.all(sql, [], (err, rows) => {
    const now = Date.now();
    const risks = rows.filter(r => {
      const daysSince = (now - r.lastDate) / (1000 * 60 * 60 * 24);
      return daysSince > 3; // Risk if no order in 3 days for corporate
    }).map(r => ({
      ...r,
      daysSince: Math.floor((now - r.lastDate) / (1000 * 60 * 60 * 24)),
      riskLevel: (now - r.lastDate) / (1000 * 60 * 60 * 24) > 7 ? 'High' : 'Medium'
    }));
    res.json(risks);
  });
});

app.get('/api/inventory', (req, res) => {
  db.all("SELECT * FROM inventory", [], (err, inv) => {
    db.all("SELECT item, quantity FROM orders WHERE status IN ('Pending', 'Preparing', 'Awaiting Approval')", [], (err, orders) => {
      const needs = {
        'Protein (Chicken/Beef)': 0,
        'Rice/Base': 0,
        'Fresh Produce': 0,
        'Dairy/Cheese': 0
      };

      orders.forEach(o => {
        const item = o.item.toLowerCase();
        const qty = o.quantity;
        if (item.includes('lunch')) {
          needs['Protein (Chicken/Beef)'] += qty * 0.5;
          needs['Rice/Base'] += qty * 0.4;
          needs['Fresh Produce'] += qty * 0.3;
        } else if (item.includes('burger')) {
           needs['Protein (Chicken/Beef)'] += qty * 0.3;
           needs['Dairy/Cheese'] += qty * 0.1;
        } else {
           needs['Fresh Produce'] += qty * 0.5;
        }
      });

      const response = inv.map(i => ({
        ...i,
        committed: needs[i.name] || 0,
        predicted: (needs[i.name] || 0) * 1.5 // Scaling for safety margin
      }));
      res.json(response);
    });
  });
});

app.post('/api/marketing/send-offer', (req, res) => {
  const { customerName, offer } = req.body;
  console.log(`[MARKETING-AI] 🚀 Sent "${offer}" to ${customerName}. Simulation Successful.`);
  res.json({ success: true, message: `Offer "${offer}" sent to ${customerName}` });
});

app.listen(PORT, () => {
  console.log(`Intelligent Enterprise Backend running at http://localhost:${PORT}`);
  console.log(`- Health Check: http://localhost:${PORT}/health`);
  console.log(`- Orders API: http://localhost:${PORT}/api/orders`);
});
