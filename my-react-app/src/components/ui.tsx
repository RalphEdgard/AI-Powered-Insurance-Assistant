import type { CSSProperties, ReactNode } from 'react';
import type { Intent, Route } from '../types';

export function Badge({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: 'teal' | 'blue' | 'warning' | 'error' | 'neutral';
}) {
  const styles: Record<string, CSSProperties> = {
    teal: { background: 'var(--accent-teal-bg)', color: 'var(--accent-teal)', border: '1px solid var(--accent-teal-border)' },
    blue: { background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)', border: '1px solid rgba(79,156,249,0.2)' },
    warning: { background: 'var(--status-warning-bg)', color: 'var(--status-warning)', border: '1px solid rgba(245,158,11,0.2)' },
    error: { background: 'var(--status-error-bg)', color: 'var(--status-error)', border: '1px solid rgba(239,68,68,0.2)' },
    neutral: { background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' },
  };

  return (
    <span
      style={{
        ...styles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  );
}

const intentLabel: Record<Intent, string> = {
  REFERRAL_REQUIREMENTS: 'Referral',
  PRESCRIPTION_REFILL_SUPPORT: 'Rx Refill',
  CLAIMS_OR_DEDUCTIBLE_INFORMATION: 'Claims / Deductible',
  MEMBER_ID_OR_VERIFICATION: 'Verification',
  HUMAN_AGENT_REQUEST: 'Agent Request',
  URGENT_CLINICAL_CONCERN: 'Urgent Clinical',
  UNSUPPORTED_REQUEST: 'Unsupported',
};

const routeLabel: Record<Route, string> = {
  SELF_SERVICE_RESPONSE: 'Self-Service',
  BENEFITS_INFORMATION: 'Benefits Info',
  EMERGENCY_ESCALATION: 'Emergency',
  HUMAN_ESCALATION: 'Human Agent',
  MEMBER_SERVICES_ESCALATION: 'Member Services',
  ABSTENTION: 'Abstention',
};

export function IntentBadge({ intent }: { intent: Intent }) {
  const variantMap: Record<Intent, 'teal' | 'blue' | 'warning' | 'error' | 'neutral'> = {
    REFERRAL_REQUIREMENTS: 'teal',
    PRESCRIPTION_REFILL_SUPPORT: 'blue',
    CLAIMS_OR_DEDUCTIBLE_INFORMATION: 'blue',
    MEMBER_ID_OR_VERIFICATION: 'neutral',
    HUMAN_AGENT_REQUEST: 'warning',
    URGENT_CLINICAL_CONCERN: 'error',
    UNSUPPORTED_REQUEST: 'neutral',
  };

  return <Badge label={intentLabel[intent]} variant={variantMap[intent]} />;
}

export function RouteBadge({ route }: { route: Route }) {
  const variantMap: Record<Route, 'teal' | 'blue' | 'warning' | 'error' | 'neutral'> = {
    SELF_SERVICE_RESPONSE: 'teal',
    BENEFITS_INFORMATION: 'blue',
    EMERGENCY_ESCALATION: 'error',
    HUMAN_ESCALATION: 'warning',
    MEMBER_SERVICES_ESCALATION: 'warning',
    ABSTENTION: 'neutral',
  };

  return <Badge label={routeLabel[route]} variant={variantMap[route]} />;
}

export function Card({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>;
}

export function MetricCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`metric-card ${accent ? 'metric-card--accent' : ''}`}>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
      {sub && <p className="metric-card__sub">{sub}</p>}
    </div>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" className="spinner" aria-label="Loading">
      <circle cx="9" cy="9" r="7" fill="none" stroke="var(--border-default)" strokeWidth="2" />
      <path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Divider() {

  return (

    <div

      style={{

        height: 1,

        width: "100%",

        background: "var(--border-subtle)",

        margin: "12px 0",

      }}

    />

  );

}