import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">60 Segundos Noticias</h1>
      <p className="text-muted-foreground">Base técnica en construcción.</p>
      <Button asChild>
        <Link href="/admin">Ir al panel de administración</Link>
      </Button>
    </main>
  )
}
