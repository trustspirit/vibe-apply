/**
 * Data export utilities
 */

import type { Application } from '@vibe-apply/shared';

/**
 * Escapes a CSV cell value
 */
const escapeCSVCell = (value: string | number): string => {
  const cell = String(value ?? '');
  if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
};

/**
 * Exports approved applications to CSV file
 */
export const exportApprovedApplicationsToCSV = (applications: Application[]): void => {
  if (!applications.length) {
    return;
  }

  const headers = [
    'Name',
    'Email',
    'Phone',
    'Age',
    'Gender',
    'Stake',
    'Ward',
    'Status',
    'Submitted At',
    'Last Updated',
    'More Info',
  ];

  const rows = applications.map((app) => [
    app.name,
    app.email,
    app.phone,
    app.age ?? '',
    app.gender ?? '',
    app.stake,
    app.ward,
    app.status,
    new Date(app.createdAt).toLocaleString(),
    new Date(app.updatedAt).toLocaleString(),
    app.moreInfo?.replace(/\r?\n/g, ' ') ?? '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map(escapeCSVCell).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `approved-applications-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
