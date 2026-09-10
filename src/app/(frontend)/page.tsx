import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <Container className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="type-h1-article text-[var(--brand-red-500)]">60 Segundos Noticias</h1>
      <p className="type-lead text-[var(--ink-700)]">Base técnica en construcción.</p>
      <Button asChild>
        <Link href="/admin">Ir al panel de administración</Link>
      </Button>
    </Container>
  )
}
