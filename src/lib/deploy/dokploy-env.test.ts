import { describe, expect, it } from 'vitest'

import { rewriteDokployEnvBlob } from './dokploy-env'

const SHA_A = 'a'.repeat(40)
const SHA_B = 'b'.repeat(40)

const RUNNER_A = `ghcr.io/alsvader/60segundosnoticias:runner-${SHA_A}`
const MIGRATOR_A = `ghcr.io/alsvader/60segundosnoticias:migrator-${SHA_A}`
const RUNNER_B = `ghcr.io/alsvader/60segundosnoticias:runner-${SHA_B}`
const MIGRATOR_B = `ghcr.io/alsvader/60segundosnoticias:migrator-${SHA_B}`

describe('rewriteDokployEnvBlob', () => {
  it('reemplaza RUNNER_IMAGE/MIGRATOR_IMAGE preservando todo lo demás byte a byte', () => {
    const blob = ['DATABASE_URI=postgres://user:pass@db:5432/app', `RUNNER_IMAGE=${RUNNER_A}`, `MIGRATOR_IMAGE=${MIGRATOR_A}`, 'PAYLOAD_SECRET=shhh', ''].join('\n')

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    expect(result.blob).toBe(
      ['DATABASE_URI=postgres://user:pass@db:5432/app', `RUNNER_IMAGE=${RUNNER_B}`, `MIGRATOR_IMAGE=${MIGRATOR_B}`, 'PAYLOAD_SECRET=shhh', ''].join('\n'),
    )
    expect(result.changes).toEqual([
      { key: 'RUNNER_IMAGE', previousValue: RUNNER_A, newValue: RUNNER_B, occurrences: 1, action: 'replaced' },
      { key: 'MIGRATOR_IMAGE', previousValue: MIGRATOR_A, newValue: MIGRATOR_B, occurrences: 1, action: 'replaced' },
    ])
  })

  it('reescribe una clave declarada pero vacía (estado natural del primer setup en Dokploy)', () => {
    const blob = ['DATABASE_URI=postgres://user:pass@db:5432/app', 'RUNNER_IMAGE=', 'MIGRATOR_IMAGE=', 'PAYLOAD_SECRET=shhh', ''].join('\n')

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_A, migratorImage: MIGRATOR_A })

    expect(result.blob).toBe(
      ['DATABASE_URI=postgres://user:pass@db:5432/app', `RUNNER_IMAGE=${RUNNER_A}`, `MIGRATOR_IMAGE=${MIGRATOR_A}`, 'PAYLOAD_SECRET=shhh', ''].join('\n'),
    )
    expect(result.changes).toEqual([
      { key: 'RUNNER_IMAGE', previousValue: '', newValue: RUNNER_A, occurrences: 1, action: 'replaced' },
      { key: 'MIGRATOR_IMAGE', previousValue: '', newValue: MIGRATOR_A, occurrences: 1, action: 'replaced' },
    ])
  })

  it('preserva CRLF byte a byte en las líneas no tocadas y en la línea reescrita', () => {
    const blob = `DATABASE_URI=postgres://user:pass@db:5432/app\r\nRUNNER_IMAGE=${RUNNER_A}\r\nMIGRATOR_IMAGE=${MIGRATOR_A}\r\nPAYLOAD_SECRET=shhh\r\n`

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    expect(result.blob).toBe(`DATABASE_URI=postgres://user:pass@db:5432/app\r\nRUNNER_IMAGE=${RUNNER_B}\r\nMIGRATOR_IMAGE=${MIGRATOR_B}\r\nPAYLOAD_SECRET=shhh\r\n`)
    // Ningún `\r` se perdió ni se convirtió en `\n` suelto.
    expect(result.blob.match(/\r\n/g)).toHaveLength(4)
    expect(result.blob).not.toMatch(/[^\r]\n/)
  })

  it('reemplaza TODAS las ocurrencias de una clave duplicada y reporta el conteo', () => {
    const blob = [`RUNNER_IMAGE=${RUNNER_A}`, `MIGRATOR_IMAGE=${MIGRATOR_A}`, `RUNNER_IMAGE=${RUNNER_A}`, ''].join('\n')

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    const runnerLines = result.blob.split('\n').filter((line) => line.startsWith('RUNNER_IMAGE='))
    expect(runnerLines).toEqual([`RUNNER_IMAGE=${RUNNER_B}`, `RUNNER_IMAGE=${RUNNER_B}`])
    expect(result.changes[0]).toMatchObject({ key: 'RUNNER_IMAGE', occurrences: 2, action: 'replaced' })
  })

  it('agrega la clave al final cuando está ausente (primer despliegue), sin tocar el resto', () => {
    const blob = 'DATABASE_URI=postgres://user:pass@db:5432/app\nPAYLOAD_SECRET=shhh'

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    expect(result.blob).toBe(`DATABASE_URI=postgres://user:pass@db:5432/app\nPAYLOAD_SECRET=shhh\nRUNNER_IMAGE=${RUNNER_B}\nMIGRATOR_IMAGE=${MIGRATOR_B}`)
    expect(result.changes).toEqual([
      { key: 'RUNNER_IMAGE', previousValue: null, newValue: RUNNER_B, occurrences: 0, action: 'appended' },
      { key: 'MIGRATOR_IMAGE', previousValue: null, newValue: MIGRATOR_B, occurrences: 0, action: 'appended' },
    ])
  })

  it('no agrega un salto de línea extra cuando el blob ya termina en uno', () => {
    const blob = 'DATABASE_URI=postgres://user:pass@db:5432/app\n'

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    expect(result.blob).toBe(`DATABASE_URI=postgres://user:pass@db:5432/app\nRUNNER_IMAGE=${RUNNER_B}\nMIGRATOR_IMAGE=${MIGRATOR_B}`)
  })

  it('ignora una línea comentada que parece la clave y agrega la clave real al final', () => {
    const blob = [`# RUNNER_IMAGE=${RUNNER_A}`, `  # RUNNER_IMAGE=${RUNNER_A}`, `MIGRATOR_IMAGE=${MIGRATOR_A}`, ''].join('\n')

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    // Las líneas comentadas quedan exactamente igual - no son la clave real.
    expect(result.blob).toContain(`# RUNNER_IMAGE=${RUNNER_A}`)
    expect(result.blob).toContain(`  # RUNNER_IMAGE=${RUNNER_A}`)
    expect(result.blob).toContain(`MIGRATOR_IMAGE=${MIGRATOR_B}`)
    // La clave real no existía sin comentar: se agrega al final.
    expect(result.blob.trimEnd().endsWith(`RUNNER_IMAGE=${RUNNER_B}`)).toBe(true)

    const runnerChange = result.changes.find((change) => change.key === 'RUNNER_IMAGE')
    expect(runnerChange).toMatchObject({ action: 'appended', occurrences: 0 })
  })

  it('no toca otros valores del blob que contienen "=" dentro de sí mismos', () => {
    const blob = [
      'DATABASE_URI=postgres://user:pass@db:5432/app?sslmode=require&x=y',
      `RUNNER_IMAGE=${RUNNER_A}`,
      `MIGRATOR_IMAGE=${MIGRATOR_A}`,
      'NEXT_PUBLIC_SITE_URL=https://60segundosnoticias.com?utm=abc',
      '',
    ].join('\n')

    const result = rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })

    expect(result.blob).toContain('DATABASE_URI=postgres://user:pass@db:5432/app?sslmode=require&x=y')
    expect(result.blob).toContain('NEXT_PUBLIC_SITE_URL=https://60segundosnoticias.com?utm=abc')
  })

  it('rechaza el alias mutable "runner-main"', () => {
    expect(() => rewriteDokployEnvBlob({ blob: '', runnerImage: 'ghcr.io/alsvader/60segundosnoticias:runner-main', migratorImage: MIGRATOR_B })).toThrow(
      /Referencia de imagen inválida/,
    )
  })

  it('rechaza un SHA malformado (corto/no hexadecimal)', () => {
    expect(() =>
      rewriteDokployEnvBlob({ blob: '', runnerImage: `ghcr.io/alsvader/60segundosnoticias:runner-${'a'.repeat(39)}`, migratorImage: MIGRATOR_B }),
    ).toThrow(/Referencia de imagen inválida/)

    expect(() =>
      rewriteDokployEnvBlob({ blob: '', runnerImage: `ghcr.io/alsvader/60segundosnoticias:runner-${'g'.repeat(40)}`, migratorImage: MIGRATOR_B }),
    ).toThrow(/Referencia de imagen inválida/)
  })

  it('rechaza cuando runnerImage/migratorImage están intercambiados', () => {
    expect(() => rewriteDokployEnvBlob({ blob: '', runnerImage: MIGRATOR_B, migratorImage: RUNNER_B })).toThrow(/Referencia de imagen inválida/)
  })

  it('rechaza reescribir cuando el valor actual no parece una referencia de imagen (posible continuación multilínea)', () => {
    const blob = ['RUNNER_IMAGE=CHANGE_ME', `MIGRATOR_IMAGE=${MIGRATOR_A}`, ''].join('\n')

    expect(() => rewriteDokployEnvBlob({ blob, runnerImage: RUNNER_B, migratorImage: MIGRATOR_B })).toThrow(/no tiene forma de referencia de imagen/)
  })

  it('no escribe nada cuando la validación de la imagen nueva falla (no hay efectos parciales observables)', () => {
    const blob = `RUNNER_IMAGE=${RUNNER_A}\nMIGRATOR_IMAGE=${MIGRATOR_A}\n`

    expect(() => rewriteDokployEnvBlob({ blob, runnerImage: 'ghcr.io/alsvader/60segundosnoticias:runner-main', migratorImage: MIGRATOR_B })).toThrow()
  })
})
