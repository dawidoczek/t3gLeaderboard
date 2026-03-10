import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'T3G Instagramy',
  description: 'Sprawdź jak radzą sobie zespoły T3G na Instagramie! Najnowsze dane, rankingi i statystyki w jednym miejscu.',
  icons: {
    icon: [
      {
        url: '/t3g.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/t3g.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/t3g.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/t3g.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
