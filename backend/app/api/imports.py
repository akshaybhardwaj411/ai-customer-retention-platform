import csv
import io
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
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
    contents = await file.read()
    text = contents.decode("utf-8")

    reader = csv.DictReader(io.StringIO(text))

    imported = 0

    for row in reader:
        name = row.get("name")
        email = row.get("email")

        if not name:
            continue

        customer = Customer(
            organization_id=organization_id,
            name=name,
            email=email,
        )

        db.add(customer)
        imported += 1

    db.commit()

    return {
        "message": "Customer import completed",
        "imported": imported,
    }
