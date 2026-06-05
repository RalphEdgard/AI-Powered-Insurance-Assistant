from pydantic import BaseModel


class PlanSummary(BaseModel):
    plan_id: str
    plan_name: str
    plan_type: str
    coverage_year: int
    state: str


class Citation(BaseModel):
    document: str
    section: str
    version: str


class RetrievedEvidenceResponse(BaseModel):
    chunk_id: str
    document: str
    section: str
    version: str
    excerpt: str
    relevance_score: float


class ConversationQueryRequest(BaseModel):
    question: str
    plan_id: str = "EXAMPLE-HMO-2026"
    input_mode: str = "TEXT"


class ConversationQueryResponse(BaseModel):
    conversation_id: str
    intent: str
    answer: str
    cited_sources: list[Citation]
    retrieved_evidence: list[RetrievedEvidenceResponse]
    grounded: bool
    route: str
    requires_human_escalation: bool
    escalation_reason: str | None = None
    latency_ms: int
    provider: str

class EvaluationCaseResult(BaseModel):
    case_id: str
    category: str
    question: str
    expected_intent: str
    actual_intent: str
    expected_route: str
    actual_route: str
    expected_section: str | None = None
    actual_top_section: str | None = None
    intent_correct: bool
    route_correct: bool
    source_correct: bool | None = None
    provider: str
    latency_ms: int


class EvaluationSummary(BaseModel):
    total_cases: int
    intent_accuracy: float
    route_accuracy: float
    source_accuracy: float | None
    emergency_escalation_accuracy: float | None
    unsupported_abstention_rate: float | None
    prompt_injection_rejection_rate: float | None
    average_latency_ms: float


class EvaluationResultsResponse(BaseModel):
    summary: EvaluationSummary
    results: list[EvaluationCaseResult]

class EvaluationCaseResult(BaseModel):
    case_id: str
    category: str
    question: str
    expected_intent: str
    actual_intent: str
    expected_route: str
    actual_route: str
    expected_section: str | None = None
    actual_top_section: str | None = None
    intent_correct: bool
    route_correct: bool
    source_correct: bool | None = None
    provider: str
    latency_ms: int


class EvaluationSummary(BaseModel):
    total_cases: int
    intent_accuracy: float
    route_accuracy: float
    source_accuracy: float | None
    emergency_escalation_accuracy: float | None
    unsupported_abstention_rate: float | None
    prompt_injection_rejection_rate: float | None
    average_latency_ms: float


class EvaluationResultsResponse(BaseModel):
    summary: EvaluationSummary
    results: list[EvaluationCaseResult]