/**
 * Format a number with commas and optional decimal places.
 * Handles invalid numbers by returning '0'.
 * 
 * @param {number} num - The number to format
 * @param {number} [decimals=0] - Number of decimal places to show (0-20)
 * @returns {string} Formatted number as string
 * @throws {RangeError} If decimals is not between 0 and 20
 * 
 * @example
 * // Returns "1,234"
 * formatNumber(1234);
 * 
 * @example
 * // Returns "1,234.56"
 * formatNumber(1234.567, 2);
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  if (decimals < 0 || decimals > 20) {
    throw new RangeError('Decimals must be between 0 and 20');
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a number to a compact string (e.g., 1.5K, 2.3M).
 * Uses the browser's built-in compact number formatting.
 * 
 * @param {number} num - The number to format
 * @param {number} [decimals=1] - Number of decimal places to show (0-3)
 * @returns {string} Formatted compact number as string
 * @throws {RangeError} If decimals is not between 0 and 3
 * 
 * @example
 * // Returns "1.2K"
 * formatCompactNumber(1234);
 * 
 * @example
 * // Returns "1.23K"
 * formatCompactNumber(1234, 2);
 */
export const formatCompactNumber = (num: number, decimals: number = 1): string => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  if (decimals < 0 || decimals > 3) {
    throw new RangeError('Decimals must be between 0 and 3');
  }
  
  const formatter = Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: decimals,
  });
  
  return formatter.format(num);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago").
 * Automatically adjusts the unit (seconds, minutes, hours, etc.)
 * based on the time difference.
 * 
 * @param {Date|string|number} date - The date to format
 * @returns {string} Relative time string
 * @throws {Error} If date is invalid
 * 
 * @example
 * // Returns "2 days ago" (depending on current date)
 * formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  let target: Date;
  
  try {
    target = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
      
    if (isNaN(target.getTime())) {
      throw new Error('Invalid date');
    }
  } catch (error) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,   // 365 days
    month: 2592000,   // 30 days (approximate)
    week: 604800,     // 7 days
    day: 86400,       // 24 hours
    hour: 3600,       // 60 minutes
    minute: 60,       // 60 seconds
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
