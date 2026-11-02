// Doodh Tracker — farmer logo (doodh ki baalti lekar khada kisan)
// Pure inline SVG — koi image file nahi, offline bhi chalta hai, kisi bhi size pe crisp

export default function FarmerLogo({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kisan doodh ki baalti ke saath"
    >
      <defs>
        <linearGradient id="farmerLogoBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b6b4f" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="32" fill="url(#farmerLogoBg)" />
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="#10b981" strokeOpacity="0.35" strokeWidth="1.6" />

      {/* legs / dhoti */}
      <rect x="24.4" y="47" width="5.4" height="12" rx="2.7" fill="#d1d5db" />
      <rect x="31.4" y="47" width="5.4" height="12" rx="2.7" fill="#d1d5db" />

      {/* kurta / body */}
      <rect x="21" y="29" width="19.5" height="21" rx="5" fill="#fef3c7" />
      <path d="M30.8 30v18" stroke="#e2c98f" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="30.8" cy="34" r="0.9" fill="#c8a96a" />
      <circle cx="30.8" cy="39" r="0.9" fill="#c8a96a" />
      <circle cx="30.8" cy="44" r="0.9" fill="#c8a96a" />

      {/* left arm */}
      <path d="M22.6 33c-2.4 2-3.4 4.2-3.4 6.4" stroke="#eab389" strokeWidth="3.6" strokeLinecap="round" fill="none" />

      {/* head */}
      <circle cx="30.8" cy="21.5" r="8" fill="#f0b98a" />

      {/* turban */}
      <path d="M22.8 20a8 8 0 0 1 16 0Z" fill="#f59e0b" />
      <rect x="22.8" y="17.6" width="16" height="3.1" rx="1.5" fill="#d97706" />
      <circle cx="39" cy="19" r="2.4" fill="#f59e0b" />
      <circle cx="39" cy="19" r="1.1" fill="#d97706" />

      {/* face */}
      <circle cx="28" cy="22.6" r="1" fill="#1f2937" />
      <circle cx="33.6" cy="22.6" r="1" fill="#1f2937" />
      <path d="M27.8 26.2q3-1.7 6 0" stroke="#5b3a1e" strokeWidth="1.9" strokeLinecap="round" fill="none" />

      {/* bucket handle */}
      <path d="M40.2 33.4c0-5.4 10.6-5.4 10.6 0" stroke="#64748b" strokeWidth="1.7" fill="none" strokeLinecap="round" />

      {/* bucket body */}
      <path d="M39.4 34.6h12.6l-1.9 15.2a2.2 2.2 0 0 1-2.2 1.9h-4.4a2.2 2.2 0 0 1-2.2-1.9L39.4 34.6Z" fill="#cbd5e1" />
      <path d="M41.3 36.4l-1.1 12.2" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />
      <path d="M50.1 36.4l1.1 12.2" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" opacity="0.65" />

      {/* bucket rim + milk */}
      <rect x="38.3" y="32.6" width="14.8" height="4" rx="2" fill="#94a3b8" />
      <ellipse cx="45.7" cy="34.6" rx="5.6" ry="1.6" fill="#ffffff" />

      {/* right arm holding the handle */}
      <path d="M37.2 31.6c2.2 0.2 3.6 1 4.4 2.2" stroke="#eab389" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <circle cx="42" cy="34" r="2.1" fill="#f0b98a" />
    </svg>
  )
}
