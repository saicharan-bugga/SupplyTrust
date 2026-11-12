export interface LogoMarkProps {
  size?: number
  animated?: boolean
}

const SHIELD = 'M64 7 109 21v41c0 27-18 47-45 59C37 109 19 89 19 62V21L64 7Z'
const SHIELD_IN = 'M64 15 101 27v35c0 22-14 38-37 48C41 100 27 84 27 62V27L64 15Z'

/**
 * SupplyTrust emblem: a classic heraldic shield in deep navy with a gold border,
 * a laurel pair and a gold approval check (trust) above a ledger rule (supply records).
 */
export function LogoMark({ size = 40, animated = false }: LogoMarkProps) {
  const a = animated
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" role="img" aria-label="SupplyTrust logo">
      <defs>
        <linearGradient id="st-gold" x1="19" y1="7" x2="109" y2="121" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f6e8b1" />
          <stop offset="0.35" stopColor="#d4af37" />
          <stop offset="0.7" stopColor="#9a7424" />
          <stop offset="1" stopColor="#ecd58a" />
        </linearGradient>
        <linearGradient id="st-crest" x1="27" y1="15" x2="101" y2="112" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f4478" />
          <stop offset="0.55" stopColor="#12294a" />
          <stop offset="1" stopColor="#081426" />
        </linearGradient>
        <linearGradient id="st-gloss" x1="30" y1="12" x2="84" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* shield body, depth and border */}
      <path d={SHIELD} fill="#000" opacity="0.3" transform="translate(0 3)" />
      <path className={a ? 'st-badge-in' : ''} d={SHIELD} fill="url(#st-crest)" />
      <path
        className={a ? 'st-draw' : ''}
        style={{ ['--len' as string]: 380, ['--delay' as string]: '0.2s', animationDuration: '1.4s' }}
        d={SHIELD}
        stroke="url(#st-gold)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d={SHIELD_IN} stroke="url(#st-gold)" strokeOpacity="0.55" strokeWidth="1.3" strokeLinejoin="round" />

      <g className={a ? 'st-pop-node' : ''} style={{ ['--delay' as string]: '0.9s' }}>
        {/* chief: three studs */}
        <circle cx="50" cy="32" r="2.6" fill="url(#st-gold)" />
        <circle cx="64" cy="29" r="3.2" fill="url(#st-gold)" />
        <circle cx="78" cy="32" r="2.6" fill="url(#st-gold)" />

        {/* laurel pair */}
        <path d="M37 52c-4 17 3 34 27 46" stroke="url(#st-gold)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M91 52c4 17-3 34-27 46" stroke="url(#st-gold)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M38 62c-6-1-9-4-10-8 5 0 9 2 10 8ZM40 75c-6 0-10-3-12-7 5-1 10 1 12 7ZM46 86c-5 1-10-1-13-5 5-2 10-1 13 5Z" fill="url(#st-gold)" />
        <path d="M90 62c6-1 9-4 10-8-5 0-9 2-10 8ZM88 75c6 0 10-3 12-7-5-1-10 1-12 7ZM82 86c5 1 10-1 13-5-5-2-10-1-13 5Z" fill="url(#st-gold)" />

        {/* ledger rule */}
        <path d="M46 84h36M52 91h24" stroke="url(#st-gold)" strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* approval check */}
      <path d="m46 62 12 12 26-27" stroke="#040b18" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      <path
        className={a ? 'st-draw' : ''}
        style={{ ['--len' as string]: 60, ['--delay' as string]: '1.5s' }}
        d="m46 62 12 12 26-27"
        stroke="url(#st-gold)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* gloss + sparkle */}
      <path d="M64 15 101 27v20L27 47V27L64 15Z" fill="url(#st-gloss)" opacity="0.5" />
      <path
        className={a ? 'st-sparkle' : ''}
        d="M104 14c.6 5 2.2 6.6 7.2 7.2-5 .6-6.6 2.2-7.2 7.2-.6-5-2.2-6.6-7.2-7.2 5-.6 6.6-2.2 7.2-7.2Z"
        fill="#fbf3d3"
      />
    </svg>
  )
}

export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[1.35em] font-bold tracking-wide ${className}`} style={{ fontFamily: 'var(--font-serif)' }}>
      Supply<span className="st-gold-text">Trust</span>
    </span>
  )
}
