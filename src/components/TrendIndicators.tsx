import React, { useMemo } from 'react';
import { useTimeSeriesData } from '../hooks/useCovidData';
import { formatNumber, formatCompactNumber } from '../utils/formatters';
import './TrendIndicators.css';

interface TrendIndicatorsProps {
  className?: string;
  days?: number;
}

interface DailyMetrics {
  date: string;
  newConfirmed: number;
  newDeaths: number;
  newRecovered: number;
  confirmedTrend: number;
  deathsTrend: number;
  recoveredTrend: number;
  weekAvgConfirmed: number;
  weekAvgDeaths: number;
}

const TrendIndicators: React.FC<TrendIndicatorsProps> = ({
  className = '',
  days = 30
}) => {
  const { timeSeriesData, loading, error } = useTimeSeriesData(days);

  const metrics = useMemo<DailyMetrics | null>(() => {
    if (!timeSeriesData || timeSeriesData.length < 8) return null;

    const latest = timeSeriesData[timeSeriesData.length - 1];
    const yesterday = timeSeriesData[timeSeriesData.length - 2];
    const weekAgo = timeSeriesData[timeSeriesData.length - 8];

    // Calculate daily changes
    const newConfirmed = latest.confirmed - yesterday.confirmed;
    const newDeaths = latest.deaths - yesterday.deaths;
    const newRecovered = latest.recovered - yesterday.recovered;

    // Calculate 7-day trends
    const confirmedTrend = latest.confirmed - weekAgo.confirmed;
    const deathsTrend = latest.deaths - weekAgo.deaths;
    const recoveredTrend = latest.recovered - weekAgo.recovered;

    // Calculate 7-day averages
    const last7Days = timeSeriesData.slice(-7);
    const weekAvgConfirmed = last7Days.reduce((sum, day, idx) => {
      if (idx === 0) return sum;
      return sum + (day.confirmed - last7Days[idx - 1].confirmed);
    }, 0) / 6;

    const weekAvgDeaths = last7Days.reduce((sum, day, idx) => {
      if (idx === 0) return sum;
      return sum + (day.deaths - last7Days[idx - 1].deaths);
    }, 0) / 6;

    return {
      date: latest.date,
      newConfirmed,
      newDeaths,
      newRecovered,
      confirmedTrend,
      deathsTrend,
      recoveredTrend,
      weekAvgConfirmed,
      weekAvgDeaths
    };
  }, [timeSeriesData]);

  const getTrendIcon = (current: number, avg: number): string => {
    const diff = ((current - avg) / avg) * 100;
    if (diff > 10) return '📈';
    if (diff < -10) return '📉';
    return '➡️';
  };

  const getTrendClass = (current: number, avg: number, inverse: boolean = false): string => {
    const diff = ((current - avg) / avg) * 100;
    if (Math.abs(diff) < 10) return 'neutral';
    if (inverse) {
      return diff > 0 ? 'bad' : 'good';
    }
    return diff > 0 ? 'good' : 'bad';
  };

  const getTrendPercentage = (current: number, previous: number): string => {
    if (previous === 0) return '+100%';
    const diff = ((current - previous) / previous) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`trend-indicators ${className}`}>
        <div className="indicators-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des indicateurs...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className={`trend-indicators ${className}`}>
        <div className="indicators-error">
          <div className="error-icon">📊</div>
          <p>Impossible de charger les indicateurs de tendance</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`trend-indicators ${className}`}>
      <div className="indicators-header">
        <h2>📊 Indicateurs de Tendance</h2>
        <p className="indicators-description">
          Métriques journalières et tendances sur 7 jours
        </p>
      </div>

      <div className="metrics-grid">
        {/* Daily New Cases */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🆕</span>
            <h3>Nouveaux Cas</h3>
          </div>
          <div className="metric-value confirmed">
            {formatNumber(metrics.newConfirmed)}
          </div>
          <div className="metric-details">
            <div className="metric-row">
              <span>Moyenne 7j:</span>
              <span className="metric-highlight">
                {formatCompactNumber(Math.round(metrics.weekAvgConfirmed))}
              </span>
            </div>
            <div className="metric-row">
              <span>Tendance:</span>
              <span className={`trend-badge ${getTrendClass(metrics.newConfirmed, metrics.weekAvgConfirmed, true)}`}>
                {getTrendIcon(metrics.newConfirmed, metrics.weekAvgConfirmed)}
                {getTrendPercentage(metrics.newConfirmed, metrics.weekAvgConfirmed)}
              </span>
            </div>
          </div>
        </div>

        {/* Daily New Deaths */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💀</span>
            <h3>Nouveaux Décès</h3>
          </div>
          <div className="metric-value deaths">
            {formatNumber(metrics.newDeaths)}
          </div>
          <div className="metric-details">
            <div className="metric-row">
              <span>Moyenne 7j:</span>
              <span className="metric-highlight">
                {formatCompactNumber(Math.round(metrics.weekAvgDeaths))}
              </span>
            </div>
            <div className="metric-row">
              <span>Tendance:</span>
              <span className={`trend-badge ${getTrendClass(metrics.newDeaths, metrics.weekAvgDeaths, true)}`}>
                {getTrendIcon(metrics.newDeaths, metrics.weekAvgDeaths)}
                {getTrendPercentage(metrics.newDeaths, metrics.weekAvgDeaths)}
              </span>
            </div>
          </div>
        </div>

        {/* Daily New Recovered */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💚</span>
            <h3>Nouvelles Guérisons</h3>
          </div>
          <div className="metric-value recovered">
            {formatNumber(metrics.newRecovered)}
          </div>
          <div className="metric-details">
            <div className="metric-row">
              <span>Total 7j:</span>
              <span className="metric-highlight">
                {formatCompactNumber(metrics.recoveredTrend)}
              </span>
            </div>
          </div>
        </div>

        {/* 7-Day Trend Summary */}
        <div className="metric-card summary-card">
          <div className="metric-header">
            <span className="metric-icon">📈</span>
            <h3>Tendance 7 Jours</h3>
          </div>
          <div className="summary-content">
            <div className="summary-row">
              <span className="summary-label">Cas confirmés:</span>
              <span className={`summary-value ${metrics.confirmedTrend > 0 ? 'negative' : 'positive'}`}>
                {metrics.confirmedTrend > 0 ? '+' : ''}
                {formatCompactNumber(metrics.confirmedTrend)}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Décès:</span>
              <span className={`summary-value ${metrics.deathsTrend > 0 ? 'negative' : 'positive'}`}>
                {metrics.deathsTrend > 0 ? '+' : ''}
                {formatCompactNumber(metrics.deathsTrend)}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Guérisons:</span>
              <span className="summary-value positive">
                {metrics.recoveredTrend > 0 ? '+' : ''}
                {formatCompactNumber(metrics.recoveredTrend)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="indicators-footer">
        <span className="footer-icon">ℹ️</span>
        <p>
          Les indicateurs de tendance comparent les données actuelles avec les moyennes sur 7 jours
          pour identifier les changements significatifs dans l'évolution de la pandémie.
        </p>
      </div>
    </div>
  );
};

export default TrendIndicators;
