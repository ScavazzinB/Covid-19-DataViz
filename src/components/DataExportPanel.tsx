import React from 'react';
import { useGlobalStats, useCountryData, useTimeSeriesData, useContinentData } from '../hooks/useCovidData';
import ExportButton, { ExportFormat } from './ExportButton';
import {
  exportGlobalStatsToCSV,
  exportGlobalStatsToJSON,
  exportCountryDataToCSV,
  exportCountryDataToJSON,
  exportTimeSeriesDataToCSV,
  exportTimeSeriesDataToJSON,
  exportContinentDataToCSV,
  exportContinentDataToJSON,
  exportAllDataToJSON
} from '../utils/dataExport';
import './DataExportPanel.css';

interface DataExportPanelProps {
  className?: string;
}

const DataExportPanel: React.FC<DataExportPanelProps> = ({ className = '' }) => {
  const { globalStats, loading: globalLoading } = useGlobalStats();
  const { countryData, loading: countryLoading } = useCountryData();
  const { timeSeriesData, loading: timeSeriesLoading } = useTimeSeriesData(60);
  const { continentData, loading: continentLoading } = useContinentData();

  const isLoading = globalLoading || countryLoading || timeSeriesLoading || continentLoading;

  const handleGlobalExport = (format: ExportFormat) => {
    if (!globalStats) return;
    if (format === 'csv') {
      exportGlobalStatsToCSV(globalStats);
    } else {
      exportGlobalStatsToJSON(globalStats);
    }
  };

  const handleCountryExport = (format: ExportFormat) => {
    if (countryData.length === 0) return;
    if (format === 'csv') {
      exportCountryDataToCSV(countryData);
    } else {
      exportCountryDataToJSON(countryData);
    }
  };

  const handleTimeSeriesExport = (format: ExportFormat) => {
    if (timeSeriesData.length === 0) return;
    if (format === 'csv') {
      exportTimeSeriesDataToCSV(timeSeriesData);
    } else {
      exportTimeSeriesDataToJSON(timeSeriesData);
    }
  };

  const handleContinentExport = (format: ExportFormat) => {
    if (continentData.length === 0) return;
    if (format === 'csv') {
      exportContinentDataToCSV(continentData);
    } else {
      exportContinentDataToJSON(continentData);
    }
  };

  const handleCompleteExport = () => {
    if (!globalStats || countryData.length === 0) return;
    exportAllDataToJSON(globalStats, countryData, timeSeriesData, continentData);
  };

  return (
    <div className={`data-export-panel ${className}`}>
      <div className="export-header">
        <h2>📥 Exportation des Données</h2>
        <p className="export-description">
          Téléchargez les données COVID-19 au format CSV ou JSON
        </p>
      </div>

      {isLoading && (
        <div className="export-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="export-grid">
            {/* Global Stats Export */}
            <div className="export-card">
              <div className="export-card-icon">🌐</div>
              <div className="export-card-content">
                <h3>Statistiques Globales</h3>
                <p>Totaux mondiaux et taux de mortalité/guérison</p>
                <div className="export-card-stats">
                  <span>📊 1 enregistrement</span>
                  <span>🗓️ Mis à jour: {globalStats?.lastUpdate || 'N/A'}</span>
                </div>
              </div>
              <div className="export-card-actions">
                <ExportButton
                  onExport={handleGlobalExport}
                  label="Exporter"
                  showFormatSelector={true}
                />
              </div>
            </div>

            {/* Country Data Export */}
            <div className="export-card">
              <div className="export-card-icon">🗺️</div>
              <div className="export-card-content">
                <h3>Données par Pays</h3>
                <p>Statistiques détaillées pour chaque pays</p>
                <div className="export-card-stats">
                  <span>📊 {countryData.length} pays</span>
                  <span>📈 7 métriques</span>
                </div>
              </div>
              <div className="export-card-actions">
                <ExportButton
                  onExport={handleCountryExport}
                  label="Exporter"
                  showFormatSelector={true}
                />
              </div>
            </div>

            {/* Time Series Export */}
            <div className="export-card">
              <div className="export-card-icon">📈</div>
              <div className="export-card-content">
                <h3>Séries Temporelles</h3>
                <p>Évolution quotidienne sur 60 jours</p>
                <div className="export-card-stats">
                  <span>📊 {timeSeriesData.length} points</span>
                  <span>🕒 4 métriques par jour</span>
                </div>
              </div>
              <div className="export-card-actions">
                <ExportButton
                  onExport={handleTimeSeriesExport}
                  label="Exporter"
                  showFormatSelector={true}
                />
              </div>
            </div>

            {/* Continent Data Export */}
            <div className="export-card">
              <div className="export-card-icon">🌍</div>
              <div className="export-card-content">
                <h3>Données Continentales</h3>
                <p>Agrégation par continent avec liste de pays</p>
                <div className="export-card-stats">
                  <span>📊 {continentData.length} continents</span>
                  <span>🌐 Tous les pays inclus</span>
                </div>
              </div>
              <div className="export-card-actions">
                <ExportButton
                  onExport={handleContinentExport}
                  label="Exporter"
                  showFormatSelector={true}
                />
              </div>
            </div>
          </div>

          {/* Complete Export */}
          <div className="complete-export-section">
            <div className="complete-export-card">
              <div className="complete-export-icon">💾</div>
              <div className="complete-export-content">
                <h3>Export Complet</h3>
                <p>
                  Téléchargez toutes les données dans un seul fichier JSON structuré.
                  Inclut les statistiques globales, les données pays, les séries temporelles
                  et les agrégations continentales.
                </p>
                <div className="complete-export-stats">
                  <span>✅ Statistiques globales</span>
                  <span>✅ {countryData.length} pays</span>
                  <span>✅ {timeSeriesData.length} points temporels</span>
                  <span>✅ {continentData.length} continents</span>
                </div>
              </div>
              <div className="complete-export-action">
                <button
                  className="complete-export-button"
                  onClick={handleCompleteExport}
                  disabled={!globalStats || countryData.length === 0}
                >
                  <span className="button-icon">📦</span>
                  <span>Télécharger l'Export Complet (JSON)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="export-info">
            <div className="info-item">
              <span className="info-icon">ℹ️</span>
              <div className="info-content">
                <strong>Format CSV:</strong> Compatible avec Excel, Google Sheets et autres tableurs.
                Idéal pour l'analyse de données et les graphiques.
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">ℹ️</span>
              <div className="info-content">
                <strong>Format JSON:</strong> Données structurées pour intégration API et développement.
                Conserve tous les types de données et la structure hiérarchique.
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">📅</span>
              <div className="info-content">
                <strong>Mise à jour:</strong> Les données sont mises à jour quotidiennement depuis
                la source Johns Hopkins CSSE. Les fichiers exportés incluent un horodatage.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataExportPanel;
