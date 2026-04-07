import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();
const API_URL = 'http://localhost:3001/api';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [theme, setTheme] = useState('light');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders via API", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const addOrder = async (order) => {
    const newOrder = {
      ...order,
      id: order.id || `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
      status: order.status || 'Pending'
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      const data = await res.json();
      
      if (data.isScam) {
        window.dispatchEvent(new CustomEvent('scam-alert', { detail: { id: newOrder.id } }));
      }
      if (data.isDuplicate) {
        window.dispatchEvent(new CustomEvent('duplicate-alert', { detail: { id: newOrder.id } }));
      }
      fetchOrders(); // Refresh list immediately
    } catch (err) {
      console.error("Failed to post order", err);
    }
  };

  const approveOrder = async (id) => {
    try {
      await fetch(`${API_URL}/orders/${id}/approve`, { method: 'PUT' });
      fetchOrders(); // Refresh
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        approveOrder,
        updateOrderStatus,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
