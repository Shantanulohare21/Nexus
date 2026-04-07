import React, { useState, useEffect, useRef } from 'react';
import { useOrders } from '../context/OrderContext';
import { Mic, Sparkles, Send, CheckCircle, Image as ImageIcon, UploadCloud } from 'lucide-react';
import './AddOrder.css';

const AddOrder = () => {
  const { addOrder } = useOrders();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'ai' | 'voice' | 'image'
  const [formData, setFormData] = useState({
    customerName: '',
    item: '',
    quantity: 1,
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    source: 'Manual',
    priority: 'Medium'
  });
  
  // Extra AI States
  const [aiInput, setAiInput] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Vision State
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAiInput(transcript);
        setIsListening(false);
        processAiInput(transcript, 'Voice');
      };
      
      recognitionRef.current.onerror = (e) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };
    }
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    await addOrder(formData);
    triggerSuccess();
  };

  const processAiInput = (textToProcess = aiInput, sourceOverride = null) => {
    setIsProcessing(true);
    setExtractedData(null);
    
    setTimeout(() => {
      const qtyMatch = textToProcess.match(/\b(\d+)\b/);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      
      const timeMatch = textToProcess.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
      let time = "12:00";
      if (timeMatch) {
         time = timeMatch[1].replace('am', ' AM').replace('pm', ' PM');
      }
      
      let item = "Assorted Items";
      if (textToProcess.toLowerCase().includes('lunch box') || textToProcess.toLowerCase().includes('lunchbox')) item = "Lunch Boxes";
      if (textToProcess.toLowerCase().includes('coffee') || textToProcess.toLowerCase().includes('pastry')) item = "Coffee & Pastry";

      const extracted = {
        customerName: 'Guest (Extracted)',
        item,
        quantity,
        date: new Date().toISOString().split('T')[0],
        time: time,
        source: sourceOverride || (activeTab === 'voice' ? 'Voice' : 'AI Text'),
        priority: 'High'
      };
      
      setExtractedData(extracted);
      setFormData(extracted);
      setIsProcessing(false);
    }, 1500);
  };

  const simulateImageScan = () => {
    setIsScanning(true);
    // Simulate Vision API taking 3 seconds
    setTimeout(() => {
      setIsScanning(false);
      setExtractedData({
        customerName: 'Handwritten Note',
        item: 'Premium Dinner Buffet',
        quantity: 120,
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        source: 'Vision Scan',
        priority: 'Medium'
      });
    }, 3000);
  };

  const confirmAiOrder = async () => {
    await addOrder(extractedData);
    triggerSuccess();
  };
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setFormData({ customerName: '', item: '', quantity: 1, date: new Date().toISOString().split('T')[0], time: '12:00', source: 'Manual', priority: 'Medium' });
    setAiInput('');
    setExtractedData(null);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="add-order-container">
      <div className="add-header">
        <h1 className="page-title">Capture New Order</h1>
        <p className="page-subtitle">Ensure 100% order capture across all channels.</p>
      </div>

      <div className="tabs glass-panel">
        <button className={`tab ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>Manual Form</button>
        <button className={`tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}><Sparkles size={16}/> AI Text</button>
        <button className={`tab ${activeTab === 'voice' ? 'active' : ''}`} onClick={() => setActiveTab('voice')}><Mic size={16}/> Voice AI</button>
        <button className={`tab ${activeTab === 'image' ? 'active' : ''}`} onClick={() => setActiveTab('image')}><ImageIcon size={16}/> Vision Scan</button>
      </div>

      <div className="form-container glass-panel">
        {showSuccess && (
          <div className="success-overlay">
            <CheckCircle size={64} className="success-icon" />
            <h2>Order Captured!</h2>
          </div>
        )}

        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="manual-form">
            <div className="form-grid">
              <div className="form-group"><label>Customer Name</label><input required type="text" className="input-field" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /></div>
              <div className="form-group"><label>Item</label><input required type="text" className="input-field" value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})} /></div>
              <div className="form-group"><label>Quantity</label><input required type="number" min="1" className="input-field" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} /></div>
              <div className="form-group"><label>Date</label><input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
              <div className="form-group"><label>Time</label><input required type="time" className="input-field" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
              <div className="form-group"><label>Source</label><select className="input-field" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}><option>Website</option><option>Call</option><option>WhatsApp</option><option>Email</option><option>Manual</option></select></div>
            </div>
            <button type="submit" className="btn-primary form-submit">Add Order</button>
          </form>
        )}

        {activeTab === 'ai' && (
          <div className="ai-container">
            <textarea className="input-field ai-textarea" placeholder='e.g., "50 lunch boxes tomorrow at 1pm for Wayne Enterprises"' value={aiInput} onChange={e => setAiInput(e.target.value)} />
            <button className={`btn-primary magic-btn ${isProcessing ? 'processing' : ''}`} onClick={() => processAiInput()} disabled={!aiInput || isProcessing}>
              {isProcessing ? 'Extracting...' : <><Sparkles size={18}/> Extract Order</>}
            </button>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="voice-container">
            <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={toggleListening}><Mic size={48} /></button>
            <p className="voice-status">{isListening ? "Listening..." : "Click microphone to start"}</p>
            {aiInput && <p className="transcript">"{aiInput}"</p>}
          </div>
        )}

        {activeTab === 'image' && (
          <div className="image-scan-container">
            <div className={`scan-dropzone ${isScanning ? 'scanning' : ''}`} onClick={!isScanning ? simulateImageScan : undefined}>
              {!isScanning ? (
                <>
                  <UploadCloud size={48} className="drop-icon" />
                  <h3>Click to upload Handwritten Note or Menu</h3>
                  <p>AI Vision will extract the catering request automatically</p>
                </>
              ) : (
                <div className="scanner-active">
                  <div className="scan-line"></div>
                  <ImageIcon size={48} className="scan-target" />
                  <p className="scan-text">Analyzing image content...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Extracted Data Preview shared by AI, Voice, and Image tabs */}
        {(activeTab === 'ai' || activeTab === 'voice' || activeTab === 'image') && extractedData && (
          <div className="extracted-preview slide-up">
            <h3>Extracted Order Details</h3>
            <div className="extracted-grid">
              <div className="extract-item"><span className="label">Item:</span><span className="value highlight">{extractedData.item}</span></div>
              <div className="extract-item"><span className="label">Quantity:</span><span className="value highlight">{extractedData.quantity}</span></div>
              <div className="extract-item"><span className="label">Time:</span><span className="value highlight">{extractedData.time}</span></div>
            </div>
            <button className="btn-primary confirm-btn" onClick={confirmAiOrder}>
              <CheckCircle size={18}/> Confirm & Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOrder;
