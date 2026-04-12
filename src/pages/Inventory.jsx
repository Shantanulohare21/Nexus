import React, { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, TrendingDown, CheckCircle, RefreshCw, Box } from 'lucide-react';
import './Inventory.css';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/inventory');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 10000);
    return () => clearInterval(interval);
  }, [fetchInventory]);

  return (
    <div className="inventory-container fade-in">
      <div className="inventory-header">
        <div>
          <h1 className="page-title">Predictive Inventory AI</h1>
          <p className="page-subtitle">Real-time mapping of stock levels against upcoming order demand.</p>
        </div>
        <button className="refresh-btn" onClick={fetchInventory} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Sync Live Stock
        </button>
      </div>

      <div className="inventory-stats">
        <div className="inv-stat-card glass-panel">
          <Package size={24} color="#3b82f6" />
          <div className="stat-content">
            <span className="label">Managed Items</span>
            <span className="value">{items.length} Units</span>
          </div>
        </div>
        <div className="inv-stat-card glass-panel warning">
          <AlertTriangle size={24} color="#ef4444" />
          <div className="stat-content">
            <span className="label">Critical Stockouts</span>
            <span className="value">{items.filter(i => i.stock < i.minLevel).length} Items</span>
          </div>
        </div>
        <div className="inv-stat-card glass-panel success">
          <CheckCircle size={24} color="#10b981" />
          <div className="stat-content">
            <span className="label">Supply Efficiency</span>
            <span className="value">94.2%</span>
          </div>
        </div>
      </div>

      <div className="inventory-grid glass-panel">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Ingredient / Item</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Committed (Active Orders)</th>
              <th>AI Safety Margin (Forecast)</th>
              <th>Replenishment Need</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const status = item.stock < item.minLevel ? 'critical' : item.stock < item.minLevel * 2 ? 'warning' : 'healthy';
              const replenishment = Math.max(0, item.minLevel * 3 - item.stock).toFixed(1);

              return (
                <tr key={item.id}>
                  <td>
                    <div className="item-cell">
                      <Box size={16} />
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <span className="stock-val">{item.stock} {item.unit}</span>
                      <div className="progress-bg">
                        <div className={`progress-fill ${status}`} style={{ width: `${Math.min(100, (item.stock / 100) * 100)}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${status}`}>
                      {status.toUpperCase()}
                    </span>
                  </td>
                  <td>{item.committed.toFixed(1)} {item.unit}</td>
                  <td>{item.predicted.toFixed(1)} {item.unit}</td>
                  <td>
                    {replenishment > 0 ? (
                      <button className="order-more-btn">
                        Order {replenishment} {item.unit}
                      </button>
                    ) : (
                      <span className="stock-ok">Sufficient</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ai-insight-box glass-panel">
        <TrendingDown size={20} color="#f59e0b" />
        <div className="insight-text">
          <strong>Smart Prep Insight:</strong> High volume of <em>Executive Lunch Boxes</em> predicted for the next 48 hours. Recommend increasing <strong>Protein</strong> prep by 15% before Friday rush.
        </div>
      </div>
    </div>
  );
};

export default Inventory;
