import { X } from 'lucide-react'
import { useApp, type Toast } from '../state/AppContext'

const COLORS: Record<Toast['severity'], string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-sky-300 bg-sky-50 text-sky-900',
}

export interface NotificationToastProps {
  message: string
  severity: Toast['severity']
  onDismiss: () => void
}

export function NotificationToast({ message, severity, onDismiss }: NotificationToastProps) {
  return (
    <div
      role={severity === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md ${COLORS[severity]}`}
    >
      <span className="flex-1">
        <strong className="mr-1 capitalize">{severity}:</strong>
        {message}
      </span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="rounded p-0.5 hover:bg-black/5">
        <X size={16} aria-hidden />
      </button>
    </div>
  )
}

export function ToastRegion() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <NotificationToast message={t.message} severity={t.severity} onDismiss={() => dismissToast(t.id)} />
        </div>
      ))}
    </div>
  )
}
