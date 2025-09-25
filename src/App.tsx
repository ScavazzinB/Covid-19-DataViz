import React from 'react';
import Header from './components/Header';
import GlobalStats from './components/GlobalStats';
import TrendsChart from './components/TrendsChart';
import CountryComparison from './components/CountryComparison';
import WorldMapLeaflet from './components/WorldMapLeaflet';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Header */}
      <Header />

      {/* Main Dashboard */}
      <main className="dashboard-container">
        {/* Global Statistics */}
        <section className="dashboard-section">
          <GlobalStats />
        </section>

        {/* Trends Chart */}
        <section className="dashboard-section">
          <TrendsChart days={30} />
        </section>

        {/* World Map */}
        <section className="dashboard-section">
          <WorldMapLeaflet />
        </section>

        {/* Country Comparison */}
        <section className="dashboard-section">
          <CountryComparison />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer" role="contentinfo">
        <div className="footer-content">
          <p>
            📊 Données fournies par{' '}
            <a
              href="https://github.com/CSSEGISandData/COVID-19"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Johns Hopkins CSSE
            </a>
          </p>
          <p className="footer-disclaimer">
            Ce tableau de bord est fourni à titre informatif uniquement.
            Consultez toujours les autorités sanitaires officielles pour les informations les plus récentes.
          </p>
          <p className="footer-tech">
            🚀 Conçu avec React + TypeScript | 📈 Graphiques Chart.js | 🌐 API Johns Hopkins
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;