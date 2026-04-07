import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertCircle, 
  MoreVertical, 
  MapPin, 
  LayoutGrid, 
  List,
  ThumbsUp,
  XCircle,
  Eye
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './Dashboard.css';

const Dashboard = () => {
  const { orders, updateOrderStatus, approveOrder } = useOrders();
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [filter, setFilter] = useState('All');

  const filteredOrders = orders.filter(o => {
    if (filter === 'All') return true;
    if (filter === 'Pending' && (o.status === 'Pending' || o.status === 'Awaiting Approval')) return true;
    return o.status === filter;
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    updateOrderStatus(draggableId, newStatus);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="status-pending" />;
      case 'Awaiting Approval': return <AlertCircle size={16} className="status-alert" />;
      case 'Preparing': return <div className="pulse-dot" />;
      case 'Out for Delivery': return <Truck size={16} className="status-delivery" />;
      case 'Delivered': return <CheckCircle size={16} className="status-done" />;
      case 'SCAM ALERT': return <AlertCircle size={16} className="status-scam" />;
      case 'DUPLICATE WARNING': return <AlertCircle size={16} className="status-duplicate" />;
      default: return null;
    }
  };

  const getSentimentTag = (sentiment) => {
    const s = sentiment?.toLowerCase() || 'neutral';
    let icon = null;
    if (s === 'urgent') icon = '⚡';
    if (s === 'negative') icon = '😠';
    if (s === 'positive') icon = '😊';
    if (s === 'neutral') icon = '😐';

    return (
      <span className={`sentiment-tag ${s}`}>
        {icon} {sentiment || 'Neutral'}
      </span>
    );
  };

  const kanbanColumns = [
    { id: 'Pending', title: 'Pending' },
    { id: 'Preparing', title: 'Preparing' },
    { id: 'Out for Delivery', title: 'Out for Delivery' },
    { id: 'Delivered', title: 'Delivered' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="page-title">Order Dashboard</h1>
          <div className="dashboard-stats">
            <span className="stat-pill">Total: {orders.length}</span>
            <span className="stat-pill pending">Awaiting: {orders.filter(o => o.status === 'Awaiting Approval').length}</span>
          </div>
        </div>

        <div className="dashboard-controls">
          <div className="filter-group no-print">
            {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map(f => (
              <button 
                key={f} 
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="view-toggle no-print">
            <button className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="List View"><List size={18}/></button>
            <button className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`} onClick={() => setViewMode('kanban')} title="Kanban View"><LayoutGrid size={18}/></button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-container glass-panel fade-in">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Item</th>
                <th>Source</th>
                <th>Status</th>
                <th>Sentiment</th>
                <th>Priority</th>
                <th>Total</th>
                <th className="no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={order.status === 'SCAM ALERT' ? 'row-scam' : ''}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.customerName}</strong>
                      <span>{order.date}</span>
                    </div>
                  </td>
                  <td>{order.quantity}x {order.item}</td>
                  <td><span className={`source-tag ${order.source.toLowerCase()}`}>{order.source}</span></td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(order.status)}
                      <span className={`status-text ${order.status.toLowerCase().replace(/ /g, '-')}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td>{getSentimentTag(order.sentiment)}</td>
                  <td>
                    <span className={`priority-tag ${order.priority.toLowerCase()}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td><span className="amount">${order.total}</span></td>
                  <td className="no-print">
                    <div className="action-btns">
                      {order.status === 'Awaiting Approval' ? (
                        <button className="btn-approve" onClick={() => approveOrder(order.id)} title="Approve Estimate">
                          <ThumbsUp size={16} /> Approve
                        </button>
                      ) : (
                        <>
                          <button className="icon-btn-track" onClick={() => window.location.href = `/timeline?id=${order.id}`} title="Track Map">
                            <MapPin size={16} />
                          </button>
                          <button className="icon-btn" onClick={() => window.location.href=`/invoice?id=${order.id}`} title="View Details">
                            <Eye size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="empty-state">No orders found matching the filter.</div>}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board fade-in">
            {kanbanColumns.map(column => (
              <div key={column.id} className="kanban-column glass-panel">
                <div className="column-header">
                  <h3>{column.title}</h3>
                  <span className="count">{orders.filter(o => o.status === column.id).length}</span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={`column-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                      {orders.filter(o => o.status === column.id).map((order, index) => (
                        <Draggable key={order.id} draggableId={order.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''} ${order.priority === 'High' ? 'high-priority' : ''}`}
                            >
                              <div className="card-top">
                                <span className="card-id">{order.id}</span>
                                <span className={`card-source ${order.source.toLowerCase()}`}>{order.source}</span>
                              </div>
                              <h4>{order.quantity}x {order.item}</h4>
                              <p className="card-customer">{order.customerName}</p>
                              <div className="card-footer">
                                <span className="card-time"><Clock size={12}/> {order.time}</span>
                                <span className="card-amount">${order.total}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default Dashboard;
