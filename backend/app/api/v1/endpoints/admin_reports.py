from fastapi import APIRouter, Query

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.admin import ReportsOut
from app.services.report_service import ReportService

router = APIRouter()


@router.get("", response_model=ReportsOut, include_in_schema=False)
async def get_reports(db: DbSession, _: CurrentAdmin, days: int = Query(14, ge=1, le=90)):
    service = ReportService(db)
    sales = await service.sales_report(days)
    top_products = await service.top_products()
    top_sizes = await service.top_sizes()
    revenue_split = await service.retail_vs_wholesale_revenue()
    low_stock_variants = await service.low_stock_variants()

    low_stock = [
        {
            "id": v.id,
            "product_id": v.product_id,
            "product_name": v.product.name if v.product else "-",
            "size": v.size,
            "color": v.color,
            "stock_quantity": v.stock_quantity,
        }
        for v in low_stock_variants
    ]

    return {
        "sales": [{"day": str(s["day"]), "revenue": s["revenue"], "orders": s["orders"]} for s in sales],
        "top_products": top_products,
        "top_sizes": top_sizes,
        "revenue_split": revenue_split,
        "low_stock": low_stock,
    }
