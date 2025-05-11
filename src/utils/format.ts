/**
 * Format a number with commas and optional decimal places
 * @param num The number to format
 * @param decimals Number of decimal places to show (default: 0)
 * @returns Formatted number as string
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num)) return '0';
  
  // Format with commas and specified decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number to a compact string (e.g., 1.5K, 2.3M)
 * @param num The number to format
 * @param decimals Number of decimal places to show (default: 1)
 * @returns Formatted compact number as string
 */
export const formatCompactNumber = (num: number, decimals: number = 1): string => {
  if (isNaN(num)) return '0';
  
  const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(num);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param date The date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return interval === 1 
        ? `${interval} ${unit} ago`
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};
