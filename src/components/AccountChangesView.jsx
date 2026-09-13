import React from 'react';
import { RefreshCw, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { exportAccountChangesReport } from '../utils/excelExporter';

export default function AccountChangesView({ accountChanges }) {
  if (!accountChanges || accountChanges.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)' }}>No Bank Account Changes Detected</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          All payment bank accounts match Employee Master records.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--warning-light)' }}>
            <RefreshCw size={18} color="var(--warning)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Bank Account Change Monitor</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Cross-references payment accounts against Employee Master & Account History logs.
            </p>
          </div>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => exportAccountChangesReport(accountChanges)}
        >
          <FileSpreadsheet size={15} />
          Export Account Changes (.xlsx)
        </button>
      </div>

      {/* Account Changes Table */}
      <div className="table-container glass-panel">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Row #</th>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Previous Bank A/C</th>
              <th>New Bank A/C</th>
              <th>Change Log Date</th>
              <th>History Status</th>
              <th>Review Required</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {accountChanges.map((change, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 600, color: 'var(--text-dim)' }}>#{change.rowIndex || index + 1}</td>
                <td style={{ fontWeight: 600 }}>{change.empCode}</td>
                <td style={{ fontWeight: 500 }}>{change.empName}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                  {change.previousAccount && change.previousAccount !== 'N/A' ? change.previousAccount : <span style={{ color: 'var(--text-dim)' }}>N/A</span>}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)' }}>
                  {change.newAccount && change.newAccount !== 'N/A' ? change.newAccount : <span style={{ color: 'var(--text-dim)' }}>N/A</span>}
                </td>
                <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{change.changeDate || 'N/A'}</td>
                <td>
                  {change.historyStatus === 'APPROVED' ? (
                    <span className="badge badge-pass" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle size={11} /> APPROVED
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {change.historyStatus}
                    </span>
                  )}
                </td>
                <td>
                  {change.reviewRequired === 'YES' ? (
                    <span className="badge badge-exception" style={{ fontSize: '0.7rem' }}>
                      <AlertCircle size={11} /> YES
                    </span>
                  ) : (
                    <span className="badge badge-pass" style={{ fontSize: '0.7rem' }}>
                      NO
                    </span>
                  )}
                </td>
                <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                  {change.remarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
