import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfileClient } from '@/components/users/ProfileClient';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileClient />
    </ProtectedRoute>
  );
}
