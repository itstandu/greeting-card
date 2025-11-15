'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CategoryCard, CategoryCardSkeleton } from '@/components/ui/category-card';
import { getAllCategories } from '@/services';
import type { Category } from '@/types';
import { ArrowRight, FolderOpen } from 'lucide-react';

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response.data) {
          // Filter active categories and show featured ones first
          const activeCategories = response.data
            .filter(c => c.isActive !== false)
            .sort((a, b) => {
              // Featured first
              if (a.isFeatured && !b.isFeatured) return -1;
              if (!a.isFeatured && b.isFeatured) return 1;
              // Then by displayOrder
              return (a.displayOrder || 0) - (b.displayOrder || 0);
            })
            .slice(0, 6);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 flex items-center justify-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
              <FolderOpen className="text-primary h-8 w-8" />
              Khám phá danh mục
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Tìm kiếm thiệp và quà tặng phù hợp với mọi dịp trong cuộc sống.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={i} variant="default" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-foreground mb-4 flex items-center justify-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl md:justify-start">
              <FolderOpen className="text-primary h-8 w-8" />
              Khám phá danh mục
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Tìm kiếm thiệp và quà tặng phù hợp với mọi dịp trong cuộc sống.
            </p>
          </div>
          <Button asChild variant="ghost" className="group">
            <Link href="/categories" className="text-primary flex items-center font-semibold">
              Xem tất cả danh mục{' '}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} variant="default" showDescription />
          ))}
        </div>
      </div>
    </section>
  );
}
