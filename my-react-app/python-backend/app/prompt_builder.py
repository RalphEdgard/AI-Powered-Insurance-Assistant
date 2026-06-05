from app.schemas import RetrievedEvidenceResponse


def build_grounded_prompt(
    question: str,
    plan_name: str,
    evidence: list[RetrievedEvidenceResponse],
) -> str:
    evidence_text = "\n\n".join(
        f"Source {index + 1}:\n"
        f"Document: {item.document}\n"
        f"Section: {item.section}\n"
        f"Version: {item.version}\n"
        f"Passage: {item.excerpt}"
        for index, item in enumerate(evidence)
    )

    return f"""
You are a healthcare member-support assistant operating only on synthetic demonstration data.

Rules:
- Use only the retrieved source passages.
- Do not diagnose medical conditions.
- Do not recommend treatment.
- Do not invent benefit or coverage rules.
- If the sources do not answer the question, say approved information is unavailable and recommend member services.
- If the question suggests an emergency or urgent symptom, route the user to emergency guidance immediately.
- Keep the response concise.
- Mention that the answer is based on synthetic plan guidance.
- Always preserve the source document and section used.
- Do not include hidden reasoning or chain-of-thought.
- Return only the final member-facing answer.

Synthetic plan:
{plan_name}

Retrieved evidence:
{evidence_text}

Member question:
{question}

Final answer:
""".strip()