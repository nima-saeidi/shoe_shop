from fastapi import APIRouter, Request

from app.admin.deps import CurrentAdminUser, DbSession
from app.admin.templating import templates
from app.services.report_service import ReportService

router = APIRouter()


@router.get("")
async def reports_page(request: Request, db: DbSession, current_admin: CurrentAdminUser, days: int = 14):
    service = ReportService(db)
    sales = await service.sales_report(days)
    top_products = await service.top_products()
    top_sizes = await service.top_sizes()
    revenue_split = await service.retail_vs_wholesale_revenue()
    low_stock = await service.low_stock_variants()
    return templates.TemplateResponse(
        "reports/index.html",
        {
            "request": request,
            "current_admin": current_admin,
            "sales": sales,
            "top_products": top_products,
            "top_sizes": top_sizes,
            "revenue_split": revenue_split,
            "low_stock": low_stock,
            "days": days,
            "active_page": "reports",
        },
    )
