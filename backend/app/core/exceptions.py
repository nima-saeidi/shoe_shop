class AppException(Exception):
    status_code = 400
    detail = "خطای برنامه"

    def __init__(self, detail: str | None = None, status_code: int | None = None):
        if detail:
            self.detail = detail
        if status_code:
            self.status_code = status_code
        super().__init__(self.detail)


class NotFoundError(AppException):
    status_code = 404
    detail = "مورد درخواستی پیدا نشد"


class AlreadyExistsError(AppException):
    status_code = 409
    detail = "این مورد قبلاً ثبت شده است"


class PermissionDeniedError(AppException):
    status_code = 403
    detail = "شما اجازه این کار را ندارید"


class InvalidCredentialsError(AppException):
    status_code = 401
    detail = "اطلاعات ورود نامعتبر است"


class BadRequestError(AppException):
    status_code = 400
    detail = "درخواست نامعتبر است"


class InsufficientStockError(AppException):
    status_code = 409
    detail = "موجودی کافی نیست"
