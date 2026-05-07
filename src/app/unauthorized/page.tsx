import Link from 'next/link';

import { PageShell } from '@/components/page-shell';

export default function UnauthorizedPage() {
  return (
    <PageShell>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-semibold text-amber-900">Unauthorized</h1>
        <p className="mt-2 text-amber-800">Your account does not have access to this module yet.</p>
        <Link href="/dashboard" className="mt-4 inline-block rounded bg-amber-900 px-4 py-2 text-white">
          Back to dashboard
        </Link>
      </div>
    </PageShell>
  );
}
