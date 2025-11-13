export type NotificationType = 'ORDER' | 'PRODUCT' | 'SYSTEM';

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
};

export type UnreadCount = {
  count: number;
};
