import time, uuid, logging
from fastapi import Request
from typing import Callable

logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next: Callable):
    request_id = str(uuid.uuid4())
    logger.info(f"Request {request_id} started: {request.method} {request.url.path}")
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(f"Request {request_id} completed in {process_time:.3f}s")
    return response
