import { useEffect, useState } from 'react';
import { getAllCategories } from '@/services';
import type { Category } from '@/types';

export function useCategories(initialCategories: Category[] = []) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await getAllCategories();
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch {
        // Silently fail, categories are not critical
      }
    };

    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length]);

  return categories;
}
