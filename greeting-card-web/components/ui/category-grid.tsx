import { CategoryCard, CategoryCardSkeleton } from '@/components/ui/category-card';
import { cn } from '@/lib/utils';
import { Category } from '@/types';

type CategoryGridVariant = 'default' | 'compact' | 'featured' | 'horizontal';
type GridDensity = 'compact' | 'normal' | 'spacious';

interface CategoryGridProps {
  categories: Category[];
  variant?: CategoryGridVariant;
  density?: GridDensity;
  loading?: boolean;
  showDescription?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
  className?: string;
}

// Static grid classes for different densities - ensures cards maintain good width
const gridDensityClasses: Record<GridDensity, string> = {
  // Compact: denser grid for small/compact cards
  // 2 cols mobile, 3 sm, 4 md, 5 lg, 6 xl
  compact: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4',
  // Normal: balanced grid for standard cards
  // 1 col mobile, 2 sm, 3 md, 4 lg
  normal: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6',
  // Spacious: fewer columns for large/featured cards
  // 1 col mobile, 2 md, 3 lg
  spacious: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8',
};

// Horizontal grid - special case for horizontal variant
const horizontalGridClass = 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5';

// Variant-based grid recommendations
const variantDensityMap: Record<CategoryGridVariant, GridDensity> = {
  compact: 'compact',
  default: 'normal',
  featured: 'spacious',
  horizontal: 'normal', // Not used, has special handling
};

export function CategoryGrid({
  categories,
  variant = 'default',
  density,
  loading = false,
  showDescription = true,
  emptyMessage = 'Không có danh mục nào.',
  skeletonCount = 8,
  className,
}: CategoryGridProps) {
  // Horizontal variant has special grid layout
  const getGridClasses = () => {
    if (variant === 'horizontal') {
      return cn('grid', horizontalGridClass, className);
    }
    // Use provided density or fallback to variant-based recommendation
    const effectiveDensity = density ?? variantDensityMap[variant];
    return cn('grid', gridDensityClasses[effectiveDensity], className);
  };

  if (loading) {
    return (
      <div className={getGridClasses()}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <CategoryCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={getGridClasses()}>
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          variant={variant}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}
