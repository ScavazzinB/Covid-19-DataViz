import { CovidRawData, CountryData, GlobalStats, TimeSeriesPoint } from '../types/covid';

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}

export const validateRawCovidData = (data: CovidRawData[]): void => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new DataValidationError('CSV data is empty or invalid');
  }

  const requiredFields = ['Province/State', 'Country/Region', 'Lat', 'Long'];
  const firstRow = data[0];

  requiredFields.forEach(field => {
    if (!(field in firstRow)) {
      throw new DataValidationError(`Missing required field: ${field}`);
    }
  });

  // Check if there are date columns
  const dateColumns = Object.keys(firstRow).filter(key =>
    !requiredFields.includes(key) &&
    /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(key)
  );

  if (dateColumns.length === 0) {
    throw new DataValidationError('No valid date columns found in CSV data');
  }

  // Validate data types
  data.slice(0, 10).forEach((row, index) => {
    if (!row['Country/Region']) {
      throw new DataValidationError(`Row ${index + 1}: Missing country/region`);
    }

    const lat = parseFloat(row.Lat);
    const lng = parseFloat(row.Long);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      console.warn(`Row ${index + 1}: Invalid latitude: ${row.Lat}`);
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      console.warn(`Row ${index + 1}: Invalid longitude: ${row.Long}`);
    }

    // Check some date values are numeric
    dateColumns.slice(0, 3).forEach(dateCol => {
      const value = row[dateCol];
      if (value && isNaN(parseInt(value, 10))) {
        console.warn(`Row ${index + 1}, ${dateCol}: Non-numeric value: ${value}`);
      }
    });
  });
};

export const validateCountryData = (data: CountryData[]): void => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new DataValidationError('Country data is empty or invalid');
  }

  data.forEach((country, index) => {
    if (!country.country || typeof country.country !== 'string') {
      throw new DataValidationError(`Country ${index + 1}: Invalid country name`);
    }

    const numericFields = ['confirmed', 'deaths', 'recovered', 'active'];
    numericFields.forEach(field => {
      if (typeof country[field as keyof CountryData] !== 'number' ||
          isNaN(country[field as keyof CountryData] as number) ||
          (country[field as keyof CountryData] as number) < 0) {
        throw new DataValidationError(`Country ${country.country}: Invalid ${field} value`);
      }
    });

    // Logical validation
    if (country.confirmed < country.deaths + country.recovered) {
      console.warn(`Country ${country.country}: Confirmed cases (${country.confirmed}) less than deaths + recovered (${country.deaths + country.recovered})`);
    }

    if (country.mortalityRate < 0 || country.mortalityRate > 100) {
      console.warn(`Country ${country.country}: Invalid mortality rate: ${country.mortalityRate}%`);
    }

    if (country.recoveryRate < 0 || country.recoveryRate > 100) {
      console.warn(`Country ${country.country}: Invalid recovery rate: ${country.recoveryRate}%`);
    }
  });
};

export const validateGlobalStats = (stats: GlobalStats): void => {
  const requiredFields: (keyof GlobalStats)[] = [
    'totalConfirmed', 'totalDeaths', 'totalRecovered', 'totalActive',
    'mortalityRate', 'recoveryRate', 'countriesAffected', 'lastUpdate'
  ];

  requiredFields.forEach(field => {
    if (!(field in stats)) {
      throw new DataValidationError(`Missing required field in global stats: ${field}`);
    }
  });

  const numericFields: (keyof GlobalStats)[] = [
    'totalConfirmed', 'totalDeaths', 'totalRecovered', 'totalActive',
    'mortalityRate', 'recoveryRate', 'countriesAffected'
  ];

  numericFields.forEach(field => {
    const value = stats[field] as number;
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new DataValidationError(`Invalid ${field} value in global stats: ${value}`);
    }
  });

  // Logical validation
  if (stats.totalConfirmed < stats.totalDeaths + stats.totalRecovered) {
    console.warn('Global stats: Total confirmed less than deaths + recovered');
  }

  if (stats.mortalityRate > 100 || stats.recoveryRate > 100) {
    console.warn('Global stats: Mortality or recovery rate exceeds 100%');
  }

  if (stats.countriesAffected < 1 || stats.countriesAffected > 300) {
    console.warn(`Global stats: Suspicious countries affected count: ${stats.countriesAffected}`);
  }
};

export const validateTimeSeriesData = (data: TimeSeriesPoint[]): void => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new DataValidationError('Time series data is empty or invalid');
  }

  data.forEach((point, index) => {
    if (!point.date || typeof point.date !== 'string') {
      throw new DataValidationError(`Time series point ${index + 1}: Invalid date`);
    }

    // Validate date format (M/D/YY)
    if (!/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(point.date)) {
      throw new DataValidationError(`Time series point ${index + 1}: Invalid date format: ${point.date}`);
    }

    const numericFields: (keyof TimeSeriesPoint)[] = ['confirmed', 'deaths', 'recovered', 'active'];
    numericFields.forEach(field => {
      const value = point[field];
      if (typeof value !== 'number' || isNaN(value) || value < 0) {
        throw new DataValidationError(`Time series point ${index + 1}: Invalid ${field} value: ${value}`);
      }
    });

    // Logical validation
    if (point.confirmed < point.deaths + point.recovered) {
      console.warn(`Time series ${point.date}: Confirmed cases less than deaths + recovered`);
    }
  });

  // Check chronological order
  const dates = data.map(point => {
    const [month, day, year] = point.date.split('/').map(Number);
    return new Date(2000 + year, month - 1, day);
  });

  for (let i = 1; i < dates.length; i++) {
    if (dates[i] < dates[i - 1]) {
      console.warn('Time series data is not in chronological order');
      break;
    }
  }
};