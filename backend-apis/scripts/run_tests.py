#!/usr/bin/env python3
"""
Script to run API tests for the Offer Management Platform.
"""

import sys
import os
import subprocess
from pathlib import Path

# Add the parent directory to sys.path to properly import from app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

def run_tests():
    """Run pytest for API tests."""
    # Make sure we're using the right dependencies
    try:
        import pytest
        import fastapi
        import httpx
    except ImportError:
        print("Installing test dependencies...")
        subprocess.run(["pip", "install", "pytest", "pytest-asyncio", "httpx"], check=True)
    
    # Prepare test environment
    os.environ["TESTING"] = "True"
    
    # Run the tests
    print("Running API tests...")
    result = subprocess.run([
        "pytest", 
        "-xvs", 
        "tests/api/v1/",
        "--cov=app",
        "--cov-report=term-missing"
    ], check=False)
    
    if result.returncode != 0:
        print("Tests failed.")
        return False
    
    print("All tests passed!")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1) 