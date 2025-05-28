from sqlalchemy import create_engine, text
import os
from contextlib import contextmanager
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_url():
    """Get database URL from environment variable."""
    return os.environ.get("DATABASE_URL", "")

@contextmanager
def get_db_connection(max_retries=5, retry_interval=2):
    """Create a database connection with retry logic."""
    db_url = get_db_url()
    engine = create_engine(db_url)
    retries = 0
    
    while retries < max_retries:
        try:
            connection = engine.connect()
            try:
                yield connection
                break
            finally:
                connection.close()
        except Exception as e:
            retries += 1
            logger.error(f"Database connection attempt {retries} failed: {str(e)}")
            if retries < max_retries:
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error("Maximum retries reached. Could not connect to database.")
                raise

def check_db_connection():
    """Check if database connection is working."""
    try:
        with get_db_connection() as conn:
            result = conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return False

if __name__ == "__main__":
    # When run directly, perform a check and exit with appropriate status code
    if check_db_connection():
        print("Database connection successful")
        exit(0)
    else:
        print("Database connection failed")
        exit(1) 