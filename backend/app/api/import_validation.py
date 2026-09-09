import csv
import io
import re

from fastapi import APIRouter, File, UploadFile


router = APIRouter(
    prefix="/imports",
    tags=["Data Import"],
)


EMAIL_PATTERN = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


@router.post("/validate")
async def validate_customer_file(
    file: UploadFile = File(...),
):
    contents = await file.read()
    text = contents.decode("utf-8")

    reader = csv.DictReader(io.StringIO(text))

    errors = []
    valid_rows = 0

    for row_number, row in enumerate(reader, start=2):
        name = row.get("name", "")
        email = row.get("email", "")

        if not name:
            errors.append(
                f"Row {row_number}: customer name is missing."
            )
            continue

        if email and not EMAIL_PATTERN.match(email):
            errors.append(
                f"Row {row_number}: invalid email address."
            )
            continue

        valid_rows += 1

    return {
        "valid_rows": valid_rows,
        "error_count": len(errors),
        "errors": errors,
    }
