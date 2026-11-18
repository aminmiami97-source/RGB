import type { User } from 'firebase/auth';
import { LogOut, ShieldCheck } from 'lucide-react';
import type { ExecutorId } from '../types/script';
import { canUserPublishUpdates } from '../utils/scriptData';
import type { UserProfileRecord } from '../utils/userProfile';
import { GoogleLogo, SolaraLogo, XenoLogo } from './ExecutorLogos';

interface AccountViewProps {
  user: User | null;
  authReady: boolean;
  profile: UserProfileRecord | null;
  authBusy: boolean;
  authError: string | null;
  activeExecutor: ExecutorId;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onUpdatePreferredExecutor: (executor: ExecutorId) => void;
}

export function AccountView({
  user,
  authReady,
  profile,
  authBusy,
  authError,
  activeExecutor,
  onSignInWithGoogle,
  onSignOut,
  onUpdatePreferredExecutor,
}: AccountViewProps) {
  const effectiveExecutor = profile?.preferredExecutor ?? activeExecutor;
  const displayName = profile?.displayName ?? user?.displayName ?? 'RGB Member';
  const email = profile?.email ?? user?.email ?? '';
  const photoURL = profile?.photoURL ?? user?.photoURL ?? '';
  const initial = displayName.charAt(0).toUpperCase() || 'R';
  const isPublisher = canUserPublishUpdates(user);

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-9 space-y-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-mono-tabular font-semibold text-[#3b5bfe]">RGB Account</span>
            <span aria-hidden="true">·</span>
            <span>Google Sign-In</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1a2238]">
            {user ? 'Your RGB Account' : 'Create an RGB Account with Google'}
          </h1>
          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            {user
              ? 'Your Google account is connected. Your preferred executor profile stays synced across sessions.'
              : 'Sign in or create your RGB account in one click using Google to save your preferred executor across RGB script releases.'}
          </p>
        </div>

        {authError && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50/90 border border-red-200 px-4 py-3 text-xs font-medium text-red-700"
          >
            {authError}
          </div>
        )}

        {!authReady ? (
          <div className="py-8 text-sm text-slate-500">Checking account session...</div>
        ) : !user ? (
          <div className="pt-2 space-y-4">
            <button
              type="button"
              onClick={onSignInWithGoogle}
              disabled={authBusy}
              className="liquid-glass-button inline-flex items-center justify-center gap-3 rounded-2xl px-6 py-3 text-sm font-semibold text-[#1a2238] hover:text-[#3b5bfe] disabled:opacity-60 min-h-[48px] w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
            >
              <GoogleLogo className="h-5 w-5" />
              <span>{authBusy ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <p className="text-xs text-slate-500">
              Uses verified Google authentication. No separate password is required.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* User Identity Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
              <div className="flex items-center gap-3.5 min-w-0">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={`${displayName} avatar`}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 rounded-2xl object-cover border border-white shadow-xs shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-[#4d6bfe] text-white font-display font-semibold text-lg flex items-center justify-center shrink-0">
                    {initial}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-[#1a2238] truncate">
                      {displayName}
                    </h2>
                    <ShieldCheck className="h-4 w-4 text-[#4d6bfe] shrink-0" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                  {isPublisher && (
                    <p className="text-[11px] font-medium text-[#3b5bfe] mt-0.5">
                      Authorized Script &amp; Update Publisher
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onSignOut}
                disabled={authBusy}
                className="liquid-glass-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-700 hover:text-red-600 min-h-[40px] self-start sm:self-auto whitespace-nowrap shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Preferred Executor Sync */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#1a2238]">
                  Saved Preferred Executor
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically highlights your preferred Roblox executor across RGB script releases.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onUpdatePreferredExecutor('solara')}
                  aria-pressed={effectiveExecutor === 'solara'}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all min-h-[52px] ${
                    effectiveExecutor === 'solara'
                      ? 'bg-[#e8f0fe] border border-[#b7cbff] text-[#1a2238] shadow-xs'
                      : 'bg-white/65 border border-white/85 text-slate-700 hover:bg-white'
                  }`}
                >
                  <SolaraLogo className="h-7 w-7" />
                  <div>
                    <p className="text-sm font-semibold">Solara</p>
                    <p className="text-xs text-slate-500">
                      {effectiveExecutor === 'solara' ? 'Saved default' : 'Click to set default'}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdatePreferredExecutor('xeno')}
                  aria-pressed={effectiveExecutor === 'xeno'}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all min-h-[52px] ${
                    effectiveExecutor === 'xeno'
                      ? 'bg-[#e8f0fe] border border-[#b7cbff] text-[#1a2238] shadow-xs'
                      : 'bg-white/65 border border-white/85 text-slate-700 hover:bg-white'
                  }`}
                >
                  <XenoLogo className="h-7 w-7" />
                  <div>
                    <p className="text-sm font-semibold">Xeno</p>
                    <p className="text-xs text-slate-500">
                      {effectiveExecutor === 'xeno' ? 'Saved default' : 'Click to set default'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
