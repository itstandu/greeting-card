'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface ProductsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ProductsSearchBar({ searchQuery, onSearchChange }: ProductsSearchBarProps) {
  return (
    <div className="relative max-w-md flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="pr-8 pl-9"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
          onClick={() => onSearchChange('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
