import { describe, expect, it } from 'vitest'

import { assertTestDatabase, UnsafeTestDatabaseError } from './assert-test-database'

describe('assertTestDatabase', () => {
  it('rechaza un URI cuyo nombre de base de datos no termina en el sufijo de prueba', () => {
    expect(() =>
      assertTestDatabase('postgres://postgres:postgres@localhost:5433/60segundos'),
    ).toThrow(UnsafeTestDatabaseError)
  })

  it('rechaza un URI de base de datos de pruebas apuntando al host/puerto de desarrollo', () => {
    expect(() =>
      assertTestDatabase('postgres://postgres:postgres@localhost:5432/60segundos_test'),
    ).toThrow(UnsafeTestDatabaseError)
  })

  it('rechaza un URI de base de datos de pruebas apuntando al host/puerto de producción', () => {
    expect(() =>
      assertTestDatabase('postgres://postgres:postgres@prod-db.internal:5432/60segundos_test'),
    ).toThrow(UnsafeTestDatabaseError)
  })

  it('rechaza un DATABASE_URI ausente', () => {
    expect(() => assertTestDatabase(undefined)).toThrow(UnsafeTestDatabaseError)
  })

  it('rechaza un URI malformado', () => {
    expect(() => assertTestDatabase('no-es-un-uri')).toThrow(UnsafeTestDatabaseError)
  })

  it('permite un URI que cumple ambas condiciones de la base de datos de pruebas', () => {
    expect(() =>
      assertTestDatabase('postgres://postgres:postgres@localhost:5433/60segundos_test'),
    ).not.toThrow()
  })

  /**
   * `db:5432` (compose.prod.yaml --profile self-hosted, usado solo por
   * scripts/docker-smoke.sh) - openspec/changes/runtime-public-rendering.
   */
  it('permite el host/puerto del Postgres desechable de docker-smoke.sh cuando el nombre termina en el sufijo de prueba', () => {
    expect(() =>
      assertTestDatabase('postgres://postgres:postgres@db:5432/60segundos_smoke_test'),
    ).not.toThrow()
  })

  it('sigue rechazando el host/puerto de docker-smoke.sh si el nombre de base de datos no termina en el sufijo de prueba', () => {
    expect(() => assertTestDatabase('postgres://postgres:postgres@db:5432/60segundos')).toThrow(
      UnsafeTestDatabaseError,
    )
  })
})
