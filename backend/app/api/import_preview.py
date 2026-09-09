import csv
import io

from fastapi import APIRouter, File, UploadFile


router = APIRouter(
    prefix="/imports",
    tags=["Data Import"],
)


@router.post("/preview")
async def preview_customer_file(
    file: UploadFile = File(...),
):
    contents = await file.read()
    text = contents.decode("utf-8")

    reader = csv.DictReader(io.StringIO(text))

    columns = reader.fieldnames or []

    rows = []

    for index, row in enumerate(reader):
        if index >= 5:
            break

        rows.append(row)

    return {
        "filename": file.filename,
        "columns": columns,
        "preview_rows": rows,
    }
