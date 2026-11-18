import { Check, Copy, ExternalLink } from 'lucide-react';
import type { ExecutorId } from '../types/script';
import { EXECUTOR_PROFILES, formatVersionDisplay } from '../utils/scriptData';
import { SolaraLogo, XenoLogo } from './ExecutorLogos';

interface ExecutorsViewProps {
  latestVersion: string;
  activeExecutor: ExecutorId;
  onSelectExecutor: (executor: ExecutorId) => void;
  onCopyForExecutor: (executor: ExecutorId) => void;
  justCopied: boolean;
}

export function ExecutorsView({
  latestVersion,
  activeExecutor,
  onSelectExecutor,
  onCopyForExecutor,
  justCopied,
}: ExecutorsViewProps) {
  const versionLabel = formatVersionDisplay(latestVersion);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="liquid-glass rounded-3xl p-5 sm:p-7 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-mono-tabular font-semibold text-[#3b5bfe]">
            RGB {versionLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>Supported Executors</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-emerald-700">Official Script Live</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1a2238]">
          Built for Solara and Xeno
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Download Solara or Xeno using their official pages below, then copy RGB {versionLabel}{' '}
          in one click to run immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {EXECUTOR_PROFILES.map((profile) => {
          const isSelected = activeExecutor === profile.id;
          return (
            <div
              key={profile.id}
              className={`liquid-glass-elevated liquid-glass-interactive rounded-3xl p-6 flex flex-col justify-between gap-6 transition-all ${
                isSelected ? 'ring-2 ring-[#4d6bfe]/55' : ''
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {profile.id === 'solara' ? (
                      <SolaraLogo className="h-11 w-11 shadow-xs" />
                    ) : (
                      <XenoLogo className="h-11 w-11 shadow-xs" />
                    )}
                    <div>
                      <h2 className="font-display text-xl font-semibold text-[#1a2238]">
                        {profile.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {profile.compatibilityScore} · {profile.frameOverhead}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectExecutor(profile.id)}
                    aria-pressed={isSelected}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[36px] ${
                      isSelected
                        ? 'bg-[#4d6bfe] text-white'
                        : 'bg-white/75 text-slate-700 border border-white hover:bg-white'
                    }`}
                  >
                    {isSelected ? 'Active Target' : 'Select Target'}
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{profile.tagline}</p>

                <div className="pt-3 border-t border-slate-200/70 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-700">Runtime Flags</h3>
                  <p className="font-mono-tabular text-xs text-slate-600">
                    {profile.recommendedFlags.join('  ·  ')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-700">Verified APIs</h3>
                  <p className="font-mono-tabular text-xs text-slate-600">
                    {profile.supportedApis.join('  ·  ')}
                  </p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-1">{profile.notes}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <a
                  href={profile.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-[0_6px_18px_rgba(77,107,254,0.24)] min-h-[44px] whitespace-nowrap transition-colors"
                >
                  {profile.id === 'solara' ? (
                    <SolaraLogo className="h-5 w-5" />
                  ) : (
                    <XenoLogo className="h-5 w-5" />
                  )}
                  <span>Download {profile.name}</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    onSelectExecutor(profile.id);
                    onCopyForExecutor(profile.id);
                  }}
                  className="liquid-glass-button inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1a2238] min-h-[44px] whitespace-nowrap shrink-0"
                >
                  {justCopied && isSelected ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
                      <span>Get Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
