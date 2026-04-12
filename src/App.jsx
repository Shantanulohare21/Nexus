import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import AddOrder from './pages/AddOrder';
import MapTracking from './pages/MapTracking';
import Logistics from './pages/Logistics';
import Insights from './pages/Insights';
import Invoice from './pages/Invoice';
import Kitchen from './pages/Kitchen';
import Simulator from './pages/Simulator';
import Inbox from './pages/Inbox';
import Inventory from './pages/Inventory';

function App() {
  return (
    <OrderProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="add" element={<AddOrder />} />
            <Route path="kitchen" element={<Kitchen />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="timeline" element={<MapTracking />} />
            <Route path="insights" element={<Insights />} />
            <Route path="invoice" element={<Invoice />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </OrderProvider>
  );
}

export default App;
