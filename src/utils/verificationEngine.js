/**
 * Automated Payment Verification Engine
 * Implements flexible header normalization and 6 core checks.
 */

// Universal flexible field getter supporting fuzzy/case-insensitive column name matching
export function getVal(row, aliases = []) {
  if (!row || typeof row !== 'object') return undefined;

  // 1. Direct exact key match
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null) {
      return row[alias];
    }
  }

  // 2. Normalized key match (ignoring case, spaces, underscores, dashes)
  const rowKeys = Object.keys(row);
  for (const alias of aliases) {
    const cleanAlias = String(alias).toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedKey = rowKeys.find(k => String(k).toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlias);
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return row[matchedKey];
    }
  }

  return undefined;
}

// Safely format bank account numbers (handling numbers, strings, and scientific notation)
export function formatAccountNo(val) {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  if (str.includes('e+') || str.includes('E+')) {
    const num = Number(str);
    if (!isNaN(num)) return BigInt(num).toString();
  }
  return str.replace(/[^0-9A-Za-z]/g, '');
}

export function runVerificationEngine(
  paymentRows = [],
  bankRows = [],
  employeeMasterRows = [],
  accountHistoryRows = [],
  config = {}
) {
  const startTime = Date.now();

  const normStr = (val) => String(val || '').trim().toUpperCase();
  const normAmt = (val) => {
    const parsed = parseFloat(String(val || 0).replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  };

  // Specific aliases to prevent cross-contamination between Previous vs Current accounts
  const EMP_CODE_ALIASES = ['Employee_Code', 'Emp_Code', 'EmpCode', 'EmployeeCode', 'Employee_ID', 'Emp_ID', 'EmpID'];
  const EMP_NAME_ALIASES = ['Employee_Name', 'Full_Name', 'FullName', 'Emp_Name', 'Name', 'Beneficiary_Name'];
  
  const PREV_ACC_ALIASES = ['Previous_Account_Number', 'Previous_Account_No', 'Old_Account', 'Prev_Account', 'Previous_Account'];
  const CURR_ACC_ALIASES = ['Current_Account_Number', 'Current_Account_No', 'New_Account_Number', 'New_Account_No', 'New_Account', 'Current_Account'];
  const MASTER_ACC_ALIASES = ['Approved_Account_Number', 'Bank_Account_No', 'Account_No', 'BankAccount', 'Bank_Account', 'Account_Number', 'AccountNo'];
  const PAY_ACC_ALIASES = ['Account_Number', 'Bank_Account_No', 'Account_No', 'BankAccount', 'Bank_Account', 'AccountNo'];

  const AMT_ALIASES = ['Payment_Amount', 'Credit_Amount', 'Amount', 'Pay_Amt', 'PaymentAmount', 'PayAmount', 'Txn_Amount'];
  const DATE_ALIASES = ['Effective_Date', 'Change_Date', 'Payment_Date', 'Date', 'Pay_Date', 'Value_Date'];
  const REF_ALIASES = ['Transaction_Ref', 'Payment_Ref', 'Txn_Ref', 'Ref_ID', 'Ref_Code', 'Txn_ID', 'Reference_Code', 'Transaction_ID'];
  const STATUS_ALIASES = ['Approval_Status', 'Verification_Status', 'Status', 'Transaction_Status', 'Active_Status'];
  const REMARKS_ALIASES = ['Change_Remarks', 'Remarks', 'Notes', 'Reason'];

  // 1. Build Employee Master Lookup Map
  const employeeMasterMap = new Map();
  employeeMasterRows.forEach(emp => {
    const code = normStr(getVal(emp, EMP_CODE_ALIASES));
    if (code) {
      employeeMasterMap.set(code, {
        empCode: code,
        fullName: getVal(emp, EMP_NAME_ALIASES) || '',
        status: normStr(getVal(emp, STATUS_ALIASES) || 'ACTIVE'),
        bankAccountNo: formatAccountNo(getVal(emp, MASTER_ACC_ALIASES)),
        companyName: getVal(emp, ['Company_Name', 'Company']) || config.companyName || 'Apex Enterprise Limited',
        department: getVal(emp, ['Department', 'Dept']) || '',
        raw: emp
      });
    }
  });

  // 2. Parse Account History Rows
  const registeredAccountHistory = [];
  accountHistoryRows.forEach((hist, idx) => {
    const code = normStr(getVal(hist, EMP_CODE_ALIASES));
    const empMaster = employeeMasterMap.get(code);
    const prevAcc = formatAccountNo(getVal(hist, PREV_ACC_ALIASES));
    const currAcc = formatAccountNo(getVal(hist, CURR_ACC_ALIASES));
    const date = getVal(hist, DATE_ALIASES) || '';
    const status = normStr(getVal(hist, STATUS_ALIASES) || 'APPROVED');
    const remarks = getVal(hist, REMARKS_ALIASES) || 'Registered bank account update';

    if (code || prevAcc || currAcc) {
      registeredAccountHistory.push({
        rowIndex: idx + 1,
        empCode: code,
        empName: getVal(hist, EMP_NAME_ALIASES) || (empMaster ? empMaster.fullName : ''),
        previousAccount: prevAcc || 'N/A',
        newAccount: currAcc || (empMaster ? empMaster.bankAccountNo : 'N/A'),
        changeDate: date,
        historyStatus: status,
        reviewRequired: status === 'APPROVED' ? 'NO' : 'YES',
        approvalStatus: status,
        remarks
      });
    }
  });

  // 3. Build Bank Transactions Lookup Maps
  const bankTxnRefMap = new Map();
  const bankTxnAccMap = new Map();
  bankRows.forEach((b, idx) => {
    const refCode = normStr(getVal(b, REF_ALIASES));
    const accNo = formatAccountNo(getVal(b, PAY_ACC_ALIASES));
    const amt = normAmt(getVal(b, AMT_ALIASES));
    const status = normStr(getVal(b, STATUS_ALIASES) || 'SUCCESS');

    const bankRecord = {
      rowIndex: idx + 1,
      refCode,
      accNo,
      amount: amt,
      status,
      beneficiaryName: getVal(b, EMP_NAME_ALIASES) || '',
      raw: b
    };

    if (refCode) bankTxnRefMap.set(refCode, bankRecord);
    if (accNo) {
      if (!bankTxnAccMap.has(accNo)) bankTxnAccMap.set(accNo, []);
      bankTxnAccMap.get(accNo).push(bankRecord);
    }
  });

  // Track seen payments for Duplicate Check
  const seenPaymentKeys = new Map();

  const processedRows = [];
  const exceptions = [];
  const accountChanges = [...registeredAccountHistory]; // Include registered history records

  let passCount = 0;
  let exceptionCount = 0;
  let totalProcessedAmount = 0;
  let passAmount = 0;
  let exceptionAmount = 0;

  // 4. Process Payment Rows
  paymentRows.forEach((pay, index) => {
    const rowIndex = index + 1;
    const empCode = normStr(getVal(pay, EMP_CODE_ALIASES));
    const empName = getVal(pay, EMP_NAME_ALIASES) || '';
    const payAcc = formatAccountNo(getVal(pay, PAY_ACC_ALIASES));
    const amt = normAmt(getVal(pay, AMT_ALIASES));
    const payDate = getVal(pay, DATE_ALIASES) || new Date().toISOString().split('T')[0];
    const payRef = normStr(getVal(pay, REF_ALIASES) || `PAY-${rowIndex}`);

    totalProcessedAmount += amt;

    const rowResult = {
      rowIndex,
      empCode,
      empName,
      payAcc,
      amount: amt,
      paymentDate: payDate,
      paymentRef: payRef,
      bankName: pay.Bank_Name || 'Standard Bank',
      checks: {
        empCodeMatch: false,
        bankAccountMatch: false,
        amountMatch: false,
        accountChangeDetected: false,
        isDuplicate: false,
        bankTxnFound: false
      },
      status: 'PASS',
      failureReasons: [],
      exceptionType: null,
      remarks: 'Payment verified cleanly.',
      reviewRequired: 'NO',
      approvedStatus: 'APPROVED'
    };

    // --- CHECK 1: Employee Code Match ---
    const empMaster = employeeMasterMap.get(empCode);
    if (!empMaster) {
      rowResult.checks.empCodeMatch = false;
      rowResult.failureReasons.push(`Employee Code ${empCode} not found in Employee Master database.`);
      rowResult.exceptionType = 'EMPLOYEE_CODE_MISMATCH';
    } else {
      rowResult.checks.empCodeMatch = true;
      if (!rowResult.empName) rowResult.empName = empMaster.fullName;
    }

    // --- CHECK 2 & 4: Bank Account Match & Unregistered Account Change Detection ---
    if (empMaster) {
      const masterAcc = empMaster.bankAccountNo;
      if (payAcc === masterAcc) {
        rowResult.checks.bankAccountMatch = true;
      } else {
        rowResult.checks.bankAccountMatch = false;
        rowResult.failureReasons.push(`Bank A/C (${payAcc}) does not match Employee Master A/C (${masterAcc}).`);
        if (!rowResult.exceptionType) rowResult.exceptionType = 'BANK_ACCOUNT_MISMATCH';

        // Add Unregistered Account Change entry
        rowResult.checks.accountChangeDetected = true;
        rowResult.reviewRequired = 'YES';
        rowResult.approvedStatus = 'PENDING_REVIEW';

        accountChanges.unshift({
          rowIndex,
          empCode,
          empName: rowResult.empName,
          previousAccount: masterAcc || 'N/A',
          newAccount: payAcc,
          changeDate: payDate,
          historyStatus: 'UNREGISTERED_CHANGE',
          reviewRequired: 'YES',
          approvalStatus: 'PENDING_REVIEW',
          remarks: `Payment bank account (${payAcc}) differs from Master account (${masterAcc}).`
        });
      }
    }

    // --- CHECK 3: Compare Amounts against Bank Statement ---
    let matchingBankRecord = bankTxnRefMap.get(payRef);
    if (!matchingBankRecord && payAcc) {
      const txnsForAcc = bankTxnAccMap.get(payAcc) || [];
      matchingBankRecord = txnsForAcc.find(t => Math.abs(t.amount - amt) < 0.01);
    }

    if (!matchingBankRecord) {
      rowResult.checks.bankTxnFound = false;
      rowResult.checks.amountMatch = false;
      rowResult.failureReasons.push(`Transaction ${payRef} / A/C ${payAcc} not found in Bank Statement file.`);
      if (!rowResult.exceptionType) rowResult.exceptionType = 'BANK_RECORD_NOT_FOUND';
    } else {
      rowResult.checks.bankTxnFound = true;
      if (Math.abs(matchingBankRecord.amount - amt) < 0.01) {
        rowResult.checks.amountMatch = true;
      } else {
        rowResult.checks.amountMatch = false;
        rowResult.failureReasons.push(
          `Amount Mismatch: Payment amount is ₹${amt.toLocaleString('en-IN')}, but Bank Statement Credit Amount is ₹${matchingBankRecord.amount.toLocaleString('en-IN')}.`
        );
        if (!rowResult.exceptionType) rowResult.exceptionType = 'AMOUNT_MISMATCH';
      }
    }

    // --- CHECK 5: Detect Duplicates ---
    const dupKey = `${empCode}_${payAcc}_${amt}`;
    if (seenPaymentKeys.has(dupKey)) {
      const prevRowIndex = seenPaymentKeys.get(dupKey);
      rowResult.checks.isDuplicate = true;
      rowResult.failureReasons.push(`Duplicate payment entry detected (matches Row #${prevRowIndex}).`);
      if (!rowResult.exceptionType) rowResult.exceptionType = 'DUPLICATE_RECORD';
    } else {
      seenPaymentKeys.set(dupKey, rowIndex);
    }

    // Determine Final Row Status
    if (rowResult.failureReasons.length > 0) {
      rowResult.status = 'EXCEPTION';
      rowResult.remarks = rowResult.failureReasons.join(' | ');
      exceptionCount++;
      exceptionAmount += amt;

      exceptions.push({
        rowIndex,
        empCode,
        empName: rowResult.empName,
        exceptionType: rowResult.exceptionType || 'DATA_VALIDATION_ERROR',
        payAcc,
        amount: amt,
        paymentRef: payRef,
        failureReasons: rowResult.failureReasons,
        remarks: rowResult.remarks,
        status: 'OPEN_EXCEPTION',
        managerAction: 'NONE',
        managerNotes: ''
      });
    } else {
      rowResult.status = 'PASS';
      passCount++;
      passAmount += amt;
    }

    processedRows.push(rowResult);
  });

  // --- CHECK 6: Validate Bank Statement Integrity ---
  const bankFileIssues = [];
  bankRows.forEach((b, idx) => {
    const acc = formatAccountNo(getVal(b, PAY_ACC_ALIASES));
    const amt = normAmt(getVal(b, AMT_ALIASES));
    if (!acc) bankFileIssues.push(`Bank Statement Row #${idx + 1}: Missing Account Number.`);
    if (amt <= 0) bankFileIssues.push(`Bank Statement Row #${idx + 1}: Invalid or zero credit amount.`);
  });

  const durationMs = Date.now() - startTime;

  return {
    summary: {
      totalProcessedCount: paymentRows.length,
      passCount,
      exceptionCount,
      accountChangesCount: accountChanges.length,
      bankIssuesCount: bankFileIssues.length,
      passRate: paymentRows.length ? Math.round((passCount / paymentRows.length) * 1000) / 10 : 0,
      totalProcessedAmount,
      passAmount,
      exceptionAmount,
      durationMs,
      companyName: config.companyName || 'Apex Enterprise Limited',
      runTimestamp: new Date().toISOString()
    },
    processedRows,
    exceptions,
    accountChanges,
    bankFileIssues
  };
}
