from dataclasses import dataclass


@dataclass(frozen=True)
class KnowledgeChunk:
    chunk_id: str
    plan_id: str
    document: str
    section: str
    version: str
    passage: str


KNOWLEDGE_CHUNKS: list[KnowledgeChunk] = [
    KnowledgeChunk(
        chunk_id="hmo-referral-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Example HMO Member Guide",
        section="Specialist Referral Requirements",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Members enrolled in the Example HMO Plan "
            "must obtain a primary care referral before scheduling a non-emergency "
            "dermatology specialist visit. Emergency services do not require prior referral."
        ),
    ),
    KnowledgeChunk(
        chunk_id="ppo-referral-001",
        plan_id="EXAMPLE-PPO-2026",
        document="Example PPO Member Guide",
        section="Specialist Referral Requirements",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Members enrolled in the Example PPO Plan "
            "generally do not need a referral before seeing an in-network specialist, "
            "but some services may require prior authorization."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-refill-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Prescription Refill Support Guide",
        section="Prescription Refill Support",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Members can request prescription refills "
            "through the member portal, pharmacy app, or by contacting their pharmacy directly."
        ),
    ),
    KnowledgeChunk(
        chunk_id="ppo-refill-001",
        plan_id="EXAMPLE-PPO-2026",
        document="Prescription Refill Support Guide",
        section="Prescription Refill Support",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Members can request prescription refills "
            "through the member portal, pharmacy app, or by contacting their pharmacy directly."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-deductible-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Claims and Deductibles FAQ",
        section="Deductible and Claims Support",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Members can view deductible progress and "
            "claims status in the member portal or by contacting member services."
        ),
    ),
    KnowledgeChunk(
        chunk_id="ppo-deductible-001",
        plan_id="EXAMPLE-PPO-2026",
        document="Claims and Deductibles FAQ",
        section="Deductible and Claims Support",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Members can view deductible progress and "
            "claims status in the member portal or by contacting member services."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-emergency-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Nurse Line and Emergency Routing Guide",
        section="Emergency Routing",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Emergency symptoms should not be handled "
            "as ordinary benefits questions. Members should seek emergency care or call "
            "emergency services for urgent symptoms."
        ),
    ),
    KnowledgeChunk(
        chunk_id="ppo-emergency-001",
        plan_id="EXAMPLE-PPO-2026",
        document="Nurse Line and Emergency Routing Guide",
        section="Emergency Routing",
        version="2026.01",
        passage=(
            "Synthetic/demo-only guidance. Emergency symptoms should not be handled "
            "as ordinary benefits questions. Members should seek emergency care or call "
            "emergency services for urgent symptoms."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-referral-approval-002",
        plan_id="EXAMPLE-HMO-2026",
        document="Example HMO Member Guide",
        section="Specialist Referral Requirements",
        version="2026.1",
        passage=(
            "Members enrolled in the Example HMO Member Plan should contact their "
            "primary care provider before scheduling most non-emergency specialist "
            "visits. Dermatology, cardiology, orthopedics, and other specialist visits "
            "may require a primary care referral. This is synthetic demonstration content "
            "and is not real benefit guidance."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-prescription-refill-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Example HMO Pharmacy Guide",
        section="Prescription Refill Support",
        version="2026.1",
        passage=(
            "Members can request eligible prescription refills through the synthetic "
            "member portal, participating pharmacy, or pharmacy mobile application. "
            "Controlled substances, expired prescriptions, or prescriptions with no "
            "remaining refills may require prescriber review. This is synthetic demonstration "
            "content and is not real pharmacy guidance."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-deductible-claims-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Example HMO Claims and Deductibles FAQ",
        section="Claims and Deductible Information",
        version="2026.1",
        passage=(
            "Members can view synthetic deductible progress, claim status, and explanation "
            "of benefits information in the member portal. Claim records shown in this "
            "demonstration are fictional and do not represent real healthcare claims."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-member-services-unsupported-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Example HMO Member Services Guide",
        section="Unsupported Coverage Questions",
        version="2026.1",
        passage=(
            "Questions about future coverage years, specific surgery approval, individual "
            "medical necessity, final claim payment, or real member account information "
            "must be handled by member services. The synthetic assistant should not invent "
            "coverage decisions when approved plan information is unavailable."
        ),
    ),
    KnowledgeChunk(
        chunk_id="hmo-privacy-verification-001",
        plan_id="EXAMPLE-HMO-2026",
        document="Example HMO Privacy and Verification Guide",
        section="Member Verification and Privacy",
        version="2026.1",
        passage=(
            "This demonstration system uses synthetic member information only. Users should "
            "not enter real member IDs, dates of birth, addresses, diagnoses, claim numbers, "
            "or other personal health information."
        ),
    ),
]
