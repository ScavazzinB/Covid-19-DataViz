import React, { useState } from 'react';
import './ExportButton.css';

export type ExportFormat = 'csv' | 'json';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  label?: string;
  className?: string;
  showFormatSelector?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  label = 'Exporter',
  className = '',
  showFormatSelector = true
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  if (!showFormatSelector) {
    return (
      <button
        className={`export-button ${className} ${isExporting ? 'exporting' : ''}`}
        onClick={() => handleExport('csv')}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <span className="export-icon">⏳</span>
            Export en cours...
          </>
        ) : (
          <>
            <span className="export-icon">📥</span>
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`export-button-container ${className}`}>
      <button
        className={`export-button ${isExporting ? 'exporting' : ''}`}
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <span className="export-icon">⏳</span>
            Export en cours...
          </>
        ) : (
          <>
            <span className="export-icon">📥</span>
            {label}
            <span className="dropdown-arrow">▼</span>
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <>
          <div className="export-backdrop" onClick={() => setShowMenu(false)} />
          <div className="export-menu">
            <button
              className="export-menu-item"
              onClick={() => handleExport('csv')}
            >
              <span className="format-icon">📄</span>
              <div className="format-info">
                <span className="format-name">CSV</span>
                <span className="format-desc">Tableau compatible Excel</span>
              </div>
            </button>
            <button
              className="export-menu-item"
              onClick={() => handleExport('json')}
            >
              <span className="format-icon">📋</span>
              <div className="format-info">
                <span className="format-name">JSON</span>
                <span className="format-desc">Format structuré pour API</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
