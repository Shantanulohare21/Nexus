import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { Bell, AlertTriangle, Clock, Zap, X, Check } from 'lucide-react';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { notifications, dismissNotification } = useOrders();
  const [isOpen, setIsOpen] = useState(false);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#3b82f6';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'scam': return <AlertTriangle size={16} />;
      case 'delay': return <Clock size={16} />;
      case 'urgent': return <Zap size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="notification-center">
      <button className={`bell-btn ${notifications.length > 0 ? 'has-alerts' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {notifications.length > 0 && <span className="alert-count">{notifications.length}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown glass-panel fade-in">
          <div className="dropdown-header">
            <h3>Notifications & Alerts</h3>
            <button className="close-dropdown" onClick={() => setIsOpen(false)}><X size={16}/></button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={32} />
                <p>No active alerts. All systems operational.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`notification-item ${n.type}`} style={{ borderLeft: `4px solid ${getSeverityColor(n.severity)}` }}>
                  <div className="n-icon" style={{ backgroundColor: getSeverityColor(n.severity) + '20', color: getSeverityColor(n.severity) }}>
                    {getIcon(n.type)}
                  </div>
                  <div className="n-text">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                  </div>
                  <button className="n-dismiss" onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }} title="Acknowledge">
                    <Check size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <button className="view-all-btn">View All History</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
