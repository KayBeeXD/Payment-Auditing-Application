import React from 'react';
import { 
  ShieldCheck, 
  Upload, 
  LayoutDashboard, 
  AlertTriangle, 
  RefreshCw, 
  FileSpreadsheet, 
  Archive, 
  FileText, 
  Settings, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isDark, setIsDark, companyName }) {
  const navItems = [
    { id: 'upload', label: 'Upload & Check', icon: Upload },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exceptions', label: 'Exceptions & Review', icon: AlertTriangle },
    { id: 'changes', label: 'Account Changes', icon: RefreshCw },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'archives', label: 'Archives', icon: Archive },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: '0 0 8px 8px', marginBottom: '1.25rem', borderTop: 'none' }}>
      <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Corporate Brand Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            background: 'var(--primary)',
            padding: '0.6rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-main)' }}>
                Payment Verification App
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              <span>Finance Controls & Audit Portal</span>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
            style={{ padding: '0.45rem 0.65rem', borderRadius: '6px' }}
          >
            {isDark ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#2563eb" />}
          </button>
        </div>
      </div>

      {/* Corporate Tab Navigation */}
      <nav style={{ padding: '0 1rem', display: 'flex', gap: '0.25rem', overflowX: 'auto', borderTop: '1px solid var(--border-color)' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 0.9rem',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-dim)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
