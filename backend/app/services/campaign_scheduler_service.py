from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.campaign import Campaign


def process_scheduled_campaigns(
    db: Session,
) -> dict:
    now = datetime.now(timezone.utc)

    activated = 0
    completed = 0

    scheduled_campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.status == "scheduled",
            Campaign.start_date.isnot(None),
        )
        .all()
    )

    for campaign in scheduled_campaigns:
        start_date = campaign.start_date

        if start_date is None:
            continue

        if start_date.tzinfo is None:
            start_date = start_date.replace(
                tzinfo=timezone.utc
            )

        if start_date <= now:
            campaign.status = "active"
            activated += 1

    active_campaigns = (
        db.query(Campaign)
        .filter(
            Campaign.status == "active",
            Campaign.end_date.isnot(None),
        )
        .all()
    )

    for campaign in active_campaigns:
        end_date = campaign.end_date

        if end_date is None:
            continue

        if end_date.tzinfo is None:
            end_date = end_date.replace(
                tzinfo=timezone.utc
            )

        if end_date <= now:
            campaign.status = "completed"
            completed += 1

    if activated or completed:
        db.commit()

    return {
        "processed_at": now.isoformat(),
        "activated": activated,
        "completed": completed,
    }
