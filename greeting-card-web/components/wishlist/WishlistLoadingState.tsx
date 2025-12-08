'use client';

export function WishlistLoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">Đang tải danh sách yêu thích...</div>
        </div>
      </div>
    </div>
  );
}
