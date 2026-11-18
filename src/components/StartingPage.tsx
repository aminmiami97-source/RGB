import {
  Activity,
  ArrowRight,
  ArrowUp,
  Check,
  Cpu,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppView, ExecutorId, ScriptRelease } from '../types/script';
import {
  CREDITS_LINE,
  EXECUTOR_URLS,
  filterChanges,
  flattenChanges,
  formatVersionDisplay,
} from '../utils/scriptData';
import { SolaraLogo, XenoLogo } from './ExecutorLogos';

interface StartingPageProps {
  latestVersion: string;
  releases: ScriptRelease[];
  activeExecutor: ExecutorId;
  onSelectExecutor: (executor: ExecutorId) => void;
  onGetScript: () => void;
  onNavigate: (view: AppView, initialSearch?: string) => void;
  justCopied: boolean;
}

export function StartingPage({
  latestVersion,
  releases,
  activeExecutor,
  onSelectExecutor,
  onGetScript,
  onNavigate,
  justCopied,
}: StartingPageProps) {
  const [commandQuery, setCommandQuery] = useState('');
  const versionLabel = formatVersionDisplay(latestVersion);

  const allChanges = useMemo(() => flattenChanges(releases), [releases]);
  const liveMatches = useMemo(() => {
    if (!commandQuery.trim()) {
      return [];
    }
    return filterChanges(allChanges, {
      query: commandQuery,
    }).slice(0, 4);
  }, [allChanges, commandQuery]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (commandQuery.trim()) {
      onNavigate('dashboard', commandQuery.trim());
    } else {
      onGetScript();
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 sm:px-6 pt-6 pb-14">
      <div className="w-full max-w-[780px] mx-auto flex flex-col items-center text-center">
        {/* Announcement Line mirroring the reference starting page — nowrap prevents orphan arrow */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="group mb-7 sm:mb-9 max-w-3xl text-[13px] sm:text-sm leading-relaxed text-slate-600 hover:text-slate-900 transition-colors rounded-xl px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
        >
          <span className="inline-flex items-center gap-1.5 mr-1.5 align-middle text-[#4d6bfe]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>
            RGB <span className="font-mono-tabular font-medium text-slate-800">{versionLabel}</span>{' '}
            is <span className="font-semibold text-[#3b5bfe]">Now Released</span> — copy the
            official script or follow updates for{' '}
            <span className="font-medium text-slate-800">Solara</span> and{' '}
            <span className="font-medium text-slate-800 whitespace-nowrap">
              Xeno.
              <ArrowRight
                className="inline-block ml-1.5 h-3.5 w-3.5 text-slate-500 transition-transform group-hover:translate-x-0.5 align-[-2px]"
                aria-hidden="true"
              />
            </span>
          </span>
        </button>

        {/* Centered Display Headline mirroring the reference hero */}
        <h1
          className="font-display font-medium tracking-tight text-[#1e2744] mb-7 sm:mb-9"
          style={{
            fontSize: 'clamp(2.35rem, 4.8vw, 3.65rem)',
            lineHeight: 1.12,
            textWrap: 'balance',
          }}
        >
          RGB · {versionLabel}
        </h1>

        {/* Central Liquid Glass Command / Script Box */}
        <form
          onSubmit={handleFormSubmit}
          className="liquid-glass-elevated liquid-glass-interactive w-full rounded-[24px] p-4 sm:p-5 text-left transition-shadow"
        >
          <label htmlFor="rgb-command-input" className="sr-only">
            Search RGB updates or press Enter to copy script
          </label>
          <input
            id="rgb-command-input"
            type="text"
            value={commandQuery}
            onChange={(e) => setCommandQuery(e.target.value)}
            placeholder={`Search RGB ${versionLabel} updates or press ↑ to copy script...`}
            className="w-full bg-transparent text-[15px] sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none px-1.5 pt-1 pb-5"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Executor Mode Toggles with Real Solara & Xeno Logos */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Target Executor">
              <button
                type="button"
                onClick={() => onSelectExecutor('solara')}
                aria-pressed={activeExecutor === 'solara'}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 transition-all min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe] ${
                  activeExecutor === 'solara'
                    ? 'bg-[#e8f0fe] text-[#2d5bff] border border-[#b7cbff] shadow-xs'
                    : 'bg-white/65 text-slate-600 border border-white/80 hover:bg-white/90 hover:text-slate-900'
                }`}
              >
                <SolaraLogo className="h-4 w-4" />
                <span>Solara</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectExecutor('xeno')}
                aria-pressed={activeExecutor === 'xeno'}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-[13px] font-medium whitespace-nowrap shrink-0 transition-all min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe] ${
                  activeExecutor === 'xeno'
                    ? 'bg-[#e8f0fe] text-[#2d5bff] border border-[#b7cbff] shadow-xs'
                    : 'bg-white/65 text-slate-600 border border-white/80 hover:bg-white/90 hover:text-slate-900'
                }`}
              >
                <XenoLogo className="h-4 w-4" />
                <span>Xeno</span>
              </button>

              <span className="hidden sm:inline-block text-xs text-slate-500 pl-1.5 font-mono-tabular">
                {versionLabel} · Live
              </span>
            </div>

            {/* Right-side executor download link with logo + circular blue copy button */}
            <div className="flex items-center gap-2 ml-auto">
              <a
                href={activeExecutor === 'solara' ? EXECUTOR_URLS.solara : EXECUTOR_URLS.xeno}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#3b5bfe] bg-white/70 hover:bg-white/95 border border-white/85 transition-colors min-h-[38px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
              >
                {activeExecutor === 'solara' ? (
                  <SolaraLogo className="h-3.5 w-3.5" />
                ) : (
                  <XenoLogo className="h-3.5 w-3.5" />
                )}
                <span>{activeExecutor === 'solara' ? 'Get Solara' : 'Get Xeno'}</span>
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={onGetScript}
                aria-label={
                  justCopied
                    ? 'RGB script copied to clipboard'
                    : `Copy RGB ${versionLabel} script for ${activeExecutor}`
                }
                className="inline-flex items-center justify-center h-10 w-10 rounded-full text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-[0_6px_18px_rgba(77,107,254,0.35)] transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4d6bfe]"
              >
                {justCopied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Instant live search matches when user types inside the command box */}
          {liveMatches.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Matching updates ({liveMatches.length})</span>
                <button
                  type="submit"
                  className="text-[#3b5bfe] font-medium hover:underline"
                >
                  Open in Dashboard →
                </button>
              </div>
              <div className="divide-y divide-slate-200/60">
                {liveMatches.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate('dashboard', commandQuery.trim())}
                    className="w-full text-left px-2 py-2 rounded-xl hover:bg-white/70 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">
                        v{item.version} · {item.category}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Three Liquid Glass Quick-Action Buttons below the command box */}
        <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="liquid-glass-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-[#1e2744] whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
          >
            <Activity className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
            <span>Live Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('executors')}
            className="liquid-glass-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-[#1e2744] whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
          >
            <Cpu className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
            <span>Solara &amp; Xeno</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('credits')}
            className="liquid-glass-button inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-[#1e2744] whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
          >
            <Users className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
            <span>Credits &amp; Team</span>
          </button>
        </div>

        {/* Clean unobtrusive attribution line */}
        <p className="mt-10 text-xs font-medium tracking-wide text-slate-500">
          {CREDITS_LINE}
        </p>
      </div>
    </section>
  );
}
