import { Check, Clock, ExternalLink, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ExecutorId } from '../types/script';
import { EXECUTOR_URLS, SCRIPT_COMING_SOON, formatVersionDisplay } from '../utils/scriptData';
import { SolaraLogo, XenoLogo } from './ExecutorLogos';

interface ScriptToastProps {
  feedback: {
    visible: boolean;
    executor: ExecutorId;
    version: string;
  } | null;
  onDismiss: () => void;
}

export function ScriptToast({ feedback, onDismiss }: ScriptToastProps) {
  const isVisible = Boolean(feedback && feedback.visible);
  const executor = feedback?.executor ?? 'solara';
  const versionLabel = formatVersionDisplay(feedback?.version ?? 'v1.4.3 [BETA]');

  const executorLabel = executor === 'solara' ? 'Solara' : 'Xeno';
  const executorUrl = executor === 'solara' ? EXECUTOR_URLS.solara : EXECUTOR_URLS.xeno;
  const secondaryLabel = executor === 'solara' ? 'Xeno' : 'Solara';
  const secondaryUrl = executor === 'solara' ? EXECUTOR_URLS.xeno : EXECUTOR_URLS.solara;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-20 right-4 left-4 sm:left-auto sm:w-[400px] z-50 liquid-glass-elevated rounded-2xl p-4 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`h-8 w-8 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5 ${
                SCRIPT_COMING_SOON ? 'bg-[#4d6bfe]' : 'bg-emerald-600'
              }`}
            >
              {SCRIPT_COMING_SOON ? (
                <Clock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-semibold text-[#1a2238]">
                {SCRIPT_COMING_SOON
                  ? `RGB ${versionLabel} — Coming Soon`
                  : `RGB ${versionLabel} Script Copied`}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {SCRIPT_COMING_SOON
                  ? `The public script release for ${executorLabel} is coming soon. Prepare your executor in the meantime:`
                  : `Official RGB script copied to your clipboard. Paste and execute it inside ${executorLabel}:`}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-0.5">
                <a
                  href={executorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3b5bfe] hover:underline"
                >
                  {executor === 'solara' ? (
                    <SolaraLogo className="h-3.5 w-3.5" />
                  ) : (
                    <XenoLogo className="h-3.5 w-3.5" />
                  )}
                  <span>Download {executorLabel}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <a
                  href={secondaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline"
                >
                  {executor === 'solara' ? (
                    <XenoLogo className="h-3.5 w-3.5" />
                  ) : (
                    <SolaraLogo className="h-3.5 w-3.5" />
                  )}
                  <span>Get {secondaryLabel}</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss script status notification"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-700 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
