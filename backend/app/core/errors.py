import logging
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)


#custom exception classes

class AppException(HTTPException):
    """Base exception with consistent error code."""

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        field: Optional[str] = None,
    ):
        self.code = code
        self.field = field
        super().__init__(status_code=status_code, detail=message)


class ValidationError(AppException):
    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(status.HTTP_400_BAD_REQUEST, "VALIDATION_ERROR", message, field)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, "UNAUTHORIZED", message)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Access denied"):
        super().__init__(status.HTTP_403_FORBIDDEN, "FORBIDDEN", message)


class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, "NOT_FOUND", message)


class DuplicateError(AppException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(status.HTTP_409_CONFLICT, "DUPLICATE", message)


class RateLimitedError(AppException):
    def __init__(self, message: str = "Too many requests", retry_after: int = 60):
        self.retry_after = retry_after
        super().__init__(status.HTTP_429_TOO_MANY_REQUESTS, "RATE_LIMITED", message)


class InternalError(AppException):
    def __init__(self, message: str = "Something went wrong"):
        super().__init__(status.HTTP_500_INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", message)


class MLUnavailableError(AppException):
    def __init__(self, message: str = "Prediction service temporarily unavailable"):
        super().__init__(status.HTTP_503_SERVICE_UNAVAILABLE, "ML_UNAVAILABLE", message)

#error reponse builder

def _error_body(code: str, message: str, field: Optional[str] = None) -> dict:
    body = {"error": {"code": code, "message": message}}
    if field:
        body["error"]["field"] = field
    return body


#global exception handlers

def register_error_handlers(app: FastAPI):
    """Attach all global exception handlers to the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        headers = {}
        if isinstance(exc, RateLimitedError):
            headers["Retry-After"] = str(exc.retry_after)
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.code, exc.detail, exc.field),
            headers=headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Convert Pydantic / FastAPI validation errors to our format."""
        errors = exc.errors()
        if errors:
            first = errors[0]
            field = ".".join(str(loc) for loc in first.get("loc", []) if loc != "body")
            message = first.get("msg", "Validation error")
        else:
            field = None
            message = "Request validation failed"

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=_error_body("VALIDATION_ERROR", message, field or None),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Convert standard FastAPI HTTPExceptions to our format."""
        code_map = {
            400: "VALIDATION_ERROR",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "DUPLICATE",
            429: "RATE_LIMITED",
            500: "INTERNAL_ERROR",
            503: "ML_UNAVAILABLE",
        }
        code = code_map.get(exc.status_code, "INTERNAL_ERROR")
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(code, str(exc.detail)),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        """Catch-all for unhandled exceptions — never leak internals."""
        logger.exception(f"Unhandled error on {request.method} {request.url.path}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_error_body("INTERNAL_ERROR", "Something went wrong"),
        )
