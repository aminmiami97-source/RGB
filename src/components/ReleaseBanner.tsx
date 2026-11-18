import { ArrowRight, Bell, Check, Copy, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { LiveScriptState } from '../types/script';

interface ReleaseBannerProps {
  visible: boolean;
  liveScript: LiveScriptState;
  justCopied: boolean;
  onGetScript: () => void;
  onViewScript: () => void;
  onDismiss: () => void;
}

export function ReleaseBanner({
  visible,
  liveScript,
  justCopied,
  onGetScript,
  onViewScript,
  onDismiss,
}: ReleaseBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Official script release announcement"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-3"
        >
          <div className="liquid-glass-elevated rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-[#4d6bfe] text-white flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3b5bfe]">
                    Official Release
                  </span>
                  <span className="text-xs font-semibold text-[#1a2238]">
                    {liveScript.releaseTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 sm:line-clamp-1 mt-0.5">
                  {liveScript.releaseMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={onGetScript}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-xs transition-colors whitespace-nowrap min-h-[34px]"
              >
                {justCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onViewScript}
                className="liquid-glass-button inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-[#1a2238] hover:text-[#3b5bfe] whitespace-nowrap min-h-[34px]"
              >
                <span>View</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss release notification"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
