import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth/session';

export default async function HomePage() {
  const session = await getCurrentSession();

  console.info('HOME PAGE SESSION', session?.user ?? null);

  if (session) {
    redirect('/dashboard');
  }

  // 👇 THIS is the key change
  redirect('/login');
}