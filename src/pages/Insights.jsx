import React, { useState } from 'react';
import { Search, TrendingUp, Star, Phone, Mail, AlertTriangle, Zap } from 'lucide-react';
import './Insights.css';

const mockupCustomers = [
  { id: 'CUST-001', name: 'Wayne Enterprises', totalOrders: 42, revenue: '$25,400', lastOrder: '2 days ago', phone: '+1 555-0199', email: 'bruce@wayne.com', favorite: 'Premium Dinner Buffet' },
  { id: 'CUST-002', name: 'Stark Industries', totalOrders: 15, revenue: '$8,200', lastOrder: '1 week ago', phone: '+1 555-0102', email: 'tony@stark.com', favorite: 'Coffee & Pastry Platter' },
  { id: 'CUST-003', name: 'Acme Corp', totalOrders: 104, revenue: '$62,150', lastOrder: 'Today', phone: '+1 555-0888', email: 'procurement@acme.com', favorite: 'Executive Lunch Boxes' },
];

const Insights = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = mockupCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="insights-container">
      <div className="insights-header">
        <div>
          <h1 className="page-title">Customer Insights & AI Forecast</h1>
          <p className="page-subtitle">Analyze ordering behavior and predict future demand.</p>
        </div>
        
        <div className="insights-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Customers..." 
            className="input-field"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="ai-forecast-panel glass-panel">
        <div className="forecast-header">
          <Zap size={24} color="#8b5cf6" />
          <h2>OrderSync AI Predictive Forecasting</h2>
        </div>
        <div className="forecast-widgets">
          <div className="f-widget">
            <span className="fw-label">Expected Volume Next Week</span>
            <div className="fw-value">+35% <TrendingUp size={16} color="#10b981"/></div>
            <p>Driven by end-of-month corporate meetings.</p>
          </div>
          <div className="f-widget caution">
            <span className="fw-label">Ingredient Demand Alert</span>
            <div className="fw-value"><AlertTriangle size={18}/> Chicken & Turkey</div>
            <p>AI expects a 400-unit spike in Lunch Boxes. Procure more poultry by Friday.</p>
          </div>
          <div className="f-widget">
            <span className="fw-label">Churn Risk Warning</span>
            <div className="fw-value text-red">Stark Industries</div>
            <p>Has not ordered in 1 week. Average frequency is every 3 days. Recommend sending 10% discount.</p>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '1rem', fontSize: '1.25rem' }}>Client Directory</h2>
      <div className="insights-grid">
        {filtered.map(cust => (
          <div key={cust.id} className="insight-card glass-panel">
            <div className="card-top">
              <div className="avatar">{cust.name.substring(0,2).toUpperCase()}</div>
              <div>
                <h3 className="cust-name">{cust.name}</h3>
                <span className="cust-id">{cust.id}</span>
              </div>
            </div>
            
            <div className="card-stats">
              <div className="stat-block">
                <span className="stat-label">Total Orders</span>
                <span className="stat-val">{cust.totalOrders}</span>
              </div>
              <div className="stat-block">
                <span className="stat-label">Revenue</span>
                <span className="stat-val text-green">{cust.revenue}</span>
              </div>
            </div>

            <div className="card-details">
              <div className="detail-row"><Star size={14}/> <span>Fav: {cust.favorite}</span></div>
              <div className="detail-row"><TrendingUp size={14}/> <span>Last Order: {cust.lastOrder}</span></div>
              <div className="spacer"></div>
              <div className="detail-row"><Phone size={14}/> <span>{cust.phone}</span></div>
              <div className="detail-row"><Mail size={14}/> <span>{cust.email}</span></div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="no-results">No customers found.</p>
        )}
      </div>
    </div>
  );
};

export default Insights;
