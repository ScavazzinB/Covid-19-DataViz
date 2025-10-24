import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCountryData, useMultiCountryComparison } from '../hooks/useCovidData';
import { formatNumber, formatPercentage, formatDateTime, formatCompactNumber } from '../utils/formatters';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import './CountryDetailPage.css';

const CountryDetailPage: React.FC = () => {
  const { countryName } = useParams<{ countryName: string }>();
  const navigate = useNavigate();

  const { countryData, loading: countriesLoading } = useCountryData();
  const { data: timeSeriesData, loading: timeSeriesLoading } = useMultiCountryComparison(
    countryName ? [countryName] : [],
    90
  );

  const country = useMemo(() => {
    if (!countryName || !countryData) return null;
    return countryData.find(c => c.country === countryName);
  }, [countryName, countryData]);

  const timeSeriesChartData = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.size === 0) {
      return null;
    }

    const data = timeSeriesData.get(countryName || '');
    if (!data) return null;

    return {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: 'Cas confirmés',
          data: data.map((d) => d.confirmed),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Décès',
          data: data.map((d) => d.deaths),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Guérisons',
          data: data.map((d) => d.recovered),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [timeSeriesData, countryName]);

  // Daily new cases chart
  const dailyCasesChartData = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.size === 0) {
      return null;
    }

    const data = timeSeriesData.get(countryName || '');
    if (!data || data.length < 2) return null;

    const dailyData = data.slice(1).map((current, index) => {
      const previous = data[index];
      return {
        date: current.date,
        newConfirmed: Math.max(0, current.confirmed - previous.confirmed),
        newDeaths: Math.max(0, current.deaths - previous.deaths),
        newRecovered: Math.max(0, current.recovered - previous.recovered)
      };
    });

    return {
      labels: dailyData.map((d) => d.date),
      datasets: [
        {
          label: 'Nouveaux cas',
          data: dailyData.map((d) => d.newConfirmed),
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          borderWidth: 1
        },
        {
          label: 'Nouveaux décès',
          data: dailyData.map((d) => d.newDeaths),
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          borderWidth: 1
        },
        {
          label: 'Nouvelles guérisons',
          data: dailyData.map((d) => d.newRecovered),
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 1
        }
      ]
    };
  }, [timeSeriesData, countryName]);

  // Distribution pie chart
  const distributionChartData = useMemo(() => {
    if (!country) return null;

    return {
      labels: ['Décès', 'Guérisons', 'Cas Actifs'],
      datasets: [
        {
          data: [country.deaths, country.recovered, country.active],
          backgroundColor: ['#ef4444', '#10b981', '#f59e0b'],
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    };
  }, [country]);

  // Calculate trends and statistics
  const statistics = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.size === 0 || !country) {
      return null;
    }

    const data = timeSeriesData.get(countryName || '');
    if (!data || data.length < 8) return null;

    const latest = data[data.length - 1];
    const yesterday = data[data.length - 2];
    const weekAgo = data[data.length - 8];

    // Daily changes
    const newConfirmed = latest.confirmed - yesterday.confirmed;
    const newDeaths = latest.deaths - yesterday.deaths;
    const newRecovered = latest.recovered - yesterday.recovered;

    // Weekly changes
    const weekConfirmedChange = latest.confirmed - weekAgo.confirmed;
    const weekDeathsChange = latest.deaths - weekAgo.deaths;
    const weekRecoveredChange = latest.recovered - weekAgo.recovered;

    // 7-day averages
    const last7Days = data.slice(-7);
    const avgNewCases = last7Days.reduce((sum, day, idx) => {
      if (idx === 0) return sum;
      return sum + Math.max(0, day.confirmed - last7Days[idx - 1].confirmed);
    }, 0) / 6;

    const avgNewDeaths = last7Days.reduce((sum, day, idx) => {
      if (idx === 0) return sum;
      return sum + Math.max(0, day.deaths - last7Days[idx - 1].deaths);
    }, 0) / 6;

    // Peak values
    const peakDailyConfirmed = Math.max(...data.slice(1).map((day, idx) =>
      Math.max(0, day.confirmed - data[idx].confirmed)
    ));

    const peakDailyDeaths = Math.max(...data.slice(1).map((day, idx) =>
      Math.max(0, day.deaths - data[idx].deaths)
    ));

    return {
      newConfirmed,
      newDeaths,
      newRecovered,
      weekConfirmedChange,
      weekDeathsChange,
      weekRecoveredChange,
      avgNewCases,
      avgNewDeaths,
      peakDailyConfirmed,
      peakDailyDeaths,
      daysTracked: data.length
    };
  }, [timeSeriesData, countryName, country]);

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCompactNumber(value as number);
          }
        }
      }
    }
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCompactNumber(value as number);
          }
        }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${formatNumber(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (countriesLoading || timeSeriesLoading) {
    return (
      <div className="country-detail-page">
        <div className="detail-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données du pays...</p>
        </div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="country-detail-page">
        <div className="detail-error">
          <div className="error-icon">🌍</div>
          <h2>Pays introuvable</h2>
          <p>Le pays "{countryName}" n'a pas été trouvé dans notre base de données.</p>
          <button onClick={() => navigate('/')} className="back-button">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="country-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Retour
        </button>
        <h1 className="country-title">{country.country}</h1>
        <p className="last-update">
          Dernière mise à jour: {formatDateTime(country.lastUpdate)}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card confirmed">
          <div className="stat-icon">🦠</div>
          <div className="stat-content">
            <h3>Cas Confirmés</h3>
            <div className="stat-value">{formatNumber(country.confirmed)}</div>
          </div>
        </div>

        <div className="stat-card deaths">
          <div className="stat-icon">💀</div>
          <div className="stat-content">
            <h3>Décès</h3>
            <div className="stat-value">{formatNumber(country.deaths)}</div>
            <div className="stat-rate">
              Taux: {formatPercentage(country.mortalityRate)}
            </div>
          </div>
        </div>

        <div className="stat-card recovered">
          <div className="stat-icon">💚</div>
          <div className="stat-content">
            <h3>Guérisons</h3>
            <div className="stat-value">{formatNumber(country.recovered)}</div>
            <div className="stat-rate">
              Taux: {formatPercentage(country.recoveryRate)}
            </div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>Cas Actifs</h3>
            <div className="stat-value">{formatNumber(country.active)}</div>
          </div>
        </div>
      </div>

      {/* Daily Metrics */}
      {statistics && (
        <div className="metrics-section">
          <h2>📊 Métriques Quotidiennes & Tendances</h2>
          <div className="metrics-grid-detailed">
            <div className="metric-box">
              <span className="metric-label">Nouveaux cas (24h)</span>
              <span className="metric-value-large confirmed">{formatNumber(statistics.newConfirmed)}</span>
              <span className="metric-sublabel">Moyenne 7j: {formatCompactNumber(Math.round(statistics.avgNewCases))}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Nouveaux décès (24h)</span>
              <span className="metric-value-large deaths">{formatNumber(statistics.newDeaths)}</span>
              <span className="metric-sublabel">Moyenne 7j: {formatCompactNumber(Math.round(statistics.avgNewDeaths))}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Nouvelles guérisons (24h)</span>
              <span className="metric-value-large recovered">{formatNumber(statistics.newRecovered)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Évolution 7 jours</span>
              <span className="metric-value-large">{formatNumber(statistics.weekConfirmedChange)}</span>
              <span className="metric-sublabel">cas confirmés</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Pic quotidien (cas)</span>
              <span className="metric-value-large">{formatNumber(statistics.peakDailyConfirmed)}</span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Pic quotidien (décès)</span>
              <span className="metric-value-large">{formatNumber(statistics.peakDailyDeaths)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-section">
        {/* Cumulative Chart */}
        {timeSeriesChartData && (
          <div className="chart-box full-width">
            <h2>📈 Évolution Cumulée (90 jours)</h2>
            <div className="chart-container">
              <Line data={timeSeriesChartData} options={lineChartOptions} />
            </div>
          </div>
        )}

        {/* Daily Cases Chart */}
        {dailyCasesChartData && (
          <div className="chart-box full-width">
            <h2>📊 Nouveaux Cas Quotidiens (90 jours)</h2>
            <div className="chart-container">
              <Bar data={dailyCasesChartData} options={barChartOptions} />
            </div>
          </div>
        )}

        {/* Distribution Chart */}
        {distributionChartData && (
          <div className="chart-box">
            <h2>🥧 Répartition Actuelle</h2>
            <div className="chart-container" style={{ height: '350px' }}>
              <Doughnut data={distributionChartData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Key Statistics */}
        <div className="chart-box">
          <h2>📋 Statistiques Clés</h2>
          <div className="key-stats-list">
            <div className="key-stat-item">
              <span className="key-stat-icon">🦠</span>
              <div className="key-stat-content">
                <span className="key-stat-label">Total Cas Confirmés</span>
                <span className="key-stat-value">{formatNumber(country.confirmed)}</span>
              </div>
            </div>
            <div className="key-stat-item">
              <span className="key-stat-icon">💀</span>
              <div className="key-stat-content">
                <span className="key-stat-label">Total Décès</span>
                <span className="key-stat-value deaths-color">{formatNumber(country.deaths)}</span>
                <span className="key-stat-rate">Taux: {formatPercentage(country.mortalityRate)}</span>
              </div>
            </div>
            <div className="key-stat-item">
              <span className="key-stat-icon">💚</span>
              <div className="key-stat-content">
                <span className="key-stat-label">Total Guérisons</span>
                <span className="key-stat-value recovered-color">{formatNumber(country.recovered)}</span>
                <span className="key-stat-rate">Taux: {formatPercentage(country.recoveryRate)}</span>
              </div>
            </div>
            <div className="key-stat-item">
              <span className="key-stat-icon">🔴</span>
              <div className="key-stat-content">
                <span className="key-stat-label">Cas Actifs</span>
                <span className="key-stat-value active-color">{formatNumber(country.active)}</span>
              </div>
            </div>
            {statistics && (
              <>
                <div className="key-stat-item">
                  <span className="key-stat-icon">📅</span>
                  <div className="key-stat-content">
                    <span className="key-stat-label">Jours de données</span>
                    <span className="key-stat-value">{statistics.daysTracked}</span>
                  </div>
                </div>
                <div className="key-stat-item">
                  <span className="key-stat-icon">📈</span>
                  <div className="key-stat-content">
                    <span className="key-stat-label">Évolution hebdomadaire</span>
                    <span className="key-stat-value">
                      {statistics.weekConfirmedChange > 0 ? '+' : ''}
                      {formatCompactNumber(statistics.weekConfirmedChange)} cas
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="info-section-detailed">
        <h2>ℹ️ Informations Détaillées</h2>
        <div className="info-categories">
          <div className="info-category">
            <h3>📊 Taux et Ratios</h3>
            <div className="info-items">
              <div className="info-item-detailed">
                <span className="info-label">Taux de mortalité:</span>
                <span className="info-value">{formatPercentage(country.mortalityRate)}</span>
              </div>
              <div className="info-item-detailed">
                <span className="info-label">Taux de guérison:</span>
                <span className="info-value">{formatPercentage(country.recoveryRate)}</span>
              </div>
              <div className="info-item-detailed">
                <span className="info-label">Ratio actifs/total:</span>
                <span className="info-value">
                  {((country.active / country.confirmed) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {statistics && (
            <div className="info-category">
              <h3>📈 Tendances Récentes</h3>
              <div className="info-items">
                <div className="info-item-detailed">
                  <span className="info-label">Nouveaux cas (24h):</span>
                  <span className="info-value">{formatNumber(statistics.newConfirmed)}</span>
                </div>
                <div className="info-item-detailed">
                  <span className="info-label">Nouveaux décès (24h):</span>
                  <span className="info-value">{formatNumber(statistics.newDeaths)}</span>
                </div>
                <div className="info-item-detailed">
                  <span className="info-label">Évolution 7 jours:</span>
                  <span className="info-value">
                    {statistics.weekConfirmedChange > 0 ? '+' : ''}
                    {formatNumber(statistics.weekConfirmedChange)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="info-category">
            <h3>🗓️ Données Temporelles</h3>
            <div className="info-items">
              <div className="info-item-detailed">
                <span className="info-label">Dernière mise à jour:</span>
                <span className="info-value">{formatDateTime(country.lastUpdate)}</span>
              </div>
              {statistics && (
                <>
                  <div className="info-item-detailed">
                    <span className="info-label">Période de suivi:</span>
                    <span className="info-value">{statistics.daysTracked} jours</span>
                  </div>
                  <div className="info-item-detailed">
                    <span className="info-label">Source des données:</span>
                    <span className="info-value">Johns Hopkins CSSE</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetailPage;
