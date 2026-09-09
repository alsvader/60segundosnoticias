import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@/app/globals.css'

export const metadata: Metadata = {
  title: '60 Segundos Noticias',
  description: 'Portal editorial y multimedia 60 Segundos Noticias.',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  )
}
