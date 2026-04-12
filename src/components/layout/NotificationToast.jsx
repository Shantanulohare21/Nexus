import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Zap, AlertTriangle } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);

  const removeToast = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addToast = useCallback((title, message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  useEffect(() => {
    const handleScam = (e) => addToast('SCAM ALERT', `Potential fraud detected: ${e.detail.id}`, 'scam');
    const handlePriority = (e) => addToast('PRIORITY ORDER', `Urgent request captured: ${e.detail.id}`, 'priority');

    window.addEventListener('scam-alert', handleScam);
    window.addEventListener('priority-order', handlePriority);

    return () => {
      window.removeEventListener('scam-alert', handleScam);
      window.removeEventListener('priority-order', handlePriority);
    };
  }, [addToast]);

  return (
    <div className="toast-container">
      {notifications.map(n => (
        <div key={n.id} className={`toast glass-panel ${n.type} slide-in`}>
          <div className="toast-icon">
            {n.type === 'scam' ? <AlertTriangle size={20} /> : <Zap size={20} />}
          </div>
          <div className="toast-content">
            <strong>{n.title}</strong>
            <p>{n.message}</p>
          </div>
          <button className="toast-close" onClick={() => removeToast(n.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
