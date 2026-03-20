import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MetalApp Pro — Cooperativa La Metalúrgica',
  description: 'Sistema de gestión para chapas metálicas',
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
