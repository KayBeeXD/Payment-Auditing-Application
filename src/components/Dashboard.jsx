import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  PieChart as PieIcon, 
  BarChart3, 
  FileSpreadsheet, 
  ArrowUpRight
} from 'lucide-react';
import { exportProcessedPaymentFile, exportSummaryReport } from '../utils/excelExporter';

export default function Dashboard({ verificationResults }) {
  if (!verificationResults) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <BarChart3 size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Verification Results Available</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Please go to the <strong>Upload & Check</strong> tab and click <strong>"Run Verification Engine"</strong> to generate financial metrics.
        </p>
      </div>
    );
  }

  const { summary, processedRows, exceptions } = verificationResults;

  // Format INR currency
  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  // Group exceptions by type
  const exceptionCounts = {};
  exceptions.forEach(e => {
    exceptionCounts[e.exceptionType] = (exceptionCounts[e.exceptionType] || 0) + 1;
  });

  const categoryLabels = {
    'EMPLOYEE_CODE_MISMATCH': 'Employee Code Mismatch',
    'BANK_ACCOUNT_MISMATCH': 'Bank Account Mismatch',
    'AMOUNT_MISMATCH': 'Payment vs Bank Amount Mismatch',
    'DUPLICATE_RECORD': 'Duplicate Payment Record',
    'BANK_RECORD_NOT_FOUND': 'Bank Record Missing'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Executive KPI Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem' }}>
        {/* Total Volume */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Processed</p>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '0.2rem' }}>{summary.totalProcessedCount} Records</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                {formatINR(summary.totalProcessedAmount)}
              </p>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--primary-light)' }}>
              <DollarSign size={20} color="var(--primary)" />
            </div>
          </div>
        </div>

        {/* Pass Count & Rate */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Pass Verification</p>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.2rem' }}>
                {summary.passCount} ({summary.passRate}%)
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--success)', fontWeight: 600, marginTop: '0.2rem' }}>
                {formatINR(summary.passAmount)}
              </p>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--success-light)' }}>
              <CheckCircle2 size={20} color="var(--success)" />
            </div>
          </div>
        </div>

        {/* Exception Count & Amount */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Exceptions Flagged</p>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.2rem' }}>
                {summary.exceptionCount} Items
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--danger)', fontWeight: 600, marginTop: '0.2rem' }}>
                {formatINR(summary.exceptionAmount)}
              </p>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--danger-light)' }}>
              <AlertTriangle size={20} color="var(--danger)" />
            </div>
          </div>
        </div>

        {/* Account Variations */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Account Changes</p>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.2rem' }}>
                {summary.accountChangesCount} Flagged
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Review Required: {summary.accountChangesCount > 0 ? 'YES' : 'NO'}
              </p>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--warning-light)' }}>
              <RefreshCw size={20} color="var(--warning)" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Visual Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem' }}>
        {/* Pass vs Exception Ratio */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart3 size={16} color="var(--primary)" />
            Verification Pass Ratio
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--success)' }}>PASS ({summary.passRate}%)</span>
              <span style={{ color: 'var(--danger)' }}>EXCEPTION ({(100 - summary.passRate).toFixed(1)}%)</span>
            </div>
            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
              <div style={{ width: `${summary.passRate}%`, background: 'var(--success)', transition: 'width 0.3s ease' }} />
              <div style={{ width: `${100 - summary.passRate}%`, background: 'var(--danger)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', borderRadius: '6px', background: 'var(--success-light)' }}>
              <span style={{ fontWeight: 500, color: 'var(--success)' }}>Clean Pass Total</span>
              <span style={{ fontWeight: 600 }}>{formatINR(summary.passAmount)} ({summary.passCount} txns)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', borderRadius: '6px', background: 'var(--danger-light)' }}>
              <span style={{ fontWeight: 500, color: 'var(--danger)' }}>Flagged Exception Total</span>
              <span style={{ fontWeight: 600 }}>{formatINR(summary.exceptionAmount)} ({summary.exceptionCount} txns)</span>
            </div>
          </div>
        </div>

        {/* Exception Category Breakdown */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PieIcon size={16} color="var(--primary)" />
            Exception Categories
          </h3>

          {Object.keys(exceptionCounts).length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--success)', fontWeight: 500, fontSize: '0.85rem' }}>
              Zero exceptions flagged. All payments passed verification.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {Object.entries(exceptionCounts).map(([type, count]) => {
                const pct = Math.round((count / summary.exceptionCount) * 100);
                return (
                  <div key={type} style={{ fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 500 }}>{categoryLabels[type] || type}</span>
                      <span className="badge badge-exception" style={{ fontSize: '0.7rem' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Export Bar */}
      <div className="glass-panel responsive-banner" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>Export Processed Results</h4>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Generate audit-ready Excel worksheets with verification tags and remarks.</p>
        </div>

        <div className="responsive-banner-buttons" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => exportSummaryReport(summary, exceptions)}
          >
            <FileSpreadsheet size={15} />
            Executive Summary (.xlsx)
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => exportProcessedPaymentFile(processedRows, summary)}
          >
            <ArrowUpRight size={15} />
            Processed Payment File (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
}
