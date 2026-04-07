import React, { useState, useEffect, useRef } from 'react';
import { useOrders } from '../context/OrderContext';
import { Mic, CheckCircle, ChefHat, LayoutPanelLeft, ListChecks, Zap } from 'lucide-react';
import './Kitchen.css';

const Kitchen = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState('kds'); // 'kds' | 'prep'
  const [isListening, setIsListening] = useState(false);
  const [log, setLog] = useState([]);
  const recognitionRef = useRef(null);

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Awaiting Approval');
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Awaiting Approval'].includes(o.status));

  // AI Ingredient Scaling Logic
  const getPrepList = () => {
    const list = {
      'Protein (Chicken/Beef)': 0,
      'Base (Rice/Dough)': 0,
      'Dairy (Cheese)': 0,
      'Fresh Produce': 0
    };

    activeOrders.forEach(o => {
      const item = o.item.toLowerCase();
      const qty = o.quantity;
      
      if (item.includes('lunch')) {
        list['Protein (Chicken/Beef)'] += qty * 0.5;
        list['Base (Rice/Dough)'] += qty * 0.4;
        list['Fresh Produce'] += qty * 0.3;
      } else if (item.includes('burger')) {
        list['Protein (Chicken/Beef)'] += qty * 0.3;
        list['Dairy (Cheese)'] += qty * 0.1;
        list['Fresh Produce'] += qty * 0.2;
      } else if (item.includes('pizza')) {
        list['Base (Rice/Dough)'] += qty * 0.4;
        list['Dairy (Cheese)'] += qty * 0.2;
        list['Fresh Produce'] += qty * 0.1;
      } else {
        list['Fresh Produce'] += qty * 0.5;
      }
    });

    return Object.entries(list).map(([name, value]) => ({ name, value: value.toFixed(1) }));
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        handleVoiceCommand(transcript);
      };

      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isListening, orders]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      addToLog("Voice AI Listening for Kitchen Commands...", 'system');
    }
  };

  const handleVoiceCommand = (command) => {
    addToLog(`Captured: "${command}"`, 'user');
    const idMatch = command.match(/\d{4}/); 
    if (idMatch) {
      const orderId = orders.find(o => o.id.includes(idMatch[0]))?.id;
      if (orderId) {
        if (command.includes('ready') || command.includes('preparing')) {
          updateOrderStatus(orderId, 'Preparing');
          addToLog(`Order ${idMatch[0]} set to Preparing.`, 'success');
        } else if (command.includes('done') || command.includes('deliver')) {
          updateOrderStatus(orderId, 'Out for Delivery');
          addToLog(`Order ${idMatch[0]} completed.`, 'success');
        }
      }
    }
  };

  const addToLog = (msg, type) => {
    setLog(prev => [{ text: msg, type, id: Date.now() }, ...prev].slice(0, 5));
  };

  return (
    <div className="kitchen-container dark-mode">
      <div className="kitchen-header">
        <div className="kitchen-title">
          <ChefHat size={32} color="var(--accent-primary)" />
          <h1>Chef's Nerve Center</h1>
        </div>
        
        <div className="kitchen-nav">
          <button className={`nav-btn ${activeTab === 'kds' ? 'active' : ''}`} onClick={() => setActiveTab('kds')}>
            <LayoutPanelLeft size={18} /> Ticket KDS
          </button>
          <button className={`nav-btn ${activeTab === 'prep' ? 'active' : ''}`} onClick={() => setActiveTab('prep')}>
            <ListChecks size={18} /> AI Prep Master
          </button>
        </div>

        <button className={`mic-btn ${isListening ? 'active' : ''}`} onClick={toggleListen}>
          <Mic size={20} /> {isListening ? 'Voice AI Live' : 'Voice Command'}
        </button>
      </div>

      {activeTab === 'kds' ? (
        <div className="kitchen-grid">
          <div className="kds-column glass-panel">
            <h2>New Orders ({pendingOrders.length})</h2>
            <div className="kds-list">
              {pendingOrders.map(o => (
                <div key={o.id} className={`kds-card ${o.status === 'Awaiting Approval' ? 'restricted' : ''}`}>
                  <div className="kds-card-head">
                    <span className="kds-id">{o.id}</span>
                    <span className={`kds-priority ${o.priority.toLowerCase()}`}>{o.priority}</span>
                  </div>
                  <h3>{o.quantity}x {o.item}</h3>
                  <p>Client: {o.customerName}</p>
                  <div className="kds-card-foot">
                    <span>Due: {o.time}</span>
                    {o.status === 'Awaiting Approval' && <span className="approval-badge">Est. Only</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="kds-column glass-panel">
            <h2>Active Prep ({preparingOrders.length})</h2>
            <div className="kds-list">
              {preparingOrders.map(o => (
                <div key={o.id} className="kds-card preparing-state">
                  <div className="kds-card-head">
                    <span className="kds-id">{o.id}</span>
                    <CheckCircle className="kds-icon spinning" />
                  </div>
                  <h3>{o.quantity}x {o.item}</h3>
                  <p>{o.customerName}</p>
                  <div className="progress-bar-small"><div className="progress-fill" /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="kds-column log-column glass-panel">
            <h2>Voice Operations</h2>
            <div className="voice-log">
              {log.map(entry => (
                <p key={entry.id} className={`log-entry ${entry.type}`}>
                  {entry.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="prep-dashboard fade-in">
          <div className="prep-summary glass-panel">
            <h2>Ingredient AI Aggregator</h2>
            <p>Scanning {activeOrders.length} active orders to generate the master prep list.</p>
            
            <div className="prep-grid">
              {getPrepList().map(item => (
                <div key={item.name} className="prep-stat-card">
                  <span className="prep-name">{item.name}</span>
                  <span className="prep-value">{item.value} kg</span>
                  <div className="prep-progress"><div className="fill" style={{width: `${Math.min(parseFloat(item.value)*2, 100)}%`}} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="prep-ai-insights glass-panel">
            <div className="insight-head">
              <Zap size={20} color="#f59e0b" />
              <h3>Smart Prep Insights</h3>
            </div>
            <ul className="insight-list">
              <li>High volume of <strong>Chicken</strong> detected for 1PM. Recommend early searing.</li>
              <li>Consolidating <strong>Burgers</strong> across 3 orders will save 15 mins of grill time.</li>
              <li>Current batch efficiency: <strong style={{color: '#10b981'}}>94%</strong>.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kitchen;
