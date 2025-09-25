import React, { useState, useEffect } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="app-header" role="banner">
      <div className="header-content">
        <div className="header-title">
          <span className="header-icon">🦠</span>
          <h1>COVID-19 Global Dashboard</h1>
        </div>

        <div className="header-info">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Live</span>
          </div>

          <div className="header-divider">|</div>

          <div className="time-info">
            <span className="current-time">{formatTime(currentTime)}</span>
          </div>

          <div className="header-divider">|</div>

          <div className="date-info">
            <span className="current-date">{formatDate(currentTime)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;