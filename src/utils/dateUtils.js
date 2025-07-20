// Date formatting and utility functions

export function formatDate(date, options = {}) {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return dateObj.toLocaleString('en-US', defaultOptions);
}

export function formatRelativeTime(date) {
  if (!date) return 'N/A';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const intervals = [
    { label: 'year', ms: 31536000000 },
    { label: 'month', ms: 2592000000 },
    { label: 'week', ms: 604800000 },
    { label: 'day', ms: 86400000 },
    { label: 'hour', ms: 3600000 },
    { label: 'minute', ms: 60000 },
    { label: 'second', ms: 1000 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffMs / interval.ms);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

export function formatDuration(ms) {
  if (!ms || ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function formatShortDuration(ms) {
  if (!ms || ms < 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function isToday(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export function isYesterday(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}

export function getTimeAgo(date) {
  if (!date) return 'N/A';
  
  if (isToday(date)) {
    return `Today at ${formatDate(date, { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${formatDate(date, { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return formatRelativeTime(date);
  }
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'N/A';
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  const isSameDay = (
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  );
  
  if (isSameDay) {
    return `${formatDate(start, { month: 'short', day: 'numeric' })} ${formatDate(start, { hour: '2-digit', minute: '2-digit' })} - ${formatDate(end, { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return `${formatDate(start, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - ${formatDate(end, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
  }
}

export function getStartOfDay(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

export function getEndOfDay(date = new Date()) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date, days) {
  return addDays(date, -days);
}

export function isSameDate(date1, date2) {
  if (!date1 || !date2) return false;
  
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatDateForAPI(date) {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString();
}

export function parseDateFromAPI(dateString) {
  if (!dateString) return null;
  
  return new Date(dateString);
}