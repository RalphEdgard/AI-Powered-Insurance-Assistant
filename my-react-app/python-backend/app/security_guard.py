from dataclasses import dataclass

from llm_guard.input_scanners import PromptInjection


@dataclass
class PromptInjectionAssessment:
    is_injection: bool
    score: float
    provider: str
    reason: str


prompt_injection_scanner = PromptInjection(threshold=0.5)


def assess_prompt_injection(question: str) -> PromptInjectionAssessment:
    sanitized_prompt, is_valid, risk_score = prompt_injection_scanner.scan(question)

    if not is_valid:
        return PromptInjectionAssessment(
            is_injection=True,
            score=float(risk_score),
            provider="LLM_GUARD_PROMPT_INJECTION_SCANNER",
            reason="LLM Guard flagged the input as a possible prompt-injection attempt.",
        )

    return PromptInjectionAssessment(
        is_injection=False,
        score=float(risk_score),
        provider="LLM_GUARD_PROMPT_INJECTION_SCANNER",
        reason="LLM Guard did not flag the input as prompt injection.",
    )
