import * as XLSX from 'xlsx';

export function exportProcessedPaymentFile(processedRows, summary) {
  const exportData = processedRows.map(r => ({
    "Row #": r.rowIndex,
    "Employee Code": r.empCode,
    "Employee Name": r.empName,
    "Bank Account No": r.payAcc,
    "Bank Name": r.bankName,
    "Payment Amount (₹)": r.amount,
    "Payment Date": r.paymentDate,
    "Payment Reference": r.paymentRef,
    "VERIFICATION STATUS": r.status,
    "EXCEPTION CATEGORY": r.exceptionType || 'NONE',
    "EMP CODE MATCH": r.checks.empCodeMatch ? 'PASS' : 'FAIL',
    "ACCOUNT MATCH": r.checks.bankAccountMatch ? 'PASS' : 'FAIL',
    "AMOUNT MATCH": r.checks.amountMatch ? 'PASS' : 'FAIL',
    "DUPLICATE DETECTED": r.checks.isDuplicate ? 'YES' : 'NO',
    "ACCOUNT CHANGE": r.checks.accountChangeDetected ? 'YES' : 'NO',
    "DETAILED REMARKS": r.remarks,
    "MANAGER ACTION": r.approvedStatus || 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Processed Payments");

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Processed_Payments_${dateStr}.xlsx`);
}

export function exportSummaryReport(summary, exceptions) {
  const summarySheetData = [
    { "Metric": "Company Name", "Value": summary.companyName || 'Apex Enterprise Limited' },
    { "Metric": "Verification Run Date", "Value": new Date(summary.runTimestamp).toLocaleString() },
    { "Metric": "Total Records Processed", "Value": summary.totalProcessedCount },
    { "Metric": "PASS Count", "Value": summary.passCount },
    { "Metric": "EXCEPTION Count", "Value": summary.exceptionCount },
    { "Metric": "Pass Rate (%)", "Value": `${summary.passRate}%` },
    { "Metric": "Total Processed Amount (₹)", "Value": summary.totalProcessedAmount },
    { "Metric": "Pass Amount (₹)", "Value": summary.passAmount },
    { "Metric": "Exception Amount (₹)", "Value": summary.exceptionAmount },
    { "Metric": "Account Changes Flagged", "Value": summary.accountChangesCount },
    { "Metric": "Bank Integrity Warnings", "Value": summary.bankIssuesCount },
    { "Metric": "Processing Execution Duration (ms)", "Value": summary.durationMs }
  ];

  const categoryCounts = {};
  exceptions.forEach(e => {
    categoryCounts[e.exceptionType] = (categoryCounts[e.exceptionType] || 0) + 1;
  });

  const categoryData = Object.keys(categoryCounts).map(cat => ({
    "Exception Category": cat,
    "Count": categoryCounts[cat]
  }));

  const workbook = XLSX.utils.book_new();
  const summaryWs = XLSX.utils.json_to_sheet(summarySheetData);
  const categoryWs = XLSX.utils.json_to_sheet(categoryData);

  XLSX.utils.book_append_sheet(workbook, summaryWs, "Executive Summary");
  XLSX.utils.book_append_sheet(workbook, categoryWs, "Exception Breakdown");

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Verification_Summary_${dateStr}.xlsx`);
}

export function exportExceptionReport(exceptions) {
  const exportData = exceptions.map(e => ({
    "Row #": e.rowIndex,
    "Employee Code": e.empCode,
    "Employee Name": e.empName,
    "Exception Category": e.exceptionType,
    "Bank Account No": e.payAcc,
    "Payment Amount (₹)": e.amount,
    "Payment Ref": e.paymentRef,
    "Failure Reasons": Array.isArray(e.failureReasons) ? e.failureReasons.join(' | ') : e.remarks,
    "Status": e.status,
    "Manager Action": e.managerAction || 'PENDING',
    "Manager Notes": e.managerNotes || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Exceptions");

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Exception_Report_${dateStr}.xlsx`);
}

export function exportAccountChangesReport(accountChanges) {
  const exportData = accountChanges.map(c => ({
    "Row #": c.rowIndex,
    "Employee Code": c.empCode,
    "Employee Name": c.empName,
    "Previous Bank Account": c.previousAccount,
    "New Bank Account": c.newAccount,
    "Change Date": c.changeDate,
    "History Verification Status": c.historyStatus,
    "Review Required": c.reviewRequired,
    "Approval Status": c.approvalStatus,
    "Remarks": c.remarks
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Account Changes");

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Account_Changes_${dateStr}.xlsx`);
}

export function exportAuditLogReport(auditLogs) {
  const exportData = auditLogs.map(l => ({
    "Timestamp": new Date(l.timestamp).toLocaleString(),
    "Action": l.action,
    "Operator": l.operator || 'Finance System Admin',
    "Status": l.status,
    "Records Processed": l.recordsProcessed || 0,
    "Details": l.details
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Trail");

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Audit_Trail_${dateStr}.xlsx`);
}
