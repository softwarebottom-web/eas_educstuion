import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Pastikan memanggil React agar tidak 'not defined'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
