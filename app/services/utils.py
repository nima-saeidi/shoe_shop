import re
import uuid


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9؀-ۿ]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    if not value:
        value = uuid.uuid4().hex[:8]
    return value


def generate_order_number() -> str:
    return f"ORD-{uuid.uuid4().hex[:10].upper()}"
