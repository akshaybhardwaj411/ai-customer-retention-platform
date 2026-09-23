def generate_recommendation(
    risk_factors: list[dict],
) -> dict:
    """
    Generate a deterministic retention recommendation
    from the strongest identified risk factor.
    """

    if not risk_factors:
        return {
            "action_type": "review_customer",
            "reason": (
                "Review the customer for available "
                "retention opportunities."
            ),
        }

    top_factor = risk_factors[0]

    feature = str(
        top_factor.get("feature", "")
    ).lower()

    label = str(
        top_factor.get("label", "A key customer factor")
    )

    impact = float(
        top_factor.get("impact", 0)
    )

    # A negative SHAP value means the strongest factor
    # is currently reducing churn risk.
    if impact <= 0:
        return {
            "action_type": "engage_customer",
            "reason": (
                f"{label} is currently associated with "
                "lower churn risk. Maintain engagement "
                "and continue monitoring the customer."
            ),
        }

    if "monthly_charges" in feature:
        return {
            "action_type": "review_plan_value",
            "reason": (
                "Monthly charges are contributing to "
                "higher churn risk. Review plan value, "
                "pricing, or available alternatives."
            ),
        }

    if "contract" in feature:
        return {
            "action_type": "contract_retention",
            "reason": (
                "Contract characteristics are contributing "
                "to churn risk. Consider a suitable renewal "
                "or longer-term plan conversation."
            ),
        }

    if "tenure" in feature:
        return {
            "action_type": "customer_engagement",
            "reason": (
                "Customer tenure is a significant risk factor. "
                "Consider proactive engagement and "
                "value reinforcement."
            ),
        }

    if "payment_method" in feature:
        return {
            "action_type": "payment_support",
            "reason": (
                "Payment method is contributing to churn risk. "
                "Review the payment experience and available "
                "payment options."
            ),
        }

    if "online_security" in feature:
        return {
            "action_type": "security_value_offer",
            "reason": (
                "Online security is a relevant risk factor. "
                "Consider highlighting relevant security "
                "features and value."
            ),
        }

    if "tech_support" in feature:
        return {
            "action_type": "support_outreach",
            "reason": (
                "Technical support is a relevant risk factor. "
                "Consider proactive support outreach."
            ),
        }

    return {
        "action_type": "retention_outreach",
        "reason": (
            f"{label} is contributing to higher churn risk. "
            "Consider proactive retention outreach."
        ),
    }
