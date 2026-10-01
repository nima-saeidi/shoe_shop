#!/bin/sh
set -e

# Apply database migrations before serving traffic (idempotent).
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  echo "Running database migrations..."
  alembic upgrade head
fi

exec "$@"
