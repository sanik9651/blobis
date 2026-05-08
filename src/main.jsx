import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TradingTerminal from './components/TradingTerminal';

function App() {
  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.enableClosingConfirmation();

      // Set theme
      const tg = window.Telegram.WebApp;
      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000000');
    }
  }, []);

  return <TradingTerminal />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
