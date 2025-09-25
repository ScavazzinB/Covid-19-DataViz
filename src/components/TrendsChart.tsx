import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTimeSeriesData } from '../hooks/useCovidData';
import { formatNumber, formatCompactNumber, formatChartDate, getColorByType } from '../utils/formatters';
import './TrendsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendsChartProps {
  className?: string;
  days?: number;
}

type ChartViewType = 'cumulative' | 'daily' | 'logarithmic';
type DataType = 'all' | 'confirmed' | 'deaths' | 'recovered' | 'active';

const TrendsChart: React.FC<TrendsChartProps> = ({ className = '', days = 30 }) => {
  const [viewType, setViewType] = useState<ChartViewType>('cumulative');
  const [dataType, setDataType] = useState<DataType>('all');
  const { timeSeriesData, loading, error, refetch } = useTimeSeriesData(days);

  const calculateDailyChanges = () => {
    if (!timeSeriesData || timeSeriesData.length <= 1) return [];

    return timeSeriesData.slice(1).map((current, index) => {
      const previous = timeSeriesData[index];
      return {
        date: current.date,
        confirmed: Math.max(0, current.confirmed - previous.confirmed),
        deaths: Math.max(0, current.deaths - previous.deaths),
        recovered: Math.max(0, current.recovered - previous.recovered),
        active: Math.max(0, current.active - previous.active)
      };
    });
  };

  const getDisplayData = () => {
    if (!timeSeriesData) return [];

    switch (viewType) {
      case 'daily':
        return calculateDailyChanges();
      case 'logarithmic':
      case 'cumulative':
      default:
        return timeSeriesData;
    }
  };

  const getDatasets = () => {
    const data = getDisplayData();
    const datasets = [];

    const baseConfig = {
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 3,
      fill: false
    };

    if (dataType === 'all' || dataType === 'confirmed') {
      datasets.push({
        label: viewType === 'daily' ? 'Nouveaux cas confirmés' : 'Cas confirmés (cumulés)',
        data: data.map(d => d.confirmed),
        borderColor: getColorByType('confirmed'),
        backgroundColor: getColorByType('confirmed'),
        ...baseConfig
      });
    }

    if (dataType === 'all' || dataType === 'deaths') {
      datasets.push({
        label: viewType === 'daily' ? 'Nouveaux décès' : 'Décès (cumulés)',
        data: data.map(d => d.deaths),
        borderColor: getColorByType('deaths'),
        backgroundColor: getColorByType('deaths'),
        ...baseConfig
      });
    }

    if (dataType === 'all' || dataType === 'recovered') {
      datasets.push({
        label: viewType === 'daily' ? 'Nouvelles guérisons' : 'Guérisons (cumulées)',
        data: data.map(d => d.recovered),
        borderColor: getColorByType('recovered'),
        backgroundColor: getColorByType('recovered'),
        ...baseConfig
      });
    }

    if (dataType === 'all' || dataType === 'active') {
      datasets.push({
        label: viewType === 'daily' ? 'Variation cas actifs' : 'Cas actifs',
        data: data.map(d => d.active),
        borderColor: getColorByType('active'),
        backgroundColor: getColorByType('active'),
        ...baseConfig
      });
    }

    return datasets;
  };

  const chartData = {
    labels: getDisplayData().map(d => formatChartDate(d.date)),
    datasets: getDatasets()
  };

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
        text: `📈 Évolution COVID-19 - ${days} derniers jours`,
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
          padding: 20
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
          title: (context) => {
            const originalDate = getDisplayData()[context[0].dataIndex]?.date;
            if (originalDate) {
              const [month, day, year] = originalDate.split('/').map(Number);
              const fullYear = year < 50 ? 2000 + year : 1900 + year;
              const date = new Date(fullYear, month - 1, day);
              return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            }
            return '';
          },
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
        type: viewType === 'logarithmic' ? 'logarithmic' : 'linear',
        display: true,
        title: {
          display: true,
          text: viewType === 'daily' ? 'Nouveaux cas par jour' : 'Nombre de cas',
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666',
          callback: function(value) {
            if (viewType === 'logarithmic' && typeof value === 'number') {
              return value >= 1000 ? formatCompactNumber(value) : value.toString();
            }
            return formatCompactNumber(value as number);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className={`trends-chart ${className}`}>
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données d'évolution...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`trends-chart ${className}`}>
        <div className="chart-error">
          <div className="error-icon">📊</div>
          <h3>Graphique indisponible</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={refetch}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div className={`trends-chart ${className}`}>
        <div className="chart-error">
          <div className="error-icon">📈</div>
          <h3>Aucune donnée disponible</h3>
          <p>Impossible de charger les données d'évolution temporelle.</p>
        </div>
      </div>
    );
  }

  const latestData = timeSeriesData[timeSeriesData.length - 1];
  const previousData = timeSeriesData[timeSeriesData.length - 2];

  return (
    <div className={`trends-chart ${className}`}>
      <div className="chart-controls">
        <div className="control-group">
          <label htmlFor="view-type">Type d'affichage:</label>
          <select
            id="view-type"
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ChartViewType)}
            className="control-select"
          >
            <option value="cumulative">Cumulé</option>
            <option value="daily">Quotidien</option>
            <option value="logarithmic">Logarithmique</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="data-type">Données à afficher:</label>
          <select
            id="data-type"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as DataType)}
            className="control-select"
          >
            <option value="all">Toutes</option>
            <option value="confirmed">Cas confirmés</option>
            <option value="deaths">Décès</option>
            <option value="recovered">Guérisons</option>
            <option value="active">Cas actifs</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="chart-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Période:</span>
            <span className="stat-value">
              {timeSeriesData.length} jours ({formatChartDate(timeSeriesData[0].date)} - {formatChartDate(latestData.date)})
            </span>
          </div>
          {previousData && (
            <>
              <div className="stat-item">
                <span className="stat-label">Évolution confirmés:</span>
                <span className={`stat-value ${latestData.confirmed > previousData.confirmed ? 'positive' : 'negative'}`}>
                  {latestData.confirmed > previousData.confirmed ? '+' : ''}
                  {formatNumber(latestData.confirmed - previousData.confirmed)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Évolution décès:</span>
                <span className={`stat-value ${latestData.deaths > previousData.deaths ? 'positive' : 'negative'}`}>
                  {latestData.deaths > previousData.deaths ? '+' : ''}
                  {formatNumber(latestData.deaths - previousData.deaths)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;