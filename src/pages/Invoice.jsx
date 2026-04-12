import React, { useState, useEffect } from 'react';
import { useOrders } from '../context/OrderContext';
import { useLocation } from 'react-router-dom';
import { Download, Search, Printer, Share2, Database, Check, Send } from 'lucide-react';
import './Invoice.css';

const Invoice = () => {
  const { orders, sendInvoice, syncToZoho } = useOrders();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('id');
  
  const [searchTerm, setSearchTerm] = useState(orderId || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type, text }

  useEffect(() => {
    if (orderId && orderId !== searchTerm) setSearchTerm(orderId);
  }, [orderId, searchTerm]);
  
  const selectedOrder = searchTerm 
    ? orders.find(o => o.id.toLowerCase() === searchTerm.toLowerCase()) 
    : orders[0];

  const handlePrint = () => {
    window.print();
  };

  const handleZohoSync = async () => {
    if (!selectedOrder) return;
    setIsSyncing(true);
    const result = await syncToZoho(selectedOrder.id);
    setIsSyncing(false);
    if (result.success) {
      setStatusMsg({ type: 'success', text: 'Synced to Zoho CRM' });
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedOrder) return;
    setIsSending(true);
    const result = await sendInvoice(selectedOrder.id);
    setIsSending(false);
    if (result.success) {
      setStatusMsg({ type: 'success', text: 'Invoice Sent to Client' });
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header no-print">
        <div>
          <h1 className="page-title">Invoice Generator</h1>
          <p className="page-subtitle">Enterprise Billing & CRM Sync</p>
        </div>
        
        <div className="invoice-actions">
          <div className="invoice-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter by Order ID..." 
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className={`btn-zoho ${statusMsg?.text.includes('Zoho') ? 'success' : ''}`} onClick={handleZohoSync} disabled={isSyncing}>
            {isSyncing ? <div className="spinner-small" /> : statusMsg?.text.includes('Zoho') ? <Check size={18}/> : <Database size={18} />}
            {isSyncing ? 'Syncing...' : statusMsg?.text.includes('Zoho') ? 'Synced' : 'Sync Zoho'}
          </button>

          <button className={`btn-primary ${statusMsg?.text.includes('Sent') ? 'success' : ''}`} onClick={handleSendInvoice} disabled={isSending}>
            {isSending ? <div className="spinner-small" /> : statusMsg?.text.includes('Sent') ? <Check size={18}/> : <Send size={18} />}
            {isSending ? 'Sending...' : statusMsg?.text.includes('Sent') ? 'Invoice Sent' : 'Send Invoice'}
          </button>

          <button className="btn-secondary" onClick={handlePrint} title="Print Invoice">
            <Printer size={18} />
          </button>
          
          <button className="btn-primary" onClick={handlePrint}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {selectedOrder ? (
        <div className="invoice-paper glass-panel printable fade-in">
          <div className="invoice-top">
            <div className="invoice-brand">
              <div className="brand-logo">OS</div>
              <div>
                <h2>OrderSync AI</h2>
                <p>Enterprise Catering Solutions</p>
              </div>
            </div>
            <div className="invoice-meta">
              <h1>INVOICE</h1>
              <p><strong>Invoice ID:</strong> #INV-{selectedOrder.id.split('-')[1] || '0000'}</p>
              <p><strong>Date:</strong> {selectedOrder.date}</p>
              <div className={`invoice-badge ${selectedOrder.status === 'Delivered' || selectedOrder.status === 'Invoiced' ? 'paid' : 'unpaid'}`}>
                {selectedOrder.status === 'Delivered' ? 'FULLY PAID' : selectedOrder.status === 'Invoiced' ? 'INVOICED' : 'PAYMENT DUE'}
              </div>
              {statusMsg?.text.includes('Zoho') && <div className="zoho-sync-tag"><Check size={12}/> Zoho Synced</div>}
            </div>
          </div>

          <div className="invoice-bill-to">
            <div className="bill-col">
              <h3>Billed To:</h3>
              <p className="client-name">{selectedOrder.customerName}</p>
              <p>Corporate Office</p>
              <p>Source Channel: <span className="source-mini">{selectedOrder.source}</span></p>
            </div>
            <div className="bill-col">
              <h3>Shipped From:</h3>
              <p>OrderSync Central Kitchen</p>
              <p>456 Artisan Way, B-12</p>
              <p>Delivery Zone: District 9</p>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Service Description</th>
                <th className="text-center">Quantity</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{selectedOrder.item}</strong></td>
                <td className="text-center">{selectedOrder.quantity}</td>
                <td className="text-right">$25.00</td>
                <td className="text-right">${selectedOrder.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Service & Setup Fee</td>
                <td className="text-center">1</td>
                <td className="text-right">$45.00</td>
                <td className="text-right">$45.00</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-bottom-grid">
            <div className="invoice-notes">
              <h4>Terms & Notes</h4>
              <p>Please pay within 15 days from the date of issue. Make checks payable to OrderSync AI.</p>
              <div className="payment-qr">
                <div className="qr-box">QR Code Mock</div>
                <span>Scan for Digital Payment</span>
              </div>
            </div>
            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>${(selectedOrder.total + 45).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Platform Fee (2%)</span>
                <span>${((selectedOrder.total + 45) * 0.02).toFixed(2)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Due</span>
                <span>${((selectedOrder.total + 45) * 1.02).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="invoice-footer">
            <p>Thank you for partnering with OrderSync AI – Powering the world's best corporate catering.</p>
          </div>
        </div>
      ) : (
        <div className="glass-panel text-center" style={{padding: '3rem'}}>
          <p>No active order selected. Use the search to fetch an invoice by ID.</p>
        </div>
      )}
    </div>
  );
};

export default Invoice;
