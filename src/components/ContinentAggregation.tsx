import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useContinentData, useContinentTimeSeries, useMultiCountryComparison } from '../hooks/useCovidData';
import { formatNumber, formatChartDate } from '../utils/formatters';
import { CONTINENT_COLORS } from '../utils/continentMapping';
import './ContinentAggregation.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ContinentAggregationProps {
  className?: string;
  days?: number;
}

type MetricType = 'confirmed' | 'deaths' | 'recovered' | 'active';

const ContinentAggregation: React.FC<ContinentAggregationProps> = ({
  className = '',
  days = 60
}) => {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [metricType, setMetricType] = useState<MetricType>('confirmed');

  const { continentData, loading: continentLoading, error: continentError } = useContinentData();
  const { data: timeSeriesData, loading: timeSeriesLoading } = useContinentTimeSeries(days);

  // Get top 5 countries from selected continent
  const selectedContinentCountries = useMemo(() => {
    if (!selectedContinent || !continentData) return [];
    const continent = continentData.find(c => c.continent === selectedContinent);
    return continent ? continent.countries.slice(0, 5) : [];
  }, [selectedContinent, continentData]);

  const { data: regionData, loading: regionLoading } = useMultiCountryComparison(
    selectedContinentCountries,
    days
  );

  // Prepare continent comparison chart data
  const continentChartData = useMemo(() => {
    if (timeSeriesData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = timeSeriesData.map(d => formatChartDate(d.date));

    const datasets = Object.keys(timeSeriesData[0].continents).map(continent => {
      const color = CONTINENT_COLORS[continent] || '#6b7280';
      return {
        label: continent,
        data: timeSeriesData.map(d => d.continents[continent]?.[metricType] || 0),
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        borderWidth: 3,
        fill: false
      };
    });

    return { labels, datasets };
  }, [timeSeriesData, metricType]);

  // Prepare continent distribution (current stats)
  const continentDistributionData = useMemo(() => {
    if (!continentData || continentData.length === 0) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: continentData.map(c => c.continent),
      datasets: [{
        label: getMetricLabel(metricType),
        data: continentData.map(c => c[metricType]),
        backgroundColor: continentData.map(c => CONTINENT_COLORS[c.continent] || '#6b7280'),
        borderColor: '#fff',
        borderWidth: 2
      }]
    };
  }, [continentData, metricType]);

  // Regional sub-graph data (selected continent)
  const regionalChartData = useMemo(() => {
    if (regionData.size === 0) {
      return { labels: [], datasets: [] };
    }

    const firstCountryData = Array.from(regionData.values())[0];
    const labels = firstCountryData ? firstCountryData.map(d => formatChartDate(d.date)) : [];

    const datasets = Array.from(regionData.entries()).map(([country, data], index) => {
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
      const color = colors[index % colors.length];

      return {
        label: country,
        data: data.map(d => d[metricType]),
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: false
      };
    });

    return { labels, datasets };
  }, [regionData, metricType]);

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { maxRotation: 45, minRotation: 0 }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return formatNumber(value as number);
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
        position: 'right' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i] as number;
                const bgColors = data.datasets[0].backgroundColor as string[];
                return {
                  text: `${label}: ${formatNumber(value)}`,
                  fillStyle: bgColors[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
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

  if (continentLoading) {
    return (
      <div className={`continent-aggregation ${className}`}>
        <div className="aggregation-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données continentales...</p>
        </div>
      </div>
    );
  }

  if (continentError) {
    return (
      <div className={`continent-aggregation ${className}`}>
        <div className="aggregation-error">
          <div className="error-icon">⚠️</div>
          <p>{continentError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`continent-aggregation ${className}`}>
      <div className="aggregation-header">
        <h2>🌍 Agrégation par Continent</h2>
        <p className="aggregation-description">
          Visualisez les données COVID-19 agrégées par continent avec détails régionaux
        </p>
      </div>

      <div className="aggregation-controls">
        <div className="control-group">
          <label htmlFor="metric-type-continent">Métrique:</label>
          <select
            id="metric-type-continent"
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

      {/* Continent Statistics Cards */}
      <div className="continent-cards">
        {continentData.map(continent => (
          <div
            key={continent.continent}
            className={`continent-card ${selectedContinent === continent.continent ? 'selected' : ''}`}
            onClick={() => setSelectedContinent(
              selectedContinent === continent.continent ? null : continent.continent
            )}
            style={{ borderLeftColor: CONTINENT_COLORS[continent.continent] }}
          >
            <h3>{continent.continent}</h3>
            <div className="card-stats">
              <div className="stat">
                <span className="stat-label">Cas confirmés</span>
                <span className="stat-value confirmed">{formatNumber(continent.confirmed)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Décès</span>
                <span className="stat-value deaths">{formatNumber(continent.deaths)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Pays affectés</span>
                <span className="stat-value">{continent.countries.length}</span>
              </div>
            </div>
            <div className="card-footer">
              Taux de mortalité: {continent.mortalityRate.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Continent Timeline */}
        <div className="chart-box full-width">
          <h3>📈 Évolution par Continent</h3>
          {timeSeriesLoading ? (
            <div className="chart-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="chart-container" style={{ height: '400px' }}>
              <Line data={continentChartData} options={lineChartOptions} />
            </div>
          )}
        </div>

        {/* Distribution Chart */}
        <div className="chart-box">
          <h3>📊 Répartition Actuelle</h3>
          <div className="chart-container" style={{ height: '350px' }}>
            <Doughnut data={continentDistributionData} options={doughnutOptions} />
          </div>
        </div>

        {/* Regional Sub-graph */}
        {selectedContinent && (
          <div className="chart-box">
            <h3>🔍 Top 5 Pays - {selectedContinent}</h3>
            {regionLoading ? (
              <div className="chart-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="chart-container" style={{ height: '350px' }}>
                {regionData.size > 0 ? (
                  <Line data={regionalChartData} options={lineChartOptions} />
                ) : (
                  <div className="empty-state">
                    <p>Aucune donnée disponible pour cette région</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!selectedContinent && (
        <div className="hint-message">
          💡 Cliquez sur une carte continentale pour voir les détails régionaux
        </div>
      )}
    </div>
  );
};

function getMetricLabel(metric: MetricType): string {
  const labels = {
    confirmed: 'Cas confirmés',
    deaths: 'Décès',
    recovered: 'Guérisons',
    active: 'Cas actifs'
  };
  return labels[metric];
}

export default ContinentAggregation;
