import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './lib/firebase'; // Initialize Firebase
import { Toaster } from '@/components/ui/sonner';
import axios from 'axios';

// Set global base URL for Axios
// On Vercel, VITE_API_URL should be set to your Render Backend URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);
