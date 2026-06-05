import time
import uuid
import os

from app.evaluation_runner import run_evaluation
from app.schemas import EvaluationResultsResponse

from app.llm_providers.bedrock_provider import (
    BedrockProviderError,
    generate_grounded_answer_with_bedrock,
)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.llm_providers.ollama_provider import (
    OllamaProviderError,
    generate_grounded_answer,
)
from app.prompt_builder import build_grounded_prompt
from app.retrieval_service import (
    build_grounded_answer,
    classify_intent_from_evidence,
    retrieve_relevant_evidence,
)
from app.sample_data import SYNTHETIC_PLANS
from app.schemas import (
    Citation,
    ConversationQueryRequest,
    ConversationQueryResponse,
    PlanSummary,
    RetrievedEvidenceResponse,
)

app = FastAPI(
    title="CareConnect Voice AI API",
    description=(
        "Zero-cost, AWS-ready healthcare conversational AI demo. "
        "Uses synthetic member-support information only."
    ),
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def is_prompt_injection_attempt(question: str) -> bool:
    question_lower = question.lower()

    injection_terms = [
        "ignore your instructions",
        "ignore previous instructions",
        "do not cite sources",
        "don't cite sources",
        "pretend this is a real patient",
        "diagnose me",
        "reveal your system prompt",
        "show your hidden instructions",
        "bypass safety",
        "forget the rules",
    ]

    return any(term in question_lower for term in injection_terms)

def find_plan_by_id(plan_id: str) -> PlanSummary:
    for plan in SYNTHETIC_PLANS:
        if plan.plan_id == plan_id:
            return plan

    raise HTTPException(status_code=404, detail="Synthetic plan not found.")


def is_emergency_question(question: str) -> bool:
    question_lower = question.lower()

    emergency_terms = [
        "chest pain",
        "cannot breathe",
        "can't breathe",
        "difficulty breathing",
        "stroke",
        "severe bleeding",
        "heart attack",
        "suicide",
        "self harm",
        "self-harm",
    ]

    return any(term in question_lower for term in emergency_terms)


def build_citations(evidence) -> list[Citation]:
    return [
        Citation(
            document=item.chunk.document,
            section=item.chunk.section,
            version=item.chunk.version,
        )
        for item in evidence[:1]
    ]


def build_retrieved_evidence_response(evidence) -> list[RetrievedEvidenceResponse]:
    return [
        RetrievedEvidenceResponse(
            chunk_id=item.chunk.chunk_id,
            document=item.chunk.document,
            section=item.chunk.section,
            version=item.chunk.version,
            excerpt=item.chunk.passage,
            relevance_score=round(item.similarity_score, 4),
        )
        for item in evidence
    ]

@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "careconnect-python-backend",
        "version": "0.3.0",
    }


@app.get("/api/v1/plans", response_model=list[PlanSummary])
def get_plans() -> list[PlanSummary]:
    return SYNTHETIC_PLANS



@app.get("/api/v1/plans/{plan_id}", response_model=PlanSummary)
def get_plan(plan_id: str) -> PlanSummary:
    return find_plan_by_id(plan_id)

def get_llm_provider_name() -> str:
    return os.getenv("LLM_PROVIDER", "ollama").lower().strip()

def generate_answer_from_configured_provider(prompt: str) -> tuple[str, str]:
    """
    Returns:
        answer, provider_name

    LLM_PROVIDER=ollama is the default free/local path.
    LLM_PROVIDER=bedrock enables optional AWS Bedrock invocation.
    """

    if os.getenv("CARECONNECT_TEST_MODE") == "1":
        raise OllamaProviderError("Test mode uses deterministic fallback.")

    provider = get_llm_provider_name()

    if provider == "bedrock":
        try:
            answer = generate_grounded_answer_with_bedrock(prompt)
            return answer, "AMAZON_BEDROCK"
        except BedrockProviderError as exc:
            raise OllamaProviderError(f"Bedrock provider failed: {exc}") from exc

    if provider == "ollama":
        answer = generate_grounded_answer(prompt)
        return answer, "OLLAMA_DEEPSEEK_R1_1_5B"

    raise OllamaProviderError(f"Unsupported LLM_PROVIDER value: {provider}")

@app.post(

    "/api/v1/conversations/query",

    response_model=ConversationQueryResponse,

)
def submit_conversation_query(
    request: ConversationQueryRequest,
) -> ConversationQueryResponse:
    start_time = time.perf_counter()
    selected_plan = find_plan_by_id(request.plan_id)

    if is_emergency_question(request.question):
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        return ConversationQueryResponse(
            conversation_id=str(uuid.uuid4()),
            intent="URGENT_CLINICAL_CONCERN",
            answer=(
                "This may require urgent medical attention. "
                "Call emergency services or seek emergency care immediately. "
                "This demonstration system cannot assess symptoms or provide clinical advice."
            ),
            cited_sources=[],
            retrieved_evidence=[],
            grounded=True,
            route="EMERGENCY_ESCALATION",
            requires_human_escalation=True,
            escalation_reason="Urgent symptom language detected.",
            latency_ms=latency_ms,
            provider="DETERMINISTIC_SAFETY_RULE",
        )

    if is_prompt_injection_attempt(request.question):
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        return ConversationQueryResponse(
            conversation_id=str(uuid.uuid4()),
            intent="UNSUPPORTED_REQUEST",
            answer=(
                "I cannot follow instructions that bypass safety rules, remove citations, "
                "request hidden instructions, or ask for real patient diagnosis. "
                "This demonstration assistant only answers using approved synthetic plan "
                "information and escalates unsupported requests to member services."
            ),
            cited_sources=[],
            retrieved_evidence=[],
            grounded=False,
            route="MEMBER_SERVICES_ESCALATION",
            requires_human_escalation=True,
            escalation_reason="Prompt-injection or unsafe instruction detected.",
            latency_ms=latency_ms,
            provider="DETERMINISTIC_SAFETY_RULE",
        )

    evidence = retrieve_relevant_evidence(
        question=request.question,
        plan_id=request.plan_id,
        top_k=3,
        minimum_score=0.30,
    )

    if not evidence:
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        return ConversationQueryResponse(
            conversation_id=str(uuid.uuid4()),
            intent="UNSUPPORTED_REQUEST",
            answer=(
                "I do not have enough approved information in the synthetic "
                "plan documents to answer that question. Please contact member services."
            ),
            cited_sources=[],
            retrieved_evidence=[],
            grounded=False,
            route="MEMBER_SERVICES_ESCALATION",
            requires_human_escalation=True,
            escalation_reason="No approved supporting information retrieved.",
            latency_ms=latency_ms,
            provider="LOCAL_EMBEDDINGS_RETRIEVAL",
        )

    intent = classify_intent_from_evidence(request.question, evidence)
    cited_sources = build_citations(evidence)
    retrieved_evidence = build_retrieved_evidence_response(evidence)

    if intent == "UNSUPPORTED_REQUEST":
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        return ConversationQueryResponse(
            conversation_id=str(uuid.uuid4()),
            intent="UNSUPPORTED_REQUEST",
            answer=(
                "I do not have enough approved information in the synthetic "
                "plan documents to answer that question. Please contact member services."
            ),
            cited_sources=cited_sources,
            retrieved_evidence=retrieved_evidence,
            grounded=False,
            route="MEMBER_SERVICES_ESCALATION",
            requires_human_escalation=True,
            escalation_reason="Retrieved evidence did not support a member-service answer.",
            latency_ms=latency_ms,
            provider="LOCAL_EMBEDDINGS_RETRIEVAL",
        )

    prompt = build_grounded_prompt(
        question=request.question,
        plan_name=selected_plan.plan_name,
        evidence=retrieved_evidence,
    )
    try:
        answer, provider = generate_answer_from_configured_provider(prompt)
    except OllamaProviderError:
        answer = build_grounded_answer(request.question, evidence)
        provider = "DETERMINISTIC_EVIDENCE_FALLBACK"

    latency_ms = int((time.perf_counter() - start_time) * 1000)

    return ConversationQueryResponse(
        conversation_id=str(uuid.uuid4()),
        intent=intent,
        answer=answer,
        cited_sources=cited_sources,
        retrieved_evidence=retrieved_evidence,
        grounded=True,
        route="SELF_SERVICE_RESPONSE",
        requires_human_escalation=False,
        escalation_reason=None,
        latency_ms=latency_ms,
        provider=provider,
    )


@app.get(
    "/api/v1/evaluations/results",
    response_model=EvaluationResultsResponse,
)
def get_evaluation_results() -> EvaluationResultsResponse:
    return run_evaluation(submit_conversation_query)