'use client';

import { useParams } from 'next/navigation';
import { CategoryDetailClient } from '@/components/categories/CategoryDetailClient';
import { useCategoryDetail } from '@/hooks/use-category-detail';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { category, products, allCategories, loading, error } = useCategoryDetail(slug);

  return (
    <CategoryDetailClient
      category={category}
      products={products}
      allCategories={allCategories}
      loading={loading}
      error={error}
    />
  );
}
