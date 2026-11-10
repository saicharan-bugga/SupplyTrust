export interface LogoMarkProps {
  size?: number
  animated?: boolean
}

/**
 * SupplyTrust mark: a rounded badge holding an "S" drawn as a supply route
 * (two stops joined by a path) with a trust check seal.
 */
export function LogoMark({ size = 40, animated = false }: LogoMarkProps) {
  const draw = animated ? 'st-draw' : ''
  const pop = animated ? 'st-pop-node' : ''
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img" aria-label="SupplyTrust logo">
      <defs>
        <linearGradient id="st-badge" x1="4" y1="2" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2dd4bf" />
          <stop offset="0.55" stopColor="#0f9488" />
          <stop offset="1" stopColor="#0a4f52" />
        </linearGradient>
      </defs>
      <rect className={animated ? 'st-badge-in' : ''} x="3" y="3" width="58" height="58" rx="17" fill="url(#st-badge)" />
      <rect x="3.75" y="3.75" width="56.5" height="56.5" rx="16.25" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <path
        className={draw}
        style={{ ['--len' as string]: 110, ['--delay' as string]: '0.5s' }}
        d="M42 19.5C38.5 14.5 22 14.5 22 25.5C22 36 42 29.5 42 40.5C42 50.5 26 50.5 21.5 44.5"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className={pop} style={{ ['--delay' as string]: '1.3s' }} cx="42" cy="19.5" r="4.2" fill="#fbbf24" stroke="#0a4f52" strokeWidth="2" />
      <circle className={pop} style={{ ['--delay' as string]: '1.45s' }} cx="21.5" cy="44.5" r="4.2" fill="#fbbf24" stroke="#0a4f52" strokeWidth="2" />
      <g className={pop} style={{ ['--delay' as string]: '1.7s' }}>
        <circle cx="50" cy="50" r="11" fill="#fbbf24" stroke="#0a2229" strokeWidth="2.5" />
        <path d="m44.8 50.2 3.6 3.6 6.2-7" stroke="#0a2229" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
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
