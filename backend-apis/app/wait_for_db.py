import time
import sys
import logging
from sqlalchemy import create_engine, text
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db(max_attempts=30, wait_seconds=2):
    """
    Wait for database to become available.
    
    Args:
        max_attempts: Maximum number of connection attempts
        wait_seconds: Wait time between attempts in seconds
    
    Returns:
        bool: True if connection succeeded, False otherwise
    """
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL environment variable not set")
        return False
    
    logger.info(f"Waiting for database to become available at {database_url}...")
    
    engine = create_engine(database_url)
    attempt = 0
    
    while attempt < max_attempts:
        attempt += 1
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                logger.info("Database connection successful!")
                return True
        except Exception as e:
            logger.warning(f"Database connection attempt {attempt}/{max_attempts} failed: {str(e)}")
            if attempt < max_attempts:
                logger.info(f"Retrying in {wait_seconds} seconds...")
                time.sleep(wait_seconds)
    
    logger.error("Maximum connection attempts reached. Database is not available.")
    return False

if __name__ == "__main__":
    # Exit with non-zero status if the database is not available
    if not wait_for_db():
        sys.exit(1)
    sys.exit(0) 