import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, CheckCircle, Smartphone, AlertCircle, Zap, RefreshCw, PhoneCall, Play, Square } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import './Inbox.css';

const getSentiment = (text) => {
  const lower = text.toLowerCase();
  const urgentKeywords = ['urgent', 'emergency', 'asap', 'cancel', 'wrong', 'late', 'change', 'immediately'];
  const negativeKeywords = ['bad', 'terrible', 'disappointed', 'complaint', 'horrible'];
  if (urgentKeywords.some(k => lower.includes(k))) return 'Urgent';
  if (negativeKeywords.some(k => lower.includes(k))) return 'Negative';
  return 'Neutral';
};

const SentimentBadge = ({ text }) => {
  const sentiment = getSentiment(text);
  const colors = {
    Urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', icon: '🚨' },
    Negative: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', icon: '⚠️' },
    Neutral: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: '✅' }
  };
  const style = colors[sentiment];
  return (
    <span className="sentiment-badge" style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}>
      {style.icon} {sentiment}
    </span>
  );
};

const Inbox = () => {
  const { addOrder, generateEstimate } = useOrders();
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [waInput, setWaInput] = useState('');
  const [waMessages, setWaMessages] = useState([
    { id: 1, text: "Can I get 100 lunch boxes tomorrow at 1pm?", isIncoming: true, time: "10:00 AM", status: "unprocessed" },
    { id: 2, text: "This is URGENT - we need to CANCEL the order from yesterday!!!", isIncoming: true, time: "10:05 AM", status: "unprocessed" }
  ]);
  const [emails, setEmails] = useState([
    { id: 1, subject: "Catering Request: Tomorrow's Board Meeting", body: "Hello Team,\n\nWe need 50 Executive Lunch Boxes delivered tomorrow at 12:00 PM for the Wayne Enterprises board meeting.\n\nRegards,\nBruce Wayne", from: "bruce@wayne.com", time: "09:45 AM", status: "unprocessed" },
    { id: 2, subject: "URGENT: Order Complaint", body: "I am very disappointed with the last delivery. The food arrived LATE and cold. We need this resolved ASAP.", from: "tony@stark.com", time: "10:30 AM", status: "unprocessed" }
  ]);
  const [calls, setCalls] = useState([
    { id: 1, customer: "Clark Kent", phone: "+1 (555) 123-4567", duration: "2:15", transcript: "Hello, I'm calling from the Daily Planet. We need to order 25 lunch boxes for our press room tomorrow at 1:30 PM. Please confirm if that's possible.", status: "unprocessed", time: "11:00 AM" },
    { id: 2, customer: "Diana Prince", phone: "+1 (555) 987-6543", duration: "1:45", transcript: "Hi, this is Diana. I'd like to place an order for 10 Gourmet Burgers for pick up at 2:00 PM today. Thank you.", status: "unprocessed", time: "11:15 AM" }
  ]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [lastGmailSync, setLastGmailSync] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate periodic Gmail sync indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setLastGmailSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGmailSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastGmailSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSyncing(false);
    }, 2000);
  };

  const handleCallProcess = (call) => {
    setProcessing(true);
    const text = call.transcript;
    setTimeout(async () => {
      const qtyMatch = text.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
      let time = "12:00 PM";
      if (timeMatch) time = timeMatch[1].toUpperCase();
      
      let item = "Standard Package";
      if (text.toLowerCase().includes('lunch')) item = "Executive Lunch Boxes";
      if (text.toLowerCase().includes('burger')) item = "Gourmet Burgers";

      await addOrder({ 
        customerName: call.customer, 
        item, 
        quantity, 
        time, 
        date: new Date().toISOString().split('T')[0], 
        source: 'Call', 
        total: quantity * 25 
      });

      setCalls(prev => prev.map(c => c.id === call.id ? { ...c, status: 'processed' } : c));
      setSelectedCall(null);
      setProcessing(false);
    }, 2000);
  };

  const handleWAProcess = (id, text) => {
    setProcessing(true);
    setTimeout(async () => {
      const qtyMatch = text.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
      let time = "12:00 PM";
      if (timeMatch) time = timeMatch[1].toUpperCase();
      let item = "Assorted Package";
      if (text.toLowerCase().includes('lunch')) item = "Executive Lunch Boxes";
      if (text.toLowerCase().includes('burger')) item = "Gourmet Burgers";

      const sentiment = getSentiment(text);
      const newOrder = { customerName: 'WhatsApp Client', item, quantity, time, date: new Date().toISOString().split('T')[0], source: 'WhatsApp', total: quantity * 25 };
      
      if (sentiment !== 'Urgent') await addOrder(newOrder);

      const reply = sentiment === 'Urgent'
        ? `🚨 OrderSync Alert: Your urgent message has been flagged and escalated to our team manager immediately. Reference ID: URG-${Math.floor(Math.random() * 999)}`
        : `✅ Auto Confirmation: Your order for ${quantity}x ${item} at ${time} has been received. Order processing started!`;
      
      setWaMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'processed' } : m));
      setWaMessages(prev => [...prev, { id: Date.now(), text: reply, isIncoming: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setProcessing(false);
    }, 1500);
  };

  const handleEmailProcess = (email, asEstimate = false) => {
    setProcessing(true);
    const text = email.body;
    setTimeout(async () => {
      const qtyMatch = text.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const timeMatch = text.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
      let time = "12:00 PM";
      if (timeMatch) time = timeMatch[1].toUpperCase();
      let item = "Standard Package";
      if (text.toLowerCase().includes('lunch box')) item = "Executive Lunch Boxes";

      const sentiment = getSentiment(text + " " + email.subject);
      const orderData = { customerName: email.from, item, quantity, time, date: new Date().toISOString().split('T')[0], source: 'Email', total: quantity * 25 };
      
      if (asEstimate) {
        await generateEstimate(orderData);
      } else if (sentiment !== 'Urgent') {
        await addOrder(orderData);
      }

      const reply = asEstimate 
        ? `📄 Estimate Generated: We've drafted an estimate for ${quantity} items. Please review and approve it on your dashboard.`
        : sentiment === 'Urgent'
          ? `🚨 Priority Response: Your complaint has been escalated to our Customer Success team. We will contact you within 30 minutes.`
          : `✅ Order Confirmed: Your order for ${quantity} items at ${time} has been logged. Order ID generated!`;

      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'processed', reply } : e));
      setSelectedEmail(null);
      setProcessing(false);
    }, 1500);
  };

  const simulateNewWAMessage = () => {
    if (!waInput.trim()) return;
    const newMsg = { id: Date.now(), text: waInput, isIncoming: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'unprocessed' };
    setWaMessages(prev => [...prev, newMsg]);
    setWaInput('');
  };

  const urgentEmails = emails.filter(e => getSentiment(e.subject + " " + e.body) === 'Urgent' && e.status === 'unprocessed');

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <div>
          <h1>Omni-Channel AI Inbox</h1>
          <p>"Our system automatically captures orders from WhatsApp and email, uses AI to convert unstructured text into structured data, and stores it in a centralized database for real-time tracking."</p>
        </div>
        <div className="gmail-sync-panel">
          <button className={`gmail-sync-btn ${isSyncing ? 'syncing' : ''}`} onClick={handleGmailSync}>
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Polling Gmail...' : 'Gmail Live Sync'}
          </button>
          {lastGmailSync && <span className="last-sync">Last synced: {lastGmailSync}</span>}
        </div>
      </div>

      {urgentEmails.length > 0 && (
        <div className="urgent-banner">
          <AlertCircle size={18} /> {urgentEmails.length} URGENT message(s) require immediate attention!
        </div>
      )}

      <div className="inbox-tabs">
        <button className={`inbox-tab ${activeTab === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveTab('whatsapp')}>
          <MessageCircle size={18} /> WhatsApp Integration
        </button>
        <button className={`inbox-tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
          <Mail size={18} /> Email + Gmail Live
        </button>
        <button className={`inbox-tab ${activeTab === 'call' ? 'active' : ''}`} onClick={() => setActiveTab('call')}>
          <PhoneCall size={18} /> Call Transcripts (AI)
        </button>
      </div>

      <div className="inbox-content glass-panel">
        {activeTab === 'whatsapp' && (
          <div className="wa-view">
            <div className="wa-header">
              <Smartphone size={24} />
              <div>
                <h3>WhatsApp Business API</h3>
                <span className="online-status">● Connected via Twilio</span>
              </div>
              <div className="ai-badge"><Zap size={12}/> Sentiment AI Active</div>
            </div>
            <div className="wa-chat-window">
              {waMessages.map(msg => (
                <div key={msg.id} className={`wa-message ${msg.isIncoming ? 'incoming' : 'outgoing'} ${getSentiment(msg.text) === 'Urgent' && msg.isIncoming ? 'urgent-msg' : ''}`}>
                  <div className="wa-bubble">
                    {msg.isIncoming && <SentimentBadge text={msg.text} />}
                    <p>{msg.text}</p>
                    <span className="wa-time">{msg.time}</span>
                  </div>
                  {msg.isIncoming && msg.status === 'unprocessed' && (
                    <button className="btn-primary extract-trigger" onClick={() => handleWAProcess(msg.id, msg.text)} disabled={processing}>
                      {processing ? '🤖 Processing...' : getSentiment(msg.text) === 'Urgent' ? '🚨 Escalate to Manager' : 'AI Auto-Extract & Save'}
                    </button>
                  )}
                  {msg.isIncoming && msg.status === 'processed' && (
                    <span className="wa-processed-tag"><CheckCircle size={14}/> AI Processed</span>
                  )}
                </div>
              ))}
            </div>
            <div className="wa-input-zone">
              <input type="text" placeholder='Simulate incoming message (try "I need 30 burgers at 3PM" or "URGENT cancel!")...' value={waInput} onChange={e => setWaInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && simulateNewWAMessage()} />
              <button className="wa-send" onClick={simulateNewWAMessage}><Send size={18} /></button>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="email-view">
            <div className="email-sidebar">
              <h3>Inbox ({emails.length})</h3>
              {emails.map(email => {
                const sentiment = getSentiment(email.subject + " " + email.body);
                return (
                  <div key={email.id} className={`email-item ${selectedEmail?.id === email.id ? 'selected' : ''} ${sentiment === 'Urgent' ? 'urgent-email' : ''}`} onClick={() => setSelectedEmail(email)}>
                    <div className="em-from">{email.from}</div>
                    <div className="em-subj">{email.subject}</div>
                    <div className="em-time">
                      {email.time}
                      <SentimentBadge text={email.subject + " " + email.body} />
                      {email.status === 'processed' && <CheckCircle size={12} color="#10b981" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="email-body-zone">
              {selectedEmail ? (
                <div className="email-reader">
                  <div className="email-reader-header">
                    <h2>{selectedEmail.subject}</h2>
                    <SentimentBadge text={selectedEmail.subject + " " + selectedEmail.body} />
                  </div>
                  <div className="email-meta">
                    <strong>From:</strong> {selectedEmail.from}<br />
                    <strong>Date:</strong> {selectedEmail.time}
                  </div>
                  <div className="email-content" style={{ whiteSpace: 'pre-line' }}>{selectedEmail.body}</div>
                  {selectedEmail.status === 'unprocessed' ? (
                    <div className="button-group-row">
                      <button className="btn-primary" onClick={() => handleEmailProcess(selectedEmail)} disabled={processing}>
                        {processing ? '🤖 AI Scanning...' : getSentiment(selectedEmail.subject + " " + selectedEmail.body) === 'Urgent' ? '🚨 Escalate' : 'AI Confirm Order'}
                      </button>
                      <button className="btn-secondary" onClick={() => handleEmailProcess(selectedEmail, true)} disabled={processing}>
                        Generate Estimate
                      </button>
                    </div>
                  ) : (
                    <div className="email-reply-mock">
                      <h4>✅ System Auto-Responder sent:</h4>
                      <p>{selectedEmail.reply}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">Select an email to view and AI process</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'call' && (
          <div className="call-view">
            <div className="call-sidebar">
              <h3>Call Logs ({calls.length})</h3>
              {calls.map(call => (
                <div key={call.id} className={`call-item ${selectedCall?.id === call.id ? 'selected' : ''}`} onClick={() => setSelectedCall(call)}>
                  <div className="cl-info">
                    <div className="cl-cust">{call.customer}</div>
                    <div className="cl-phone">{call.phone}</div>
                  </div>
                  <div className="cl-meta">
                    <div className="cl-time">{call.time}</div>
                    <div className="cl-dur">{call.duration}</div>
                    {call.status === 'processed' && <CheckCircle size={14} color="#10b981" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="call-body-zone">
              {selectedCall ? (
                <div className="call-reader">
                  <div className="call-reader-header">
                    <h2>Voice Intelligence Transcript</h2>
                    <div className="call-controls">
                      <button className="icon-btn-play"><Play size={16} /> Play Recording</button>
                    </div>
                  </div>
                  <div className="transcript-meta">
                    <strong>Caller:</strong> {selectedCall.customer} ({selectedCall.phone})<br />
                    <strong>Duration:</strong> {selectedCall.duration}
                  </div>
                  <div className="transcript-content glass-panel">
                    <div className="ai-tag"><Zap size={10} /> AI Transcribed</div>
                    <p>"{selectedCall.transcript}"</p>
                  </div>
                  {selectedCall.status === 'unprocessed' ? (
                    <button className="btn-primary mt-4" onClick={() => handleCallProcess(selectedCall)} disabled={processing}>
                      {processing ? '🤖 AI Extracting Order Data...' : 'AI Convert Transcript to Order'}
                    </button>
                  ) : (
                    <div className="call-processed-banner">
                      <CheckCircle size={20} />
                      <div>
                        <strong>Order Logged Successfully</strong>
                        <p>The transcript was parsed and a new order has been added to the system.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state">Select a call log to view the AI transcript</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
