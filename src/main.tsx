import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/viewport-toggle.css';
import './styles/home-updates.css';
import './styles/static-polish.css';
import './styles/header-cleanup.css';
import './styles/footer-cleanup.css';
import './styles/roadmap-polish.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
