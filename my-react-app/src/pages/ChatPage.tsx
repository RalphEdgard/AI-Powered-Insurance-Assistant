import React, { useState, useRef, useEffect } from 'react';
import { SyntheticPlan, ConversationResponse, Intent, Route, CitedSource } from '../types';
import { Card, SectionLabel, IntentBadge, RouteBadge, Badge, Divider, Spinner } from '../components/ui';

const MOCK_PLANS: SyntheticPlan[] = [
  { planId: 'EXAMPLE-HMO-2026', planName: 'Example HMO Plan', planType: 'HMO', state: 'Minnesota',  coverageYear: 2026, memberId: 'SYN-1007', memberName: 'Alex Rivera' },
  { planId: 'EXAMPLE-PPO-2026', planName: 'Example PPO Plan', planType: 'PPO', state: 'California', coverageYear: 2026, memberId: 'SYN-2014', memberName: 'Jordan Lee' },
  { planId: 'EXAMPLE-EPO-2026', planName: 'Example EPO Plan', planType: 'EPO', state: 'New York',   coverageYear: 2026, memberId: 'SYN-3021', memberName: 'Morgan Chen' },
];

const MOCK_SUGGESTIONS = [
  'Do I need a referral before seeing a dermatologist?',
  'How can I refill my prescription?',
  'Where can I find information about my deductible?',
  'What is my copay for specialist visits?',
];

function mockResponse(question: string): ConversationResponse {
  const q = question.toLowerCase();
  const isEmergency = /chest pain|can't breathe|stroke|emergency|heart attack/.test(q);
  const isReferral   = /referral|dermatolog|specialist|skin doctor/.test(q);
  const isRx         = /prescription|refill|medication|drug/.test(q);
  const isClaims     = /deductible|copay|claim|out.of.pocket/.test(q);

  if (isEmergency) return {
    conversationId: `conv-${Date.now()}`,
    intent: 'URGENT_CLINICAL_CONCERN',
    answer: 'This may require urgent medical attention. Call 911 or go to your nearest emergency room immediately. I cannot assess symptoms or provide clinical advice.',
    citedSources: [],
    grounded: false,
    route: 'EMERGENCY_ESCALATION',
    requiresHumanEscalation: true,
    escalationReason: 'Urgent clinical indicator detected.',
    latencyMs: 280,
    llmProvider: 'LOCAL',
    inputMode: 'TEXT',
    timestamp: new Date().toISOString(),
  };

  if (isReferral) return {
    conversationId: `conv-${Date.now()}`,
    intent: 'REFERRAL_REQUIREMENTS',
    answer: 'Based on the retrieved synthetic plan guidance, members enrolled in the Example HMO Plan must obtain a primary care referral before scheduling a non-emergency dermatology specialist visit. Emergency services do not require prior referral.',
    citedSources: [
      { document: 'Example HMO Member Guide', section: 'Specialist Referral Requirements', version: '2026.1', relevanceScore: 0.94, excerpt: 'Members must obtain a primary care referral before scheduling a non-emergency dermatology specialist visit.' },
      { document: 'Referral Rules', section: 'HMO Network Requirements', version: '2026.1', relevanceScore: 0.81, excerpt: 'Emergency services and preventive screenings do not require prior referral authorization.' },
    ],
    grounded: true,
    route: 'SELF_SERVICE_RESPONSE',
    requiresHumanEscalation: false,
    latencyMs: 1430,
    llmProvider: 'LOCAL',
    inputMode: 'TEXT',
    timestamp: new Date().toISOString(),
  };

  if (isRx) return {
    conversationId: `conv-${Date.now()}`,
    intent: 'PRESCRIPTION_REFILL_SUPPORT',
    answer: 'You can refill your prescription through the member portal, by calling the pharmacy benefits line, or by visiting a participating network pharmacy. Mail-order pharmacy is also available for maintenance medications.',
    citedSources: [
      { document: 'Prescription Refill Support', section: 'Refill Options', version: '2026.1', relevanceScore: 0.92, excerpt: 'Members may request refills via the online portal, phone, or at any in-network pharmacy.' },
    ],
    grounded: true,
    route: 'SELF_SERVICE_RESPONSE',
    requiresHumanEscalation: false,
    latencyMs: 1120,
    llmProvider: 'LOCAL',
    inputMode: 'TEXT',
    timestamp: new Date().toISOString(),
  };

  if (isClaims) return {
    conversationId: `conv-${Date.now()}`,
    intent: 'CLAIMS_OR_DEDUCTIBLE_INFORMATION',
    answer: 'Your deductible and cost-sharing information is available in your member portal under "Benefits Summary." The synthetic plan documents show an individual deductible applies before cost-sharing begins, after which the plan covers a percentage of approved services.',
    citedSources: [
      { document: 'Claims and Deductibles FAQ', section: 'Annual Deductible', version: '2026.1', relevanceScore: 0.89, excerpt: 'The individual annual deductible must be met before plan cost-sharing applies to most covered services.' },
    ],
    grounded: true,
    route: 'BENEFITS_INFORMATION',
    requiresHumanEscalation: false,
    latencyMs: 1280,
    llmProvider: 'LOCAL',
    inputMode: 'TEXT',
    timestamp: new Date().toISOString(),
  };

  return {
    conversationId: `conv-${Date.now()}`,
    intent: 'UNSUPPORTED_REQUEST',
    answer: 'I do not have enough approved information in the synthetic plan documents to answer that question. Please contact member services for personalized assistance.',
    citedSources: [],
    grounded: false,
    route: 'ABSTENTION',
    requiresHumanEscalation: false,
    latencyMs: 760,
    llmProvider: 'LOCAL',
    inputMode: 'TEXT',
    timestamp: new Date().toISOString(),
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  response?: ConversationResponse;
}

const SourceCard: React.FC<{ source: CitedSource; index: number }> = ({ source, index }) => (
  <div style={{
    padding: '10px 12px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-teal)' }}>
        [{index + 1}] {source.document}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {Math.round(source.relevanceScore * 100)}%
      </span>
    </div>
    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 4 }}>§ {source.section} · v{source.version}</p>
    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
      "{source.excerpt}"
    </p>
  </div>
);

const AssistantMessage: React.FC<{ response: ConversationResponse }> = ({ response }) => {
  const [feedback, setFeedback] = useState<null | 'helpful' | 'not_helpful'>(null);
  const [showSources, setShowSources] = useState(false);
  const isEscalated = response.requiresHumanEscalation || response.route === 'EMERGENCY_ESCALATION';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '80%', alignSelf: 'flex-start' }}>
      {/* Answer bubble */}
      <div style={{
        padding: '14px 16px',
        background: isEscalated ? 'var(--status-error-bg)' : 'var(--bg-raised)',
        border: `1px solid ${isEscalated ? 'rgba(239,68,68,0.2)' : 'var(--border-default)'}`,
        borderRadius: '2px 14px 14px 14px',
        lineHeight: 1.6,
        fontSize: '14px',
        color: isEscalated ? '#FCA5A5' : 'var(--text-primary)',
      }}>
        {isEscalated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: '16px' }}>🚨</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-error)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Emergency Escalation
            </span>
          </div>
        )}
        {response.answer}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <IntentBadge intent={response.intent} />
        <RouteBadge route={response.route} />
        {response.grounded && <Badge label="Grounded" variant="teal" />}
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
          {response.latencyMs}ms · {response.llmProvider === 'LOCAL' ? '⚙ Local' : '☁ Bedrock'}
        </span>
      </div>

      {/* Sources toggle */}
      {response.citedSources.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(v => !v)}
            style={{
              fontSize: '12px', color: 'var(--accent-teal)', background: 'none',
              border: 'none', cursor: 'pointer', padding: '4px 0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={showSources ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'} />
            </svg>
            {showSources ? 'Hide' : 'Show'} {response.citedSources.length} source{response.citedSources.length !== 1 ? 's' : ''}
          </button>
          {showSources && (
            <div style={{ marginTop: 6 }}>
              {response.citedSources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {!isEscalated && (
        <div style={{ display: 'flex', gap: 6 }}>
          {(['helpful', 'not_helpful'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFeedback(v)}
              style={{
                fontSize: '11px', padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${feedback === v ? 'var(--accent-teal-border)' : 'var(--border-subtle)'}`,
                background: feedback === v ? 'var(--accent-teal-bg)' : 'transparent',
                color: feedback === v ? 'var(--accent-teal)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {v === 'helpful' ? '👍 Helpful' : '👎 Not helpful'}
            </button>
          ))}
          {feedback && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>Feedback recorded</span>
          )}
        </div>
      )}
    </div>
  );
};

const ChatPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SyntheticPlan>(MOCK_PLANS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
    const response = mockResponse(q);
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(response.answer);
      utt.rate = 0.95;
      window.speechSynthesis.speak(utt);
    }
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: response.answer, response }]);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ width: 280, minWidth: 280, borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Plan selector */}
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <SectionLabel>Synthetic Member Plan</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {MOCK_PLANS.map(plan => {
              const active = plan.planId === selectedPlan.planId;
              return (
                <button
                  key={plan.planId}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    padding: '10px 12px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                    background: active ? 'var(--accent-teal-bg)' : 'var(--bg-elevated)',
                    border: `1px solid ${active ? 'var(--accent-teal-border)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 500, color: active ? 'var(--accent-teal)' : 'var(--text-primary)', marginBottom: 2 }}>
                    {plan.planName}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{plan.memberName} · {plan.memberId}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{plan.state} · {plan.coverageYear}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Member card */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
          <SectionLabel>Active Member</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--accent-teal-bg)',
              border: '1px solid var(--accent-teal-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 600, color: 'var(--accent-teal)',
            }}>
              {selectedPlan.memberName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{selectedPlan.memberName}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{selectedPlan.memberId}</p>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['Plan Type', selectedPlan.planType],
              ['State', selectedPlan.state],
              ['Year', selectedPlan.coverageYear],
              ['Plan ID', selectedPlan.planId.split('-').slice(0,2).join('-')],
            ].map(([k, v]) => (
              <div key={k as string}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: '16px 18px' }}>
          <SectionLabel>Options</SectionLabel>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div
              onClick={() => setVoiceEnabled(v => !v)}
              style={{
                width: 36, height: 20, borderRadius: 'var(--radius-full)',
                background: voiceEnabled ? 'var(--accent-teal)' : 'var(--bg-overlay)',
                border: `1px solid ${voiceEnabled ? 'var(--accent-teal)' : 'var(--border-default)'}`,
                position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: voiceEnabled ? 'var(--bg-canvas)' : 'var(--text-muted)',
                position: 'absolute', top: 2,
                left: voiceEnabled ? 18 : 2,
                transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Speak responses aloud</span>
          </label>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 500 }}>Member Support</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedPlan.planName} · Synthetic Demo</p>
          </div>
          <Badge label="DeepSeek Local" variant="neutral" />
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 420 }}>
              <div style={{ fontSize: '32px', marginBottom: 16 }}>💬</div>
              <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: 8 }}>Ask a benefits question</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 24 }}>
                Using synthetic plan data. All answers are grounded in retrieved documents.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MOCK_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); }}
                    style={{
                      padding: '10px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                      background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'user' ? (
                <div style={{
                  maxWidth: '70%', padding: '12px 16px',
                  background: 'var(--accent-teal-bg)',
                  border: '1px solid var(--accent-teal-border)',
                  borderRadius: '14px 2px 14px 14px',
                  fontSize: '14px', color: 'var(--text-primary)',
                }}>
                  {msg.text}
                </div>
              ) : msg.response ? (
                <AssistantMessage response={msg.response} />
              ) : null}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: '13px' }}>
              <Spinner size={16} />
              Retrieving sources and generating answer…
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about benefits, referrals, prescriptions…"
              rows={1}
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-raised)', border: '1px solid var(--border-default)',
                color: 'var(--text-primary)', fontSize: '14px', resize: 'none',
                outline: 'none', lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 42, height: 42, borderRadius: 'var(--radius-md)',
                background: input.trim() && !loading ? 'var(--accent-teal)' : 'var(--bg-elevated)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {loading ? <Spinner size={16} /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={input.trim() ? 'var(--bg-canvas)' : 'var(--text-muted)'}
                  strokeWidth="2" strokeLinecap="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              )}
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 8 }}>
            Shift+Enter for new line · Responses grounded in synthetic plan documents only
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
