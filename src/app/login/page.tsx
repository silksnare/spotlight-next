import Image from 'next/image'
import { PageShell } from '@/components/page-shell'

export default function LoginPage() {
  return (
    <PageShell>
      <div
        className="flex flex-1 items-center justify-center px-4 py-12 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      >
        <div className="w-full max-w-xl space-y-8 p-10 text-center">

          <div className="flex justify-center">
            <Image
              src="/images/hood.png"
              alt="Lexus Logo"
              width={360}
              height={220}
              className="h-auto w-[360px]"
            />
          </div>

          <form action="/api/auth/saml/login" method="get" className="w-full">
            <button className="w-full rounded px-4 py-3 font-medium text-white transition bg-[#000000] text-[22px]">
              Sign-in
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  )
}