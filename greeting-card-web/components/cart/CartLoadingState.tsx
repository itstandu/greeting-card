'use client';

export function CartLoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">Đang tải giỏ hàng...</div>
        </div>
      </div>
    </div>
  );
}
