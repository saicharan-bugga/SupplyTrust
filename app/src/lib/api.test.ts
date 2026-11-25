import { describe, expect, it, vi } from 'vitest'
import { sampleData } from '../data/sample'
import { ApiError, loadRemote, saveRemote } from './api'

const reply = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status }))

describe('api client', () => {
  it('loads the server copy and sends the user header', async () => {
    const fetcher = vi.fn(() => reply(200, sampleData)) as unknown as typeof fetch
    const data = await loadRemote('u1', sampleData, fetcher)
    expect(data.orders).toHaveLength(sampleData.orders.length)
    const init = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit
    expect((init.headers as Record<string, string>)['x-user-id']).toBe('u1')
  })

  it('seeds an empty server and then loads again', async () => {
    const calls: string[] = []
    const fetcher = vi.fn((url: string, init: RequestInit) => {
      calls.push(`${init.method} ${url}`)
      if (calls.length === 1) return reply(409, { error: 'no data' })
      if (init.method === 'POST') return reply(201, { ok: true })
      return reply(200, sampleData)
    }) as unknown as typeof fetch
    await loadRemote('u1', sampleData, fetcher)
    expect(calls.map((c) => c.split(' ')[0])).toEqual(['GET', 'POST', 'GET'])
  })

  it('surfaces a server rejection as an ApiError with the server message', async () => {
    const fetcher = vi.fn(() => reply(403, { error: 'Your role cannot create purchase orders' })) as unknown as typeof fetch
    await expect(saveRemote('u4', sampleData, fetcher)).rejects.toMatchObject({ status: 403, message: 'Your role cannot create purchase orders' })
    await expect(saveRemote('u4', sampleData, fetcher)).rejects.toBeInstanceOf(ApiError)
  })
})
