import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  CheckCircle, 
  XCircle, 
  FileSpreadsheet, 
  Edit3, 
  ShieldCheck 
} from 'lucide-react';
import { exportExceptionReport } from '../utils/excelExporter';

export default function ExceptionManager({ exceptions, onUpdateExceptionStatus }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalAction, setModalAction] = useState('APPROVED');
  const [modalNotes, setModalNotes] = useState('');

  if (!exceptions || exceptions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)' }}>Zero Exceptions Flagged</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
          All payments match Employee Master and Bank statement records.
        </p>
      </div>
    );
  }

  // Filter exceptions
  const filteredExceptions = exceptions.filter(e => {
    const matchesSearch = 
      (e.empCode && e.empCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.empName && e.empName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.payAcc && e.payAcc.includes(searchQuery)) ||
      (e.paymentRef && e.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || e.exceptionType === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const handleOpenModal = (item) => {
    setActiveModalItem(item);
    setModalAction(item.managerAction === 'REJECTED' ? 'REJECTED' : 'APPROVED');
    setModalNotes(item.managerNotes || '');
  };

  const handleSaveModal = () => {
    if (!activeModalItem) return;
    onUpdateExceptionStatus(activeModalItem.rowIndex, modalAction, modalNotes);
    setActiveModalItem(null);
  };

  const categories = [
    { id: 'ALL', label: 'All Exceptions' },
    { id: 'EMPLOYEE_CODE_MISMATCH', label: 'Emp Code Mismatch' },
    { id: 'BANK_ACCOUNT_MISMATCH', label: 'Account Mismatch' },
    { id: 'AMOUNT_MISMATCH', label: 'Amount Mismatch' },
    { id: 'DUPLICATE_RECORD', label: 'Duplicates' },
    { id: 'BANK_RECORD_NOT_FOUND', label: 'Bank Missing' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-panel responsive-banner" style={{ padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ padding: '0.45rem', borderRadius: '6px', background: 'var(--danger-light)' }}>
            <AlertTriangle size={18} color="var(--danger)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Exception Review Workspace</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Review flagged items, override exceptions with manager sign-off, and add audit notes.</p>
          </div>
        </div>

        <div className="responsive-banner-buttons" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => exportExceptionReport(exceptions)}
          >
            <FileSpreadsheet size={15} />
            Export Exception Report (.xlsx)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Category Pills */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.2rem', maxWidth: '100%', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-elevated)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                fontWeight: selectedCategory === cat.id ? '600' : '500',
                fontSize: '0.775rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', flex: '1 1 auto' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            placeholder="Search Emp Code, Name, Account..."
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

      {/* Exception Table */}
      <div className="table-container glass-panel">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Row #</th>
              <th>Employee Info</th>
              <th>Category</th>
              <th>Account Details</th>
              <th>Amount (₹)</th>
              <th>Failure Remarks</th>
              <th>Manager Action</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredExceptions.map((item) => (
              <tr key={item.rowIndex}>
                <td style={{ fontWeight: 600, color: 'var(--text-dim)' }}>#{item.rowIndex}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.empCode}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.empName}</div>
                </td>
                <td>
                  <span className="badge badge-exception" style={{ fontSize: '0.7rem' }}>
                    {item.exceptionType}
                  </span>
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.payAcc}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Ref: {item.paymentRef}</div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--danger)' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </td>
                <td style={{ maxWidth: '280px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  {item.remarks}
                </td>
                <td>
                  {item.managerAction === 'APPROVED' ? (
                    <span className="badge badge-pass">
                      <CheckCircle size={11} /> Approved
                    </span>
                  ) : item.managerAction === 'REJECTED' ? (
                    <span className="badge badge-exception">
                      <XCircle size={11} /> Rejected
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      Pending Review
                    </span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleOpenModal(item)}
                    style={{ padding: '0.3rem 0.55rem', fontSize: '0.725rem' }}
                  >
                    <Edit3 size={13} />
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manager Decision Action Modal */}
      {activeModalItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <ShieldCheck size={22} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Finance Manager Audit Review</h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Row #{activeModalItem.rowIndex} — {activeModalItem.empCode} ({activeModalItem.empName})</p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '0.875rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem' }}>
              <div style={{ marginBottom: '0.3rem' }}><strong>Flagged Reason:</strong> <span style={{ color: 'var(--danger)' }}>{activeModalItem.remarks}</span></div>
              <div style={{ marginBottom: '0.3rem' }}><strong>Payment Amount:</strong> ₹{activeModalItem.amount.toLocaleString('en-IN')}</div>
              <div><strong>Bank A/C:</strong> {activeModalItem.payAcc}</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Select Decision</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setModalAction('APPROVED')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: modalAction === 'APPROVED' ? 'var(--success-light)' : 'var(--bg-elevated)',
                    color: modalAction === 'APPROVED' ? 'var(--success)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <CheckCircle size={15} /> Override & Approve
                </button>
                <button
                  onClick={() => setModalAction('REJECTED')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: modalAction === 'REJECTED' ? 'var(--danger-light)' : 'var(--bg-elevated)',
                    color: modalAction === 'REJECTED' ? 'var(--danger)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <XCircle size={15} /> Reject Payment
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Audit Remarks</label>
              <textarea 
                rows={3}
                placeholder="Enter approval mandate reference or explanation..."
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button className="btn btn-secondary" onClick={() => setActiveModalItem(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveModal}>
                Save Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
