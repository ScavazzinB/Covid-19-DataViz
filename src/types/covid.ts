export interface CovidRawData {
  'Province/State': string;
  'Country/Region': string;
  Lat: string;
  Long: string;
  [date: string]: string;
}

export interface CovidTimeSeriesData {
  provinceState: string;
  countryRegion: string;
  latitude: number;
  longitude: number;
  data: { [date: string]: number };
}

export interface CountryData {
  country: string;
  confirmed: number;
  deaths: number;
  recovered: number;
  active: number;
  mortalityRate: number;
  recoveryRate: number;
  lastUpdate: string;
}

export interface GlobalStats {
  totalConfirmed: number;
  totalDeaths: number;
  totalRecovered: number;
  totalActive: number;
  mortalityRate: number;
  recoveryRate: number;
  countriesAffected: number;
  lastUpdate: string;
}

export interface TimeSeriesPoint {
  date: string;
  confirmed: number;
  deaths: number;
  recovered: number;
  active: number;
}

export interface ApiEndpoints {
  confirmed: string;
  deaths: string;
  recovered: string;
}