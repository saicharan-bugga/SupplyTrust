import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sampleData } from '../data/sample'
import type { AppData, PurchaseOrder, User } from '../types'

const DATA_KEY = 'supplytrust.data.v1'
const USER_KEY = 'supplytrust.user.v1'

export interface Toast {
  id: number
  message: string
  severity: 'success' | 'error' | 'info'
}

interface AppContextValue {
  data: AppData
  setData: (updater: (prev: AppData) => AppData) => void
  resetData: () => void
  currentUser: User
  setCurrentUserId: (id: string) => void
  visibleOrders: PurchaseOrder[]
  toasts: Toast[]
  notify: (message: string, severity?: Toast['severity']) => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => load(DATA_KEY, sampleData))
  const [userId, setUserId] = useState<string>(() => load(USER_KEY, 'u1'))
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data))
    } catch {
      /* storage unavailable */
    }
  }, [data])

  useEffect(() => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userId))
    } catch {
      /* storage unavailable */
    }
  }, [userId])

  const currentUser = data.users.find((u) => u.userId === userId) ?? data.users[0]

  const visibleOrders = useMemo(
    () =>
      currentUser.role === 'vendor'
        ? data.orders.filter((o) => o.vendorId === currentUser.vendorId)
        : data.orders,
    [data.orders, currentUser],
  )

  const setData = useCallback((updater: (prev: AppData) => AppData) => setDataState((p) => updater(p)), [])
  const resetData = useCallback(() => setDataState(sampleData), [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback(
    (message: string, severity: Toast['severity'] = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t, { id, message, severity }])
      setTimeout(() => dismissToast(id), 4000)
    },
    [dismissToast],
  )

  const value: AppContextValue = {
    data,
    setData,
    resetData,
    currentUser,
    setCurrentUserId: setUserId,
    visibleOrders,
    toasts,
    notify,
    dismissToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
