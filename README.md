# 🌌 Nexus - OrderSync AI (Prototype 3.0)

**An AI-Driven Enterprise Order Management & Logistics Engine**  
Built for the Future of Automated Commerce.

---

## 👥 Meet the Team
**Nexus** is developed with ❤️ for Prototype 3.0 by:
- **Shantanu Lohare** (Backend Architect & AI Integration)
- **Tanay Meshram** (Frontend Engineer & UI/UX Design)

---

## 🖼️ Visual Product Showcase

| **Command Center (Dashboard)** | **AI Logistics & Route Opt** |
|:---:|:---:|
| ![Dashboard](./screenshots/dashboard.png) | ![Logistics](./screenshots/logistics.png) |
| *Real-time order monitoring with sentiment analysis.* | *Intelligent batching and delivery pathing.* |

| **Smart Order Capture** | **Kitchen Display System (KDS)** |
|:---:|:---:|
| ![Add Order](./screenshots/add_order.png) | ![Kitchen](./screenshots/kitchen.png) |
| *Omni-channel order entry with AI support.* | *Real-time preparation management for chefs.* |

| **Omni-Channel AI Inbox** |
|:---:|
| ![Inbox](./screenshots/inbox.png) |
| *Automated extraction from WhatsApp & Gmail.* |

---

## 🚀 The Vision
In today's fast-paced digital economy, businesses lose billions due to fragmented communication, manual data entry errors, and logistics opacity. **Nexus - OrderSync AI** bridges this gap by centralizing orders from **Email, WhatsApp, and Webhooks** into a single, AI-verified command center.

### 🧠 Core Intelligence
- **AI Sentiment Engine**: Analyzes the tone of every customer interaction to prioritize "Urgent" requests and flag "Negative" feedback instantly.
- **Automated Data Extraction**: Uses natural language parsing to pull product names, quantities, and delivery times from raw unstructured text.
- **Scam Guard**: Heuristic-based detection system that flags suspicious high-volume orders before they hit your fulfillment line.

---

## ✨ Key Features

### 📊 Financial Insights & Analytics
- **Live SVG Revenue Tracking**: A 7-day visual trend of your daily sales.
- **Channel Distribution**: Donut charts showing exactly which source (Gmail, WhatsApp, Website) is driving your growth.

### 🚚 Advanced Logistics Mapping
- **Waypoint Navigation**: A high-fidelity logistics map where delivery fleet icons follow real-world road networks with dynamic orientation.
- **Live Status Feed**: Real-time progress bars and status updates as orders move from "Pending" to "Delivered."

### 🔔 Real-Time Enterprise Alerts
- **Priority Toasts**: Instant, slide-in notifications for high-priority AI captures.
- **WhatsApp Sync**: Automated outbound simulation to alert warehouse staff of urgent deliveries.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Lucide React, CSS3 (Glassmorphism design).
- **Backend**: Node.js, Express, SQLite3 for localized data persistence.
- **Automation**: `imap-simple` for Gmail polling, `mailparser` for NLP.
- **Deployment & Connectivity**: `ngrok` for secure public webhook tunneling.

---

## 🏁 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 3. Launching the Engine
```bash
# Start the AI Backend
node server.js

# Launch the Dashboard
npm run dev
```

---

## 🛸 Future Roadmap
- [ ] Integration with Twilio for Live WhatsApp API.
- [ ] Predictive Inventory Management using Historical Data.
- [ ] Driver Mobile App for Real-time GPS Sync.

---
*© 2026 Team Nexus. Built for Hackathon Excellence.*
