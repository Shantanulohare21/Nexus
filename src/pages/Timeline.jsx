import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { CheckCircle, Clock, Package, MapPin, Search } from 'lucide-react';
import './Timeline.css';

const Timeline = () => {
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedOrder = searchTerm 
    ? orders.find(o => o.id.toLowerCase() === searchTerm.toLowerCase()) 
    : orders[0];

  const stages = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
  
  const getStageIndex = (status) => {
    return stages.indexOf(status);
  };

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <div>
          <h1 className="page-title">Order Timeline</h1>
          <p className="page-subtitle">Track the real-time progress of catering orders.</p>
        </div>
        
        <div className="search-order">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Order ID (e.g. ORD-1001)" 
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedOrder ? (
        <div className="timeline-view glass-panel">
          <div className="order-summary">
            <h2>Order {selectedOrder.id}</h2>
            <div className="order-meta">
              <span><strong>Customer:</strong> {selectedOrder.customerName}</span>
              <span><strong>Items:</strong> {selectedOrder.quantity}x {selectedOrder.item}</span>
              <span><strong>Time:</strong> {selectedOrder.time}</span>
              <span className={`priority-badge ${selectedOrder.priority.toLowerCase()}`}>
                {selectedOrder.priority} Priority
              </span>
            </div>
          </div>

          <div className="stepper-container">
            {stages.map((stage, index) => {
              const currentStageIndex = getStageIndex(selectedOrder.status);
              const isCompleted = index <= currentStageIndex;
              const isActive = index === currentStageIndex;
              
              let Icon = Clock;
              if (stage === 'Pending') Icon = Clock;
              if (stage === 'Preparing') Icon = Package;
              if (stage === 'Out for Delivery') Icon = MapPin;
              if (stage === 'Delivered') Icon = CheckCircle;

              return (
                <div key={stage} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-icon">
                    <Icon size={24} />
                  </div>
                  <div className="step-label">{stage}</div>
                  {index < stages.length - 1 && <div className="step-connector"></div>}
                </div>
              );
            })}
          </div>
          
          <div className="activity-feed">
            <h3>Activity Log</h3>
            <div className="feed-item">
              <div className="feed-dot"></div>
              <p><strong>{selectedOrder.status}</strong> - Current Status</p>
            </div>
            <div className="feed-item">
              <div className="feed-dot"></div>
              <p>Order received via <strong>{selectedOrder.source}</strong></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel text-center" style={{padding: '3rem'}}>
          <p>No order found with that ID. Showing blank state.</p>
        </div>
      )}
    </div>
  );
}

export default Timeline;
