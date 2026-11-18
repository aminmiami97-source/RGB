import { Check, Copy, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { AppView } from '../types/script';

interface NavbarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onGetScript: () => void;
  justCopied: boolean;
  isSignedIn: boolean;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'executors', label: 'Executors' },
  { id: 'credits', label: 'Credits' },
  { id: 'account', label: 'Account' },
];

export function Navbar({
  activeView,
  onNavigate,
  onGetScript,
  justCopied,
  isSignedIn,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#f6f8fe]/70 border-b border-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="group flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
          aria-label="RGB Home"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3"
          >
            <defs>
              <linearGradient id="rgbPrismShell" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="rgbSpectrumEdge" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="48%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#4d6bfe" />
              </linearGradient>
              <linearGradient id="rgbFacetTop" x1="10" y1="7" x2="22" y2="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="28" height="28" rx="8.5" fill="url(#rgbPrismShell)" />
            <rect
              x="2.75"
              y="2.75"
              width="26.5"
              height="26.5"
              rx="7.75"
              stroke="url(#rgbSpectrumEdge)"
              strokeWidth="1.6"
            />
            {/* Isometric RGB prism facets */}
            <path
              d="M16 6.8L23.8 11.3V20.7L16 25.2L8.2 20.7V11.3L16 6.8Z"
              stroke="url(#rgbSpectrumEdge)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M16 6.8L23.8 11.3L16 15.8L8.2 11.3L16 6.8Z" fill="url(#rgbFacetTop)" fillOpacity="0.22" />
            <path d="M16 15.8V25.2M16 15.8L23.8 11.3M16 15.8L8.2 11.3" stroke="url(#rgbSpectrumEdge)" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="16" cy="15.8" r="2" fill="#ffffff" />
          </svg>
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-[#1e2744] via-[#3b5bfe] to-[#0ea5e9] bg-clip-text text-transparent">
            RGB
          </span>
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            const label = item.id === 'account' && isSignedIn ? 'Account ✓' : item.label;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={`relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe] rounded ${
                  isActive
                    ? 'text-[#1a2238]'
                    : 'text-slate-600 hover:text-[#1a2238]'
                }`}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="rgb-nav-active-bar"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#4d6bfe]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button [Get Script] + mobile menu trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGetScript}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-all min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe] ${
              justCopied
                ? 'bg-[#4d6bfe] text-white shadow-sm'
                : 'liquid-glass-button text-[#1a2238] hover:text-[#3b5bfe]'
            }`}
          >
            {justCopied ? (
              <>
                <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Script Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 shrink-0 text-[#4d6bfe]" aria-hidden="true" />
                <span>Get Script</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-full p-2.5 min-h-[44px] min-w-[44px] liquid-glass-button text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Mobile navigation"
            className="md:hidden border-t border-white/80 bg-white/85 backdrop-blur-2xl px-4 py-3"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id;
                const label = item.id === 'account' && isSignedIn ? 'Account (Signed In)' : item.label;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-[#4d6bfe]/10 text-[#3b5bfe]'
                        : 'text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
