'use client';

import Link from 'next/link';
import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'compact';
  backgroundImage?: string;
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  children,
  className,
  variant = 'default',
  backgroundImage,
  badge,
}: PageHeaderProps) {
  const containerClasses = cn(
    'relative',
    variant === 'hero' && 'py-12 md:py-16 lg:py-20',
    variant === 'default' && 'py-8 md:py-10',
    variant === 'compact' && 'py-4 md:py-6',
    backgroundImage && 'overflow-hidden',
    className,
  );

  const contentClasses = cn('container mx-auto px-4', backgroundImage && 'relative z-10');

  return (
    <div className={containerClasses}>
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/70" />
        </>
      )}

      <div className={contentClasses}>
        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb className={cn('mb-4', backgroundImage && 'text-white/80')}>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className={cn(
                      'hover:text-primary flex items-center gap-1.5',
                      backgroundImage && 'hover:text-white',
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <span>Trang chủ</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'hover:text-primary',
                            backgroundImage && 'hover:text-white',
                          )}
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className={cn(backgroundImage && 'font-medium text-white')}>
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header Content */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            {badge && <div className="mb-2">{badge}</div>}
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight md:text-4xl',
                backgroundImage && 'text-white',
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  'text-muted-foreground max-w-2xl text-lg',
                  backgroundImage && 'text-white/80',
                )}
              >
                {description}
              </p>
            )}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}
