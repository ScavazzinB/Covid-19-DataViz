import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountryData } from '../hooks/useCovidData';
import { formatNumber, formatCompactNumber } from '../utils/formatters';
import './Top10Ranking.css';

interface Top10RankingProps {
  className?: string;
}

type MetricType = 'confirmed' | 'deaths' | 'recovered' | 'active';

const Top10Ranking: React.FC<Top10RankingProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [metricType, setMetricType] = useState<MetricType>('confirmed');
  const [animatedRankings, setAnimatedRankings] = useState<any[]>([]);
  const { countryData, loading, error } = useCountryData();

  // Sort and get top 10
  const top10Countries = React.useMemo(() => {
    if (!countryData || countryData.length === 0) return [];

    const sorted = [...countryData].sort((a, b) => b[metricType] - a[metricType]);
    return sorted.slice(0, 10).map((country, index) => ({
      ...country,
      rank: index + 1
    }));
  }, [countryData, metricType]);

  // Animate rankings
  useEffect(() => {
    if (top10Countries.length === 0) return;

    // Reset animation
    setAnimatedRankings([]);

    // Animate in sequence
    top10Countries.forEach((country, index) => {
      setTimeout(() => {
        setAnimatedRankings(prev => [...prev, country]);
      }, index * 100);
    });
  }, [top10Countries]);

  const getMaxValue = () => {
    if (top10Countries.length === 0) return 1;
    return top10Countries[0][metricType];
  };

  const getBarWidth = (value: number): number => {
    const max = getMaxValue();
    return (value / max) * 100;
  };

  const getMetricColor = (type: MetricType): string => {
    const colors = {
      confirmed: '#3b82f6',
      deaths: '#ef4444',
      recovered: '#10b981',
      active: '#f59e0b'
    };
    return colors[type];
  };

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className={`top10-ranking ${className}`}>
        <div className="ranking-loading">
          <div className="loading-spinner"></div>
          <p>Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error || !countryData) {
    return (
      <div className={`top10-ranking ${className}`}>
        <div className="ranking-error">
          <div className="error-icon">🏆</div>
          <p>Impossible de charger le classement</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`top10-ranking ${className}`}>
      <div className="ranking-header">
        <h2>🏆 Top 10 des Pays</h2>
        <p className="ranking-description">
          Classement animé des pays les plus touchés
        </p>
      </div>

      <div className="ranking-controls">
        <div className="control-group">
          <label htmlFor="ranking-metric">Classer par:</label>
          <select
            id="ranking-metric"
            value={metricType}
            onChange={(e) => setMetricType(e.target.value as MetricType)}
            className="control-select"
          >
            <option value="confirmed">Cas confirmés</option>
            <option value="deaths">Décès</option>
            <option value="recovered">Guérisons</option>
            <option value="active">Cas actifs</option>
          </select>
        </div>
      </div>

      <div className="ranking-list">
        {animatedRankings.map((country, index) => (
          <div
            key={country.country}
            className="ranking-item"
            style={{
              animationDelay: `${index * 0.1}s`,
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/country/${encodeURIComponent(country.country)}`)}
            title={`Voir les détails de ${country.country}`}
          >
            <div className="ranking-position">
              <span className={`rank-badge rank-${country.rank}`}>
                {getMedalEmoji(country.rank)}
              </span>
            </div>

            <div className="ranking-content">
              <div className="ranking-info">
                <span className="country-name">{country.country}</span>
                <span className="country-value">
                  {formatNumber(country[metricType])}
                </span>
              </div>

              <div className="ranking-bar-container">
                <div
                  className="ranking-bar"
                  style={{
                    width: `${getBarWidth(country[metricType])}%`,
                    backgroundColor: getMetricColor(metricType),
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className="bar-label">
                    {formatCompactNumber(country[metricType])}
                  </span>
                </div>
              </div>

              <div className="ranking-stats">
                <div className="stat-pill">
                  <span className="stat-icon">☠️</span>
                  <span className="stat-text">
                    {country.mortalityRate.toFixed(2)}%
                  </span>
                </div>
                <div className="stat-pill">
                  <span className="stat-icon">💚</span>
                  <span className="stat-text">
                    {country.recoveryRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ranking-footer">
        <div className="footer-stats">
          <div className="footer-stat">
            <span className="footer-label">Total Top 10:</span>
            <span className="footer-value">
              {formatNumber(
                top10Countries.reduce((sum, c) => sum + c[metricType], 0)
              )}
            </span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">% du total mondial:</span>
            <span className="footer-value">
              {(
                (top10Countries.reduce((sum, c) => sum + c[metricType], 0) /
                  countryData.reduce((sum, c) => sum + c[metricType], 0)) *
                100
              ).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Top10Ranking;
