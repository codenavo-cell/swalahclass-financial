import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  KeyRound,
  User,
  Receipt,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, profile } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.adminEmail.toLowerCase().includes(q) ||
        (log.recordId && log.recordId.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (selectedAction !== 'all' && log.action !== selectedAction) return false;

      return true;
    });
  }, [auditLogs, searchQuery, selectedAction]);

  const exportAuditCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Action', 'Admin Email', 'Record ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.action,
      l.adminEmail,
      l.recordId || '',
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Class_${profile.className}_Audit_Logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('CLEARED')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('CREATED') || action.includes('ADDED')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-slate-800" />
            <span>Immutable Security Audit Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking all administrator operations, mutations, and sessions
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, details, admin email, record ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
          >
            <option value="all">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="STUDENT_CREATED">STUDENT_CREATED</option>
            <option value="STUDENT_EDITED">STUDENT_EDITED</option>
            <option value="STUDENT_DELETED">STUDENT_DELETED</option>
            <option value="TRANSACTION_CREATED">TRANSACTION_CREATED</option>
            <option value="EXPENSE_ADDED">EXPENSE_ADDED</option>
            <option value="TRANSACTION_DELETED">TRANSACTION_DELETED</option>
            <option value="SETTINGS_CHANGED">SETTINGS_CHANGED</option>
            <option value="DATA_EXPORTED">DATA_EXPORTED</option>
            <option value="DATA_RESTORED">DATA_RESTORED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin Email</th>
                <th className="py-3 px-4">Record Ref</th>
                <th className="py-3 px-4">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(
                          log.action,
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{log.adminEmail}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.recordId || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-md">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
