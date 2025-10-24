import { useState, useEffect, useCallback } from 'react';
import johnHopkinsApi from '../services/johnHopkinsApi';
import { CountryData, GlobalStats, TimeSeriesPoint, ContinentData, ContinentTimeSeriesPoint } from '../types/covid';
import { validateCountryData, validateGlobalStats, validateTimeSeriesData } from '../utils/dataValidation';

interface UseCovidDataState {
  globalStats: GlobalStats | null;
  countryData: CountryData[];
  timeSeriesData: TimeSeriesPoint[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

interface UseCovidDataActions {
  refetch: () => Promise<void>;
  clearError: () => void;
}

interface UseCovidDataOptions {
  timeSeriesDays?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useCovidData = (options: UseCovidDataOptions = {}): UseCovidDataState & UseCovidDataActions => {
  const {
    timeSeriesDays = 30,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const [state, setState] = useState<UseCovidDataState>({
    globalStats: null,
    countryData: [],
    timeSeriesData: [],
    loading: true,
    error: null,
    lastUpdate: null
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch all data in parallel
      const [globalStats, countryData, timeSeriesData] = await Promise.all([
        johnHopkinsApi.getGlobalStats(),
        johnHopkinsApi.getLatestCountryData(),
        johnHopkinsApi.getTimeSeriesData(timeSeriesDays)
      ]);

      // Validate data
      validateGlobalStats(globalStats);
      validateCountryData(countryData);
      validateTimeSeriesData(timeSeriesData);

      setState({
        globalStats,
        countryData,
        timeSeriesData,
        loading: false,
        error: null,
        lastUpdate: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Log the error for debugging
      console.error('Error fetching COVID data:', error);
    }
  }, [timeSeriesDays]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!state.loading) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, state.loading]);

  return {
    ...state,
    refetch,
    clearError
  };
};

// Hook for global stats only (lighter)
export const useGlobalStats = () => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stats = await johnHopkinsApi.getGlobalStats();
      validateGlobalStats(stats);
      setGlobalStats(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch global stats';
      setError(errorMessage);
      console.error('Error fetching global stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  return {
    globalStats,
    loading,
    error,
    refetch: fetchGlobalStats
  };
};

// Hook for country data only
export const useCountryData = () => {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountryData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await johnHopkinsApi.getLatestCountryData();
      validateCountryData(data);
      setCountryData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch country data';
      setError(errorMessage);
      console.error('Error fetching country data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountryData();
  }, [fetchCountryData]);

  return {
    countryData,
    loading,
    error,
    refetch: fetchCountryData
  };
};

// Hook for time series data only
export const useTimeSeriesData = (days: number = 30) => {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSeriesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await johnHopkinsApi.getTimeSeriesData(days);
      validateTimeSeriesData(data);
      setTimeSeriesData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch time series data';
      setError(errorMessage);
      console.error('Error fetching time series data:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchTimeSeriesData();
  }, [fetchTimeSeriesData]);

  return {
    timeSeriesData,
    loading,
    error,
    refetch: fetchTimeSeriesData
  };
};

// Hook for multi-country comparison
export const useMultiCountryComparison = (countries: string[], days: number = 30) => {
  const [data, setData] = useState<Map<string, TimeSeriesPoint[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (countries.length === 0) {
      setData(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const countryData = await johnHopkinsApi.getCountryTimeSeriesData(countries, days);
      setData(countryData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch country comparison data';
      setError(errorMessage);
      console.error('Error fetching multi-country data:', error);
    } finally {
      setLoading(false);
    }
  }, [countries, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

// Hook for continent data
export const useContinentData = () => {
  const [continentData, setContinentData] = useState<ContinentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await johnHopkinsApi.getContinentData();
      setContinentData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch continent data';
      setError(errorMessage);
      console.error('Error fetching continent data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    continentData,
    loading,
    error,
    refetch: fetchData
  };
};

// Hook for continent time series data
export const useContinentTimeSeries = (days: number = 30) => {
  const [data, setData] = useState<ContinentTimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const timeSeriesData = await johnHopkinsApi.getContinentTimeSeriesData(days);
      setData(timeSeriesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch continent time series';
      setError(errorMessage);
      console.error('Error fetching continent time series:', error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};