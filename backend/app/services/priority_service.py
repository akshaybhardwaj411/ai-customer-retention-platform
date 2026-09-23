from dataclasses import dataclass


@dataclass
class PriorityResult:
    priority_score: float
    priority_level: str


def calculate_priority(
    churn_probability: float | None,
    customer_value: float | None,
    intervention_opportunity: float | None,
) -> PriorityResult:
    """
    Calculate a retention priority score.

    Inputs should be normalized between 0 and 1.

    Priority =
        Churn Risk
        × Customer Value
        × Intervention Opportunity
    """

    risk = _normalize(churn_probability)
    value = _normalize(customer_value)
    opportunity = _normalize(
        intervention_opportunity
    )

    score = risk * value * opportunity

    priority_level = _priority_level(score)

    return PriorityResult(
        priority_score=round(score, 4),
        priority_level=priority_level,
    )


def _normalize(value: float | None) -> float:
    if value is None:
        return 0.0

    return max(
        0.0,
        min(1.0, float(value)),
    )


def _priority_level(score: float) -> str:
    if score >= 0.70:
        return "critical"

    if score >= 0.45:
        return "high"

    if score >= 0.20:
        return "medium"

    return "low"
