import {
  validateRawCovidData,
  validateCountryData,
  validateGlobalStats,
  validateTimeSeriesData,
  DataValidationError
} from '../dataValidation';
import { CovidRawData, CountryData, GlobalStats, TimeSeriesPoint } from '../../types/covid';

describe('dataValidation', () => {
  describe('validateRawCovidData', () => {
    const validRawData: CovidRawData[] = [
      {
        'Province/State': '',
        'Country/Region': 'France',
        'Lat': '46.2276',
        'Long': '2.2137',
        '1/22/20': '0',
        '1/23/20': '0'
      }
    ];

    it('should pass with valid data', () => {
      expect(() => validateRawCovidData(validRawData)).not.toThrow();
    });

    it('should throw error for empty data', () => {
      expect(() => validateRawCovidData([])).toThrow(DataValidationError);
    });

    it('should throw error for missing required fields', () => {
      const invalidData = [{ 'Country/Region': 'France' }] as CovidRawData[];
      expect(() => validateRawCovidData(invalidData)).toThrow(DataValidationError);
    });

    it('should throw error for no date columns', () => {
      const invalidData: CovidRawData[] = [
        {
          'Province/State': '',
          'Country/Region': 'France',
          'Lat': '46.2276',
          'Long': '2.2137'
        }
      ];
      expect(() => validateRawCovidData(invalidData)).toThrow(DataValidationError);
    });
  });

  describe('validateCountryData', () => {
    const validCountryData: CountryData[] = [
      {
        country: 'France',
        confirmed: 1000,
        deaths: 50,
        recovered: 900,
        active: 50,
        mortalityRate: 5.0,
        recoveryRate: 90.0,
        lastUpdate: '2022-01-15'
      }
    ];

    it('should pass with valid data', () => {
      expect(() => validateCountryData(validCountryData)).not.toThrow();
    });

    it('should throw error for empty data', () => {
      expect(() => validateCountryData([])).toThrow(DataValidationError);
    });

    it('should throw error for missing country name', () => {
      const invalidData = [{ ...validCountryData[0], country: '' }];
      expect(() => validateCountryData(invalidData)).toThrow(DataValidationError);
    });

    it('should throw error for negative values', () => {
      const invalidData = [{ ...validCountryData[0], confirmed: -1 }];
      expect(() => validateCountryData(invalidData)).toThrow(DataValidationError);
    });
  });

  describe('validateGlobalStats', () => {
    const validGlobalStats: GlobalStats = {
      totalConfirmed: 1000000,
      totalDeaths: 50000,
      totalRecovered: 900000,
      totalActive: 50000,
      mortalityRate: 5.0,
      recoveryRate: 90.0,
      countriesAffected: 195,
      lastUpdate: '2022-01-15'
    };

    it('should pass with valid data', () => {
      expect(() => validateGlobalStats(validGlobalStats)).not.toThrow();
    });

    it('should throw error for missing fields', () => {
      const { totalConfirmed, ...invalidStats } = validGlobalStats;
      // Use spread to remove totalConfirmed field
      expect(() => validateGlobalStats(invalidStats as GlobalStats)).toThrow(DataValidationError);
    });

    it('should throw error for negative values', () => {
      const invalidStats = { ...validGlobalStats, totalConfirmed: -1 };
      expect(() => validateGlobalStats(invalidStats)).toThrow(DataValidationError);
    });

    it('should throw error for NaN values', () => {
      const invalidStats = { ...validGlobalStats, mortalityRate: NaN };
      expect(() => validateGlobalStats(invalidStats)).toThrow(DataValidationError);
    });
  });

  describe('validateTimeSeriesData', () => {
    const validTimeSeriesData: TimeSeriesPoint[] = [
      {
        date: '1/22/20',
        confirmed: 1000,
        deaths: 50,
        recovered: 900,
        active: 50
      },
      {
        date: '1/23/20',
        confirmed: 1100,
        deaths: 55,
        recovered: 950,
        active: 95
      }
    ];

    it('should pass with valid data', () => {
      expect(() => validateTimeSeriesData(validTimeSeriesData)).not.toThrow();
    });

    it('should throw error for empty data', () => {
      expect(() => validateTimeSeriesData([])).toThrow(DataValidationError);
    });

    it('should throw error for invalid date format', () => {
      const invalidData = [{ ...validTimeSeriesData[0], date: '2022-01-15' }];
      expect(() => validateTimeSeriesData(invalidData)).toThrow(DataValidationError);
    });

    it('should throw error for negative values', () => {
      const invalidData = [{ ...validTimeSeriesData[0], confirmed: -1 }];
      expect(() => validateTimeSeriesData(invalidData)).toThrow(DataValidationError);
    });

    it('should throw error for NaN values', () => {
      const invalidData = [{ ...validTimeSeriesData[0], deaths: NaN }];
      expect(() => validateTimeSeriesData(invalidData)).toThrow(DataValidationError);
    });
  });
});