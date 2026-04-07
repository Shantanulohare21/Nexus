import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from './Chatbot';
import CommandMenu from './CommandMenu';
import NotificationToast from './NotificationToast';
import './Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <Chatbot />
      <CommandMenu />
      <NotificationToast />
    </div>
  );
};

export default Layout;
