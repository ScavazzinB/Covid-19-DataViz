export const formatNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '0';

  // Use French locale for number formatting (spaces as thousands separator)
  return num.toLocaleString('fr-FR');
};

export const formatPercentage = (num: number, decimals: number = 2): string => {
  if (isNaN(num) || !isFinite(num)) return '0.00%';

  return `${num.toFixed(decimals)}%`;
};

export const formatCompactNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000) {
    return `${sign}${(absNum / 1000000000).toFixed(1)}G`;
  } else if (absNum >= 1000000) {
    return `${sign}${(absNum / 1000000).toFixed(1)}M`;
  } else if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(1)}K`;
  } else {
    return `${sign}${absNum}`;
  }
};

export const formatDate = (dateString: string): string => {
  try {
    // Handle M/D/YY format from Johns Hopkins data
    const parts = dateString.split('/');
    if (parts.length !== 3) {
      return dateString;
    }

    const [month, day, year] = parts.map(Number);

    // Basic validation
    if (isNaN(month) || isNaN(day) || isNaN(year)) {
      return dateString;
    }

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return dateString;
    }

    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    const date = new Date(fullYear, month - 1, day);

    if (isNaN(date.getTime())) {
      return dateString; // Return original if parsing fails
    }

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minutes`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heures`;
    } else if (diffDays < 30) {
      return `Il y a ${diffDays} jours`;
    } else {
      return formatDate(dateString);
    }
  } catch {
    return dateString;
  }
};

export const formatChartDate = (dateString: string): string => {
  try {
    const [month, day, year] = dateString.split('/').map(Number);
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    const date = new Date(fullYear, month - 1, day);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const getColorByType = (type: 'confirmed' | 'deaths' | 'recovered' | 'active'): string => {
  const colors = {
    confirmed: '#ff6b6b',
    deaths: '#495057',
    recovered: '#51cf66',
    active: '#ffd43b'
  };

  return colors[type];
};

export const getBackgroundColorByType = (type: 'confirmed' | 'deaths' | 'recovered' | 'active'): string => {
  const colors = {
    confirmed: '#ffe0e0',
    deaths: '#f8f9fa',
    recovered: '#e7f5e7',
    active: '#fff9db'
  };

  return colors[type];
};