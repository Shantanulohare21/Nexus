import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Clock, Users, FileText, ChefHat, Server, Inbox as InboxIcon, Truck } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inbox', label: 'Omni-Channel Inbox', icon: InboxIcon },
    { path: '/add', label: 'Add Order', icon: PlusCircle },
    { path: '/kitchen', label: 'Kitchen (KDS)', icon: ChefHat },
    { path: '/logistics', label: 'Logistics AI', icon: Truck },
    { path: '/timeline', label: 'Tracking', icon: Clock },
    { path: '/insights', label: 'Insights', icon: Users },
    { path: '/invoice', label: 'Invoice', icon: FileText },
    { path: '/simulator', label: 'API Simulator', icon: Server },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="brand-logo">OS</div>
        <h2>OrderSync AI</h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff" alt="User" />
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
