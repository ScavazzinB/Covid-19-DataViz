import React from 'react';
import GlobalStats from '../components/GlobalStats';
import TrendIndicators from '../components/TrendIndicators';
import TrendsChart from '../components/TrendsChart';
import WorldMapLeaflet from '../components/WorldMapLeaflet';
import MultiCountryComparison from '../components/MultiCountryComparison';
import ContinentAggregation from '../components/ContinentAggregation';
import Top10Ranking from '../components/Top10Ranking';
import CountryComparison from '../components/CountryComparison';
import DataExportPanel from '../components/DataExportPanel';

const HomePage: React.FC = () => {
  return (
    <>
      {/* Global Statistics */}
      <section className="dashboard-section">
        <GlobalStats />
      </section>

      {/* Trend Indicators */}
      <section className="dashboard-section">
        <TrendIndicators days={30} />
      </section>

      {/* Trends Chart */}
      <section className="dashboard-section">
        <TrendsChart days={30} />
      </section>

      {/* World Map */}
      <section className="dashboard-section">
        <WorldMapLeaflet />
      </section>

      {/* Multi-Country Comparison */}
      <section className="dashboard-section">
        <MultiCountryComparison days={60} />
      </section>

      {/* Continent Aggregation */}
      <section className="dashboard-section">
        <ContinentAggregation days={60} />
      </section>

      {/* Top 10 Ranking */}
      <section className="dashboard-section">
        <Top10Ranking />
      </section>

      {/* Country Comparison */}
      <section className="dashboard-section">
        <CountryComparison />
      </section>

      {/* Data Export Panel */}
      <section className="dashboard-section">
        <DataExportPanel />
      </section>
    </>
  );
};

export default HomePage;
