import React from 'react';
import { Clock, Download, FileText, CheckCircle, XCircle } from 'lucide-react';

// Mock data – this can be replaced with real API call later
const mockHistory = [
  {
    id: 1,
    type: 'financial',
    format: 'csv',
    dateRange: 'Mar 1, 2025 - Mar 31, 2025',
    generatedAt: '2025-04-01T10:30:00',
    status: 'completed',
    filename: 'financial_report_Mar2025.csv',
    size: '2.4 MB',
  },
  {
    id: 2,
    type: 'bookings',
    format: 'pdf',
    dateRange: 'Mar 1, 2025 - Mar 31, 2025',
    generatedAt: '2025-04-01T09:15:00',
    status: 'completed',
    filename: 'bookings_Mar2025.pdf',
    size: '1.8 MB',
  },
  {
    id: 3,
    type: 'occupancy',
    format: 'csv',
    dateRange: 'Mar 1, 2025 - Mar 31, 2025',
    generatedAt: '2025-03-31T14:45:00',
    status: 'failed',
    error: 'Insufficient data',
  },
  {
    id: 4,
    type: 'guests',
    format: 'excel',
    dateRange: 'All time',
    generatedAt: '2025-03-30T11:20:00',
    status: 'completed',
    filename: 'guests_export.xlsx',
    size: '3.1 MB',
  },
];

const ExportHistory: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      financial: 'Financial',
      bookings: 'Bookings',
      occupancy: 'Occupancy',
      guests: 'Guests',
      rooms: 'Rooms',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div className="p-4 border-b border-[var(--border-color)]/20">
        <h3 className="text-md font-medium text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--primary-color)]" />
          Recent Exports
        </h3>
      </div>
      <div className="divide-y divide-[var(--border-color)]/10">
        {mockHistory.length === 0 ? (
          <div className="p-4 text-center text-[var(--text-tertiary)]">
            No exports yet. Generate your first report above.
          </div>
        ) : (
          mockHistory.map((item) => (
            <div key={item.id} className="p-4 hover:bg-[var(--card-hover-bg)]/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--card-secondary-bg)]">
                    <FileText className="w-4 h-4 text-[var(--primary-color)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {getTypeLabel(item.type)} Report
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--card-secondary-bg)] text-[var(--text-secondary)] uppercase">
                        {item.format}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        {getStatusIcon(item.status)}
                        <span className={`text-xs ${
                          item.status === 'completed' ? 'text-green-500' : 
                          item.status === 'failed' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          {item.status}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-tertiary)]">
                      <span>{item.dateRange}</span>
                      <span>{new Date(item.generatedAt).toLocaleString()}</span>
                      {item.size && <span>{item.size}</span>}
                      {item.error && <span className="text-red-500">{item.error}</span>}
                    </div>
                  </div>
                </div>
                {item.status === 'completed' && (
                  <button
                    className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] 
                               hover:text-[var(--primary-color)] transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExportHistory;