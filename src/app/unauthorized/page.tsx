import { PageShell } from '@/components/page-shell';

export default function UnauthorizedPage() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-amber-900">Unauthorized</h1>
          <p className="mt-2 text-amber-800">
            Your account does not have access to this content.
          </p>
        </div>
      </div>
    </PageShell>
  );
}