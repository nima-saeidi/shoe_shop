import type { OrderStatus, PaymentStatus } from './types'

export const ORDER_STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
export const SHIPPING_PROVIDERS = ['پست پیشتاز', 'تیپاکس', 'باربری', 'پیک موتوری', 'سایر']
