'use client';
const ALLOWED_ROLES = ['uploader','qualifier','judge1','judge2','admin','client'] as const;
export default function PlatformAdminClient({ users, q }: any) {
  return <div className="p-6"><h1 className="text-2xl font-semibold mb-4">Platform Admin</h1><form className="mb-4"><input name="q" defaultValue={q} placeholder="Search email or display name" className="border p-2 w-full max-w-md" /></form><div className="space-y-4">{users.map((u: any) => <UserRow key={u.id} user={u} />)}</div></div>
}
function UserRow({ user }: any){
  const current = new Set((user.userRoles||[]).map((r:any)=>r.role));
  async function save(formData: FormData){
    const roles = ALLOWED_ROLES.filter((r)=>formData.get(r)==='on');
    const res = await fetch(`/api/platform-admin/users/${user.id}/roles`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({roles})});
    if(!res.ok){alert((await res.json()).error||'Failed to update roles');return;}alert('Saved');location.reload();
  }
  return <form action={save} className="border rounded p-3"><div className="font-medium">{user.displayName} ({user.email})</div><div className="text-sm text-gray-600">employeeId: {user.employeeId} | active: {String(user.active)} | emailVerified: {String(user.localAuthCredential?.emailVerified ?? 'n/a')} | createdAt: {new Date(user.createdAt).toLocaleString()} | homeArea: {user.homeArea ?? '-'} | district: {user.district ?? '-'}</div><div className="mt-2 flex flex-wrap gap-3">{ALLOWED_ROLES.map((r)=><label key={r} className="text-sm"><input type="checkbox" name={r} defaultChecked={current.has(r)} className="mr-1"/>{r}</label>)}</div><button className="mt-3 bg-black text-white px-3 py-1 rounded">Save Roles</button></form>
}
