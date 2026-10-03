import { formatToman } from '@/utils/format'
import type { Order } from '../types'

/** Line items of an order plus the totals block. */
export function OrderItemsTable({ order }: { order: Order }) {
  return (
    <section className="card overflow-x-auto p-5">
      <table className="w-full min-w-[28rem] text-sm">
        <thead className="text-muted">
          <tr className="text-start">
            <th className="pb-2 text-start font-medium">کالا</th>
            <th className="pb-2 text-start font-medium">قیمت واحد</th>
            <th className="pb-2 text-start font-medium">تعداد</th>
            <th className="pb-2 text-start font-medium">جمع</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {order.items.map((i) => (
            <tr key={i.id}>
              <td className="py-3">{i.product_name}<span className="block text-xs text-muted">سایز {i.size} · {i.color}</span></td>
              <td>{formatToman(i.unit_price)}</td>
              <td>{i.quantity.toLocaleString('fa-IR')}</td>
              <td>{formatToman(i.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 ms-auto max-w-xs space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-muted">جمع کالاها</dt><dd>{formatToman(order.subtotal)}</dd></div>
        {order.discount_total > 0 && <div className="flex justify-between"><dt className="text-muted">تخفیف</dt><dd>−{formatToman(order.discount_total)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted">هزینه ارسال</dt><dd>{formatToman(order.shipping_cost)}</dd></div>
        <div className="flex justify-between text-base font-bold"><dt>مبلغ نهایی</dt><dd>{formatToman(order.grand_total)}</dd></div>
      </dl>
    </section>
  )
}
