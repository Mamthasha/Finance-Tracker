// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { TransactionProvider } from './contexts/TransactionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter basename="/Finance-Tracker">
    <TransactionProvider>
      <App />
    </TransactionProvider>
  </BrowserRouter>
);
