import { PageShell } from './page-shell';

export function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <PageShell>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-slate-600">{description}</p>
      </div>
    </PageShell>
  );
}
