import React from 'react';
import { FileSpreadsheet, Download, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { 
  exportProcessedPaymentFile, 
  exportSummaryReport, 
  exportExceptionReport, 
  exportAccountChangesReport 
} from '../utils/excelExporter';

export default function ReportExportSection({ verificationResults }) {
  if (!verificationResults) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <FileSpreadsheet size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Verification Reports Generated Yet</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          Please run the verification engine to unlock downloadable audit reports.
        </p>
      </div>
    );
  }

  const { summary, processedRows, exceptions, accountChanges } = verificationResults;

  const reportCards = [
    {
      title: 'Processed Payment File',
      filename: `Processed_Payments.xlsx`,
      desc: 'Original payment list enriched with PASS/EXCEPTION tags, check flags, and detailed remarks.',
      icon: FileSpreadsheet,
      onDownload: () => exportProcessedPaymentFile(processedRows, summary)
    },
    {
      title: 'Executive Summary Report',
      filename: `Verification_Summary.xlsx`,
      desc: 'High-level financial executive summary featuring total volumes, PASS rates %, and exception breakdown.',
      icon: ShieldCheck,
      onDownload: () => exportSummaryReport(summary, exceptions)
    },
    {
      title: 'Detailed Exception Report',
      filename: `Exception_Report.xlsx`,
      desc: 'Complete list of all flagged exceptions with categories, failure reasons, and approval override statuses.',
      icon: Download,
      onDownload: () => exportExceptionReport(exceptions)
    },
    {
      title: 'Account Changes Report',
      filename: `Account_Changes.xlsx`,
      desc: 'Detailed log of employee bank account changes detected between current payment batch and master records.',
      icon: ArrowUpRight,
      onDownload: () => exportAccountChangesReport(accountChanges)
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.2rem' }}>
          Audit Report Download Center
        </h3>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Download standardized Excel worksheets for banking partners, internal audit, and executive review.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {reportCards.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '190px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{report.title}</h4>
                    <p style={{ fontSize: '0.725rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{report.filename}</p>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {report.desc}
                </p>
              </div>

              <button 
                className="btn btn-primary"
                onClick={report.onDownload}
                style={{ width: '100%' }}
              >
                <Download size={15} />
                Download Excel File
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
