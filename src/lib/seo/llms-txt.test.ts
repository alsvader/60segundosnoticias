import { describe, expect, it } from 'vitest'

import { escapeMarkdownInline, formatLink } from './llms-txt'

describe('escapeMarkdownInline', () => {
  it('escapa corchetes y paréntesis con significado estructural en Markdown', () => {
    expect(escapeMarkdownInline('[click aquí](javascript:alert(1))')).toBe(
      '\\[click aquí\\]\\(javascript:alert\\(1\\)\\)',
    )
  })

  it('colapsa saltos de línea a un espacio', () => {
    expect(escapeMarkdownInline('línea uno\nlínea dos\r\nlínea tres')).toBe('línea uno línea dos línea tres')
  })

  it('recorta espacios al inicio/fin', () => {
    expect(escapeMarkdownInline('  con espacios  ')).toBe('con espacios')
  })

  it('deja texto sin caracteres especiales intacto', () => {
    expect(escapeMarkdownInline('Título normal')).toBe('Título normal')
  })
})

describe('formatLink', () => {
  it('impide que un título malicioso inyecte un enlace `](javascript:...)` dentro del label', () => {
    const maliciousTitle = 'Nota](javascript:alert(1))'
    const line = formatLink(maliciousTitle, 'https://example.com/nota')

    // El label completo (incluyendo el intento de cierre de enlace) queda
    // escapado, así que el único enlace real del renglón sigue siendo el
    // segundo argumento (`url`), no uno inyectado desde el título.
    expect(line).toBe('- [Nota\\]\\(javascript:alert\\(1\\)\\)](https://example.com/nota)')
  })

  it('escapa también el note opcional', () => {
    const line = formatLink('Título', 'https://example.com', 'Resumen con [corchetes] y (paréntesis)')
    expect(line).toBe('- [Título](https://example.com): Resumen con \\[corchetes\\] y \\(paréntesis\\)')
  })

  it('omite el note cuando no se provee', () => {
    expect(formatLink('Título', 'https://example.com')).toBe('- [Título](https://example.com)')
  })
})
