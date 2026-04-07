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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh stats every 10s
    return () => clearInterval(interval);
  }, []);

  const filtered = mockupCustomers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // SVG Chart Components
  const RevenueChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="chart-empty">Insufficient data for revenue trend.</div>;
    
    const maxVal = Math.max(...data.map(d => d.value)) || 100;
    const width = 600;
    const height = 200;
    const padding = 40;
    
    const points = data.map((d, i) => {
      const x = padding + (i * (width - 2 * padding) / (data.length - 1));
      const y = height - padding - (d.value / maxVal * (height - 2 * padding));
      return { x, y };
    });

    const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');

    return (
      <div className="chart-wrapper">
        <h4>7-Day Revenue Trend</h4>
        <svg viewBox={`0 0 ${width} ${height}`} className="revenue-svg">
          <g className="grid-lines">
            {[0, 1, 2, 3].map(i => {
              const y = padding + i * (height - 2 * padding) / 3;
              return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border-color)" strokeDasharray="4 4" />;
            })}
          </g>
          <path d={pathD} fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--accent-primary)" stroke="var(--bg-secondary)" strokeWidth="2">
               <title>{data[i].label}: ${data[i].value}</title>
            </circle>
          ))}
          <text x={width/2} y={height - 5} fill="var(--text-muted)" fontSize="10" textAnchor="middle">Last 7 Trading Days</text>
        </svg>
      </div>
    );
  };

  const SourceChart = ({ data }) => {
    if (!data) return null;
    const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
    let currentAngle = 0;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
      <div className="chart-wrapper donut">
        <h4>Order Source Volume</h4>
        <div className="donut-content">
          <svg viewBox="0 0 100 100" className="donut-svg">
            {data.map((d, i) => {
              const sliceAngle = (d.value / total) * 360;
              const x1 = 50 + 40 * Math.cos(Math.PI * currentAngle / 180);
              const y1 = 50 + 40 * Math.sin(Math.PI * currentAngle / 180);
              currentAngle += sliceAngle;
              const x2 = 50 + 40 * Math.cos(Math.PI * currentAngle / 180);
              const y2 = 50 + 40 * Math.sin(Math.PI * currentAngle / 180);
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              
              return (
                <path
                  key={i}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[i % colors.length]}
                  stroke="var(--bg-primary)"
                  strokeWidth="1"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="var(--bg-secondary)" />
            <text x="50" y="55" fontSize="8" fontWeight="700" fill="var(--text-primary)" textAnchor="middle">{total}</text>
          </svg>
          <div className="chart-legend">
            {data.map((d, i) => (
              <div key={i} className="legend-item">
                <span className="dot" style={{ backgroundColor: colors[i % colors.length] }}></span>
                <span className="label">{d.label}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

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

      <div className="analytics-row">
         <div className="analytics-card glass-panel">
            <RevenueChart data={stats?.revenueSeries} />
         </div>
         <div className="analytics-card glass-panel">
            <SourceChart data={stats?.sourceDistribution} />
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
