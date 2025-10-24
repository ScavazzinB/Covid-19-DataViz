import { CountryData, GlobalStats, TimeSeriesPoint, ContinentData } from '../types/covid';

/**
 * Converts data to CSV format
 */
export function convertToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) return '';

  const csvRows: string[] = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== null && value !== undefined ? value : '';
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Downloads data as a file
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export country data to CSV
 */
export function exportCountryDataToCSV(data: CountryData[]): void {
  const headers = [
    'country',
    'confirmed',
    'deaths',
    'recovered',
    'active',
    'mortalityRate',
    'recoveryRate',
    'lastUpdate'
  ];

  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `covid19-country-data-${timestamp}.csv`, 'text/csv');
}

/**
 * Export country data to JSON
 */
export function exportCountryDataToJSON(data: CountryData[]): void {
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `covid19-country-data-${timestamp}.json`, 'application/json');
}

/**
 * Export global stats to CSV
 */
export function exportGlobalStatsToCSV(stats: GlobalStats): void {
  const data = [{
    totalConfirmed: stats.totalConfirmed,
    totalDeaths: stats.totalDeaths,
    totalRecovered: stats.totalRecovered,
    totalActive: stats.totalActive,
    mortalityRate: stats.mortalityRate,
    recoveryRate: stats.recoveryRate,
    countriesAffected: stats.countriesAffected,
    lastUpdate: stats.lastUpdate
  }];

  const headers = Object.keys(data[0]);
  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `covid19-global-stats-${timestamp}.csv`, 'text/csv');
}

/**
 * Export global stats to JSON
 */
export function exportGlobalStatsToJSON(stats: GlobalStats): void {
  const json = JSON.stringify(stats, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `covid19-global-stats-${timestamp}.json`, 'application/json');
}

/**
 * Export time series data to CSV
 */
export function exportTimeSeriesDataToCSV(data: TimeSeriesPoint[]): void {
  const headers = ['date', 'confirmed', 'deaths', 'recovered', 'active'];
  const csv = convertToCSV(data, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `covid19-time-series-${timestamp}.csv`, 'text/csv');
}

/**
 * Export time series data to JSON
 */
export function exportTimeSeriesDataToJSON(data: TimeSeriesPoint[]): void {
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `covid19-time-series-${timestamp}.json`, 'application/json');
}

/**
 * Export continent data to CSV
 */
export function exportContinentDataToCSV(data: ContinentData[]): void {
  const flatData = data.map(continent => ({
    continent: continent.continent,
    countriesCount: continent.countries.length,
    countries: continent.countries.join('; '),
    confirmed: continent.confirmed,
    deaths: continent.deaths,
    recovered: continent.recovered,
    active: continent.active,
    mortalityRate: continent.mortalityRate,
    recoveryRate: continent.recoveryRate,
    lastUpdate: continent.lastUpdate
  }));

  const headers = [
    'continent',
    'countriesCount',
    'countries',
    'confirmed',
    'deaths',
    'recovered',
    'active',
    'mortalityRate',
    'recoveryRate',
    'lastUpdate'
  ];

  const csv = convertToCSV(flatData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `covid19-continent-data-${timestamp}.csv`, 'text/csv');
}

/**
 * Export continent data to JSON
 */
export function exportContinentDataToJSON(data: ContinentData[]): void {
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `covid19-continent-data-${timestamp}.json`, 'application/json');
}

/**
 * Export all data as a comprehensive JSON file
 */
export function exportAllDataToJSON(
  globalStats: GlobalStats | null,
  countryData: CountryData[],
  timeSeriesData: TimeSeriesPoint[],
  continentData: ContinentData[]
): void {
  const allData = {
    exportDate: new Date().toISOString(),
    globalStatistics: globalStats,
    countries: countryData,
    timeSeries: timeSeriesData,
    continents: continentData,
    metadata: {
      totalCountries: countryData.length,
      totalContinents: continentData.length,
      timeSeriesDataPoints: timeSeriesData.length,
      dataSource: 'Johns Hopkins CSSE COVID-19 Dataset'
    }
  };

  const json = JSON.stringify(allData, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `covid19-complete-dataset-${timestamp}.json`, 'application/json');
}
