"""
Minimal in-memory rate limiter for brute-force-prone endpoints (login forms).

This is intentionally dependency-free and process-local: fine for a single-worker
deployment. If the app is ever run with multiple worker processes or replicas,
swap this for a shared backend (e.g. Redis) so limits are enforced consistently.
"""
import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, max_attempts: int, window_seconds: int):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._hits: dict[str, list[float]] = defaultdict(list)

    def _key(self, request: Request, extra: str = "") -> str:
        client_ip = request.client.host if request.client else "unknown"
        return f"{client_ip}:{extra}"

    def check(self, request: Request, extra: str = "") -> None:
        key = self._key(request, extra)
        now = time.monotonic()
        window_start = now - self.window_seconds
        hits = [t for t in self._hits[key] if t > window_start]
        if len(hits) >= self.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="تعداد تلاش‌های شما بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
            )
        hits.append(now)
        self._hits[key] = hits

    def reset(self, request: Request, extra: str = "") -> None:
        self._hits.pop(self._key(request, extra), None)


login_rate_limiter = RateLimiter(max_attempts=10, window_seconds=300)
