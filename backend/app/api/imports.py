import csv
import io
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.customer import Customer


router = APIRouter(
    prefix="/imports",
    tags=["Data Import"],
)


@router.post("/customers")
async def import_customers(
    organization_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A CSV file is required.",
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )

    contents = await file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="The CSV file must use UTF-8 encoding.",
        )

    reader = csv.DictReader(
        io.StringIO(text)
    )

    if not reader.fieldnames:
        raise HTTPException(
            status_code=400,
            detail="The CSV file has no header row.",
        )

    required_columns = {
        "name",
        "email",
    }

    available_columns = {
        column.strip().lower()
        for column in reader.fieldnames
        if column
    }

    missing_columns = (
        required_columns - available_columns
    )

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=(
                "Missing required columns: "
                + ", ".join(
                    sorted(missing_columns)
                )
            ),
        )

    imported = 0
    skipped = 0

    for row in reader:
        name = (
            row.get("name")
            or row.get("Name")
            or ""
        ).strip()

        email = (
            row.get("email")
            or row.get("Email")
            or ""
        ).strip()

        if not name:
            skipped += 1
            continue

        customer = Customer(
            organization_id=organization_id,
            name=name,
            email=email or None,
        )

        db.add(customer)
        imported += 1

    db.commit()

    return {
        "message": "Customer import completed",
        "imported": imported,
        "skipped": skipped,
    }
