import { describe, expect, it } from 'vitest'
import type { PayloadRequest } from 'payload'

import { createHistoricalRedirect } from './create-historical-redirect'

/**
 * `createHistoricalRedirect` opera directamente sobre `req.payload`
 * (find/update/create reales), no sobre datos puros - ver el comentario
 * del propio archivo. Este fake implementa en memoria únicamente las
 * formas de consulta que la función realmente usa, para poder probar el
 * aplanado de cadena/protección de ciclos/upsert de forma rápida y
 * aislada, sin una base de datos real. La cobertura de extremo a extremo
 * contra Payload+Postgres real vive en
 * tests/integration/redirects.test.ts.
 */
type FakeRedirect = { id: number; from: string; to: string; active: boolean; statusCode: string }

function matchesWhere(doc: FakeRedirect, where: Record<string, unknown>): boolean {
  if ('and' in where) {
    return (where.and as Record<string, unknown>[]).every((clause) => matchesWhere(doc, clause))
  }
  return Object.entries(where).every(([field, condition]) => {
    const { equals } = condition as { equals: unknown }
    return (doc as unknown as Record<string, unknown>)[field] === equals
  })
}

function createFakeRedirectsPayload(seed: FakeRedirect[] = []) {
  const store = [...seed]
  let nextId = seed.length > 0 ? Math.max(...seed.map((d) => d.id)) + 1 : 1

  const payload = {
    find: async ({ where, limit }: { where: Record<string, unknown>; limit: number }) => {
      const matches = store.filter((doc) => matchesWhere(doc, where))
      const docs = limit === 0 ? matches : matches.slice(0, limit)
      return { docs }
    },
    update: async ({ id, data }: { id: number; data: Partial<FakeRedirect> }) => {
      const doc = store.find((d) => d.id === id)
      if (doc) Object.assign(doc, data)
      return doc
    },
    create: async ({ data }: { data: Omit<FakeRedirect, 'id'> }) => {
      const doc: FakeRedirect = { id: nextId, ...data }
      nextId += 1
      store.push(doc)
      return doc
    },
  }

  return { payload, store }
}

function fakeReq(payload: ReturnType<typeof createFakeRedirectsPayload>['payload']): PayloadRequest {
  return { payload } as unknown as PayloadRequest
}

describe('createHistoricalRedirect', () => {
  it('no crea nada si el destino solicitado es igual al origen', async () => {
    const { payload, store } = createFakeRedirectsPayload()
    await createHistoricalRedirect({ req: fakeReq(payload), from: '/a', to: '/a' })
    expect(store).toHaveLength(0)
  })

  it('crea un redirect 301 simple de A a B', async () => {
    const { payload, store } = createFakeRedirectsPayload()
    await createHistoricalRedirect({ req: fakeReq(payload), from: '/a', to: '/b' })
    expect(store).toEqual([{ id: 1, from: '/a', to: '/b', active: true, statusCode: '301' }])
  })

  it('aplana una cadena existente: A->B ya existe, se crea B->C, A debe resolver directo a C', async () => {
    const { payload, store } = createFakeRedirectsPayload([
      { id: 1, from: '/a', to: '/b', active: true, statusCode: '301' },
    ])
    // El nuevo redirect solicitado es B->C: como B ya es origen de un
    // redirect activo (A->B apunta A a B, pero aquí probamos el caso
    // donde /b pasa a redirigir a /c, y /a ya apuntaba a /b).
    await createHistoricalRedirect({ req: fakeReq(payload), from: '/b', to: '/c' })

    const aRedirect = store.find((d) => d.from === '/a')
    const bRedirect = store.find((d) => d.from === '/b')
    expect(bRedirect).toMatchObject({ to: '/c', active: true })
    // Aplanado hacia atrás: A ya no debe pasar por B, sino ir directo a C.
    expect(aRedirect).toMatchObject({ to: '/c', active: true })
  })

  it('respeta el límite de saltos y no sigue una cadena indefinidamente', async () => {
    // Cadena deliberadamente más larga que MAX_CHAIN_HOPS (5): /h1 -> /h2 ->
    // ... -> /h6, y se crea un nuevo redirect apuntando a /h1.
    const seed: FakeRedirect[] = []
    for (let i = 1; i <= 6; i += 1) {
      seed.push({ id: i, from: `/h${i}`, to: `/h${i + 1}`, active: true, statusCode: '301' })
    }
    const { payload, store } = createFakeRedirectsPayload(seed)

    await createHistoricalRedirect({ req: fakeReq(payload), from: '/origin', to: '/h1' })

    const originRedirect = store.find((d) => d.from === '/origin')
    // No debe resolver más allá de lo que el límite de saltos permite
    // seguir - el destino final no debe ser el final teórico de la
    // cadena completa (/h7), que excede MAX_CHAIN_HOPS.
    expect(originRedirect?.to).not.toBe('/h7')
  })

  it('detecta un ciclo y desactiva los redirects involucrados en vez de bucle infinito', async () => {
    // A -> B ya existe. Ahora se solicita que B -> A (un ciclo).
    const { payload, store } = createFakeRedirectsPayload([
      { id: 1, from: '/a', to: '/b', active: true, statusCode: '301' },
    ])

    await createHistoricalRedirect({ req: fakeReq(payload), from: '/b', to: '/a' })

    const aRedirect = store.find((d) => d.from === '/a')
    // El redirect que formaba parte del ciclo se desactiva, nunca se
    // elimina.
    expect(aRedirect?.active).toBe(false)
    expect(store).toContainEqual(expect.objectContaining({ from: '/a' }))
  })

  it('actualiza (upsert) un redirect existente con el mismo `from` en vez de duplicar', async () => {
    const { payload, store } = createFakeRedirectsPayload([
      { id: 1, from: '/a', to: '/b', active: true, statusCode: '301' },
    ])
    await createHistoricalRedirect({ req: fakeReq(payload), from: '/a', to: '/c' })

    expect(store).toHaveLength(1)
    expect(store[0]).toMatchObject({ from: '/a', to: '/c', active: true })
  })

  it('reactiva un redirect existente que estaba inactivo', async () => {
    const { payload, store } = createFakeRedirectsPayload([
      { id: 1, from: '/a', to: '/b', active: false, statusCode: '301' },
    ])
    await createHistoricalRedirect({ req: fakeReq(payload), from: '/a', to: '/b' })

    expect(store[0]).toMatchObject({ active: true })
  })
})
