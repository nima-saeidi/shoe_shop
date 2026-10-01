FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Override with a closer mirror when files.pythonhosted.org is slow/blocked (see PIP_INDEX_URL in .env.example).
ARG PIP_INDEX_URL=https://pypi.org/simple
ENV PIP_INDEX_URL=$PIP_INDEX_URL
COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=120 --retries 10 -r requirements.txt

COPY . .

# Run as an unprivileged user; uploads/ and logs/ are the only writable paths (mounted as volumes).
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /code/app/static/uploads /code/logs \
    && chown -R appuser:appuser /code/app/static/uploads /code/logs \
    && chmod +x /code/docker-entrypoint.sh
USER appuser

EXPOSE 8000

ENTRYPOINT ["/code/docker-entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
