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

  // Determine truck position along a mock path
  const truckX = 150 + (progress * 5); 
  const truckY = 250 - (Math.sin((progress / 100) * Math.PI) * 100);

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
            <p>123 Corporate Plaza, Suite 400</p>
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
            <span>Delivery Hero • 4.9 ★</span>
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
              <line key={`v-${i}`} x1={i * 80} y1="0" x2={i * 80} y2="600" stroke="var(--border-color)" strokeWidth="1" />
            ))}
            {[...Array(8)].map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="var(--border-color)" strokeWidth="1" />
            ))}
          </g>

          {/* Roads */}
          <path d="M 100 400 L 400 400 L 400 100 L 700 100" fill="none" stroke="#334155" strokeWidth="40" strokeLinecap="round" />
          <path d="M 100 400 L 400 400 L 400 100 L 700 100" fill="none" stroke="var(--accent-glow)" strokeWidth="42" strokeLinecap="round" opacity="0.3" />
          <path d="M 100 400 L 400 400 L 400 100 L 700 100" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />

          {/* Delivery Points */}
          <circle cx="100" cy="400" r="20" fill="var(--accent-primary)" />
          <text x="90" y="370" fill="var(--text-primary)" fontSize="12" fontWeight="700">Kitchen HQ</text>
          
          <circle cx="700" cy="100" r="20" fill="#10b981" />
          <MapPin x="684" y="74" size={32} color="#10b981" className="map-pin-dest" />
          <text x="660" y="70" fill="var(--text-primary)" fontSize="12" fontWeight="700">{order.customerName}</text>

          {/* Pulsing Destination */}
          <circle cx="700" cy="100" r="40" fill="#10b981" opacity="0.2">
            <animate attributeName="r" from="20" to="50" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* The Truck */}
          {order.status === 'Out for Delivery' && (
            <g transform={`translate(${truckX}, ${truckY})`}>
              <circle r="30" fill="var(--accent-primary)" opacity="0.2">
                 <animate attributeName="r" from="30" to="45" dur="1s" repeatCount="indefinite" />
                 <animate attributeName="opacity" from="0.2" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
              <foreignObject x="-20" y="-20" width="40" height="40">
                <div className="truck-marker">
                  <Navigation size={24} color="white" style={{ transform: 'rotate(90deg)' }} />
                </div>
              </foreignObject>
            </g>
          )}

          {/* Delivered State */}
          {order.status === 'Delivered' && (
            <g transform="translate(700, 100)">
              <Truck size={48} color="#10b981" x="-24" y="-24" />
            </g>
          )}
        </svg>

        <div className="map-overlay">
          <div className="map-badge">
            <Navigation size={14} className="spinning" />
            <span>Live GPS Tracking Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTracking;
