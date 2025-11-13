/**
 * Chart and visualization constants used across the application
 */

// Gender colors for charts and visualizations
export const GENDER_COLORS: Record<string, string> = {
  male: '#1d4ed8',
  female: '#f97316',
  other: '#6b7280',
  'No Data': '#d1d5db',
};

// General chart colors for pie charts, bar charts, etc.
export const CHART_COLORS = {
  PRIMARY: ['#2563eb', '#1e3a8a', '#64748b'],
  BLUE_SHADES: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  ORANGE_SHADES: ['#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412'],
  GREEN_SHADES: ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'],
} as const;

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  awaiting: '#f59e0b',
  submitted: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
  pending: '#f59e0b',
};

// Chart dimensions (optional, can be used for consistent sizing)
export const CHART_DIMENSIONS = {
  SMALL: { width: 300, height: 200 },
  MEDIUM: { width: 500, height: 300 },
  LARGE: { width: 700, height: 400 },
} as const;
