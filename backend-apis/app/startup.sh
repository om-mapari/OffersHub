#!/bin/bash
set -e

# Wait for database to be ready
python -m app.wait_for_db

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 