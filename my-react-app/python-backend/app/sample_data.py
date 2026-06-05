from app.schemas import PlanSummary


SYNTHETIC_PLANS = [
    PlanSummary(
        plan_id="EXAMPLE-HMO-2026",
        plan_name="Example HMO Plan",
        plan_type="HMO",
        coverage_year=2026,
        state="Minnesota",
    ),
    PlanSummary(
        plan_id="EXAMPLE-PPO-2026",
        plan_name="Example PPO Plan",
        plan_type="PPO",
        coverage_year=2026,
        state="Minnesota",
    ),
]