import React from 'react';
import { Archive, Calendar, Clock, FileSpreadsheet, Folder, HardDrive } from 'lucide-react';
import { exportProcessedPaymentFile } from '../utils/excelExporter';

export default function ArchivingView({ archiveHistory, onLoadArchiveRun }) {
  if (!archiveHistory || archiveHistory.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Archive size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Archive Vault is Empty</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Executed verification runs will automatically be stored here for future auditing.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel responsive-banner" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Folder color="var(--primary)" size={18} />
            Verification Session Archives
          </h3>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Audit repository storing historical verification sessions and reports.
          </p>
        </div>

        <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
          {archiveHistory.length} Saved Sessions
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {archiveHistory.map((run, idx) => (
          <div key={idx} className="glass-card responsive-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--primary-light)' }}>
                <HardDrive size={20} color="var(--primary)" />
              </div>

              <div>
                <h4 style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span>Session Run #{archiveHistory.length - idx}</span>
                  <span className="badge badge-pass" style={{ fontSize: '0.7rem' }}>
                    {run.summary.passRate}% Pass Rate
                  </span>
                </h4>

                <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={13} /> {new Date(run.summary.runTimestamp).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> {new Date(run.summary.runTimestamp).toLocaleTimeString()}
                  </span>
                  <span>
                    Records: {run.summary.totalProcessedCount}
                  </span>
                  <span>
                    Value: ₹{run.summary.totalProcessedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="responsive-banner-buttons" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => onLoadArchiveRun(run)}
              >
                Inspect Session
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => exportProcessedPaymentFile(run.processedRows, run.summary)}
              >
                <FileSpreadsheet size={15} />
                Export (.xlsx)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
