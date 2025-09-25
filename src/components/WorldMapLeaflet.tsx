import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './WorldMapLeaflet.css';

interface CountryData {
  country: string;
  cases: number;
  deaths: number;
  recovered: number;
  active: number;
  countryInfo: {
    lat: number;
    long: number;
    flag: string;
  };
}

interface WorldMapLeafletProps {
  className?: string;
}

const WorldMapLeaflet: React.FC<WorldMapLeafletProps> = ({ className = '' }) => {
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getCircleColor = (cases: number): string => {
    if (cases > 1000000) return '#d63031'; // Rouge foncé
    if (cases > 100000) return '#e17055';  // Rouge-orange
    if (cases > 10000) return '#fdcb6e';   // Orange
    if (cases > 1000) return '#ffeaa7';    // Jaune
    return '#ddd';                         // Gris
  };

  const getCircleSize = (cases: number): number => {
    if (cases > 10000000) return 25;
    if (cases > 1000000) return 20;
    if (cases > 100000) return 15;
    if (cases > 10000) return 10;
    if (cases > 1000) return 8;
    return 5;
  };

  useEffect(() => {
    const fetchCovidData = async () => {
      try {
        setLoading(true);
        console.log('📍 Fetching COVID data from disease.sh API...');

        // API alternative plus fiable
        const response = await axios.get('https://disease.sh/v3/covid-19/countries', {
          timeout: 10000,
        });

        console.log('✅ COVID data received:', response.data.length, 'countries');
        setCountriesData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching COVID data:', err);

        // Fallback avec des données de test
        const testData: CountryData[] = [
          {
            country: 'USA',
            cases: 103436829,
            deaths: 1123836,
            recovered: 100246926,
            active: 2066067,
            countryInfo: { lat: 38, long: -97, flag: 'https://disease.sh/assets/img/flags/us.png' }
          },
          {
            country: 'India',
            cases: 44690738,
            deaths: 530779,
            recovered: 44155671,
            active: 4288,
            countryInfo: { lat: 20, long: 77, flag: 'https://disease.sh/assets/img/flags/in.png' }
          },
          {
            country: 'France',
            cases: 38997490,
            deaths: 174226,
            recovered: 38597082,
            active: 226182,
            countryInfo: { lat: 46, long: 2, flag: 'https://disease.sh/assets/img/flags/fr.png' }
          },
          {
            country: 'Germany',
            cases: 38437756,
            deaths: 172843,
            recovered: 38036200,
            active: 228713,
            countryInfo: { lat: 51, long: 10, flag: 'https://disease.sh/assets/img/flags/de.png' }
          },
          {
            country: 'Brazil',
            cases: 37715531,
            deaths: 704659,
            recovered: 36651565,
            active: 359307,
            countryInfo: { lat: -10, long: -52, flag: 'https://disease.sh/assets/img/flags/br.png' }
          }
        ];

        console.log('📍 Using fallback test data');
        setCountriesData(testData);
        setError('Utilisation de données de test (API non disponible)');
        setLoading(false);
      }
    };

    fetchCovidData();
  }, []);

  if (loading) {
    return (
      <div className={`world-map-leaflet ${className}`}>
        <h3>🌍 Carte mondiale interactive</h3>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`world-map-leaflet ${className}`}>
      <h3>🌍 Carte mondiale interactive</h3>
      {error && (
        <div className="error-notice">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="map-container-leaflet">
        <MapContainer
          center={[20, 0] as LatLngExpression}
          zoom={2}
          style={{ height: '500px', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tile-layer"
          />

          {countriesData.map((country, index) => (
            <CircleMarker
              key={`${country.country}-${index}`}
              center={[country.countryInfo.lat, country.countryInfo.long] as LatLngExpression}
              radius={getCircleSize(country.cases)}
              fillColor={getCircleColor(country.cases)}
              color="#fff"
              weight={2}
              opacity={1}
              fillOpacity={0.7}
            >
              <Popup>
                <div className="country-popup">
                  <div className="popup-header">
                    <img
                      src={country.countryInfo.flag}
                      alt={`${country.country} flag`}
                      className="country-flag"
                    />
                    <h4>{country.country}</h4>
                  </div>
                  <div className="popup-stats">
                    <div className="stat-item confirmed">
                      <span className="stat-label">Confirmés:</span>
                      <span className="stat-value">{formatNumber(country.cases)}</span>
                    </div>
                    <div className="stat-item deaths">
                      <span className="stat-label">Décès:</span>
                      <span className="stat-value">{formatNumber(country.deaths)}</span>
                    </div>
                    <div className="stat-item recovered">
                      <span className="stat-label">Guéris:</span>
                      <span className="stat-value">{formatNumber(country.recovered)}</span>
                    </div>
                    <div className="stat-item active">
                      <span className="stat-label">Actifs:</span>
                      <span className="stat-value">{formatNumber(country.active)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        <div className="map-legend-leaflet">
          <div className="legend-title">Cas confirmés</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-circle" style={{backgroundColor: '#ffeaa7', width: '8px', height: '8px'}}></div>
              <span>1K - 10K</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle" style={{backgroundColor: '#fdcb6e', width: '12px', height: '12px'}}></div>
              <span>10K - 100K</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle" style={{backgroundColor: '#e17055', width: '16px', height: '16px'}}></div>
              <span>100K - 1M</span>
            </div>
            <div className="legend-item">
              <div className="legend-circle" style={{backgroundColor: '#d63031', width: '20px', height: '20px'}}></div>
              <span>1M+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapLeaflet;