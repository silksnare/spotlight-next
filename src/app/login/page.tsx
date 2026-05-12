'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageShell } from '@/components/page-shell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center px-4 py-12 bg-cover bg-center" style={{ backgroundImage: "url('/images/background.jpg')" }}>
        <div className="w-full max-w-xl space-y-6 p-10 text-center">
          <div className="flex justify-center">
            <Image src="/images/hood.png" alt="Cadillac Logo" width={360} height={220} className="h-auto w-[360px]" />
          </div>
          <form onSubmit={async (e) => { e.preventDefault(); setError(''); const res = await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})}); if(!res.ok){setError('Invalid email or password'); return;} router.push('/dashboard'); }} className="space-y-3">
            <input className="w-full rounded border p-3" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="w-full rounded border p-3" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            {error && <p className="text-red-600">{error}</p>}
            <button className="w-full rounded px-4 py-3 font-medium text-white bg-[#000000]">Sign in with Email</button>
          </form>
          <div className="text-sm"><a href="/register" className="underline">Create account</a> · <a href="/forgot-password" className="underline">Forgot password</a></div>
          <form action="/api/auth/saml/login" method="get" className="w-full">
            <button className="w-full rounded px-4 py-3 font-medium text-white transition bg-[#333333] text-[18px]">Sign-in with SSO</button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
