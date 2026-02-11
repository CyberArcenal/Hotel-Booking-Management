// src/pages/Audit/components/AuditTable.tsx
import React, { useState } from 'react';
import { Eye, Clock } from 'lucide-react';
import type { AuditLogEntry } from '../../../api/audit';

interface AuditTableProps {
  logs: AuditLogEntry[];
  loading: boolean;
}

const AuditTable: React.FC<AuditTableProps> = ({ logs, loading }) => {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg border border-[var(--border-color)]/20">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-black text-[var(--text-primary)] border-b border-[var(--border-color)]/20">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Entity</th>
              <th className="px-4 py-3 text-left font-medium">Entity ID</th>
              <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                  <div className="flex justify-center items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--border-color)]/10 hover:bg-[var(--card-hover-bg)]/20 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text-primary)]">#{log.id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full 
                                   bg-[var(--primary-color)]/20 text-[var(--primary-color)] 
                                   border border-[var(--primary-color)]/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{log.entity}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{log.entityId}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{log.user || 'System'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedEntry(log)}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] 
                               text-[var(--text-secondary)] hover:text-[var(--primary-color)] 
                               transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]/20">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-1 text-[var(--text-secondary)]">
                <span className="font-medium">ID:</span>
                <span className="col-span-2 text-[var(--text-primary)]">{selectedEntry.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[var(--text-secondary)]">
                <span className="font-medium">Action:</span>
                <span className="col-span-2 text-[var(--text-primary)]">{selectedEntry.action}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[var(--text-secondary)]">
                <span className="font-medium">Entity:</span>
                <span className="col-span-2 text-[var(--text-primary)]">{selectedEntry.entity}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[var(--text-secondary)]">
                <span className="font-medium">Entity ID:</span>
                <span className="col-span-2 text-[var(--text-primary)]">{selectedEntry.entityId}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[var(--text-secondary)]">
                <span className="font-medium">Timestamp:</span>
                <span className="col-span-2 text-[var(--text-primary)]">
                  {new Date(selectedEntry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[var(--text-secondary)]">
                <span className="font-medium">User:</span>
                <span className="col-span-2 text-[var(--text-primary)]">{selectedEntry.user || 'System'}</span>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-[var(--border-color)]/20">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-[var(--primary-color)] text-black rounded-lg 
                         hover:bg-[var(--primary-hover)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuditTable;