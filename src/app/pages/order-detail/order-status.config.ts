// src/app/config/order-status.config.ts
export const ORDER_STATUSES = [
    'Pending',
    'Processing',
    'Shipped',
    'Completed',
    'Cancelled',
    'Created',
    'Updated',
    'PaymentConfirmed',
    'Refunded',
    'OutForDelivery',
    'Delivered',
    'DeliveryFailed'
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
    Pending: 'ORDER.PENDING',
    Processing: 'ORDER.PROCESSING',
    Shipped: 'ORDER.SHIPPED',
    Completed: 'ORDER.COMPLETED',
    Cancelled: 'ORDER.CANCELLED',
    Created: 'ORDER.CREATED',
    Updated: 'ORDER.UPDATED',
    PaymentConfirmed: 'ORDER.PAYMENT_CONFIRMED',
    Refunded: 'ORDER.REFUNDED',
    OutForDelivery: 'ORDER.OUT_FOR_DELIVERY',
    Delivered: 'ORDER.DELIVERED',
    DeliveryFailed: 'ORDER.DELIVERY_FAILED'
};

export const STATUS_ICONS: Record<OrderStatus, string> = {
    Pending: 'pi pi-clock text-yellow-500',
    Processing: 'pi pi-cog text-blue-500',
    Shipped: 'pi pi-truck text-indigo-500',
    Completed: 'pi pi-check-circle text-green-600',
    Cancelled: 'pi pi-times-circle text-red-500',
    Created: 'pi pi-plus-circle text-green-500',
    Updated: 'pi pi-pencil text-blue-500',
    PaymentConfirmed: 'pi pi-credit-card text-emerald-500',
    Refunded: 'pi pi-refresh text-yellow-500',
    OutForDelivery: 'pi pi-send text-indigo-500',
    Delivered: 'pi pi-home text-green-600',
    DeliveryFailed: 'pi pi-exclamation-circle text-red-600'
};
