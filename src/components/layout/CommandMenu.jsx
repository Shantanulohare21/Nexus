import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, List, Users, FileText, X } from 'lucide-react';
import './CommandMenu.css';

const CommandMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  const actions = [
    { name: 'Go to Dashboard', icon: List, path: '/' },
    { name: 'Add New Order', icon: Plus, path: '/add' },
    { name: 'View Customer Insights', icon: Users, path: '/insights' },
    { name: 'Generate Invoice', icon: FileText, path: '/invoice' },
  ];

  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="cmd-backdrop" onClick={() => setIsOpen(false)}>
      <div className="cmd-menu glass-panel" onClick={e => e.stopPropagation()}>
        <div className="cmd-header">
          <Search size={20} className="cmd-icon"/>
          <input 
            autoFocus
            type="text" 
            placeholder="Type a command or search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={16}/></button>
        </div>
        <div className="cmd-body">
          <div className="cmd-group">Suggestions</div>
          {filteredActions.map((action, idx) => (
            <button 
              key={idx} 
              className="cmd-item"
              onClick={() => navigateTo(action.path)}
            >
              <action.icon size={16} />
              <span>{action.name}</span>
            </button>
          ))}
          {filteredActions.length === 0 && (
            <div className="cmd-empty">No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandMenu;
