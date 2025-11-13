'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUnreadCount } from '@/services';
import { Bell } from 'lucide-react';

type NotificationBellProps = {
  onClick?: () => void;
};

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
      <Bell className="h-5 w-5" />
      {!loading && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
