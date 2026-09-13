import * as XLSX from 'xlsx';

export const COMPANY_NAME = 'Apex Enterprise Limited';

// Pre-configured realistic test dataset matching exact user Excel images
export function getSampleDatasets() {
  const paymentData = [
    {
      "Employee_Code": "EMP001",
      "Employee_Name": "Aarav Sharma",
      "Account_Number": "10012345678",
      "Payment_Amount": 45000,
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9001"
    },
    {
      "Employee_Code": "EMP002",
      "Employee_Name": "Sneha Patel",
      "Account_Number": "99999999999", // Mismatch with Master A/C 10023456789
      "Payment_Amount": 52000,
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9002"
    },
    {
      "Employee_Code": "EMP003",
      "Employee_Name": "Rohan Das",
      "Account_Number": "10034567890",
      "Payment_Amount": 60000, // Mismatch with Bank Credit Amount 55000
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9003"
    },
    {
      "Employee_Code": "EMP004",
      "Employee_Name": "Priya Singh",
      "Account_Number": "10045678901",
      "Payment_Amount": 38000,
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9004"
    },
    {
      "Employee_Code": "EMP004", // Duplicate payment entry
      "Employee_Name": "Priya Singh",
      "Account_Number": "10045678901",
      "Payment_Amount": 38000,
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9005"
    },
    {
      "Employee_Code": "EMP999", // Employee code does not exist in Employee Master
      "Employee_Name": "Vikram Rao",
      "Account_Number": "10099999999",
      "Payment_Amount": 41000,
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9006"
    },
    {
      "Employee_Code": "EMP005",
      "Employee_Name": "Ananya Roy",
      "Account_Number": "10055555555",
      "Payment_Amount": 49000,
      "Payment_Date": "13-09-2026",
      "Transaction_Ref": "TXN9007"
    }
  ];

  const bankData = [
    {
      "Transaction_Ref": "TXN9001",
      "Account_Number": "10012345678",
      "Beneficiary_Name": "Aarav Sharma",
      "Credit_Amount": 45000,
      "Transaction_Status": "SUCCESS"
    },
    {
      "Transaction_Ref": "TXN9002",
      "Account_Number": "99999999999",
      "Beneficiary_Name": "Sneha Patel",
      "Credit_Amount": 52000,
      "Transaction_Status": "SUCCESS"
    },
    {
      "Transaction_Ref": "TXN9003",
      "Account_Number": "10034567890",
      "Beneficiary_Name": "Rohan Das",
      "Credit_Amount": 55000, // Bank recorded 55000 vs Payment 60000
      "Transaction_Status": "SUCCESS"
    },
    {
      "Transaction_Ref": "TXN9004",
      "Account_Number": "10045678901",
      "Beneficiary_Name": "Priya Singh",
      "Credit_Amount": 38000,
      "Transaction_Status": "SUCCESS"
    },
    {
      "Transaction_Ref": "TXN9005",
      "Account_Number": "10045678901",
      "Beneficiary_Name": "Priya Singh",
      "Credit_Amount": 38000,
      "Transaction_Status": "SUCCESS"
    },
    {
      "Transaction_Ref": "TXN9006",
      "Account_Number": "10099999999",
      "Beneficiary_Name": "Vikram Rao",
      "Credit_Amount": 41000,
      "Transaction_Status": "SUCCESS"
    },
    {
      "Transaction_Ref": "TXN9007",
      "Account_Number": "10055555555",
      "Beneficiary_Name": "Ananya Roy",
      "Credit_Amount": 49000,
      "Transaction_Status": "SUCCESS"
    }
  ];

  const employeeMasterData = [
    {
      "Employee_Code": "EMP001",
      "Employee_Name": "Aarav Sharma",
      "Approved_Account_Number": "10012345678",
      "Company_Name": "Apex Enterprise Limited",
      "Department": "Operations",
      "Status": "Active"
    },
    {
      "Employee_Code": "EMP002",
      "Employee_Name": "Sneha Patel",
      "Approved_Account_Number": "10023456789", // Master account is 10023456789
      "Company_Name": "Apex Enterprise Limited",
      "Department": "Finance",
      "Status": "Active"
    },
    {
      "Employee_Code": "EMP003",
      "Employee_Name": "Rohan Das",
      "Approved_Account_Number": "10034567890",
      "Company_Name": "Apex Enterprise Limited",
      "Department": "Logistics",
      "Status": "Active"
    },
    {
      "Employee_Code": "EMP004",
      "Employee_Name": "Priya Singh",
      "Approved_Account_Number": "10045678901",
      "Company_Name": "Apex Enterprise Limited",
      "Department": "Technology",
      "Status": "Active"
    },
    {
      "Employee_Code": "EMP005",
      "Employee_Name": "Ananya Roy",
      "Approved_Account_Number": "10055555555",
      "Company_Name": "Apex Enterprise Limited",
      "Department": "Human Resources",
      "Status": "Active"
    },
    {
      "Employee_Code": "EMP006",
      "Employee_Name": "Kabir Mehta",
      "Approved_Account_Number": "10067890123",
      "Company_Name": "Apex Enterprise Limited",
      "Department": "Operations",
      "Status": "Active"
    }
  ];

  const accountHistoryData = [
    {
      "Employee_Code": "EMP001",
      "Previous_Account_Number": "10011111111",
      "Current_Account_Number": "10012345678",
      "Effective_Date": "15-11-2025",
      "Approval_Status": "Approved",
      "Change_Remarks": "Salary bank branch switch"
    },
    {
      "Employee_Code": "EMP005",
      "Previous_Account_Number": "10051111111",
      "Current_Account_Number": "10055555555",
      "Effective_Date": "20-08-2026",
      "Approval_Status": "Approved",
      "Change_Remarks": "Primary payroll update"
    },
    {
      "Employee_Code": "EMP002",
      "Previous_Account_Number": "10020000000",
      "Current_Account_Number": "10023456789",
      "Effective_Date": "10-01-2026",
      "Approval_Status": "Approved",
      "Change_Remarks": "Initial onboarding correction"
    }
  ];

  return { paymentData, bankData, employeeMasterData, accountHistoryData };
}

// Download sample Excel file helper
export function downloadSampleExcel(data, fileName, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
