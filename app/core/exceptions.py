class AppException(Exception):
    status_code = 400
    detail = "Application error"

    def __init__(self, detail: str | None = None, status_code: int | None = None):
        if detail:
            self.detail = detail
        if status_code:
            self.status_code = status_code
        super().__init__(self.detail)


class NotFoundError(AppException):
    status_code = 404
    detail = "Resource not found"


class AlreadyExistsError(AppException):
    status_code = 409
    detail = "Resource already exists"


class PermissionDeniedError(AppException):
    status_code = 403
    detail = "Permission denied"


class InvalidCredentialsError(AppException):
    status_code = 401
    detail = "Invalid credentials"


class BadRequestError(AppException):
    status_code = 400
    detail = "Bad request"


class InsufficientStockError(AppException):
    status_code = 409
    detail = "Insufficient stock"
