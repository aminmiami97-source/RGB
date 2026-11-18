import { useId } from 'react';

interface LogoProps {
  className?: string;
}

/**
 * Solara Executor Icon matching official Solara mark (image_571f7a46.png):
 * dark circular/rounded badge containing an open-gap ring arc and a centered 5-pointed outline star.
 */
export function SolaraLogo({ className = 'h-4 w-4' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`${className} shrink-0 rounded-full`}
    >
      <circle cx="16" cy="16" r="16" fill="#0d0f14" />
      {/* Open ring with top-right gap matching Solara logo */}
      <path
        d="M 24.4 9.5 A 10.6 10.6 0 1 0 26.5 17.5"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/* 5-pointed outline star */}
      <path
        d="M16 8.2L17.95 13.15L23.2 13.55L19.15 16.95L20.45 22.1L16 19.3L11.55 22.1L12.85 16.95L8.8 13.55L14.05 13.15L16 8.2Z"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Xeno Executor Icon matching official Xeno mark (image_62670fd6.png):
 * solid black circular badge with a tilted metallic UFO saucer (3 portholes) and glowing XENO text.
 */
export function XenoLogo({ className = 'h-4 w-4' }: LogoProps) {
  const uid = useId().replace(/:/g, '');
  const hullGradId = `xeno-hull-${uid}`;
  const domeGradId = `xeno-dome-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={`${className} shrink-0 rounded-full`}
    >
      <defs>
        <linearGradient id={hullGradId} x1="6" y1="8" x2="26" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id={domeGradId} x1="12" y1="6" x2="21" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      <circle cx="16" cy="16" r="16" fill="#050608" />

      {/* Tilted flying saucer */}
      <g transform="rotate(14 16 13)">
        {/* Saucer brim */}
        <ellipse cx="16" cy="14" rx="9.8" ry="3.7" fill={`url(#${hullGradId})`} />
        {/* Upper dome */}
        <path
          d="M10.4 13.2C10.4 9.7 12.9 7.5 16 7.5C19.1 7.5 21.6 9.7 21.6 13.2"
          fill={`url(#${domeGradId})`}
          stroke="#050608"
          strokeWidth="0.9"
        />
        {/* Three black porthole dots along the brim */}
        <circle cx="9.6" cy="14.1" r="0.95" fill="#050608" />
        <circle cx="16" cy="15.3" r="0.95" fill="#050608" />
        <circle cx="22.4" cy="14.1" r="0.95" fill="#050608" />
      </g>

      {/* Crisp XENO wordmark below saucer */}
      <text
        x="16"
        y="25.2"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="5.4"
        fontWeight="800"
        letterSpacing="0.8"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        XENO
      </text>
    </svg>
  );
}

export function GoogleLogo({ className = 'h-4 w-4' }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0`}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}
