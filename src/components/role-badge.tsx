import { ROLE_LABELS, type AppRole } from '@/lib/auth/roles';

export function RoleBadge({ role }: { role: AppRole }) {
  return (
    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
      {ROLE_LABELS[role]}
    </span>
  );
}
