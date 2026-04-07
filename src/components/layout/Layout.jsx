import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from './Chatbot';
import CommandMenu from './CommandMenu';
import { AlertTriangle, X } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const [scamAlerts, setScamAlerts] = useState([]);
  const [duplicateAlerts, setDuplicateAlerts] = useState([]);

  useEffect(() => {
    const handleScamAlert = (e) => {
      setScamAlerts(prev => [...prev, e.detail.id]);
      setTimeout(() => setScamAlerts(prev => prev.filter(id => id !== e.detail.id)), 10000);
    };
    const handleDuplicateAlert = (e) => {
      setDuplicateAlerts(prev => [...prev, e.detail.id]);
      setTimeout(() => setDuplicateAlerts(prev => prev.filter(id => id !== e.detail.id)), 10000);
    };
    
    window.addEventListener('scam-alert', handleScamAlert);
    window.addEventListener('duplicate-alert', handleDuplicateAlert);
    
    return () => {
      window.removeEventListener('scam-alert', handleScamAlert);
      window.removeEventListener('duplicate-alert', handleDuplicateAlert);
    };
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {scamAlerts.length > 0 && (
        <div className="toaster-container">
          {scamAlerts.map((id) => (
            <div key={id} className="toast scam-toast">
              <AlertTriangle size={24} color="#ef4444" />
              <div>
                <h4>Scam Intercepted</h4>
                <p>Order {id} was flagged by AI.</p>
              </div>
              <button className="icon-btn" onClick={() => setScamAlerts(p => p.filter(x => x !== id))}><X size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {duplicateAlerts.length > 0 && (
        <div className="toaster-container" style={{ top: '6rem' }}>
          {duplicateAlerts.map((id) => (
            <div key={id} className="toast" style={{ borderLeftColor: '#f59e0b' }}>
              <AlertTriangle size={24} color="#f59e0b" />
              <div>
                <h4>Duplicate Detected!</h4>
                <p>Order {id} looks identical to a recent order.</p>
              </div>
              <button className="icon-btn" onClick={() => setDuplicateAlerts(p => p.filter(x => x !== id))}><X size={16}/></button>
            </div>
          ))}
        </div>
      )}

      <Chatbot />
      <CommandMenu />
    </div>
  );
};

export default Layout;
