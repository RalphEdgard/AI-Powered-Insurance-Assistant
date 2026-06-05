from app.retrieval_service import retrieve_relevant_evidence


def test_semantic_question_retrieves_referral_rule() -> None:
    results = retrieve_relevant_evidence(
        question="Can I book a skin specialist directly?",
        plan_id="EXAMPLE-HMO-2026",
        top_k=3,
        minimum_score=0.25,
    )

    assert results
    assert results[0].chunk.section == "Specialist Referral Requirements"


def test_prescription_question_retrieves_refill_support() -> None:
    results = retrieve_relevant_evidence(
        question="How can I get my medication refilled?",
        plan_id="EXAMPLE-HMO-2026",
        top_k=3,
        minimum_score=0.25,
    )

    assert results
    assert results[0].chunk.section == "Prescription Refill Support"
