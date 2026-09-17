import { describe, expect, it } from 'vitest'

import { JsonLd } from './json-ld'

describe('JsonLd', () => {
  it('escapa `<` antes de dangerouslySetInnerHTML para que un </script> en el dato no rompa el tag', () => {
    const maliciousTitle = 'Título malicioso</script><script>alert(1)</script>'
    const element = JsonLd({ data: { headline: maliciousTitle } })

    const html = (element.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html

    expect(html).not.toContain('</script>')
    expect(html).toContain('\\u003c/script>')
  })

  it('produce JSON válido una vez des-escapado', () => {
    const data = { headline: 'Un título con </script> adentro', count: 3 }
    const element = JsonLd({ data })
    const html = (element.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html

    const restored = html.replace(/\\u003c/g, '<')
    expect(JSON.parse(restored)).toEqual(data)
  })

  it('no altera contenido sin `<`', () => {
    const data = { headline: 'Título normal sin caracteres especiales' }
    const element = JsonLd({ data })
    const html = (element.props as { dangerouslySetInnerHTML: { __html: string } }).dangerouslySetInnerHTML.__html

    expect(html).toBe(JSON.stringify(data))
  })
})
