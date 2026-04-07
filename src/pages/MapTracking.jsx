import React, { useEffect, useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Truck, MapPin, Navigation, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import './MapTracking.css';

const MapTracking = () => {
  const { orders } = useOrders();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('id');
  const [order, setOrder] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (orderId) {
      const found = orders.find(o => o.id === orderId);
      setOrder(found);
    } else {
      setOrder(orders[0]); // Default to first order for demo
    }
  }, [orderId, orders]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 1 : 0));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  if (!order) {
    return <div className="loading-state glass-panel">Select an order to track...</div>;
  }

  // Mock Path Coordinates (match the SVG road: M 100 400 L 400 400 L 400 100 L 700 100)
  const waypoints = [
    { x: 100, y: 400 }, // Start
    { x: 400, y: 400 }, // Corner 1
    { x: 400, y: 100 }, // Corner 2
    { x: 700, y: 100 }  // End
  ];

  // Calculate current X/Y based on progress (0-100)
  const getPathPosition = (pct) => {
    const totalWaypoints = waypoints.length;
    const segments = totalWaypoints - 1;
    const segmentPct = 100 / segments;
    
    const segmentIndex = Math.min(Math.floor(pct / segmentPct), segments - 1);
    const start = waypoints[segmentIndex];
    const end = waypoints[segmentIndex + 1];
    
    const localPct = (pct % segmentPct) / segmentPct;
    
    return {
      x: start.x + (end.x - start.x) * localPct,
      y: start.y + (end.y - start.y) * localPct,
      rotation: end.x > start.x ? 90 : (end.y < start.y ? 0 : 180)
    };
  };

  const pos = getPathPosition(progress);

  return (
    <div className="map-tracking-container fade-in">
      <div className="map-sidebar glass-panel">
        <NavLink to="/" className="back-link"><ChevronLeft size={18}/> Back to Dashboard</NavLink>
        
        <div className="track-header">
          <h2>Live Tracking</h2>
          <span className={`status-pill ${order.status.toLowerCase().replace(/ /g, '-')}`}>{order.status}</span>
        </div>

        <div className="order-mini-card">
          <div className="order-info">
            <span className="label">Order ID</span>
            <h3>{order.id}</h3>
          </div>
          <div className="order-info">
            <span className="label">Destination</span>
            <p><strong>{order.customerName}</strong></p>
            <p>123 Corporate Plaza, Suite 400 (AI Optimized Path)</p>
          </div>
        </div>

        <div className="delivery-steps">
          <div className={`step ${['Preparing', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
            <span className="step-icon"><Clock size={16}/></span>
            <div className="step-txt">
              <strong>Order Received</strong>
              <span>{order.time}</span>
            </div>
          </div>
          <div className={`step ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'active' : ''}`}>
            <span className="step-icon"><Truck size={16}/></span>
            <div className="step-txt">
              <strong>Out for Delivery</strong>
              <span>Estimated 15 mins</span>
            </div>
          </div>
          <div className={`step ${order.status === 'Delivered' ? 'active' : ''}`}>
            <span className="step-icon"><CheckCircle size={16}/></span>
            <div className="step-txt">
              <strong>Handed to Client</strong>
              <span>Pending</span>
            </div>
          </div>
        </div>

        <div className="driver-card">
          <div className="driver-avatar">JD</div>
          <div className="driver-info">
            <strong>John Doe</strong>
            <span>Logistics Pilot • 4.9 ★</span>
          </div>
          <button className="btn-contact">Contact</button>
        </div>
      </div>

      <div className="map-view glass-panel">
        <svg viewBox="0 0 800 600" className="map-svg">
          {/* Mock Map Background - City Grid */}
          <rect width="800" height="600" fill="var(--bg-primary)" rx="12" />
          
          <g className="map-grid">
            {[...Array(10)].map((_, i) => (
              <line key={`v-${i}`} x1={i * 80} y1="0" x2={i * 80} y2="600" stroke="var(--border-color)" strokeWidth="1" opacity="0.3" />
            ))}
            {[...Array(8)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="var(--border-color)" strokeWidth="1" opacity="0.3" />
            ))}
          </g>

          {/* Roads */}
          <path d="M 100 400 L 400 400 L 400 100 L 700 100" fill="none" stroke="#334155" strokeWidth="40" strokeLinecap="round" />
          <path d="M 100 400 L 400 400 L 400 100 L 700 100" fill="none" stroke="var(--accent-glow)" strokeWidth="42" strokeLinecap="round" opacity="0.3" />
          <path d="M 100 400 L 400 400 L 400 100 L 700 100" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10" opacity="0.2" />

          {/* Delivery Points */}
          <circle cx="100" cy="400" r="15" fill="var(--accent-primary)" />
          <text x="70" y="440" fill="var(--text-secondary)" fontSize="10" fontWeight="600">DISTRIBUTION CENTER</text>
          
          <circle cx="700" cy="100" r="15" fill="#10b981" />
          <foreignObject x="684" y="60" width="32" height="32">
             <MapPin size={32} color="#10b981" className="map-pin-dest" />
          </foreignObject>
          <text x="660" y="140" fill="var(--text-primary)" fontSize="12" fontWeight="700">{order.customerName}</text>

          {/* Pulsing Destination */}
          <circle cx="700" cy="100" r="40" fill="#10b981" opacity="0.1">
            <animate attributeName="r" from="15" to="60" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* The Truck */}
          {order.status === 'Out for Delivery' && (
            <g transform={`translate(${pos.x}, ${pos.y})`}>
              <circle r="30" fill="var(--accent-primary)" opacity="0.2">
                 <animate attributeName="r" from="30" to="45" dur="1s" repeatCount="indefinite" />
                 <animate attributeName="opacity" from="0.2" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
              <foreignObject x="-20" y="-20" width="40" height="40">
                <div className="truck-marker" style={{ transform: `rotate(${pos.rotation}deg)` }}>
                  <Navigation size={24} color="white" />
                </div>
              </foreignObject>
            </g>
          )}

          {/* Delivered State */}
          {order.status === 'Delivered' && (
            <g transform="translate(680, 80)">
               <foreignObject x="0" y="0" width="40" height="40">
                  <div className="delivered-badge">
                     <CheckCircle size={32} color="#10b981" />
                  </div>
               </foreignObject>
            </g>
          )}
        </svg>

        <div className="map-overlay">
          <div className="map-badge">
            <Navigation size={14} className="spinning" />
            <span>AI Optimized Logistics Route Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTracking;
