import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useCountryData } from '../hooks/useCovidData';
import { useMultiCountryComparison } from '../hooks/useCovidData';
import { formatNumber, formatChartDate } from '../utils/formatters';
import './MultiCountryComparison.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MultiCountryComparisonProps {
  className?: string;
  days?: number;
}

type MetricType = 'confirmed' | 'deaths' | 'recovered' | 'active';

const COUNTRY_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const MultiCountryComparison: React.FC<MultiCountryComparisonProps> = ({
  className = '',
  days = 60
}) => {
  const navigate = useNavigate();
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['France', 'US', 'Italy']);
  const [searchQuery, setSearchQuery] = useState('');
  const [metricType, setMetricType] = useState<MetricType>('confirmed');

  const { countryData, loading: countriesLoading } = useCountryData();
  const { data: comparisonData, loading: dataLoading, error } = useMultiCountryComparison(selectedCountries, days);

  // Filter countries for selection
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countryData;
    return countryData.filter(country =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [countryData, searchQuery]);

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
    } else {
      if (selectedCountries.length < 8) {
        setSelectedCountries([...selectedCountries, country]);
      }
    }
  };

  const chartData = useMemo(() => {
    if (comparisonData.size === 0) {
      return { labels: [], datasets: [] };
    }

    // Get labels from first country's data
    const firstCountryData = Array.from(comparisonData.values())[0];
    const labels = firstCountryData ? firstCountryData.map(d => formatChartDate(d.date)) : [];

    const datasets = Array.from(comparisonData.entries()).map(([country, data], index) => {
      const color = COUNTRY_COLORS[index % COUNTRY_COLORS.length];

      return {
        label: country,
        data: data.map(d => d[metricType]),
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 3,
        fill: false
      };
    });

    return { labels, datasets };
  }, [comparisonData, metricType]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Comparaison multi-pays - ${getMetricLabel(metricType)}`,
        font: { size: 18, weight: 'bold' },
        color: '#333',
        padding: { bottom: 30 }
      },
      legend: {
        position: 'top' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 },
          color: '#666',
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${formatNumber(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: getMetricLabel(metricType),
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          callback: function(value) {
            return formatNumber(value as number);
          }
        }
      }
    }
  };

  if (countriesLoading) {
    return (
      <div className={`multi-country-comparison ${className}`}>
        <div className="comparison-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des pays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`multi-country-comparison ${className}`}>
      <div className="comparison-header">
        <h2>📊 Comparaison Multi-Pays</h2>
        <p className="comparison-description">
          Comparez l'évolution du COVID-19 entre différents pays (max. 8)
        </p>
      </div>

      <div className="comparison-controls">
        <div className="control-row">
          <div className="control-group">
            <label htmlFor="metric-type">Métrique:</label>
            <select
              id="metric-type"
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

          <div className="selected-countries-count">
            {selectedCountries.length} / 8 pays sélectionnés
          </div>
        </div>

        <div className="country-selector">
          <input
            type="text"
            placeholder="Rechercher un pays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="country-chips">
            {selectedCountries.map((country, index) => (
              <div
                key={country}
                className="country-chip"
                style={{
                  backgroundColor: COUNTRY_COLORS[index % COUNTRY_COLORS.length],
                  color: '#fff',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  // Only navigate if not clicking the remove button
                  if (!(e.target as HTMLElement).closest('.chip-remove')) {
                    navigate(`/country/${encodeURIComponent(country)}`);
                  }
                }}
                title={`Voir les détails de ${country}`}
              >
                {country}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCountryToggle(country);
                  }}
                  className="chip-remove"
                  aria-label={`Retirer ${country}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="country-list">
            {filteredCountries.slice(0, 20).map(country => (
              <div key={country.country} className="country-list-item">
                <button
                  onClick={() => handleCountryToggle(country.country)}
                  className={`country-item ${selectedCountries.includes(country.country) ? 'selected' : ''}`}
                  disabled={selectedCountries.length >= 8 && !selectedCountries.includes(country.country)}
                >
                  <span className="country-name">{country.country}</span>
                  <span className="country-stats">
                    {formatNumber(country.confirmed)} cas
                  </span>
                </button>
                <button
                  onClick={() => navigate(`/country/${encodeURIComponent(country.country)}`)}
                  className="country-detail-btn"
                  title={`Voir les détails de ${country.country}`}
                  aria-label={`Voir les détails de ${country.country}`}
                >
                  📊
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="comparison-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {dataLoading && (
        <div className="comparison-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données de comparaison...</p>
        </div>
      )}

      {!dataLoading && !error && selectedCountries.length > 0 && (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {!dataLoading && !error && selectedCountries.length === 0 && (
        <div className="comparison-empty">
          <div className="empty-icon">🌍</div>
          <h3>Aucun pays sélectionné</h3>
          <p>Sélectionnez au moins un pays pour voir la comparaison</p>
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

export default MultiCountryComparison;
