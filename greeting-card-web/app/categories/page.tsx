import { CategoriesPageClient } from '@/components/categories/CategoriesPageClient';
import { getAllCategories } from '@/services';
import type { Category } from '@/types';

// Server component - fetches all categories
export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const response = await getAllCategories();
    categories = response.data || [];
  } catch {
    // Show empty state on error
  }

  return <CategoriesPageClient categories={categories} />;
}
