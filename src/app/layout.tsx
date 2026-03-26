import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Cooperativa Metalúrgica Argentina — Calculadora de Chapas BWG',
  description: 'Calculá chapas LAF, LAC y Galvanizado al instante. Presupuestos gratis con PDF. Villa Lugano, CABA, Argentina.',
  keywords: ['chapas metálicas', 'calculadora BWG', 'LAF', 'LAC', 'galvanizado', 'presupuesto chapas', 'Villa Lugano', 'cooperativa metalúrgica'],
  authors: [{ name: 'La Cooperativa Metalúrgica Argentina' }],
  creator: 'La Cooperativa Metalúrgica Argentina',
  publisher: 'La Cooperativa Metalúrgica Argentina',
  metadataBase: new URL('https://metalurgica.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://metalurgica.vercel.app',
    siteName: 'La Cooperativa Metalúrgica Argentina',
    title: 'La Cooperativa Metalúrgica Argentina — Calculadora de Chapas BWG',
    description: 'Calculá chapas LAF, LAC y Galvanizado al instante. Presupuestos gratis con PDF. Villa Lugano, CABA.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'La Cooperativa Metalúrgica Argentina',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Cooperativa Metalúrgica Argentina',
    description: 'Calculá chapas BWG al instante. Presupuestos gratis con PDF.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/logo.jpg' },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#0B1F3A',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={dmSans.className}>
        {children}
      </body>
    </html>
  )
}