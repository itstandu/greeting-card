import { Metadata } from 'next';
import { WishlistsTable } from '@/components/admin/wishlists';

export const metadata: Metadata = {
  title: 'Quản lý danh sách yêu thích | Admin',
  description: 'Xem và quản lý danh sách yêu thích của users',
};

export default function AdminWishlistsPage() {
  return <WishlistsTable />;
}
