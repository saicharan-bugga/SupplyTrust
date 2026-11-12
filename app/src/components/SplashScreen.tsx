import { useEffect, useState } from 'react'
import { LogoMark } from './Logo'

const SHOW_MS = 3800
const EXIT_MS = 800
const VARIANTS = 4
const LAST_KEY = 'supplytrust.intro.last'

/** Pick a random intro, never the same one twice in a row. */
function pickVariant(): number {
  const forced = Number(new URLSearchParams(window.location.search).get('intro'))
  if (Number.isInteger(forced) && forced >= 1 && forced <= VARIANTS) return forced - 1
  let last = -1
  try {
    last = Number(sessionStorage.getItem(LAST_KEY) ?? localStorage.getItem(LAST_KEY) ?? -1)
  } catch {
    /* storage unavailable */
  }
  let v = Math.floor(Math.random() * VARIANTS)
  if (v === last) v = (v + 1 + Math.floor(Math.random() * (VARIANTS - 1))) % VARIANTS
  try {
    localStorage.setItem(LAST_KEY, String(v))
  } catch {
    /* storage unavailable */
  }
  return v
}

export interface SplashScreenProps {
  onDone: () => void
}

function Wordmark({ delay = 1.2, className = '' }: { delay?: number; className?: string }) {
  return (
    <h1 className={`sp-serif flex ${className}`} aria-label="SupplyTrust">
      {'SupplyTrust'.split('').map((ch, i) => (
        <span key={i} aria-hidden className={`sp-letter ${i >= 6 ? 'st-gold-text' : ''}`} style={{ animationDelay: `${delay + i * 0.07}s` }}>
          {ch}
        </span>
      ))}
    </h1>
  )
}

function Tagline({ delay = 2.2 }: { delay?: number }) {
  return (
    <p className="sp-tagline sp-serif mt-4 text-sm tracking-[0.4em] text-amber-100/80 uppercase" style={{ animationDelay: `${delay}s` }}>
      Order · Inspect · Approve
    </p>
  )
}

function Rule({ delay = 1.9 }: { delay?: number }) {
  return <span className="sp-rule mx-auto mt-4 block h-px w-48 bg-gradient-to-r from-transparent via-amber-300 to-transparent" style={{ animationDelay: `${delay}s` }} />
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false)
  const [variant] = useState(pickVariant)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const show = reduce ? 600 : SHOW_MS
    const t1 = setTimeout(() => setLeaving(true), show)
    const t2 = setTimeout(onDone, show + EXIT_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  // Variant 2 shows an elegant 0-100 counter while loading.
  useEffect(() => {
    if (variant !== 2) return
    const id = setInterval(() => setCount((c) => Math.min(100, c + 2)), SHOW_MS / 55)
    return () => clearInterval(id)
  }, [variant])

  const skip = () => {
    setLeaving(true)
    setTimeout(onDone, 350)
  }

  return (
    <div className={`sp sp-v${variant} fixed inset-0 z-[100] overflow-hidden text-white ${leaving ? 'sp-out' : ''}`} role="dialog" aria-label="SupplyTrust is loading">
      {/* Variant 0: grand curtains that part to reveal the app */}
      {variant === 0 && (
        <>
          <div className="sp-curtain sp-curtain-l" />
          <div className="sp-curtain sp-curtain-r" />
        </>
      )}
      {variant !== 0 && <div className="sp-bg absolute inset-0" />}
      {variant === 3 && <div className="sp-beam" aria-hidden />}
      <div className="sp-vignette pointer-events-none absolute inset-0" aria-hidden />

      <div className="sp-content absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {variant === 2 ? (
          <>
            <p className="sp-serif sp-tagline text-xs tracking-[0.5em] text-amber-200/80 uppercase" style={{ animationDelay: '0.2s' }}>
              SupplyTrust
            </p>
            <p className="sp-serif st-gold-text mt-4 text-8xl font-semibold tabular-nums sm:text-9xl" aria-hidden>
              {count}
              <span className="text-4xl sm:text-5xl">%</span>
            </p>
            <div className="mt-8 h-px w-64 overflow-hidden bg-white/15" aria-hidden>
              <div className="h-full bg-gradient-to-r from-amber-200 to-amber-500" style={{ width: `${count}%` }} />
            </div>
            <div className="sp-fade-late mt-10 flex items-center gap-3" style={{ animationDelay: '2.4s' }}>
              <LogoMark size={44} />
              <span className="sp-serif text-lg tracking-[0.3em] text-amber-100/90 uppercase">Order · Inspect · Approve</span>
            </div>
          </>
        ) : (
          <>
            <div className={variant === 1 ? 'sp-seal relative p-6' : 'sp-pop relative p-3'}>
              {variant === 1 && (
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="48" fill="none" stroke="url(#sp-gold)" strokeWidth="0.8" className="sp-ring" pathLength={1} />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="0.4" strokeDasharray="1 2" className="sp-ring sp-ring-2" pathLength={1} />
                  <defs>
                    <linearGradient id="sp-gold" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="#f6e8b1" />
                      <stop offset="0.5" stopColor="#d4af37" />
                      <stop offset="1" stopColor="#9a7424" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
              <LogoMark size={variant === 1 ? 120 : 140} animated />
            </div>
            <Wordmark delay={1.2} className="mt-7 text-5xl font-semibold tracking-wide sm:text-6xl" />
            {variant === 3 && <Rule />}
            <Tagline delay={2.2} />
          </>
        )}

        <button type="button" onClick={skip} className="absolute bottom-8 text-xs tracking-widest text-teal-100/60 uppercase underline-offset-4 hover:text-white hover:underline">
          Skip
        </button>
      </div>
    </div>
  )
}
