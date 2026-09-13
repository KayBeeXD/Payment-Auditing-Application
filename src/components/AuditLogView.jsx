import React, { useState } from 'react';
import { FileText, Search, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { exportAuditLogReport } from '../utils/excelExporter';

export default function AuditLogView({ auditLogs }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.operator && l.operator.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-panel responsive-banner" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--primary-light)' }}>
            <FileText size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>System Audit Trail & Event Logs</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Audit trail recording file ingestion, engine executions, and manager overrides.
            </p>
          </div>
        </div>

        <div className="responsive-banner-buttons" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => exportAuditLogReport(auditLogs)}
          >
            <Download size={15} />
            Export Audit Trail (.xlsx)
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem 0.45rem 2rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container glass-panel">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action / Event</th>
              <th>Operator</th>
              <th>Status</th>
              <th>Records</th>
              <th>Details & Execution Logs</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td style={{ fontWeight: 600 }}>{log.action}</td>
                <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  {log.operator || 'Finance System Admin'}
                </td>
                <td>
                  {log.status === 'SUCCESS' ? (
                    <span className="badge badge-pass" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle size={11} /> SUCCESS
                    </span>
                  ) : (
                    <span className="badge badge-exception" style={{ fontSize: '0.7rem' }}>
                      <AlertCircle size={11} /> {log.status}
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{log.recordsProcessed || 0}</td>
                <td style={{ fontSize: '0.775rem', color: 'var(--text-main)', maxWidth: '380px' }}>
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
