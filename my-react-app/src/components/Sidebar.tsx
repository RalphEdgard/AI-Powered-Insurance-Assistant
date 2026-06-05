import React from 'react';

export type Page = 'chat' | 'evaluations' | 'logs' | 'knowledge';

interface NavProps {
  current: Page;
  onChange: (p: Page) => void;
}

const navItems: { id: Page; icon: string; label: string }[] = [
  { id: 'chat',        icon: 'M8 4H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9M15 4l5 5M15 4v5h5',          label: 'Member Chat' },
  { id: 'evaluations', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2m-6 9l2 2 4-4', label: 'Evaluations' },
  { id: 'logs',        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',  label: 'Audit Log' },
  { id: 'knowledge',   icon: 'M4 6h16M4 10h16M4 14h10M4 18h6',                  label: 'Knowledge Base' },
];

const Sidebar: React.FC<NavProps> = ({ current, onChange }) => (
  <nav style={{
    width: 220,
    minWidth: 220,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    height: '100vh',
    position: 'sticky',
    top: 0,
  }}>
    {/* Logo */}
    <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--accent-teal-bg)',
          border: '1px solid var(--accent-teal-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 6v6l4 2" />
            <path d="M20 2l2 2-2 2" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>CareConnect</p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>VOICE AI</p>
        </div>
      </div>
    </div>

    {/* Nav Items */}
    <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {navItems.map(item => {
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 'var(--radius-md)',
              background: active ? 'rgba(34,211,170,0.08)' : 'transparent',
              color: active ? 'var(--accent-teal)' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--accent-teal-border)' : 'transparent'}`,
              fontSize: '13px', fontWeight: active ? 500 : 400,
              textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            {item.label}
          </button>
        );
      })}
    </div>

    {/* Demo notice */}
    <div style={{
      margin: '0 10px 16px',
      padding: '10px 12px',
      background: 'var(--status-warning-bg)',
      border: '1px solid rgba(245,158,11,0.15)',
      borderRadius: 'var(--radius-md)',
    }}>
      <p style={{ fontSize: '11px', color: 'var(--status-warning)', fontWeight: 500, marginBottom: 2 }}>
        ⚠ Demo System
      </p>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        Synthetic data only. Do not enter real personal or medical information.
      </p>
    </div>
  </nav>
);

export default Sidebar;
