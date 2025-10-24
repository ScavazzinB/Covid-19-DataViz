import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import CountryDetailPage from './pages/CountryDetailPage';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Header */}
          <Header />

          {/* Main Dashboard */}
          <main className="dashboard-container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/country/:countryName" element={<CountryDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
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
      </Router>
    </ErrorBoundary>
  );
}

export default App;