import { useEffect, useState } from 'react'
import { LogoMark } from './Logo'

const SHOW_MS = 3600

export interface SplashScreenProps {
  onDone: () => void
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t1 = setTimeout(() => setLeaving(true), reduce ? 600 : SHOW_MS)
    const t2 = setTimeout(onDone, (reduce ? 600 : SHOW_MS) + 600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  const skip = () => {
    setLeaving(true)
    setTimeout(onDone, 350)
  }

  return (
    <div
      className={`st-splash fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden text-white ${
        leaving ? 'st-splash-out' : ''
      }`}
      role="dialog"
      aria-label="SupplyTrust is loading"
    >
      {/* moving supply-chain route lines */}
      <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden preserveAspectRatio="none" viewBox="0 0 800 600">
        <path className="st-route" d="M-20 440 C 160 380, 240 520, 400 450 S 640 330, 820 380" />
        <path className="st-route st-route-2" d="M-20 180 C 140 240, 260 100, 420 170 S 660 270, 820 200" />
        {[
          [150, 408],
          [400, 450],
          [640, 352],
          [260, 172],
          [560, 215],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" className="st-node" style={{ animationDelay: `${0.4 + i * 0.35}s` }} />
        ))}
      </svg>

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="st-halo rounded-3xl p-5">
          <LogoMark size={112} animated />
        </div>

        <h1 className="mt-6 flex text-4xl font-semibold tracking-tight sm:text-5xl" aria-label="SupplyTrust">
          {'SupplyTrust'.split('').map((ch, i) => (
            <span
              key={i}
              aria-hidden
              className={`st-letter ${i >= 6 ? 'text-amber-400' : ''}`}
              style={{ animationDelay: `${1.5 + i * 0.06}s` }}
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="st-tagline mt-3 text-sm tracking-[0.25em] text-teal-100/80 uppercase">
          Order. Inspect. Approve.
        </p>

        <div className="mt-10 h-1 w-56 overflow-hidden rounded-full bg-white/15" aria-hidden>
          <div className="st-bar h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-300" />
        </div>
        <button type="button" onClick={skip} className="mt-6 text-xs text-teal-100/70 underline-offset-4 hover:text-white hover:underline">
          Skip
        </button>
      </div>
    </div>
  )
}
