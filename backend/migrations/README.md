# Database Migrations

This directory contains Alembic database migrations for the AI Customer Retention Platform.

## Structure

- `env.py` — Alembic migration configuration
- `versions/` — versioned database migrations

## Migration workflow

Create a new migration:

```bash
alembic revision --autogenerate -m "description"
