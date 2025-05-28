#!/bin/sh
curl -f http://localhost:8000/health || exit 1 