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
  const qtyMatch = text.match(/\b(\d+)\b/);
  const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
  const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
  let time = timeMatch ? timeMatch[1].toUpperCase() : "12:00 PM";

  let item = "Standard Package";
  if (text.includes('lunch') || text.includes('box')) item = "Executive Lunch Boxes";
  if (text.includes('burger')) item = "Gourmet Burgers";
  if (text.includes('pizza')) item = "Artisan Pizza";

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

      db.run(sql, [orderId, from, product, quantity, new Date().toISOString().split('T')[0], time, 'Email', status, priority, total, isScam, sentiment], () => {
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
  const sql = `INSERT INTO orders (id, customerName, item, quantity, date, time, source, status, priority, total, isScam, sentiment) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
  db.run(sql, [o.id, o.customerName, o.item, o.quantity, o.date, o.time, o.source, status, priority, total, isScam, sentiment], (err) => {
    simulateWhatsAppAlert({ id: o.id, customerName: o.customerName, priority, sentiment });
    res.json({ id: o.id, isScam: isScam === 1, status, priority, sentiment });
  });
});

app.put('/api/orders/:id/approve', (req, res) => {
  db.run(`UPDATE orders SET status = 'Pending' WHERE id = ? AND status = 'Awaiting Approval'`, [req.params.id], function (err) {
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

  db.run(`INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [orderId, profileName, item, quantity, new Date().toISOString().split('T')[0], time, 'WhatsApp', status, priority, total, isScam, sentiment], () => {
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
  db.run(`INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [orderId, payload.customerName || 'External', payload.item || 'Lunch Boxes', quantity, new Date().toISOString().split('T')[0], '12:00 PM', source, status, 'Medium', total, isScam, sentiment], () => {
    simulateWhatsAppAlert({ id: orderId, customerName: payload.customerName, priority: 'Medium', sentiment });
    res.json({ success: true, orderId, status });
  });
});

const simulateWhatsAppAlert = (order) => {
  if (order.priority === 'High' || order.sentiment === 'Urgent') {
    console.log(`[WHATSAPP-AI] 📱 Automated Alert Sent to Warehouse: New ${order.priority} Order ${order.id} from ${order.customerName}.`);
  }
};

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
    const sources = { Email: 0, WhatsApp: 0, Manual: 0, Website: 0, EXTERNAL: 0 };
    
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

app.listen(PORT, () => {
  console.log(`Intelligent Enterprise Backend running at http://localhost:${PORT}`);
});
