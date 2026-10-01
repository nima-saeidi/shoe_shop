from fastapi.templating import Jinja2Templates

from app.admin.translations import translate

templates = Jinja2Templates(directory="app/admin/templates")


def flash(request, message: str, category: str = "success") -> None:
    messages = request.session.setdefault("_flashes", [])
    messages.append({"message": message, "category": category})


def get_flashed_messages(request) -> list[dict]:
    return request.session.pop("_flashes", [])


templates.env.globals["get_flashed_messages"] = get_flashed_messages
templates.env.globals["t"] = translate


def format_toman(value) -> str:
    try:
        return f"{float(value):,.0f}"
    except (TypeError, ValueError):
        return "0"


templates.env.filters["toman"] = format_toman
