// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { AuthProvider } from './hooks/useAuth';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);