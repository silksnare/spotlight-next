import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'

import './globals.css'

import { Header } from '@/components/header'
import { HeaderGate } from '@/components/HeaderGate'

export const metadata: Metadata = {
  metadataBase: new URL('https://chooseyourevconquest.com'),

  title: 'Choose Your EV Conquest',
  description: 'Video Contest Platform',

  icons: {
    icon: [
      { url: '/icons/icon-16x16-sharp.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32-sharp.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-sharp.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/icons/icon-192x192-sharp.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },

  openGraph: {
    title: 'Choose Your EV Conquest',
    description: 'Video Contest Platform Powered by BI WORLDWIDE',
    url: '/',
    siteName: 'Choose Your EV Conquest',
    images: [
      {
        url: '/images/share-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Choose Your EV Conquest',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

const cadillacGothic = localFont({
  src: [
    {
      path: '../fonts/CadillacGothic-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CadillacGothic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-cadillac',
  display: 'swap',
})

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${cadillacGothic.className} min-h-screen antialiased`}>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}

        <div className="flex min-h-screen w-full flex-col">
          <HeaderGate>
            <Header />
          </HeaderGate>

          <div className="flex w-full flex-1 flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}