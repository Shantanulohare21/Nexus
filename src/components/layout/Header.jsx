import React from 'react';
import { Moon, Sun, Search, Bell } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import './Header.css';

import NotificationCenter from '../NotificationCenter';

const Header = () => {
  const { theme, toggleTheme } = useOrders();

  return (
    <header className="top-header glass-panel">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search orders, customers, or press Ctrl+K..." 
          className="search-input"
        />
        <div className="cmd-k-hint">Ctrl K</div>
      </div>
      
      <div className="header-actions">
        <NotificationCenter />
        
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
