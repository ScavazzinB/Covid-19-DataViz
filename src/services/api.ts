import axios from 'axios';

export interface CovidData {
  id: number;
  country_region: string;
  province_state?: string;
  fips?: string;
  admin2?: string;
  last_update: string;
  confirmed: number;
  deaths: number;
  recovered: number;
}

export interface ApiParams {
  skip?: number;
  limit?: number;
  last_update_from?: string;
  last_update_to?: string;
  country?: string;
  province?: string;
}

class CovidApiService {
  private baseURL: string;

  constructor() {
    // Use local API by default, fallback to production if needed
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  async getDailyReports(params: ApiParams = {}): Promise<CovidData[]> {
    try {
      const response = await axios.get<CovidData[]>(`${this.baseURL}/v1/jh/daily-reports/`, {
        params,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      throw new Error('Failed to fetch COVID-19 data');
    }
  }

  async getLatestData(limit: number = 300): Promise<CovidData[]> {
    const today = new Date();
    const tenDaysAgo = new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000));

    return this.getDailyReports({
      last_update_from: tenDaysAgo.toISOString().split('T')[0],
      last_update_to: today.toISOString().split('T')[0],
      limit
    });
  }

  async getCountryData(country: string, days: number = 30): Promise<CovidData[]> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    return this.getDailyReports({
      country,
      last_update_from: startDate.toISOString().split('T')[0],
      last_update_to: endDate.toISOString().split('T')[0],
      limit: 1000
    });
  }

  async getGlobalSummary(): Promise<{
    totalConfirmed: number;
    totalDeaths: number;
    totalRecovered: number;
    countries: number;
    lastUpdate: string;
  }> {
    try {
      const data = await this.getLatestData(500);

      // Get the most recent data per country
      const countryLatest = new Map<string, CovidData>();

      data.forEach(record => {
        const key = record.country_region;
        const existing = countryLatest.get(key);

        if (!existing || new Date(record.last_update) > new Date(existing.last_update)) {
          countryLatest.set(key, record);
        }
      });

      const latestRecords = Array.from(countryLatest.values());

      const summary = latestRecords.reduce(
        (acc, record) => ({
          totalConfirmed: acc.totalConfirmed + record.confirmed,
          totalDeaths: acc.totalDeaths + record.deaths,
          totalRecovered: acc.totalRecovered + record.recovered,
          countries: acc.countries,
          lastUpdate: record.last_update > acc.lastUpdate ? record.last_update : acc.lastUpdate
        }),
        {
          totalConfirmed: 0,
          totalDeaths: 0,
          totalRecovered: 0,
          countries: latestRecords.length,
          lastUpdate: ''
        }
      );

      return summary;
    } catch (error) {
      console.error('Error calculating global summary:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/health`, { timeout: 5000 });
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }
}

const apiService = new CovidApiService();
export default apiService;