# Docker Setup for Offer Management Platform

This document provides instructions for running the Offer Management Platform using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Quick Start

1. Start the application:

```bash
docker-compose up
```

This will:
- Start a PostgreSQL database container
- Initialize the database schema and create a default admin user
- Start the API service

2. Access the application:
   - API: http://localhost:8000
   - Health check: http://localhost:8000/health

## Default Credentials

- Username: `admin`
- Password: `password` (the hash in init script is for 'password')
- Default tenant: `credit_card`

## Useful Commands

### View logs

```bash
docker-compose logs -f
```

### Reset the environment

If you encounter database issues or want to start fresh:

```bash
# Use the reset script
./scripts/reset-docker-env.sh

# Or manually:
docker-compose down
docker-compose --profile cleanup up db-cleanup
docker-compose up -d
```

### Rebuild containers

If you've made changes to the Dockerfile:

```bash
docker-compose build --no-cache
docker-compose up
```

## Troubleshooting

### Database connection issues

1. Check if the database container is running:
   ```bash
   docker ps | grep offer-management-db
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres-offer-db
   ```

3. Test database connection from host:
   ```bash
   docker exec -it offer-management-db psql -U postgres -d offer_management -c "SELECT 1"
   ```

### API service issues

1. Check API logs:
   ```bash
   docker-compose logs backend-apis
   ```

2. Check health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

## Container Details

### postgres-offer-db
- PostgreSQL 15 (Alpine-based for smaller size)
- Stores data in a Docker volume
- Exposed on port 5432

### backend-apis
- Python 3.11 with FastAPI
- Uses a multi-stage build for smaller image size
- Healthcheck included
- Exposed on port 8000 