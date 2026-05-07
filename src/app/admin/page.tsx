import { redirect } from 'next/navigation';

import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getCurrentSession } from '@/lib/auth/session';
import { getAdminDashboardData } from '@/lib/admin-dashboard';

export default async function AdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}
