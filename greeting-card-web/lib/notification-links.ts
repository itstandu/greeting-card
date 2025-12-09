import type { Notification } from '@/types';

const ORDER_LINK_PATTERN = /^\/orders\/(\d+)(?:\/)?$/;
const ADMIN_ORDER_LINK_PATTERN = /^\/admin\/orders\/(\d+)(?:\/)?$/;

export function getNotificationLink(notification: Notification): string {
  const { linkUrl } = notification;
  if (!linkUrl) return '#';

  const orderMatch = ORDER_LINK_PATTERN.exec(linkUrl);
  if (orderMatch) {
    return `/orders?orderId=${orderMatch[1]}`;
  }

  const adminOrderMatch = ADMIN_ORDER_LINK_PATTERN.exec(linkUrl);
  if (adminOrderMatch) {
    return `/admin/orders?orderId=${adminOrderMatch[1]}`;
  }

  return linkUrl;
}
