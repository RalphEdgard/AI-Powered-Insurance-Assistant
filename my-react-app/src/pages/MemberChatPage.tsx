import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
Card,
IntentBadge,
MetricCard,
RouteBadge,
SectionLabel,
Spinner,
} from "../components/ui";
import { getPlans, submitConversationQuery } from "../services/careConnectApi";
import type {
  ConversationQueryResponse,
  InputMode,
  PlanSummary,
} from "../types";

const exampleQuestions = [
  "Do I need a referral before seeing a dermatologist?",
  "Can I book a skin specialist directly?",
  "How can I refill my prescription?",
  "I am having chest pain right now.",
  "Will a specific surgery be covered next year?",
];

type BrowserSpeechRecognition = SpeechRecognition;

type BrowserSpeechRecognitionConstructor = {
  new (): BrowserSpeechRecognition;
  prototype: BrowserSpeechRecognition;
};

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };
  
export default function MemberChatPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [planId, setPlanId] = useState("EXAMPLE-HMO-2026");
  const [question, setQuestion] = useState(exampleQuestions[0]);
  const [response, setResponse] = useState<ConversationQueryResponse | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("TEXT");
  const [spokenAnswerEnabled, setSpokenAnswerEnabled] = useState(false);

  const speechWindow = window as SpeechRecognitionWindow;

  const SpeechRecognitionConstructor =
    speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

  const voiceSupported = Boolean(SpeechRecognitionConstructor);

  useEffect(() => {
    async function loadPlans() {
      try {
        setPlans(await getPlans());
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load synthetic plans."
        );
      } finally {
        setLoadingPlans(false);
      }
    }

    void loadPlans();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.plan_id === planId),
    [plans, planId]
  );

  function testVoice() {
    if (!window.speechSynthesis) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      "CareConnect Voice AI speech output is working."
    );

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onerror = () => {
      setError("Speech synthesis failed. Check browser audio permissions and system volume.");
    };

    window.speechSynthesis.speak(utterance);
  }
  function handleVoiceInput() {
    if (!SpeechRecognitionConstructor) {
      setError(
        "Speech recognition is not supported in this browser. Please use typed input."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;

      if (transcript) {
        setQuestion(transcript);
        setInputMode("VOICE");
      }
    };

    recognition.onerror = () => {
      setError("Voice input failed. Please try again or use typed input.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setError(null);
    setIsListening(true);
    recognition.start();
  }

  function speakAnswer(answer: string) {
    if (!spokenAnswerEnabled) {
      return;
    }

    if (!window.speechSynthesis) {
      setError("Speech synthesis is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onerror = () => {
      setError("Speech synthesis failed. Check browser audio permissions and system volume.");
    };

    window.speechSynthesis.speak(utterance);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    setError(null);
    setSubmitting(true);
    setResponse(null);

    try {
      const result = await submitConversationQuery({
        question: trimmedQuestion,
        plan_id: planId,
        input_mode: inputMode,
      });

      setResponse(result);
      speakAnswer(result.answer);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to submit your question."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <p className="eyebrow">Conversational AI Demonstration</p>
          <h1>Member Support Assistant</h1>
          <p className="page-description">
            Ask a synthetic member-benefit question. The backend supports safety
            routing, local retrieval, grounded response generation, and browser
            voice input/output.
          </p>
        </div>

        <span className="status-pill">
          <span className="status-dot" /> FastAPI connected
        </span>
      </header>

      <div className="workspace-grid">
        <Card className="query-panel">
          <SectionLabel>Member Interaction</SectionLabel>

          <form onSubmit={handleSubmit} className="query-form">
            <label className="field-label" htmlFor="plan">
              Synthetic member plan
            </label>

            <select
              id="plan"
              className="form-control"
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
              disabled={loadingPlans || submitting}
            >
              {loadingPlans ? (
                <option>Loading plans...</option>
              ) : (
                plans.map((plan) => (
                  <option value={plan.plan_id} key={plan.plan_id}>
                    {plan.plan_name} ({plan.coverage_year})
                  </option>
                ))
              )}
            </select>

            <label className="field-label" htmlFor="question">
              Member question
            </label>

            <textarea
              id="question"
              className="form-control question-box"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                setInputMode("TEXT");
              }}
              minLength={3}
              required
              disabled={submitting}
            />

            <p className="field-label example-label">Example prompts</p>

            <div className="example-prompts">
              {exampleQuestions.map((example) => (
                <button
                  className="prompt-chip"
                  type="button"
                  key={example}
                  onClick={() => {
                    setQuestion(example);
                    setInputMode("TEXT");
                  }}
                  disabled={submitting}
                >
                  {example}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={handleVoiceInput}
              disabled={!voiceSupported || submitting}
            >
              {isListening ? "Listening..." : "Use microphone"}
            </button>

            {!voiceSupported && (
              <p className="secondary-copy">
                Voice input is not supported in this browser. Typed input is
                available.
              </p>
            )}
            <button
              type="button"
              className="secondary-button"
              onClick={testVoice}
            >
              Test voice output
            </button>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={spokenAnswerEnabled}
                onChange={(event) =>
                  setSpokenAnswerEnabled(event.target.checked)
                }
              />
              Speak answer aloud
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={submitting || !question.trim()}
            >
              {submitting ? (
                <>
                  <Spinner /> Processing request
                </>
              ) : (
                "Submit Question"
              )}
            </button>
          </form>
        </Card>

        <section className="results-column">
          {error && (
            <Card className="error-panel">
              <strong>Backend connection error</strong>
              <p>{error}</p>
              <p className="secondary-copy">
                Confirm FastAPI is running at http://127.0.0.1:8000 and that
                CORS allows http://localhost:5173.
              </p>
            </Card>
          )}

          {!response && !error && (
            <Card className="empty-panel">
              <SectionLabel>AI Response</SectionLabel>
              <h2>Ready for a test request</h2>
              <p>
                Submit a referral question to see a grounded response, or submit
                the chest-pain test to verify deterministic safety routing.
              </p>
            </Card>
          )}

          {response && (
            <>
              <div className="metrics-grid">
                <MetricCard
                  label="Intent"
                  value={response.intent.replaceAll("_", " ")}
                />
                <MetricCard label="Input Mode" value={inputMode} />
                <MetricCard
                  label="Latency"
                  value={`${response.latency_ms} ms`}
                  sub={response.provider}
                  accent
                />
              </div>

              <Card className="response-panel">
                <div className="panel-row">
                  <SectionLabel>AI Response</SectionLabel>
                  <div className="badge-row">
                    <IntentBadge intent={response.intent} />
                    <RouteBadge route={response.route} />
                  </div>
                </div>

                <p className="answer-text">{response.answer}</p>

                {response.requires_human_escalation &&
                  response.escalation_reason && (
                    <div className="escalation-box">
                      <strong>Escalation required</strong>
                      <p>{response.escalation_reason}</p>
                    </div>
                  )}
              </Card>

              <Card className="evidence-panel">
                <SectionLabel>Retrieved Evidence</SectionLabel>

                {response.retrieved_evidence &&
                response.retrieved_evidence.length > 0 ? (
                  response.retrieved_evidence.map((source) => (
                    <div
                      className="source-card"
                      key={`${source.document}-${source.section}-${source.version}`}
                    >
                      <p className="source-title">{source.document}</p>
                      <p className="secondary-copy">
                        {source.section} · Version {source.version}
                        {typeof source.relevance_score === "number"
                          ? ` · Similarity ${Math.round(
                              source.relevance_score * 100
                            )}%`
                          : ""}
                      </p>
                      {source.excerpt && (
                        <p className="source-excerpt">{source.excerpt}</p>
                      )}
                    </div>
                  ))
                ) : response.cited_sources.length > 0 ? (
                  response.cited_sources.map((source) => (
                    <div
                      className="source-card"
                      key={`${source.document}-${source.section}-${source.version}`}
                    >
                      <p className="source-title">{source.document}</p>
                      <p className="secondary-copy">
                        {source.section} · Version {source.version}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="secondary-copy">
                    No source citation returned for this escalated or
                    unsupported workflow.
                  </p>
                )}
              </Card>
            </>
          )}
        </section>
      </div>

      {selectedPlan && (
        <footer className="plan-footer">
          Active synthetic plan: <strong>{selectedPlan.plan_name}</strong> ·{" "}
          {selectedPlan.plan_type} · Coverage year{" "}
          {selectedPlan.coverage_year}
        </footer>
      )}
    </div>
  );
}