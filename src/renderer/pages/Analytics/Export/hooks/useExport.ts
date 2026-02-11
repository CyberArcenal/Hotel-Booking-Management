import { useState } from 'react';
import bookingAPI from '../../../../api/booking';
import guestAPI from '../../../../api/guest';
import roomAPI from '../../../../api/room';
import dashboardAPI from '../../../../api/dashboard';

export type ExportType = 
  | 'bookings' 
  | 'guests' 
  | 'rooms' 
  | 'financial' 
  | 'occupancy';

export interface ExportOptions {
  type: ExportType;
  format: 'csv' | 'pdf' | 'excel';
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}

interface UseExportReturn {
  loading: boolean;
  error: string | null;
  success: string | null;
  exportData: (options: ExportOptions) => Promise<void>;
  reset: () => void;
}

export const useExport = (): UseExportReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const exportData = async (options: ExportOptions) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { type, format, dateRange, filters } = options;

      switch (type) {
        case 'bookings': {
          const res = await bookingAPI.exportCSV(
            '', // filePath will be handled by backend
            { ...filters, ...dateRange },
            'admin'
          );
          if (res.status && res.data?.filePath) {
            setSuccess(`Bookings exported successfully to ${res.data.filePath}`);
          } else {
            throw new Error(res.message || 'Export failed');
          }
          break;
        }

        case 'guests': {
          const res = await guestAPI.exportToCSV(
            { ...filters, ...dateRange },
            'admin'
          );
          if (res.status && res.data?.data) {
            // Trigger download for CSV data
            downloadFile(res.data.data, res.data.filename || 'guests.csv', 'text/csv');
            setSuccess(`Guests exported successfully`);
          } else {
            throw new Error(res.message || 'Export failed');
          }
          break;
        }

        case 'rooms': {
          const res = await roomAPI.exportToCSV({
            filters: { ...filters, ...dateRange },
            user: 'admin',
          });
          if (res.status && res.data?.data) {
            downloadFile(res.data.data, res.data.filename || 'rooms.csv', 'text/csv');
            setSuccess(`Rooms exported successfully`);
          } else {
            throw new Error(res.message || 'Export failed');
          }
          break;
        }

        case 'financial': {
          if (!dateRange?.startDate || !dateRange?.endDate) {
            throw new Error('Date range is required for financial export');
          }
          const res = await dashboardAPI.generateReport({
            reportType: 'financial_summary',
            parameters: {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
            format: format === 'csv' ? 'csv' : 'pdf',
            user: 'admin',
          });
          if (res.status && res.data?.data) {
            if (format === 'csv') {
              downloadFile(res.data.data, res.data.filename || 'financial_report.csv', 'text/csv');
            } else {
              // For PDF, assume data is base64 or blob
              // This is a simplification; in real implementation you'd handle PDF blob
              alert('PDF export not fully implemented in this demo');
            }
            setSuccess(`Financial report exported successfully`);
          } else {
            throw new Error(res.message || 'Export failed');
          }
          break;
        }

        case 'occupancy': {
          if (!dateRange?.startDate || !dateRange?.endDate) {
            throw new Error('Date range is required for occupancy export');
          }
          // Use generateReport with occupancy_report type
          const res = await dashboardAPI.generateReport({
            reportType: 'occupancy_report',
            parameters: {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
            format: format === 'csv' ? 'csv' : 'pdf',
            user: 'admin',
          });
          if (res.status && res.data?.data) {
            if (format === 'csv') {
              downloadFile(res.data.data, res.data.filename || 'occupancy_report.csv', 'text/csv');
            } else {
              alert('PDF export not fully implemented in this demo');
            }
            setSuccess(`Occupancy report exported successfully`);
          } else {
            throw new Error(res.message || 'Export failed');
          }
          break;
        }

        default:
          throw new Error('Unsupported export type');
      }
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  return { loading, error, success, exportData, reset };
};