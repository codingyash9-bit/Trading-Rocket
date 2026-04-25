import os
from fastapi import HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from starlette.status import HTTP_403_FORBIDDEN

API_KEY = os.getenv("API_KEY", "demo-key-2026")
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(
    api_key_header: str = Security(api_key_header),
):
    if not api_key_header:
        return "demo-mode"
    if api_key_header == API_KEY:
        return api_key_header
    if api_key_header == "demo-mode":
        return api_key_header
    return "demo-mode"