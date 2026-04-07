import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import './Chatbot.css';

const Chatbot = () => {
  const { orders } = useOrders();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm OrderSync Copilot. Try asking me:\n- How many pending orders?\n- Any scams detected?\n- Most popular item?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setInput('');

    // Logic parsing
    setTimeout(() => {
      let aiResponse = "I'm not sure about that. Try asking about pending orders, or scams.";
      const query = userMsg.toLowerCase();

      if (query.includes('pending')) {
        const pCount = orders.filter(o => o.status === 'Pending').length;
        aiResponse = `There are currently ${pCount} pending orders waiting to be prepared.`;
      } 
      else if (query.includes('scam') || query.includes('flag')) {
        const sCount = orders.filter(o => o.status === 'SCAM ALERT').length;
        aiResponse = sCount > 0 
          ? `WARNING: There are ${sCount} orders flagged as potential scams. Check the dashboard immediately.`
          : `Good news! There are 0 scam alerts right now.`;
      }
      else if (query.includes('popular') || query.includes('most')) {
        aiResponse = `Based on recent data, 'Executive Lunch Boxes' is your top seller right now!`;
      }
      else if (query.includes('total') || query.includes('revenue')) {
        const rev = orders.filter(o => o.status !== 'SCAM ALERT').reduce((acc, o) => acc + (o.total || 0), 0);
        aiResponse = `The estimated pipeline revenue (excluding scams) is $${rev.toFixed(2)}.`;
      }

      setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    }, 800);
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-window glass-panel">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <Bot size={20} />
              <span>OrderSync Copilot</span>
            </div>
            <button className="icon-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.isUser ? 'user' : 'bot'}`} style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          
          <div className="chatbot-input">
            <input 
              autoFocus
              type="text" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
