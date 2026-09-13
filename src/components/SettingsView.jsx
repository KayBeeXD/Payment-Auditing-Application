import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Building2, Sliders, Map, CheckCircle2 } from 'lucide-react';

export default function SettingsView({ config, setConfig }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const defaultConfig = {
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
    };
    setLocalConfig(defaultConfig);
    setConfig(defaultConfig);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--primary-light)' }}>
            <Settings size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>System Configuration & Rules</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Configure company defaults, header mappings, and validation tolerance.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          {savedSuccess && (
            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={15} /> Saved!
            </span>
          )}
          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={15} /> Reset Defaults
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={15} /> Save Settings
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Company & Archiving Settings */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Building2 size={16} color="var(--primary)" />
            Company & Storage Defaults
          </h4>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Standardized Company Name
            </label>
            <input 
              type="text"
              value={localConfig.companyName}
              onChange={(e) => setLocalConfig({ ...localConfig, companyName: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Default Archiving Directory Path
            </label>
            <input 
              type="text"
              value={localConfig.archiveFolderPath}
              onChange={(e) => setLocalConfig({ ...localConfig, archiveFolderPath: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
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

        {/* Validation Rules Settings */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Sliders size={16} color="var(--primary)" />
            Validation Rules & Criteria
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>Duplicate Entry Detection</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Flag identical employee, account & amount records</div>
            </div>
            <input 
              type="checkbox"
              checked={localConfig.enableDuplicateCheck}
              onChange={(e) => setLocalConfig({ ...localConfig, enableDuplicateCheck: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>Strict Bank Account Cross-Match</div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Require exact account match against Master</div>
            </div>
            <input 
              type="checkbox"
              checked={localConfig.enableStrictAccountCheck}
              onChange={(e) => setLocalConfig({ ...localConfig, enableStrictAccountCheck: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              Amount Tolerance Limit (₹)
            </label>
            <input 
              type="number"
              step="0.01"
              value={localConfig.amountTolerance}
              onChange={(e) => setLocalConfig({ ...localConfig, amountTolerance: parseFloat(e.target.value) || 0 })}
              style={{
                width: '100%',
                padding: '0.5rem 0.65rem',
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

        {/* Excel Header Column Mappings */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', gridColumn: '1 / -1' }}>
          <h4 style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Map size={16} color="var(--primary)" />
            Excel Header Column Mappings
          </h4>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Comma-separated aliases for Excel column headers to match custom file formats.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.875rem' }}>
            {Object.entries(localConfig.columnMappings).map(([field, mappedVal]) => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                  {field} Column Aliases
                </label>
                <input 
                  type="text"
                  value={mappedVal}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    columnMappings: { ...localConfig.columnMappings, [field]: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    fontSize: '0.775rem',
                    outline: 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
