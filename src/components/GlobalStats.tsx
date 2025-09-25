import React, { useState, useEffect } from 'react';
import { useGlobalStats } from '../hooks/useCovidData';
import { formatNumber, formatPercentage, formatDateTime, getColorByType, getBackgroundColorByType } from '../utils/formatters';
import './GlobalStats.css';

interface GlobalStatsProps {
  onDataLoad?: (data: any) => void;
}

interface StatCardProps {
  type: 'confirmed' | 'deaths' | 'recovered' | 'active';
  value: number;
  label: string;
  subtitle: string;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ type, value, label, subtitle, loading }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (!loading && value > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let currentValue = 0;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= value) {
          currentValue = value;
          clearInterval(timer);
        }
        setAnimatedValue(Math.floor(currentValue));
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  if (loading) {
    return (
      <div className={`stat-card stat-card-${type} loading`}>
        <div className="stat-skeleton">
          <div className="skeleton-value"></div>
          <div className="skeleton-label"></div>
          <div className="skeleton-subtitle"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`stat-card stat-card-${type} ${isVisible ? 'visible' : ''}`}
      style={{
        backgroundColor: getBackgroundColorByType(type),
        borderColor: getColorByType(type)
      }}
    >
      <div className="stat-icon">
        {type === 'confirmed' && '🦠'}
        {type === 'deaths' && '💀'}
        {type === 'recovered' && '💚'}
        {type === 'active' && '⚡'}
      </div>
      <div className="stat-content">
        <div
          className="stat-value"
          style={{ color: getColorByType(type) }}
        >
          {formatNumber(animatedValue)}
        </div>
        <div className="stat-label">{label}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );
};

const GlobalStats: React.FC<GlobalStatsProps> = ({ onDataLoad }) => {
  const { globalStats, loading, error, refetch } = useGlobalStats();

  useEffect(() => {
    if (globalStats && onDataLoad) {
      onDataLoad(globalStats);
    }
  }, [globalStats, onDataLoad]);

  if (error) {
    return (
      <div className="global-stats-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={refetch}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const stats = globalStats || {
    totalConfirmed: 0,
    totalDeaths: 0,
    totalRecovered: 0,
    totalActive: 0,
    mortalityRate: 0,
    recoveryRate: 0,
    countriesAffected: 0,
    lastUpdate: new Date().toISOString()
  };

  return (
    <div className="global-stats">
      <div className="stats-header">
        <h2>📊 Statistiques Globales COVID-19</h2>
        <div className="last-update">
          Dernière mise à jour: {formatDateTime(stats.lastUpdate)}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          type="confirmed"
          value={stats.totalConfirmed}
          label="Cas Confirmés"
          subtitle={`Dans ${stats.countriesAffected} pays`}
          loading={loading}
        />
        <StatCard
          type="deaths"
          value={stats.totalDeaths}
          label="Décès"
          subtitle={`Taux: ${formatPercentage(stats.mortalityRate)}`}
          loading={loading}
        />
        <StatCard
          type="recovered"
          value={stats.totalRecovered}
          label="Guérisons"
          subtitle={`Taux: ${formatPercentage(stats.recoveryRate)}`}
          loading={loading}
        />
        <StatCard
          type="active"
          value={stats.totalActive}
          label="Cas Actifs"
          subtitle="En cours de traitement"
          loading={loading}
        />
      </div>

      <div className="stats-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Pays Affectés</span>
            <span className="summary-value">{loading ? '...' : stats.countriesAffected}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Taux de Mortalité</span>
            <span className="summary-value">
              {loading ? '...' : formatPercentage(stats.mortalityRate)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Taux de Guérison</span>
            <span className="summary-value">
              {loading ? '...' : formatPercentage(stats.recoveryRate)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Cas par Million</span>
            <span className="summary-value">
              {loading ? '...' : formatNumber(Math.round(stats.totalConfirmed / 7800))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;