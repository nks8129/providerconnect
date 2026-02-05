// ============================================================================
// Export utilities for CSV download
// ============================================================================

/**
 * Convert an array of objects to CSV string
 */
export function toCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; header: string }[]
): string {
  if (data.length === 0) return '';

  // If no columns specified, use all keys from first item
  const headers = columns
    ? columns.map((c) => c.header)
    : Object.keys(data[0]);

  const keys = columns
    ? columns.map((c) => c.key)
    : (Object.keys(data[0]) as (keyof T)[]);

  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value: unknown = item[key];
        // Handle null/undefined
        if (value === null || value === undefined) return '';
        // Handle dates
        if (value instanceof Date) return value.toISOString();
        // Handle arrays
        if (Array.isArray(value)) return `"${value.join(', ')}"`;
        // Handle objects
        if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(
  data: string,
  filename: string = 'export.csv'
): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export cases to CSV
 */
export function exportCasesToCSV(
  cases: any[],
  providers: any[],
  users: any[]
): void {
  const exportData = cases.map((c) => {
    const provider = providers.find((p) => p.id === c.providerId);
    const assignee = users.find((u) => u.id === c.assigneeId);

    return {
      'Case ID': c.id,
      'Title': c.title,
      'Status': c.status,
      'Priority': c.priority,
      'Category': c.category,
      'Subcategory': c.subcategory || '',
      'Provider Name': provider?.name || '',
      'Provider NPI': provider?.npi || '',
      'Assignee': assignee?.name || 'Unassigned',
      'Channel': c.channel,
      'LOB': c.lob,
      'SLA Due': c.sla?.dueAt || '',
      'Created At': c.createdAt,
      'Updated At': c.updatedAt,
      'Resolution': c.resolution?.summary || '',
      'Disposition': c.resolution?.disposition || '',
    };
  });

  const csv = toCSV(exportData);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `cases-export-${date}.csv`);
}

/**
 * Export interactions to CSV
 */
export function exportInteractionsToCSV(
  interactions: any[],
  providers: any[],
  users: any[]
): void {
  const exportData = interactions.map((i) => {
    const provider = providers.find((p) => p.id === i.providerId);
    const creator = users.find((u) => u.id === i.createdBy);

    return {
      'Interaction ID': i.id,
      'Type': i.type,
      'Direction': i.direction,
      'Provider Name': provider?.name || '',
      'Provider NPI': provider?.npi || '',
      'Case ID': i.caseId || '',
      'Duration (min)': i.duration,
      'Sentiment': i.sentiment,
      'Summary': i.summary,
      'Logged By': creator?.name || '',
      'Occurred At': i.occurredAt,
      'Created At': i.createdAt,
    };
  });

  const csv = toCSV(exportData);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `interactions-export-${date}.csv`);
}

/**
 * Export providers to CSV
 */
export function exportProvidersToCSV(providers: any[]): void {
  const exportData = providers.map((p) => ({
    'Provider ID': p.id,
    'Name': p.name,
    'Type': p.type,
    'NPI': p.npi,
    'Tax ID': p.taxId,
    'Specialties': p.specialties.join('; '),
    'Network Status': p.networkStatus,
    'Credentialing Status': p.credentialingStatus,
    'Lines of Business': p.lobs.join('; '),
    'Tags': p.tags.join('; '),
    'Created At': p.createdAt,
  }));

  const csv = toCSV(exportData);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `providers-export-${date}.csv`);
}

/**
 * Export report data to CSV
 */
export function exportReportToCSV(
  reportData: any[],
  reportName: string
): void {
  const csv = toCSV(reportData);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `${reportName}-${date}.csv`);
}
