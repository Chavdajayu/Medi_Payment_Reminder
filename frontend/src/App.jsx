import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ReminderManager from './components/ReminderManager';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Retailers from './pages/Retailers';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ReminderManager />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<DashboardLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload" element={<Upload />} />
              <Route path="retailers" element={<Retailers />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="settings" element={<Settings />} />
              <Route path="logs" element={<Logs />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
