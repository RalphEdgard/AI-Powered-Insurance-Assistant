import React, { useState } from 'react';
import { Intent, Route, LogEntry } from './types';
import { Badge, SectionLabel, MetricCard, IntentBadge, RouteBadge } from './components/ui';

function randomMs(min: number, max: number) { return Math.floor(Math.random() * (max - min) + min); }
function pastTime(minutesAgo: number) {
  const d = new Date(Date.now() - minutesAgo * 60000);
  return d.toISOString();
}

const MOCK_LOGS: LogEntry[] = [
  { id: 'log-001', timestamp: pastTime(2),  inputMode: 'TEXT',  intent: 'REFERRAL_REQUIREMENTS',          route: 'SELF_SERVICE_RESPONSE', latencyMs: 1430, escalated: false, llmProvider: 'LOCAL',       feedbackGiven: 'HELPFUL' },
  { id: 'log-002', timestamp: pastTime(5),  inputMode: 'VOICE', intent: 'PRESCRIPTION_REFILL_SUPPORT',    route: 'SELF_SERVICE_RESPONSE', latencyMs: 1120, escalated: false, llmProvider: 'LOCAL',       feedbackGiven: 'HELPFUL' },
  { id: 'log-003', timestamp: pastTime(8),  inputMode: 'TEXT',  intent: 'URGENT_CLINICAL_CONCERN',        route: 'EMERGENCY_ESCALATION',  latencyMs: 280,  escalated: true,  llmProvider: 'LOCAL',       feedbackGiven: undefined },
  { id: 'log-004', timestamp: pastTime(12), inputMode: 'TEXT',  intent: 'CLAIMS_OR_DEDUCTIBLE_INFORMATION',route: 'BENEFITS_INFORMATION', latencyMs: 1280, escalated: false, llmProvider: 'LOCAL',       feedbackGiven: 'HELPFUL' },
  { id: 'log-005', timestamp: pastTime(15), inputMode: 'VOICE', intent: 'UNSUPPORTED_REQUEST',            route: 'ABSTENTION',            latencyMs: 760,  escalated: false, llmProvider: 'LOCAL',       feedbackGiven: 'NOT_HELPFUL' },
  { id: 'log-006', timestamp: pastTime(18), inputMode: 'TEXT',  intent: 'REFERRAL_REQUIREMENTS',          route: 'SELF_SERVICE_RESPONSE', latencyMs: 1380, escalated: false, llmProvider: 'AWS_BEDROCK', feedbackGiven: 'HELPFUL' },
  { id: 'log-007', timestamp: pastTime(22), inputMode: 'TEXT',  intent: 'MEMBER_ID_OR_VERIFICATION',      route: 'SELF_SERVICE_RESPONSE', latencyMs: 890,  escalated: false, llmProvider: 'LOCAL',       feedbackGiven: undefined },
  { id: 'log-008', timestamp: pastTime(25), inputMode: 'TEXT',  intent: 'UNSUPPORTED_REQUEST',            route: 'ABSTENTION',            latencyMs: 710,  escalated: false, llmProvider: 'LOCAL',       feedbackGiven: undefined },
  { id: 'log-009', timestamp: pastTime(30), inputMode: 'VOICE', intent: 'PRESCRIPTION_REFILL_SUPPORT',    route: 'SELF_SERVICE_RESPONSE', latencyMs: 980,  escalated: false, llmProvider: 'LOCAL',       feedbackGiven: 'HELPFUL' },
  { id: 'log-010', timestamp: pastTime(35), inputMode: 'TEXT',  intent: 'URGENT_CLINICAL_CONCERN',        route: 'EMERGENCY_ESCALATION',  latencyMs: 265,  escalated: true,  llmProvider: 'LOCAL',       feedbackGiven: undefined },
  { id: 'log-011', timestamp: pastTime(40), inputMode: 'TEXT',  intent: 'CLAIMS_OR_DEDUCTIBLE_INFORMATION',route: 'BENEFITS_INFORMATION', latencyMs: 1190, escalated: false, llmProvider: 'LOCAL',       feedbackGiven: 'HELPFUL' },
  { id: 'log-012', timestamp: pastTime(45), inputMode: 'TEXT',  intent: 'REFERRAL_REQUIREMENTS',          route: 'SELF_SERVICE_RESPONSE', latencyMs: 1510, escalated: false, llmProvider: 'AWS_BEDROCK', feedbackGiven: 'HELPFUL' },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const LogsPage: React.FC = () => {
  const [filterEscalated, setFilterEscalated] = useState(false);
  const [filterProvider, setFilterProvider] = useState<'ALL' | 'LOCAL' | 'AWS_BEDROCK'>('ALL');

  const filtered = MOCK_LOGS.filter(l => {
    if (filterEscalated && !l.escalated) return false;
    if (filterProvider !== 'ALL' && l.llmProvider !== filterProvider) return false;
    return true;
  });

  const avgLatency = Math.round(MOCK_LOGS.reduce((s, l) => s + l.latencyMs, 0) / MOCK_LOGS.length);
  const escalatedCount = MOCK_LOGS.filter(l => l.escalated).length;
  const bedrockCount   = MOCK_LOGS.filter(l => l.llmProvider === 'AWS_BEDROCK').length;
  const helpfulCount   = MOCK_LOGS.filter(l => l.feedbackGiven === 'HELPFUL').length;

  return (
    <div style={{ height: '100vh', overflowY: 'auto', padding: '28px 32px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: 4 }}>Audit Log</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 28 }}>
        Request history · No personal or medical data logged · Synthetic demo only
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        <MetricCard label="Total Requests" value={MOCK_LOGS.length} accent />
        <MetricCard label="Avg Latency"    value={`${avgLatency}ms`} sub="end-to-end" />
        <MetricCard label="Escalated"      value={escalatedCount} sub="emergency routes" />
        <MetricCard label="Helpful Rate"   value={`${Math.round((helpfulCount / MOCK_LOGS.filter(l => l.feedbackGiven).length) * 100)}%`} sub="of rated responses" />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: 4 }}>Filter:</span>
        <button
          onClick={() => setFilterEscalated(v => !v)}
          style={{
            padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', cursor: 'pointer',
            background: filterEscalated ? 'var(--status-error-bg)' : 'transparent',
            border: `1px solid ${filterEscalated ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}`,
            color: filterEscalated ? 'var(--status-error)' : 'var(--text-secondary)',
          }}
        >🚨 Escalated only</button>

        {(['ALL', 'LOCAL', 'AWS_BEDROCK'] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilterProvider(p)}
            style={{
              padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', cursor: 'pointer',
              background: filterProvider === p ? 'var(--accent-teal-bg)' : 'transparent',
              border: `1px solid ${filterProvider === p ? 'var(--accent-teal-border)' : 'var(--border-subtle)'}`,
              color: filterProvider === p ? 'var(--accent-teal)' : 'var(--text-secondary)',
            }}
          >{p === 'ALL' ? 'All providers' : p === 'LOCAL' ? '⚙ Local' : '☁ Bedrock'}</button>
        ))}

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {MOCK_LOGS.length}
        </span>
      </div>

      {/* Log table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Time', 'ID', 'Mode', 'Intent', 'Route', 'Provider', 'Latency', 'Escalated', 'Feedback'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={log.id} style={{
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: log.escalated ? 'rgba(239,68,68,0.03)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
              }}>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTime(log.timestamp)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(log.timestamp)}</p>
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {log.id}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {log.inputMode === 'VOICE' ? '🎙 Voice' : '⌨ Text'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <IntentBadge intent={log.intent} />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <RouteBadge route={log.route} />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: log.llmProvider === 'AWS_BEDROCK' ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                    {log.llmProvider === 'AWS_BEDROCK' ? '☁ Bedrock' : '⚙ Local'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {log.latencyMs}ms
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {log.escalated
                    ? <span style={{ fontSize: '11px', color: 'var(--status-error)' }}>🚨 Yes</span>
                    : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {log.feedbackGiven === 'HELPFUL'     && <span style={{ fontSize: '11px', color: 'var(--accent-teal)' }}>👍 Helpful</span>}
                  {log.feedbackGiven === 'NOT_HELPFUL'  && <span style={{ fontSize: '11px', color: 'var(--status-warning)' }}>👎 Not helpful</span>}
                  {!log.feedbackGiven                   && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 12 }}>
        ✓ No real patient or personal information is stored in this log. All entries are synthetic demo data.
      </p>
    </div>
  );
};

export default LogsPage;
