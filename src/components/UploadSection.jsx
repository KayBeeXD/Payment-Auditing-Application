import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Play, 
  FileText, 
  Layers, 
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getSampleDatasets, downloadSampleExcel } from '../utils/sampleDataGenerator';

export default function UploadSection({
  filesData,
  setFilesData,
  onRunEngine,
  isProcessing,
  processingStep
}) {
  const [dragActive, setDragActive] = useState(null);

  const fileSlots = [
    {
      id: 'payment',
      title: 'Payment.xlsx',
      subtitle: "Today's payment transaction batch",
      icon: FileSpreadsheet,
      sampleKey: 'paymentData'
    },
    {
      id: 'bank',
      title: 'Bank.xlsx',
      subtitle: 'Bank transaction statement records',
      icon: Database,
      sampleKey: 'bankData'
    },
    {
      id: 'employeeMaster',
      title: 'Employee Master.xlsx',
      subtitle: 'Approved employee bank accounts',
      icon: Layers,
      sampleKey: 'employeeMasterData'
    },
    {
      id: 'accountHistory',
      title: 'Account History.xlsx',
      subtitle: 'Historical bank account log (Optional)',
      icon: FileText,
      sampleKey: 'accountHistoryData'
    }
  ];

  const handleFileUpload = (slotId, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);

        setFilesData(prev => ({
          ...prev,
          [slotId]: {
            fileName: file.name,
            fileSize: (file.size / 1024).toFixed(1) + ' KB',
            rows: jsonRows,
            uploadedAt: new Date().toLocaleTimeString()
          }
        }));
      } catch (err) {
        alert(`Failed to parse file ${file.name}. Please ensure it is a valid Excel or CSV file.`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadSampleDataset = () => {
    const samples = getSampleDatasets();
    setFilesData({
      payment: {
        fileName: 'Payment_Demo_Sep2026.xlsx',
        fileSize: '18.4 KB',
        rows: samples.paymentData,
        uploadedAt: new Date().toLocaleTimeString()
      },
      bank: {
        fileName: 'Bank_Statement_Sep2026.xlsx',
        fileSize: '14.2 KB',
        rows: samples.bankData,
        uploadedAt: new Date().toLocaleTimeString()
      },
      employeeMaster: {
        fileName: 'Employee_Master_Enterprise.xlsx',
        fileSize: '22.0 KB',
        rows: samples.employeeMasterData,
        uploadedAt: new Date().toLocaleTimeString()
      },
      accountHistory: {
        fileName: 'Account_History_Logs.xlsx',
        fileSize: '9.6 KB',
        rows: samples.accountHistoryData,
        uploadedAt: new Date().toLocaleTimeString()
      }
    });
  };

  const isReadyToRun = filesData.payment && filesData.bank && filesData.employeeMaster;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-panel responsive-banner" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Data Import & Reconciliation Workspace
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.15rem' }}>
            Upload input files or load the enterprise sample dataset to run complete verification checks.
          </p>
        </div>

        <div className="responsive-banner-buttons" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const samples = getSampleDatasets();
              downloadSampleExcel(samples.paymentData, 'Payment_Template');
              downloadSampleExcel(samples.bankData, 'Bank_Template');
              downloadSampleExcel(samples.employeeMasterData, 'Employee_Master_Template');
              downloadSampleExcel(samples.accountHistoryData, 'Account_History_Template');
            }}
            title="Download Template Excel Files"
          >
            <FileSpreadsheet size={15} />
            Download Templates
          </button>

          <button 
            className="btn btn-primary"
            onClick={handleLoadSampleDataset}
          >
            <RefreshCw size={15} />
            Load Sample Dataset
          </button>
        </div>
      </div>

      {/* 4 File Drag-and-Drop Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '1rem' }}>
        {fileSlots.map(slot => {
          const Icon = slot.icon;
          const uploaded = filesData[slot.id];
          const isDragging = dragActive === slot.id;

          return (
            <div 
              key={slot.id}
              className="glass-card"
              onDragOver={(e) => { e.preventDefault(); setDragActive(slot.id); }}
              onDragLeave={() => setDragActive(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(null);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(slot.id, e.dataTransfer.files[0]);
                }
              }}
              style={{
                borderColor: isDragging ? 'var(--primary)' : uploaded ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '200px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'inline-flex'
                  }}>
                    <Icon size={18} />
                  </div>

                  {uploaded ? (
                    <span className="badge badge-pass" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={12} /> {uploaded.rows.length} Rows
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      Pending Upload
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>{slot.title}</h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>{slot.subtitle}</p>

                {uploaded ? (
                  <div style={{
                    padding: '0.65rem',
                    borderRadius: '6px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.775rem'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>{uploaded.fileName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.725rem' }}>
                      <span>Size: {uploaded.fileSize}</span>
                      <span>Time: {uploaded.uploadedAt}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '1rem 0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <Upload size={18} color="var(--text-muted)" style={{ margin: '0 auto 0.35rem' }} />
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Drag & Drop file or click to browse</p>
                  </div>
                )}
              </div>

              <input 
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(slot.id, e.target.files[0])}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Main Action CTA */}
      <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>
              <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
              <span>{processingStep || 'Executing Verification Engine...'}</span>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onRunEngine}
            disabled={!isReadyToRun}
            style={{
              padding: '0.65rem 2rem',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <Play size={16} fill="currentColor" />
            Run Verification Engine
          </button>
        )}
      </div>
    </div>
  );
}
