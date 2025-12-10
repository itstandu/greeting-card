'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Clock,
  Gift,
  Heart,
  LucideIcon,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';

interface FeatureBadgeProps {
  icon: LucideIcon;
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export function FeatureBadge({
  icon: Icon,
  text,
  variant = 'default',
  className,
}: FeatureBadgeProps) {
  const variantClasses = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 px-2.5 py-1 font-normal', variantClasses[variant], className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </Badge>
  );
}

// Promotional Banner Component
interface PromoBannerProps {
  title: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'gradient';
  icon?: LucideIcon;
  className?: string;
}

export function PromoBanner({
  title,
  description,
  variant = 'primary',
  icon: Icon = Gift,
  className,
}: PromoBannerProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    gradient: 'bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 text-white',
  };

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl p-6', variantClasses[variant], className)}
    >
      <div className="absolute -top-6 -right-6 opacity-10">
        <Icon className="h-32 w-32" />
      </div>
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
    </div>
  );
}

// Trust Badges Section
export function TrustBadges({ className }: { className?: string }) {
  const badges = [
    {
      icon: Truck,
      title: 'Miễn phí vận chuyển',
      description: 'Đơn hàng từ 500.000đ',
    },
    {
      icon: ShieldCheck,
      title: 'Bảo đảm chất lượng',
      description: 'Đổi trả trong 7 ngày',
    },
    {
      icon: Clock,
      title: 'Giao hàng nhanh',
      description: '2-3 ngày làm việc',
    },
    {
      icon: MessageCircle,
      title: 'Hỗ trợ 24/7',
      description: 'Tư vấn tận tâm',
    },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}>
      {badges.map((badge, index) => (
        <Card key={index} className="border-dashed">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <badge.icon className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{badge.title}</p>
              <p className="text-muted-foreground truncate text-xs">{badge.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Category Quick Links
interface QuickLink {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
}

interface QuickLinksProps {
  title?: string;
  links: QuickLink[];
  className?: string;
}

export function QuickLinks({ title, links, className }: QuickLinksProps) {
  return (
    <Card className={className}>
      <CardContent className="px-4">
        {title && <h3 className="mb-3 font-semibold">{title}</h3>}
        <div className="flex flex-wrap gap-2">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="hover:bg-accent hover:border-primary/50 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
            >
              {link.icon && <link.icon className="h-3.5 w-3.5" />}
              {link.label}
              {link.badge && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {link.badge}
                </Badge>
              )}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sale Badge
interface SaleBadgeProps {
  percentage: number;
  className?: string;
}

export function SaleBadge({ percentage, className }: SaleBadgeProps) {
  return (
    <Badge className={cn('bg-red-500 font-bold text-white hover:bg-red-600', className)}>
      -{percentage}%
    </Badge>
  );
}

// New Arrival Badge
export function NewBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn('bg-green-500 text-white hover:bg-green-600', className)}>
      <Sparkles className="mr-1 h-3 w-3" />
      Mới
    </Badge>
  );
}

// Best Seller Badge
export function BestSellerBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn('bg-amber-500 text-white hover:bg-amber-600', className)}>
      <Star className="mr-1 h-3 w-3 fill-current" />
      Bán chạy
    </Badge>
  );
}

// Limited Badge
export function LimitedBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn('border-red-200 bg-red-50 text-red-700', className)}>
      <Heart className="mr-1 h-3 w-3" />
      Số lượng có hạn
    </Badge>
  );
}

// Stats Display
interface StatItem {
  value: string | number;
  label: string;
}

interface StatsDisplayProps {
  stats: StatItem[];
  className?: string;
}

export function StatsDisplay({ stats, className }: StatsDisplayProps) {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="text-primary text-2xl font-bold">{stat.value}</p>
          <p className="text-muted-foreground text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
