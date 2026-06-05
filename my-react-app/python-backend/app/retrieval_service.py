import os
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from app.knowledge_base import KNOWLEDGE_CHUNKS, KnowledgeChunk


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


class RetrievedEvidence:
    def __init__(self, chunk: KnowledgeChunk, similarity_score: float):
        self.chunk = chunk
        self.similarity_score = similarity_score


def _test_mode_enabled() -> bool:
    return os.getenv("CARECONNECT_TEST_MODE") == "1"


def _keyword_score(question: str, passage: str, section: str) -> float:
    text = f"{passage} {section}".lower()
    question_lower = question.lower()

    score = 0.0

    referral_terms = ["referral", "specialist", "dermatologist", "dermatology", "skin specialist", "skin doctor"]
    refill_terms = ["refill", "prescription", "medication", "pharmacy"]
    claims_terms = ["deductible", "claim", "claims", "eob"]

    if any(term in question_lower for term in referral_terms) and (
        "referral" in text or "specialist" in text or "dermatology" in text
    ):
        score = max(score, 0.95)

    if any(term in question_lower for term in refill_terms) and (
        "refill" in text or "prescription" in text or "pharmacy" in text
    ):
        score = max(score, 0.95)

    if any(term in question_lower for term in claims_terms) and (
        "deductible" in text or "claim" in text or "claims" in text
    ):
        score = max(score, 0.95)

    return score


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(
        MODEL_NAME,
        local_files_only=True,
    )


@lru_cache(maxsize=1)
def get_chunk_embeddings() -> np.ndarray:
    model = get_embedding_model()
    passages = [chunk.passage for chunk in KNOWLEDGE_CHUNKS]
    return model.encode(passages, normalize_embeddings=True)


def _cosine_similarity_normalized(
    query_embedding: np.ndarray,
    chunk_embeddings: np.ndarray,
) -> np.ndarray:
    return np.dot(chunk_embeddings, query_embedding)


def _retrieve_with_keywords(
    question: str,
    plan_id: str,
    top_k: int,
    minimum_score: float,
) -> list[RetrievedEvidence]:
    candidates: list[RetrievedEvidence] = []

    for chunk in KNOWLEDGE_CHUNKS:
        if chunk.plan_id != plan_id:
            continue

        score = _keyword_score(question, chunk.passage, chunk.section)

        if score < minimum_score:
            continue

        candidates.append(RetrievedEvidence(chunk=chunk, similarity_score=score))

    candidates.sort(key=lambda item: item.similarity_score, reverse=True)
    return candidates[:top_k]


def retrieve_relevant_evidence(
    question: str,
    plan_id: str,
    top_k: int = 3,
    minimum_score: float = 0.35,
) -> list[RetrievedEvidence]:
    if _test_mode_enabled():
        return _retrieve_with_keywords(
            question=question,
            plan_id=plan_id,
            top_k=top_k,
            minimum_score=minimum_score,
        )

    model = get_embedding_model()
    query_embedding = model.encode(question, normalize_embeddings=True)
    chunk_embeddings = get_chunk_embeddings()

    scores = _cosine_similarity_normalized(query_embedding, chunk_embeddings)

    candidates: list[RetrievedEvidence] = []
    for chunk, score in zip(KNOWLEDGE_CHUNKS, scores):
        if chunk.plan_id != plan_id:
            continue
        if float(score) < minimum_score:
            continue

        candidates.append(RetrievedEvidence(chunk=chunk, similarity_score=float(score)))

    candidates.sort(key=lambda item: item.similarity_score, reverse=True)
    return candidates[:top_k]

def build_grounded_answer(question: str, evidence: list[RetrievedEvidence]) -> str:
    if not evidence:
        return (
            "I do not have enough approved information in the synthetic plan documents "
            "to answer that question. Please contact member services."
        )

    best = evidence[0].chunk
    return f"Based on the retrieved synthetic source, {best.passage}"
def classify_intent_from_evidence(question: str, evidence: list[RetrievedEvidence]) -> str:
    question_lower = question.lower()
    best_section = evidence[0].chunk.section.lower() if evidence else ""

    if not evidence:
        return "UNSUPPORTED_REQUEST"

    if (
        "referral" in best_section
        or "specialist" in best_section
        or "dermatology" in question_lower
        or "skin specialist" in question_lower
        or "skin doctor" in question_lower
    ):
        return "REFERRAL_REQUIREMENTS"

    if (
        "prescription" in best_section
        or "refill" in best_section
        or "refill" in question_lower
        or "medication" in question_lower
        or "pharmacy" in question_lower
    ):
        return "PRESCRIPTION_REFILL_SUPPORT"

    if (
        "claim" in best_section
        or "deductible" in best_section
        or "deductible" in question_lower
        or "claim" in question_lower
        or "eob" in question_lower
    ):
        return "CLAIMS_OR_DEDUCTIBLE_INFORMATION"

    if (
        "verification" in best_section
        or "privacy" in best_section
        or "member id" in question_lower
        or "personal information" in question_lower
    ):
        return "MEMBER_ID_OR_VERIFICATION"

    if (
        "unsupported" in best_section
        or "future coverage" in question_lower
        or "specific surgery" in question_lower
        or "covered next year" in question_lower
        or "guarantee" in question_lower
    ):
        return "UNSUPPORTED_REQUEST"

    return "UNSUPPORTED_REQUEST"