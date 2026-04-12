import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OrderContext = createContext();
const API_URL = 'http://localhost:3001/api';

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');

  const fetchOrders = useCallback(async (retries = 3) => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders via API", err);
      if (retries > 0) {
        console.log(`Retrying fetch orders... (${retries} left)`);
        setTimeout(() => fetchOrders(retries - 1), 2000);
      }
    }
  }, []);

  const fetchNotifications = useCallback(async (retries = 3) => {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      if (retries > 0) {
        console.log(`Retrying fetch notifications... (${retries} left)`);
        setTimeout(() => fetchNotifications(retries - 1), 2000);
      }
    }
  }, []);

  const dismissNotification = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/dismiss`, { method: 'POST' });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to dismiss notification", err);
    }
  };

  const generateEstimate = async (orderData) => {
    // Force status to Awaiting Approval for estimates
    const estimate = { ...orderData, status: 'Awaiting Approval' };
    await addOrder(estimate);
    return { success: true };
  };

  useEffect(() => {
    fetchOrders();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchOrders();
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchNotifications]);

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

  const sendInvoice = async (id) => {
    try {
      // Simulate API call to send invoice
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Invoiced' })
      });
      fetchOrders();
      return { success: true, message: 'Invoice sent successfully' };
    } catch (err) {
      console.error("Failed to send invoice", err);
      return { success: false, error: err.message };
    }
  };

  const syncToZoho = async (id) => {
    try {
      const res = await fetch(`${API_URL}/zoho/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Zoho sync failed", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        notifications,
        addOrder,
        approveOrder,
        updateOrderStatus,
        sendInvoice,
        syncToZoho,
        dismissNotification,
        generateEstimate,
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
