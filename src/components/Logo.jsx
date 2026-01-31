export default function Logo({ size = 120 }) {
  return (
    <div className="logo-icon" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" fill="none">
        <defs>
          <linearGradient id="logoOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d8a6f" />
            <stop offset="100%" stopColor="#0A735E" />
          </linearGradient>
          <linearGradient id="logoInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14a085" />
            <stop offset="50%" stopColor="#0d9b7a" />
            <stop offset="100%" stopColor="#0A7055" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logoShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>
        {/* Outer ring - dark teal */}
        <circle cx="60" cy="60" r="56" fill="url(#logoOuter)" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
        {/* Inner glossy circle */}
        <circle cx="60" cy="60" r="50" fill="url(#logoInner)" filter="url(#logoGlow)" />
        {/* Shine overlay for 3D effect */}
        <ellipse cx="60" cy="38" rx="38" ry="22" fill="url(#logoShine)" />
        {/* Calendar grid */}
        <rect x="32" y="24" width="36" height="28" rx="3" fill="none" stroke="white" strokeWidth="2.5" />
        <line x1="32" y1="34" x2="68" y2="34" stroke="white" strokeWidth="2" />
        <line x1="42" y1="40" x2="42" y2="48" stroke="white" strokeWidth="1.6" />
        <line x1="50" y1="40" x2="50" y2="48" stroke="white" strokeWidth="1.6" />
        <line x1="58" y1="40" x2="58" y2="48" stroke="white" strokeWidth="1.6" />
        {/* Location pin - teardrop shape */}
        <path d="M60 54 C50 54 50 68 60 82 C70 68 70 54 60 54 Z" fill="white" />
        <circle cx="60" cy="58" r="3" fill="#0A7055" />
      </svg>
    </div>
  )
}
