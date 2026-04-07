import React, { useState } from 'react';
import { Send, Smartphone, Mail, PhoneCall } from 'lucide-react';
import './Simulator.css';

const Simulator = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const simulateWebhook = async (source) => {
    setLoading(true);
    setResponse(null);
    
    // Simulate what Zapier or Twilio would strictly send
    const payload = {};
    if (source === 'whatsapp') {
      payload.customerName = 'Jane Doe (WhatsApp)';
      payload.item = 'Assorted Sandwiches';
      payload.quantity = 25;
    } else if (source === 'email') {
      payload.customerName = 'scammer@fake-domain.com';
      payload.item = 'Diamond Lunch Boxes';
      payload.quantity = 600; // Expected to trigger SCAM alert
    } else if (source === 'call') {
      payload.customerName = 'Voice Caller 555-0101';
      payload.item = 'Coffee Carriers';
      payload.quantity = 5;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/webhooks/${source}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setResponse({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h1 className="page-title">Channel Webhook Simulator</h1>
        <p className="page-subtitle">Demonstrate 100% order capture from external sources (Twilio, SendGrid, Zapier) directly into the SQLite DB.</p>
      </div>

      <div className="sim-cards glass-panel">
        <div className="sim-card">
          <div className="sim-icon whatsapp"><Smartphone size={32}/></div>
          <h3>Simulate WhatsApp Order</h3>
          <p>Sends a REST payload simulating a Twilio WhatsApp message.</p>
          <button className="btn-primary" onClick={() => simulateWebhook('whatsapp')} disabled={loading}>
            <Send size={16}/> Fire Webhook
          </button>
        </div>

        <div className="sim-card">
          <div className="sim-icon email"><Mail size={32}/></div>
          <h3>Simulate Email Order (SCAM TEST)</h3>
          <p>Sends a payload of 600 items. Our AI should intercept it.</p>
          <button className="btn-primary" onClick={() => simulateWebhook('email')} disabled={loading}>
            <Send size={16}/> Fire Webhook
          </button>
        </div>

        <div className="sim-card">
          <div className="sim-icon call"><PhoneCall size={32}/></div>
          <h3>Simulate Automated Call</h3>
          <p>Simulates a voice-transcribed API request.</p>
          <button className="btn-primary" onClick={() => simulateWebhook('call')} disabled={loading}>
            <Send size={16}/> Fire Webhook
          </button>
        </div>
      </div>

      {response && (
        <div className="response-box glass-panel">
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          {response.isScam === true && (
            <div className="scam-notice">SYSTEM FLAG: Order intercepted by Scam Heuristics</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Simulator;
