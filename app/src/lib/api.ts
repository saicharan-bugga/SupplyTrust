import type { AppData } from '../types'

/**
 * Optional REST backend (see /server). When VITE_API_URL is not set the app runs fully
 * in the browser on LocalStorage, which is how the GitHub Pages demo works.
 */
export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
export const apiEnabled = API_URL !== ''

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, method: string, userId?: string, body?: unknown, fetcher: typeof fetch = fetch): Promise<T> {
  const res = await fetcher(`${API_URL}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(userId ? { 'x-user-id': userId } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new ApiError(json.error ?? `Request failed (${res.status})`, res.status)
  return json as T
}

/** Load the server copy for a user. If the server is empty it is seeded with `seed` first. */
export async function loadRemote(userId: string, seed: AppData, fetcher?: typeof fetch): Promise<AppData> {
  try {
    return await request<AppData>('/api/data', 'GET', userId, undefined, fetcher)
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      await request('/api/seed', 'POST', undefined, seed, fetcher)
      return request<AppData>('/api/data', 'GET', userId, undefined, fetcher)
    }
    throw e
  }
}

export const saveRemote = (userId: string, data: AppData, fetcher?: typeof fetch) => request<AppData>('/api/data', 'PUT', userId, data, fetcher)
