'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoutDialog } from '@/components/auth/LogoutDialog';
import { NotificationDropdown } from '@/components/notifications';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { cartStorage } from '@/lib/store/cart/cart-storage';
import { wishlistStorage } from '@/lib/store/wishlist/wishlist-storage';
import {
  FolderOpen,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Tag,
  User,
  X,
} from 'lucide-react';

// Header component for the application - displays navigation menu, logo, and authentication controls
export function Header() {
  const { user, isAuthenticated, isLoading, hasCheckedAuth } = useAuth();
  const { productIds: wishlistProductIds } = useWishlist();
  const router = useRouter();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Update cart count when cart changes
  useEffect(() => {
    const updateCartCount = async () => {
      if (isAuthenticated && user) {
        // User đã đăng nhập: Lấy từ API
        try {
          const { getCart } = await import('@/services/cart.service');
          const response = await getCart();
          if (response.data) {
            setCartCount(response.data.totalItems || 0);
          }
        } catch {
          // Nếu API fail, set về 0
          setCartCount(0);
        }
      } else {
        // Guest: Lấy từ localStorage
        setCartCount(cartStorage.getItemCount());
      }
    };

    updateCartCount();
    window.addEventListener('cart-changed', updateCartCount);
    window.addEventListener('storage', e => {
      if (e.key === 'greeting_card_cart' && !isAuthenticated) {
        updateCartCount();
      }
    });

    return () => {
      window.removeEventListener('cart-changed', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [isAuthenticated, user]);

  // Update wishlist count when wishlist changes
  useEffect(() => {
    const updateWishlistCount = () => {
      if (isAuthenticated && user) {
        // User đã đăng nhập: Lấy từ Redux store (đã được fetch một lần)
        setWishlistCount(wishlistProductIds.length);
      } else {
        // Guest: Lấy từ localStorage
        setWishlistCount(wishlistStorage.getItemCount());
      }
    };

    updateWishlistCount();

    // Listen for guest localStorage changes
    const handleWishlistChange = () => {
      if (!isAuthenticated) {
        setWishlistCount(wishlistStorage.getItemCount());
      }
    };

    window.addEventListener('wishlist-changed', handleWishlistChange);
    window.addEventListener('storage', e => {
      if (e.key === 'greeting_card_wishlist' && !isAuthenticated) {
        handleWishlistChange();
      }
    });

    return () => {
      window.removeEventListener('wishlist-changed', handleWishlistChange);
      window.removeEventListener('storage', handleWishlistChange);
    };
  }, [isAuthenticated, user, wishlistProductIds]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 font-semibold transition-transform hover:scale-105"
          >
            <div className="bg-primary/10 group-hover:bg-primary/20 flex size-9 items-center justify-center rounded-lg transition-colors">
              <ShoppingBag className="text-primary size-5" />
            </div>
            <span className="hidden text-xl font-bold sm:block">
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                Greeting
              </span>
              <span className="ml-1">Card</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/categories" className={navigationMenuTriggerStyle()}>
                    Danh mục
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/products" className={navigationMenuTriggerStyle()}>
                    Sản phẩm
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/about" className={navigationMenuTriggerStyle()}>
                    Giới thiệu
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/contact" className={navigationMenuTriggerStyle()}>
                    Liên hệ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Center - Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden max-w-md flex-1 lg:block">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 pr-4 pl-9"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </form>

        {/* Right side - Actions and Auth controls */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="size-5" />
                <span className="sr-only">Tìm kiếm</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="px-4 py-12">
              <SheetHeader className="p-0">
                <SheetTitle>Tìm kiếm sản phẩm</SheetTitle>
                <SheetDescription>Nhập tên sản phẩm hoặc từ khóa để tìm kiếm</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSearch} className="mt-6">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-11 pr-4 pl-9"
                    autoFocus
                  />
                </div>
              </form>
            </SheetContent>
          </Sheet>

          {/* Cart Icon */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full p-0 px-1 text-[10px] font-bold"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
              <span className="sr-only">Giỏ hàng</span>
            </Link>
          </Button>

          {/* Wishlist Icon */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full p-0 px-1 text-[10px] font-bold"
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </Badge>
              )}
              <span className="sr-only">Yêu thích</span>
            </Link>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {isLoading || !hasCheckedAuth ? (
            <div className="bg-muted size-8 animate-pulse rounded-full" />
          ) : isAuthenticated && user ? (
            <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-10 rounded-full">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user.fullName || 'Người dùng'}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex cursor-pointer items-center">
                      <User className="mr-2 size-4" />
                      <span>Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex cursor-pointer items-center">
                          <Shield className="mr-2 size-4" />
                          <span>Trang quản trị</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLogoutDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="bg-background border-t md:hidden">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories"
                  className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FolderOpen className="h-4 w-4" />
                  Danh mục
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" />
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </header>
  );
}
