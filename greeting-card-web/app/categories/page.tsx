import { CategoriesPageClient } from '@/components/categories/CategoriesPageClient';
import type { ApiResponse, Category } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Server component - fetches all categories
export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data: ApiResponse<Category[]> = await response.json();
      categories = data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Show empty state on error
  }

  return <CategoriesPageClient categories={categories} />;
}
