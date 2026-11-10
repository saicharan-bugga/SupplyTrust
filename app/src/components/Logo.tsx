export interface LogoMarkProps {
  size?: number
  animated?: boolean
}

/** SupplyTrust mark: a shield (trust) wrapped around a shipping box (supply) with a check (approval). */
export function LogoMark({ size = 40, animated = false }: LogoMarkProps) {
  const a = animated ? 'st-draw' : ''
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="SupplyTrust logo">
      <defs>
        <linearGradient id="st-g" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path
        className={a}
        style={{ ['--len' as string]: 190, ['--delay' as string]: '0s' }}
        d="M32 4 56 13v17c0 15-10 26-24 30C18 56 8 45 8 30V13L32 4Z"
        fill={animated ? 'none' : 'url(#st-g)'}
        stroke="url(#st-g)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {animated && <path className="st-fill" d="M32 4 56 13v17c0 15-10 26-24 30C18 56 8 45 8 30V13L32 4Z" fill="url(#st-g)" />}
      <path
        className={a}
        style={{ ['--len' as string]: 90, ['--delay' as string]: '0.7s' }}
        d="M32 20 43 25.5v11L32 42 21 36.5v-11L32 20Zm0 0v11m0 0 11-5.5M32 31l-11-5.5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        className={a}
        style={{ ['--len' as string]: 30, ['--delay' as string]: '1.3s' }}
        d="m25 48 5 5 10-11"
        stroke="#fbbf24"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      Supply<span className="text-amber-400">Trust</span>
    </span>
  )
}
