import {
  formatNumber,
  formatPercentage,
  formatCompactNumber,
  formatDate,
  formatDateTime,
  formatChartDate,
  getColorByType,
  getBackgroundColorByType
} from '../formatters';

describe('formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with French locale', () => {
      expect(formatNumber(1234567)).toMatch(/1[\s\u00A0]234[\s\u00A0]567/);
      expect(formatNumber(1000)).toMatch(/1[\s\u00A0]000/);
      expect(formatNumber(123)).toBe('123');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle invalid numbers', () => {
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(Infinity)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(15.678)).toBe('15.68%');
      expect(formatPercentage(0.5)).toBe('0.50%');
      expect(formatPercentage(100)).toBe('100.00%');
    });

    it('should handle custom decimal places', () => {
      expect(formatPercentage(15.678, 1)).toBe('15.7%');
      expect(formatPercentage(15.678, 0)).toBe('16%');
    });

    it('should handle invalid numbers', () => {
      expect(formatPercentage(NaN)).toBe('0.00%');
      expect(formatPercentage(Infinity)).toBe('0.00%');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers with suffixes', () => {
      expect(formatCompactNumber(1500000000)).toBe('1.5G');
      expect(formatCompactNumber(2500000)).toBe('2.5M');
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(500)).toBe('500');
    });

    it('should handle negative numbers', () => {
      expect(formatCompactNumber(-1500000)).toBe('-1.5M');
      expect(formatCompactNumber(-500)).toBe('-500');
    });

    it('should handle invalid numbers', () => {
      expect(formatCompactNumber(NaN)).toBe('0');
      expect(formatCompactNumber(Infinity)).toBe('0');
    });
  });

  describe('formatDate', () => {
    it('should format M/D/YY dates correctly', () => {
      expect(formatDate('1/15/22')).toBe('15/01/2022');
      expect(formatDate('12/31/21')).toBe('31/12/2021');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date');
      expect(formatDate('13/45/22')).toBe('13/45/22');
    });
  });

  describe('formatDateTime', () => {
    it('should format ISO dates correctly', () => {
      const isoDate = '2022-01-15T10:30:00.000Z';
      const result = formatDateTime(isoDate);
      expect(result).toMatch(/15\/01\/2022/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle invalid dates', () => {
      expect(formatDateTime('invalid-date')).toBe('invalid-date');
    });
  });

  describe('formatChartDate', () => {
    it('should format dates for charts', () => {
      expect(formatChartDate('1/15/22')).toBe('15 janv.');
      expect(formatChartDate('12/31/21')).toBe('31 déc.');
    });

    it('should handle invalid dates', () => {
      expect(formatChartDate('invalid-date')).toBe('invalid-date');
    });
  });

  describe('getColorByType', () => {
    it('should return correct colors for each type', () => {
      expect(getColorByType('confirmed')).toBe('#ff6b6b');
      expect(getColorByType('deaths')).toBe('#495057');
      expect(getColorByType('recovered')).toBe('#51cf66');
      expect(getColorByType('active')).toBe('#ffd43b');
    });
  });

  describe('getBackgroundColorByType', () => {
    it('should return correct background colors for each type', () => {
      expect(getBackgroundColorByType('confirmed')).toBe('#ffe0e0');
      expect(getBackgroundColorByType('deaths')).toBe('#f8f9fa');
      expect(getBackgroundColorByType('recovered')).toBe('#e7f5e7');
      expect(getBackgroundColorByType('active')).toBe('#fff9db');
    });
  });
});