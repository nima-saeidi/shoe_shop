from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Shoe Shop"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str
    SYNC_DATABASE_URL: str

    SECRET_KEY: str
    SESSION_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    UPLOAD_DIR: str = "app/static/uploads"
    BACKEND_CORS_ORIGINS: List[str] = []

    API_V1_PREFIX: str = "/api/v1"

    # --- SMS gateway (placeholder — to be wired up later) ---
    SMS_PROVIDER: str = ""  # e.g. "kavenegar", "ippanel", "melipayamak"
    SMS_API_KEY: str = ""
    SMS_SENDER_NUMBER: str = ""

    # --- Payment gateway (placeholder — to be wired up later) ---
    PAYMENT_PROVIDER: str = ""  # e.g. "zarinpal", "idpay", "nextpay"
    PAYMENT_MERCHANT_ID: str = ""
    PAYMENT_CALLBACK_URL: str = "http://localhost:8000/api/v1/payments/callback"

    WHOLESALE_MIN_ORDER_AMOUNT: float = 0

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
