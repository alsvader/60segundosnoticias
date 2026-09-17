import { describe, expect, it } from 'vitest'

import { getAbsoluteUrl, getCategoryUrl, getPageUrl, getPostUrl, normalizePath } from './canonical'

describe('normalizePath', () => {
  it('agrega un slash inicial si falta', () => {
    expect(normalizePath('deportes')).toBe('/deportes')
  })

  it('colapsa slashes duplicados', () => {
    expect(normalizePath('//deportes//futbol//')).toBe('/deportes/futbol')
  })

  it('elimina el slash final salvo para la raíz', () => {
    expect(normalizePath('/deportes/')).toBe('/deportes')
    expect(normalizePath('/')).toBe('/')
  })

  it('deja la raíz intacta', () => {
    expect(normalizePath('/')).toBe('/')
  })
})

describe('getCategoryUrl', () => {
  it('construye la ruta de una categoría', () => {
    expect(getCategoryUrl('deportes')).toBe('/deportes')
  })
})

describe('getPostUrl', () => {
  it('construye la ruta de un post bajo su categoría primaria', () => {
    expect(getPostUrl('deportes', 'gana-el-mundial')).toBe('/deportes/gana-el-mundial')
  })
})

describe('getPageUrl', () => {
  it('construye la ruta de una page de slug raíz', () => {
    expect(getPageUrl('sobre-nosotros')).toBe('/sobre-nosotros')
  })
})

describe('getAbsoluteUrl', () => {
  it('combina el origen del sitio con una ruta canónica', () => {
    expect(getAbsoluteUrl('/deportes/gana-el-mundial')).toBe('http://localhost:3000/deportes/gana-el-mundial')
  })

  it('normaliza slashes duplicados antes de combinar', () => {
    expect(getAbsoluteUrl('//deportes//')).toBe('http://localhost:3000/deportes')
  })
})
