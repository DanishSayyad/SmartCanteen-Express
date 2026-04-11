import type { OrderStatus } from '@/types/api';

export const orderStatusMeta: Record<
  OrderStatus,
  {
    label: string;
    tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
    blurb: string;
  }
> = {
  CREATED: {
    label: 'Created',
    tone: 'neutral',
    blurb: 'Order has been drafted and is waiting for payment.'
  },
  PAYMENT_PENDING: {
    label: 'Payment Pending',
    tone: 'warning',
    blurb: 'Payment was started and is waiting for confirmation.'
  },
  PAID: {
    label: 'Paid',
    tone: 'accent',
    blurb: 'Payment completed successfully.'
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    tone: 'danger',
    blurb: 'Payment did not complete. You can retry checkout.'
  },
  CANCELLED: {
    label: 'Cancelled',
    tone: 'danger',
    blurb: 'This order was cancelled before completion.'
  },
  QR_GENERATED: {
    label: 'QR Ready',
    tone: 'accent',
    blurb: 'The QR token is active and ready for scanning.'
  },
  CONFIRMED: {
    label: 'Confirmed',
    tone: 'accent',
    blurb: 'The customer has checked in and the kitchen acknowledged the order.'
  },
  PREPARING: {
    label: 'Preparing',
    tone: 'warning',
    blurb: 'The kitchen is preparing the order.'
  },
  READY: {
    label: 'Ready',
    tone: 'success',
    blurb: 'The order is ready for pickup or handover.'
  },
  COMPLETED: {
    label: 'Completed',
    tone: 'success',
    blurb: 'The order lifecycle has been completed.'
  },
  EXPIRED: {
    label: 'Expired',
    tone: 'danger',
    blurb: 'The QR token expired before the order was confirmed.'
  },
  REFUNDED: {
    label: 'Refunded',
    tone: 'danger',
    blurb: 'The payment was refunded to the customer.'
  },
  ISSUE_REPORTED: {
    label: 'Issue Reported',
    tone: 'danger',
    blurb: 'A customer issue has been raised for this order.'
  },
  DELAYED: {
    label: 'Delayed',
    tone: 'warning',
    blurb: 'The order is running behind the configured SLA.'
  }
};

export const managerActionsByStatus: Partial<
  Record<OrderStatus, Array<'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'>>
> = {
  CONFIRMED: ['PREPARING', 'CANCELLED', 'REFUNDED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  DELAYED: ['PREPARING', 'READY', 'REFUNDED']
};
