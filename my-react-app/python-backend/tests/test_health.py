from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_referral_question_returns_grounded_retrieval_response() -> None:
    response = client.post(
        "/api/v1/conversations/query",
        json={
            "plan_id": "EXAMPLE-HMO-2026",
            "question": "Do I need a referral before seeing a dermatologist?",
            "input_mode": "TEXT",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert body["intent"] == "REFERRAL_REQUIREMENTS"
    assert body["grounded"] is True
    assert body["provider"] in {
        "OLLAMA_DEEPSEEK_R1_1_5B",
        "DETERMINISTIC_EVIDENCE_FALLBACK",
    }
    assert len(body["cited_sources"]) == 1


def test_emergency_language_routes_without_llm() -> None:
    response = client.post(
        "/api/v1/conversations/query",
        json={
            "plan_id": "EXAMPLE-HMO-2026",
            "question": "I am having chest pain right now.",
            "input_mode": "TEXT",
        },
    )

    assert response.status_code == 200

    body = response.json()
    assert body["intent"] == "URGENT_CLINICAL_CONCERN"
    assert body["route"] == "EMERGENCY_ESCALATION"
    assert body["requires_human_escalation"] is True
    assert body["provider"] == "DETERMINISTIC_SAFETY_RULE"