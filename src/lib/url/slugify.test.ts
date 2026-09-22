import { describe, expect, it } from 'vitest'

import { SLUG_PATTERN, slugify } from './slugify'

describe('slugify', () => {
  it('quita acentos y diacríticos', () => {
    expect(slugify('Política Económica')).toBe('politica-economica')
    expect(slugify('Año de la Niñez')).toBe('ano-de-la-ninez')
    expect(slugify('Pingüino')).toBe('pinguino')
  })

  it('convierte ñ/Ñ en n, compuesta o descompuesta', () => {
    expect(slugify('Año Nuevo en España')).toBe('ano-nuevo-en-espana')
    expect(slugify('NIÑOS Y NIÑAS')).toBe('ninos-y-ninas')
    expect(slugify('El Niño llega a Ñuñoa')).toBe('el-nino-llega-a-nunoa')
    expect(slugify('Espa\u00f1a')).toBe('espana')
    expect(slugify('Espan\u0303a')).toBe('espana')
  })

  it('elimina signos de puntuación del español', () => {
    expect(slugify('¿Qué pasó hoy? ¡Última hora!')).toBe('que-paso-hoy-ultima-hora')
  })

  it('colapsa espacios y separadores repetidos', () => {
    expect(slugify('  Sismo   en --- CDMX  ')).toBe('sismo-en-cdmx')
  })

  it('descarta emojis y caracteres no alfanuméricos', () => {
    expect(slugify('Fútbol ⚽ 2026: México vs. EE.UU.')).toBe('futbol-2026-mexico-vs-ee-uu')
  })

  it('devuelve cadena vacía si no queda nada utilizable', () => {
    expect(slugify('')).toBe('')
    expect(slugify('¡¿?!')).toBe('')
  })

  it('siempre produce un valor que cumple SLUG_PATTERN', () => {
    for (const input of ['Política Económica ¡Hoy!', 'A', '100 días', 'x--y']) {
      expect(slugify(input)).toMatch(SLUG_PATTERN)
    }
  })
})
