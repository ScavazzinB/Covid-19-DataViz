import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountryData } from '../hooks/useCovidData';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { CountryData } from '../types/covid';
import './CountryComparison.css';

interface CountryComparisonProps {
  className?: string;
}

type SortKey = keyof CountryData;
type SortOrder = 'asc' | 'desc';

const CountryComparison: React.FC<CountryComparisonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { countryData, loading, error, refetch } = useCountryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('confirmed');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredAndSortedData = useMemo(() => {
    if (!countryData) return [];

    // Filter by search query
    const filtered = countryData.filter(country =>
      country.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort data
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc'
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      return 0;
    });

    return sorted;
  }, [countryData, searchQuery, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return '⚬';
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  if (loading) {
    return (
      <div className={`country-comparison ${className}`}>
        <div className="section-header">
          <h2>🌍 Comparaison par Pays</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des données des pays...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`country-comparison ${className}`}>
        <div className="section-header">
          <h2>🌍 Comparaison par Pays</h2>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={refetch}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`country-comparison ${className}`}>
      <div className="section-header">
        <h2>🌍 Comparaison par Pays</h2>
        <p className="section-subtitle">
          {countryData?.length || 0} pays affectés par la pandémie
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Rechercher un pays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="clear-search-button"
              aria-label="Effacer la recherche"
            >
              ✕
            </button>
          )}
          <div className="search-icon">🔍</div>
        </div>
        {searchQuery && (
          <div className="search-results">
            {filteredAndSortedData.length > 0
              ? `${filteredAndSortedData.length} pays trouvé(s)`
              : 'Aucun pays trouvé'
            }
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredAndSortedData.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Aucun pays trouvé</h3>
            <p>
              {searchQuery
                ? `Aucun pays ne correspond à "${searchQuery}"`
                : 'Aucune donnée disponible'
              }
            </p>
            {searchQuery && (
              <button className="clear-button" onClick={clearSearch}>
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <table className="countries-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('country')}
                  className="sortable"
                >
                  Pays {getSortIcon('country')}
                </th>
                <th
                  onClick={() => handleSort('confirmed')}
                  className="sortable number-column"
                >
                  Cas Confirmés {getSortIcon('confirmed')}
                </th>
                <th
                  onClick={() => handleSort('deaths')}
                  className="sortable number-column"
                >
                  Décès {getSortIcon('deaths')}
                </th>
                <th
                  onClick={() => handleSort('recovered')}
                  className="sortable number-column"
                >
                  Guérisons {getSortIcon('recovered')}
                </th>
                <th
                  onClick={() => handleSort('active')}
                  className="sortable number-column"
                >
                  Cas Actifs {getSortIcon('active')}
                </th>
                <th
                  onClick={() => handleSort('mortalityRate')}
                  className="sortable number-column"
                >
                  Taux Mortalité {getSortIcon('mortalityRate')}
                </th>
                <th
                  onClick={() => handleSort('recoveryRate')}
                  className="sortable number-column"
                >
                  Taux Guérison {getSortIcon('recoveryRate')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((country, index) => (
                <tr
                  key={country.country}
                  className={index % 2 === 0 ? 'even' : 'odd'}
                  onClick={() => navigate(`/country/${encodeURIComponent(country.country)}`)}
                  style={{ cursor: 'pointer' }}
                  title={`Voir les détails de ${country.country}`}
                >
                  <td className="country-name">
                    <span className="country-flag">
                      {getCountryFlag(country.country)}
                    </span>
                    {country.country}
                  </td>
                  <td className="number-cell confirmed">
                    {formatNumber(country.confirmed)}
                  </td>
                  <td className="number-cell deaths">
                    {formatNumber(country.deaths)}
                  </td>
                  <td className="number-cell recovered">
                    {formatNumber(country.recovered)}
                  </td>
                  <td className="number-cell active">
                    {formatNumber(country.active)}
                  </td>
                  <td className="number-cell mortality">
                    {formatPercentage(country.mortalityRate)}
                  </td>
                  <td className="number-cell recovery">
                    {formatPercentage(country.recoveryRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Footer */}
      {filteredAndSortedData.length > 0 && (
        <div className="table-footer">
          <div className="table-stats">
            <span>Total: {filteredAndSortedData.length} pays</span>
            {searchQuery && (
              <span> | Filtré sur "{searchQuery}"</span>
            )}
          </div>
          <div className="table-legend">
            <span className="legend-item confirmed">■ Confirmés</span>
            <span className="legend-item deaths">■ Décès</span>
            <span className="legend-item recovered">■ Guérisons</span>
            <span className="legend-item active">■ Actifs</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get country flags (basic implementation)
const getCountryFlag = (countryName: string): string => {
  const flagMap: { [key: string]: string } = {
    'United States': '🇺🇸',
    'China': '🇨🇳',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Germany': '🇩🇪',
    'United Kingdom': '🇬🇧',
    'Brazil': '🇧🇷',
    'India': '🇮🇳',
    'Russia': '🇷🇺',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Mexico': '🇲🇽',
    'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪',
    'Switzerland': '🇨🇭',
    'Portugal': '🇵🇹',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Austria': '🇦🇹',
    'Denmark': '🇩🇰',
    'Finland': '🇫🇮',
    'Greece': '🇬🇷',
    'Turkey': '🇹🇷',
    'Iran': '🇮🇷',
    'Israel': '🇮🇱',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Peru': '🇵🇪',
    'South Africa': '🇿🇦',
    'Egypt': '🇪🇬',
    'Thailand': '🇹🇭',
    'Singapore': '🇸🇬',
    'Malaysia': '🇲🇾',
    'Philippines': '🇵🇭',
    'Indonesia': '🇮🇩',
    'Vietnam': '🇻🇳',
    'New Zealand': '🇳🇿'
  };

  return flagMap[countryName] || '🌍';
};

export default CountryComparison;