export interface LogoMarkProps {
  size?: number
  animated?: boolean
}

const HEX = 'M64 6 114.2 35v58L64 122 13.8 93V35L64 6Z'
const HEX_IN = 'M64 14 107.3 39v50L64 114 20.7 89V39L64 14Z'

/**
 * SupplyTrust emblem: a gold-rimmed faceted crest holding an isometric cargo
 * cube (supply) stamped with a gold approval check (trust).
 */
export function LogoMark({ size = 40, animated = false }: LogoMarkProps) {
  const a = animated
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" role="img" aria-label="SupplyTrust logo">
      <defs>
        <linearGradient id="st-gold" x1="14" y1="6" x2="114" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff3b0" />
          <stop offset="0.35" stopColor="#fbbf24" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#fcd34d" />
        </linearGradient>
        <linearGradient id="st-crest" x1="20" y1="14" x2="108" y2="114" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0f4c56" />
          <stop offset="0.5" stopColor="#0a2e36" />
          <stop offset="1" stopColor="#041014" />
        </linearGradient>
        <radialGradient id="st-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(64 58) rotate(90) scale(54)">
          <stop stopColor="#2dd4bf" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="st-top" x1="40" y1="34" x2="88" y2="62" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ccfbf1" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id="st-left" x1="40" y1="48" x2="64" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0b6b6b" />
        </linearGradient>
        <linearGradient id="st-right" x1="88" y1="48" x2="64" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d7377" />
          <stop offset="1" stopColor="#062f36" />
        </linearGradient>
        <linearGradient id="st-gloss" x1="30" y1="14" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* crest body + depth */}
      <path d={HEX} fill="#000" opacity="0.35" transform="translate(0 3)" />
      <path className={a ? 'st-badge-in' : ''} d={HEX} fill="url(#st-crest)" />
      <path d={HEX} fill="url(#st-glow)" />

      {/* gold rim */}
      <path
        className={a ? 'st-draw' : ''}
        style={{ ['--len' as string]: 360, ['--delay' as string]: '0.2s', animationDuration: '1.4s' }}
        d={HEX}
        stroke="url(#st-gold)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d={HEX_IN} stroke="url(#st-gold)" strokeOpacity="0.45" strokeWidth="1.2" strokeLinejoin="round" />

      {/* cube */}
      <g className={a ? 'st-pop-node' : ''} style={{ ['--delay' as string]: '0.9s' }}>
        <path d="M64 34 88 48 64 62 40 48 64 34Z" fill="url(#st-top)" />
        <path d="M40 48 64 62V90L40 76V48Z" fill="url(#st-left)" />
        <path d="M88 48 64 62V90L88 76V48Z" fill="url(#st-right)" />
        <path d="M64 34 88 48V76L64 90 40 76V48L64 34ZM40 48l24 14 24-14M64 62v28" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.4" strokeLinejoin="round" />
      </g>

      {/* approval check */}
      <path d="m51 68 9.5 9.5L80 54" stroke="#041014" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path
        className={a ? 'st-draw' : ''}
        style={{ ['--len' as string]: 50, ['--delay' as string]: '1.5s' }}
        d="m51 68 9.5 9.5L80 54"
        stroke="url(#st-gold)"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* glass sheen + sparkle */}
      <path d="M64 14 107.3 39 64 64 20.7 39 64 14Z" fill="url(#st-gloss)" opacity="0.55" />
      <path
        className={a ? 'st-sparkle' : ''}
        d="M104 14c.6 5 2.2 6.6 7.2 7.2-5 .6-6.6 2.2-7.2 7.2-.6-5-2.2-6.6-7.2-7.2 5-.6 6.6-2.2 7.2-7.2Z"
        fill="#fff8d6"
      />
    </svg>
  )
}

export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight ${className}`}>
      Supply<span className="st-gold-text">Trust</span>
    </span>
  )
}
