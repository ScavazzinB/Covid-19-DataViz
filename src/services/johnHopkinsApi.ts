import axios from 'axios';
import Papa from 'papaparse';
import {
  CovidRawData,
  CovidTimeSeriesData,
  CountryData,
  GlobalStats,
  TimeSeriesPoint,
  ApiEndpoints
} from '../types/covid';

class JohnHopkinsApiService {
  private baseUrl: string;
  private endpoints: ApiEndpoints;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL ||
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series';

    this.endpoints = {
      confirmed: `${this.baseUrl}/time_series_covid19_confirmed_global.csv`,
      deaths: `${this.baseUrl}/time_series_covid19_deaths_global.csv`,
      recovered: `${this.baseUrl}/time_series_covid19_recovered_global.csv`
    };
  }

  private async fetchCsvData(url: string): Promise<CovidRawData[]> {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'Accept': 'text/csv',
        }
      });

      return new Promise((resolve, reject) => {
        Papa.parse(response.data, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
              return;
            }
            resolve(results.data as CovidRawData[]);
          },
          error: (error) => {
            reject(new Error(`CSV parsing failed: ${error.message}`));
          }
        });
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - Johns Hopkins API is taking too long to respond');
        }
        if (error.response?.status === 404) {
          throw new Error('Data not found - Johns Hopkins CSV file may have moved');
        }
        if (error.response?.status && error.response.status >= 500) {
          throw new Error('Server error - Johns Hopkins API is temporarily unavailable');
        }
      }
      throw new Error(`Failed to fetch CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformRawData(rawData: CovidRawData[]): CovidTimeSeriesData[] {
    return rawData.map(row => {
      const { 'Province/State': provinceState, 'Country/Region': countryRegion, Lat, Long, ...dateData } = row;

      const data: { [date: string]: number } = {};
      Object.entries(dateData).forEach(([date, value]) => {
        if (date !== 'Province/State' && date !== 'Country/Region' && date !== 'Lat' && date !== 'Long') {
          data[date] = parseInt(value as string, 10) || 0;
        }
      });

      return {
        provinceState: provinceState || '',
        countryRegion: countryRegion || '',
        latitude: parseFloat(Lat) || 0,
        longitude: parseFloat(Long) || 0,
        data
      };
    });
  }

  async getConfirmedData(): Promise<CovidTimeSeriesData[]> {
    const rawData = await this.fetchCsvData(this.endpoints.confirmed);
    return this.transformRawData(rawData);
  }

  async getDeathsData(): Promise<CovidTimeSeriesData[]> {
    const rawData = await this.fetchCsvData(this.endpoints.deaths);
    return this.transformRawData(rawData);
  }

  async getRecoveredData(): Promise<CovidTimeSeriesData[]> {
    const rawData = await this.fetchCsvData(this.endpoints.recovered);
    return this.transformRawData(rawData);
  }

  async getAllData(): Promise<{
    confirmed: CovidTimeSeriesData[];
    deaths: CovidTimeSeriesData[];
    recovered: CovidTimeSeriesData[];
  }> {
    try {
      const [confirmed, deaths, recovered] = await Promise.all([
        this.getConfirmedData(),
        this.getDeathsData(),
        this.getRecoveredData()
      ]);

      return { confirmed, deaths, recovered };
    } catch (error) {
      throw new Error(`Failed to fetch all COVID-19 data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLatestCountryData(): Promise<CountryData[]> {
    const { confirmed, deaths, recovered } = await this.getAllData();

    const countriesMap = new Map<string, {
      confirmed: number;
      deaths: number;
      recovered: number;
    }>();

    // Aggregate data by country (sum provinces)
    confirmed.forEach(entry => {
      const country = entry.countryRegion;
      const dates = Object.keys(entry.data);
      const latestDate = dates[dates.length - 1];
      const value = entry.data[latestDate] || 0;

      if (!countriesMap.has(country)) {
        countriesMap.set(country, { confirmed: 0, deaths: 0, recovered: 0 });
      }
      countriesMap.get(country)!.confirmed += value;
    });

    deaths.forEach(entry => {
      const country = entry.countryRegion;
      const dates = Object.keys(entry.data);
      const latestDate = dates[dates.length - 1];
      const value = entry.data[latestDate] || 0;

      if (!countriesMap.has(country)) {
        countriesMap.set(country, { confirmed: 0, deaths: 0, recovered: 0 });
      }
      countriesMap.get(country)!.deaths += value;
    });

    recovered.forEach(entry => {
      const country = entry.countryRegion;
      const dates = Object.keys(entry.data);
      const latestDate = dates[dates.length - 1];
      const value = entry.data[latestDate] || 0;

      if (!countriesMap.has(country)) {
        countriesMap.set(country, { confirmed: 0, deaths: 0, recovered: 0 });
      }
      countriesMap.get(country)!.recovered += value;
    });

    const currentDate = new Date().toISOString().split('T')[0];

    return Array.from(countriesMap.entries()).map(([country, data]) => {
      const active = data.confirmed - data.deaths - data.recovered;
      const mortalityRate = data.confirmed > 0 ? (data.deaths / data.confirmed) * 100 : 0;
      const recoveryRate = data.confirmed > 0 ? (data.recovered / data.confirmed) * 100 : 0;

      return {
        country,
        confirmed: data.confirmed,
        deaths: data.deaths,
        recovered: data.recovered,
        active: Math.max(0, active),
        mortalityRate: Math.round(mortalityRate * 100) / 100,
        recoveryRate: Math.round(recoveryRate * 100) / 100,
        lastUpdate: currentDate
      };
    }).sort((a, b) => b.confirmed - a.confirmed);
  }

  async getGlobalStats(): Promise<GlobalStats> {
    const countryData = await this.getLatestCountryData();

    const totals = countryData.reduce(
      (acc, country) => ({
        confirmed: acc.confirmed + country.confirmed,
        deaths: acc.deaths + country.deaths,
        recovered: acc.recovered + country.recovered,
        active: acc.active + country.active
      }),
      { confirmed: 0, deaths: 0, recovered: 0, active: 0 }
    );

    const mortalityRate = totals.confirmed > 0 ? (totals.deaths / totals.confirmed) * 100 : 0;
    const recoveryRate = totals.confirmed > 0 ? (totals.recovered / totals.confirmed) * 100 : 0;

    return {
      totalConfirmed: totals.confirmed,
      totalDeaths: totals.deaths,
      totalRecovered: totals.recovered,
      totalActive: totals.active,
      mortalityRate: Math.round(mortalityRate * 100) / 100,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
      countriesAffected: countryData.length,
      lastUpdate: new Date().toISOString().split('T')[0]
    };
  }

  async getTimeSeriesData(days: number = 30): Promise<TimeSeriesPoint[]> {
    const { confirmed, deaths, recovered } = await this.getAllData();

    if (confirmed.length === 0) {
      throw new Error('No confirmed data available');
    }

    // Get all dates from the first entry
    const allDates = Object.keys(confirmed[0].data).sort();
    const recentDates = allDates.slice(-days);

    return recentDates.map(date => {
      const dayTotals = {
        confirmed: 0,
        deaths: 0,
        recovered: 0
      };

      // Sum all countries for this date
      confirmed.forEach(entry => {
        dayTotals.confirmed += entry.data[date] || 0;
      });

      deaths.forEach(entry => {
        dayTotals.deaths += entry.data[date] || 0;
      });

      recovered.forEach(entry => {
        dayTotals.recovered += entry.data[date] || 0;
      });

      return {
        date,
        confirmed: dayTotals.confirmed,
        deaths: dayTotals.deaths,
        recovered: dayTotals.recovered,
        active: dayTotals.confirmed - dayTotals.deaths - dayTotals.recovered
      };
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(this.endpoints.confirmed, {
        timeout: 10000,
        maxContentLength: 1024 // Just check if the endpoint responds
      });
      return true;
    } catch {
      return false;
    }
  }
}

const johnHopkinsApi = new JohnHopkinsApiService();
export default johnHopkinsApi;