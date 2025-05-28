#!/bin/bash
set -e

# Print what we're doing
echo "Stopping running containers..."
docker-compose down

# Clean up the database volume
echo "Cleaning up database volume..."
docker-compose --profile cleanup up db-cleanup

# Confirm it's done
echo "Database volume cleaned. Now starting fresh environment..."

# Start the environment
docker-compose up -d

# Print information on how to view logs
echo ""
echo "Environment started. To view logs:"
echo "docker-compose logs -f"
echo ""
echo "To check backend health:"
echo "curl http://localhost:8000/health" 