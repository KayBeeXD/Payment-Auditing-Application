import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import Dashboard from './components/Dashboard';
import ExceptionManager from './components/ExceptionManager';
import AccountChangesView from './components/AccountChangesView';
import ReportExportSection from './components/ReportExportSection';
import ArchivingView from './components/ArchivingView';
import AuditLogView from './components/AuditLogView';
import SettingsView from './components/SettingsView';

import { runVerificationEngine } from './utils/verificationEngine';
import { getSampleDatasets } from './utils/sampleDataGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [isDark, setIsDark] = useState(true);

  // Sync theme class to document.body for full-screen seamless background
  useEffect(() => {
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  }, [isDark]);

  // Input Excel Files State
  const [filesData, setFilesData] = useState({
    payment: null,
    bank: null,
    employeeMaster: null,
    accountHistory: null
  });

  // Processing & Engine State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [verificationResults, setVerificationResults] = useState(null);

  // System State Logs & Archives
  const [archiveHistory, setArchiveHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([
    {
      timestamp: new Date().toISOString(),
      action: 'System Initialized',
      operator: 'System Administrator',
      status: 'SUCCESS',
      recordsProcessed: 0,
      details: 'Payment Verification Engine initialized successfully.'
    }
  ]);

  // App Settings
  const [config, setConfig] = useState({
    companyName: 'Apex Enterprise Limited',
    archiveFolderPath: './archives/processed_payments/',
    amountTolerance: 0.0,
    enableDuplicateCheck: true,
    enableStrictAccountCheck: true,
    columnMappings: {
      empCode: 'Emp_Code, Employee_Code, EmpID, EmployeeID',
      empName: 'Employee_Name, Full_Name, Name',
      bankAccount: 'Bank_Account_No, Account_No, BankAccount',
      amount: 'Amount, Pay_Amt, Payment_Amount',
      paymentRef: 'Payment_Ref, Ref_ID, Txn_Ref'
    }
  });

  // Automatically load sample demo dataset on first visit for zero-friction demo experience!
  useEffect(() => {
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
  }, []);

  // Execute Verification Checking Engine
  const handleRunEngine = async () => {
    if (!filesData.payment || !filesData.bank || !filesData.employeeMaster) {
      alert('Please upload Payment.xlsx, Bank.xlsx, and Employee Master.xlsx before running.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('1/6 Reading & Standardizing Data...');
    await new Promise(r => setTimeout(r, 300));

    setProcessingStep('2/6 Matching Employee Codes...');
    await new Promise(r => setTimeout(r, 300));

    setProcessingStep('3/6 Cross-referencing Bank Account Numbers...');
    await new Promise(r => setTimeout(r, 300));

    setProcessingStep('4/6 Comparing Amounts & Detecting Changes...');
    await new Promise(r => setTimeout(r, 300));

    setProcessingStep('5/6 Scanning Duplicates & Bank Integrity...');
    await new Promise(r => setTimeout(r, 300));

    setProcessingStep('6/6 Compiling Financial Reports...');
    await new Promise(r => setTimeout(r, 200));

    const results = runVerificationEngine(
      filesData.payment.rows,
      filesData.bank.rows,
      filesData.employeeMaster.rows,
      filesData.accountHistory ? filesData.accountHistory.rows : [],
      config
    );

    setVerificationResults(results);
    setIsProcessing(false);

    // Save to Archive Vault
    setArchiveHistory(prev => [results, ...prev]);

    // Log Audit Event
    setAuditLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        action: 'Verification Engine Executed',
        operator: 'Finance Manager',
        status: 'SUCCESS',
        recordsProcessed: results.summary.totalProcessedCount,
        details: `Processed ${results.summary.totalProcessedCount} rows. Pass: ${results.summary.passCount}, Exceptions: ${results.summary.exceptionCount}, Amount: ₹${results.summary.totalProcessedAmount.toLocaleString('en-IN')}`
      },
      ...prev
    ]);

    // Confetti celebration if clean run
    if (results.summary.passRate === 100) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setActiveTab('dashboard');
  };

  // Manager Approval Action Handler
  const handleUpdateExceptionStatus = (rowIndex, action, managerNotes) => {
    if (!verificationResults) return;

    const updatedExceptions = verificationResults.exceptions.map(item => {
      if (item.rowIndex === rowIndex) {
        return {
          ...item,
          managerAction: action,
          status: action === 'APPROVED' ? 'RESOLVED_APPROVED' : 'RESOLVED_REJECTED',
          managerNotes
        };
      }
      return item;
    });

    const updatedProcessedRows = verificationResults.processedRows.map(row => {
      if (row.rowIndex === rowIndex) {
        return {
          ...row,
          approvedStatus: action,
          status: action === 'APPROVED' ? 'PASS (MANAGER OVERRIDE)' : 'EXCEPTION',
          remarks: `${row.remarks} | Manager Action: ${action} (${managerNotes || 'No notes'})`
        };
      }
      return row;
    });

    setVerificationResults({
      ...verificationResults,
      exceptions: updatedExceptions,
      processedRows: updatedProcessedRows
    });

    setAuditLogs(prev => [
      {
        timestamp: new Date().toISOString(),
        action: `Manager Exception ${action}`,
        operator: 'Finance VP',
        status: 'SUCCESS',
        recordsProcessed: 1,
        details: `Row #${rowIndex} tagged ${action}. Audit Notes: ${managerNotes || 'None'}`
      },
      ...prev
    ]);
  };

  // Load archived session
  const handleLoadArchiveRun = (run) => {
    setVerificationResults(run);
    setActiveTab('dashboard');
  };

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDark={isDark} 
          setIsDark={setIsDark}
          companyName={config.companyName}
        />

        <main>
          {activeTab === 'upload' && (
            <UploadSection 
              filesData={filesData}
              setFilesData={setFilesData}
              onRunEngine={handleRunEngine}
              isProcessing={isProcessing}
              processingStep={processingStep}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard verificationResults={verificationResults} />
          )}

          {activeTab === 'exceptions' && (
            <ExceptionManager 
              exceptions={verificationResults ? verificationResults.exceptions : []}
              onUpdateExceptionStatus={handleUpdateExceptionStatus}
            />
          )}

          {activeTab === 'changes' && (
            <AccountChangesView 
              accountChanges={verificationResults ? verificationResults.accountChanges : []}
            />
          )}

          {activeTab === 'reports' && (
            <ReportExportSection verificationResults={verificationResults} />
          )}

          {activeTab === 'archives' && (
            <ArchivingView 
              archiveHistory={archiveHistory}
              onLoadArchiveRun={handleLoadArchiveRun}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogView auditLogs={auditLogs} />
          )}

          {activeTab === 'settings' && (
            <SettingsView config={config} setConfig={setConfig} />
          )}
        </main>
      </div>
    </div>
  );
}
