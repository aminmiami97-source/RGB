import {
  Check,
  Code2,
  Copy,
  Download,
  Pause,
  PencilLine,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import type { ExecutorId, LiveScriptState, ScriptRelease, UpdateCategory } from '../types/script';
import {
  EXECUTOR_URLS,
  filterChanges,
  flattenChanges,
  formatRelativeTime,
  formatVersionDisplay,
} from '../utils/scriptData';
import { SolaraLogo, XenoLogo } from './ExecutorLogos';

interface DashboardViewProps {
  releases: ScriptRelease[];
  updatesLoading: boolean;
  liveScript: LiveScriptState;
  latestVersion: string;
  activeExecutor: ExecutorId;
  onSelectExecutor: (executor: ExecutorId) => void;
  liveSyncEnabled: boolean;
  onToggleLiveSync: () => void;
  lastSyncedAt: string;
  onRefreshNow: () => void;
  canPublishUpdates: boolean;
  onOpenLogModal: () => void;
  onOpenEditScriptModal: () => void;
  onDeleteUpdate?: (updateId: string) => void;
  onGetScript: () => void;
  onDownloadScript: () => void;
  justCopied: boolean;
  initialSearch?: string;
}

const CATEGORY_TABS: (UpdateCategory | 'All')[] = [
  'All',
  'Added',
  'Improved',
  'Fixed',
  'Security',
];

export function DashboardView({
  releases,
  updatesLoading,
  liveScript,
  latestVersion,
  activeExecutor,
  onSelectExecutor,
  liveSyncEnabled,
  onToggleLiveSync,
  lastSyncedAt,
  onRefreshNow,
  canPublishUpdates,
  onOpenLogModal,
  onOpenEditScriptModal,
  onDeleteUpdate,
  onGetScript,
  onDownloadScript,
  justCopied,
  initialSearch = '',
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<UpdateCategory | 'All'>('All');

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const flattened = useMemo(() => flattenChanges(releases), [releases]);
  const filteredChanges = useMemo(
    () =>
      filterChanges(flattened, {
        query: searchQuery,
        category: selectedCategory,
      }),
    [flattened, searchQuery, selectedCategory]
  );

  const totalReleases = releases.length;
  const totalChanges = flattened.length;
  const versionLabel = formatVersionDisplay(latestVersion);
  const lineCount = useMemo(() => liveScript.code.split('\n').length, [liveScript.code]);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {/* Top Dashboard Header Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass rounded-3xl p-5 sm:p-7"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="font-mono-tabular font-semibold text-[#3b5bfe]">
                {versionLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>{totalReleases} {totalReleases === 1 ? 'Release' : 'Releases'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                {totalChanges} {totalChanges === 1 ? 'Script Change' : 'Script Changes'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Synced {formatRelativeTime(lastSyncedAt)}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1a2238]">
              RGB Script &amp; Live Updates
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Copy the official RGB SCRIPTS loader in one click and follow real-time script updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleLiveSync}
              aria-pressed={liveSyncEnabled}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 min-h-[40px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe] ${
                liveSyncEnabled
                  ? 'bg-[#e8f0fe] text-[#2d5bff] border border-[#bfd2ff]'
                  : 'bg-white/70 text-slate-600 border border-white'
              }`}
            >
              {liveSyncEnabled ? (
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{liveSyncEnabled ? 'Live Sync On' : 'Live Sync Paused'}</span>
            </button>

            <button
              type="button"
              onClick={onRefreshNow}
              className="liquid-glass-button inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
              aria-label="Sync updates now"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sync</span>
            </button>

            {canPublishUpdates && (
              <>
                <button
                  type="button"
                  onClick={onOpenEditScriptModal}
                  className="liquid-glass-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#1a2238] hover:text-[#3b5bfe] whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
                >
                  <PencilLine className="h-3.5 w-3.5 text-[#4d6bfe]" aria-hidden="true" />
                  <span>Edit Script</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenLogModal}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-[0_6px_18px_rgba(77,107,254,0.28)] whitespace-nowrap shrink-0 min-h-[40px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Log Update</span>
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main 12-col Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simple Script-Only Update Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-4"
        >
          <div className="liquid-glass rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Simple Search & Category Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                <label htmlFor="dashboard-search" className="sr-only">
                  Filter RGB script updates
                </label>
                <input
                  id="dashboard-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search RGB script updates..."
                  className="w-full rounded-2xl bg-white/75 border border-white/90 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
                />
              </div>

              <div
                className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white/55 border border-white/80 max-w-full"
                role="group"
                aria-label="Filter by change category"
              >
                {CATEGORY_TABS.map((category) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      aria-pressed={active}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors min-h-[34px] ${
                        active
                          ? 'bg-white text-[#1a2238] shadow-xs'
                          : 'text-slate-600 hover:text-[#1a2238]'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Empty / Loading / Filtered States */}
            {updatesLoading ? (
              <div className="py-12 text-center border-t border-slate-200/70">
                <p className="text-sm text-slate-500">Checking for RGB script updates...</p>
              </div>
            ) : totalChanges === 0 ? (
              <div
                className="py-12 text-center space-y-3 border-t border-slate-200/70"
                data-testid="updates-empty"
              >
                <p className="text-sm font-semibold text-[#1a2238]">No updates logged yet</p>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Nothing has been added to the RGB updates log yet. Official script code is live on
                  the right.
                </p>
                {canPublishUpdates && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={onOpenLogModal}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-[0_6px_18px_rgba(77,107,254,0.28)] min-h-[40px]"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Log First Update</span>
                    </button>
                  </div>
                )}
              </div>
            ) : filteredChanges.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-t border-slate-200/70">
                <p className="text-sm font-medium text-slate-800">
                  No script updates match your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="liquid-glass-button inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[#1a2238] min-h-[38px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset Filters</span>
                </button>
              </div>
            ) : (
              <div
                className="divide-y divide-slate-200/70 border-t border-slate-200/70"
                data-testid="updates-feed"
              >
                {filteredChanges.map((item) => (
                  <article key={item.id} className="py-4 first:pt-4 last:pb-1 space-y-1">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular font-semibold text-[#3b5bfe]">
                          v{item.version}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-medium ${
                            item.category === 'Added'
                              ? 'text-emerald-700'
                              : item.category === 'Improved'
                                ? 'text-[#3b5bfe]'
                                : item.category === 'Fixed'
                                  ? 'text-amber-700'
                                  : 'text-slate-700'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono-tabular">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                        {canPublishUpdates && onDeleteUpdate && (
                          <button
                            type="button"
                            onClick={() => onDeleteUpdate(item.id)}
                            aria-label={`Delete update ${item.title}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50/80 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="font-display text-base font-medium text-[#1a2238]">
                      {item.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Official Live Lua Script Viewer + One-Click Copy + Admin Edit */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-4"
        >
          <div className="liquid-glass-elevated rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-semibold text-[#1a2238]">
                    RGB SCRIPTS · Official Loader
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Updated {formatRelativeTime(liveScript.updatedAt)} · {lineCount} lines · Ready for
                  Solara &amp; Xeno
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono-tabular text-xs font-semibold text-[#3b5bfe]">
                  {versionLabel}
                </span>
                {canPublishUpdates && (
                  <button
                    type="button"
                    onClick={onOpenEditScriptModal}
                    aria-label="Edit official RGB script"
                    className="liquid-glass-button inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#1a2238] hover:text-[#3b5bfe]"
                  >
                    <PencilLine className="h-3 w-3 text-[#4d6bfe]" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Executor Switcher with Liquid Glass sliding indicator */}
            <div
              className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-white/60 border border-white/85"
              role="group"
              aria-label="Select executor profile"
            >
              {(['solara', 'xeno'] as const).map((exec) => {
                const isActive = activeExecutor === exec;
                return (
                  <button
                    key={exec}
                    type="button"
                    onClick={() => onSelectExecutor(exec)}
                    aria-pressed={isActive}
                    className={`relative inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-colors min-h-[40px] ${
                      isActive ? 'text-[#3b5bfe]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="dashboard-executor-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-xl bg-white shadow-xs"
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {exec === 'solara' ? (
                        <SolaraLogo className="h-4 w-4" />
                      ) : (
                        <XenoLogo className="h-4 w-4" />
                      )}
                      <span>{exec === 'solara' ? 'Solara' : 'Xeno'}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Official Lua Script Source Box */}
            <div className="rounded-2xl bg-[#0f172a] border border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 text-[11px] font-mono-tabular text-slate-400">
                <span>RGB_SCRIPTS.lua</span>
                <span>{versionLabel}</span>
              </div>
              <pre
                data-testid="official-script-code"
                className="max-h-64 overflow-auto p-3.5 text-xs font-mono leading-relaxed text-slate-100 whitespace-pre"
              >
                <code>{liveScript.code}</code>
              </pre>
            </div>

            {/* One-Click Copy, Download .lua, & Executor Download Links */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={onGetScript}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-[0_6px_18px_rgba(77,107,254,0.28)] min-h-[44px] transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d6bfe]"
                >
                  {justCopied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      <span>Get Script (Copy)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onDownloadScript}
                  className="liquid-glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium text-[#1a2238] hover:text-[#3b5bfe] min-h-[44px] whitespace-nowrap"
                >
                  <Download className="h-4 w-4 text-[#4d6bfe]" aria-hidden="true" />
                  <span>Download .lua</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={EXECUTOR_URLS.solara}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-medium text-[#1a2238] min-h-[42px] whitespace-nowrap"
                >
                  <SolaraLogo className="h-4 w-4" />
                  <span>Download Solara</span>
                </a>
                <a
                  href={EXECUTOR_URLS.xeno}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass-button inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-medium text-[#1a2238] min-h-[42px] whitespace-nowrap"
                >
                  <XenoLogo className="h-4 w-4" />
                  <span>Download Xeno</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
