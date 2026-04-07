import React, { useState, useEffect } from 'react';
import { useOrders } from '../context/OrderContext';
import { Truck, MapPin, Navigation, Info, Briefcase, Zap, ChevronRight } from 'lucide-react';
import './Logistics.css';

const Logistics = () => {
  const { orders } = useOrders();
  const [batches, setBatches] = useState([]);
  
  // Logic: Group orders into "Batches" by mock geographical zones
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'Preparing' || o.status === 'Pending' || o.status === 'Awaiting Approval');
    
    // Simple mock logic for demonstration
    const zoneA = pendingOrders.filter((_, i) => i % 2 === 0);
    const zoneB = pendingOrders.filter((_, i) => i % 2 !== 0);
    
    const newBatches = [
      { id: 'Batch-North-1', orders: zoneA, zone: 'North Sector', efficiency: '92%', driver: 'Sarah Connor', status: 'Routing' },
      { id: 'Batch-Downtown-2', orders: zoneB, zone: 'Central Business', efficiency: '88%', driver: 'John Wick', status: 'Ready' }
    ].filter(b => b.orders.length > 0);
    
    setBatches(newBatches);
  }, [orders]);

  return (
    <div className="logistics-container fade-in">
      <div className="logistics-header">
        <div>
          <h1 className="page-title">AI Logistics Engine</h1>
          <p className="page-subtitle">Multi-order route grouping for peak efficiency.</p>
        </div>
        <div className="logistics-meta">
          <div className="meta-pill"><Zap size={14}/> {batches.length} Optimized Routes</div>
          <div className="meta-pill green"><Briefcase size={14}/> 124 kg Total Payload</div>
        </div>
      </div>

      <div className="logistics-grid">
        <div className="logistics-list">
          {batches.map(batch => (
            <div key={batch.id} className="batch-card glass-panel">
              <div className="batch-top">
                <div className="batch-id">
                  <Truck size={18} />
                  <strong>{batch.id}</strong>
                </div>
                <span className="efficiency-badge">{batch.efficiency} Efficiency</span>
              </div>
              
              <div className="batch-details">
                <p><span>Zone:</span> {batch.zone}</p>
                <p><span>Driver:</span> {batch.driver}</p>
                <p><span>Orders:</span> {batch.orders.length}</p>
              </div>

              <div className="batch-orders">
                {batch.orders.slice(0, 3).map(o => (
                  <div key={o.id} className="mini-order-row">
                    <MapPin size={12}/>
                    <span>{o.id}: {o.customerName}</span>
                  </div>
                ))}
                {batch.orders.length > 3 && <div className="more-count">+{batch.orders.length - 3} more orders...</div>}
              </div>

              <button className="btn-primary w-full">Deploy Batch <ChevronRight size={16}/></button>
            </div>
          ))}
          {batches.length === 0 && <div className="empty-state glass-panel">No orders available for routing.</div>}
        </div>

        <div className="logistics-map glass-panel">
          <div className="map-placeholder">
            <svg viewBox="0 0 800 600" className="logistics-map-svg">
              <rect width="800" height="600" fill="var(--bg-primary)" rx="12" />
              <g opacity="0.1">
                {[...Array(15)].map((_, i) => (
                  <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="600" stroke="currentColor" />
                ))}
                {[...Array(10)].map((_, i) => (
                  <line key={i} x1="0" y1={i * 60} x2="800" y2={i * 60} stroke="currentColor" />
                ))}
              </g>
              
              {/* Central Hub */}
              <circle cx="400" cy="300" r="10" fill="var(--accent-primary)" />
              <text x="380" y="280" fontSize="12" fill="var(--text-primary)" fontWeight="700">Kitchen Central</text>

              {/* Route 1 - Blue */}
              <path d="M 400 300 Q 300 200 200 150 T 100 100" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeDasharray="6 4" />
              <circle cx="200" cy="150" r="6" fill="var(--accent-primary)" />
              <circle cx="100" cy="100" r="6" fill="var(--accent-primary)" />

              {/* Route 2 - Green */}
              <path d="M 400 300 Q 500 400 600 450 T 700 500" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="6 4" />
              <circle cx="600" cy="450" r="6" fill="#10b981" />
              <circle cx="700" cy="500" r="6" fill="#10b981" />
            </svg>
            <div className="map-overlay-info">
              <Info size={14}/> Interactive Route Overlay (AI-Driven)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
