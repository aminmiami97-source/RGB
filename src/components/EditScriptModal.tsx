import { FileUp, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { LiveScriptState, OfficialScriptInput } from '../types/script';
import { SCRIPT_CONFIG_LIMITS, validateOfficialScriptInput } from '../utils/scriptData';

interface EditScriptModalProps {
  open: boolean;
  liveScript: LiveScriptState;
  onClose: () => void;
  onSubmit: (input: OfficialScriptInput) => Promise<void>;
}

export function EditScriptModal({
  open,
  liveScript,
  onClose,
  onSubmit,
}: EditScriptModalProps) {
  const [version, setVersion] = useState(liveScript.version);
  const [releaseTitle, setReleaseTitle] = useState(liveScript.releaseTitle);
  const [releaseMessage, setReleaseMessage] = useState(liveScript.releaseMessage);
  const [code, setCode] = useState(liveScript.code);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setVersion(liveScript.version);
      setReleaseTitle(liveScript.releaseTitle);
      setReleaseMessage(liveScript.releaseMessage);
      setCode(liveScript.code);
      setErrorMessage(null);
      setSubmitting(false);
    }
  }, [open, liveScript]);

  if (!open) {
    return null;
  }

  const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      if (text.length > SCRIPT_CONFIG_LIMITS.CODE_MAX) {
        setErrorMessage(
          `Loaded file exceeds ${SCRIPT_CONFIG_LIMITS.CODE_MAX.toLocaleString()} characters.`
        );
        return;
      }
      setCode(text);
      setErrorMessage(null);
    } catch {
      setErrorMessage('Could not read the selected script file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: OfficialScriptInput = {
      version,
      releaseTitle,
      releaseMessage,
      code,
    };

    const check = validateOfficialScriptInput(payload);
    if (!check.valid) {
      setErrorMessage(check.error ?? 'Please verify all fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to save script update right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-script-title"
        className="liquid-glass-elevated w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 id="edit-script-title" className="font-display text-xl font-semibold text-[#1a2238]">
              Update Official RGB Script
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes published here sync immediately in real time for all visitors.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close script editor"
            className="rounded-full p-2 text-slate-500 hover:text-slate-900 hover:bg-white/70 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col flex-1 min-h-0 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            <div>
              <label htmlFor="script-version-input" className="block text-xs font-medium text-slate-700 mb-1">
                Script Version
              </label>
              <input
                id="script-version-input"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                maxLength={SCRIPT_CONFIG_LIMITS.VERSION_MAX}
                placeholder="v1.4.4 [BETA]"
                className="w-full rounded-xl bg-white/85 border border-white px-3 py-2 text-sm font-mono-tabular text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="script-release-title" className="block text-xs font-medium text-slate-700 mb-1">
                Release Notification Title
              </label>
              <input
                id="script-release-title"
                type="text"
                value={releaseTitle}
                onChange={(e) => setReleaseTitle(e.target.value)}
                maxLength={SCRIPT_CONFIG_LIMITS.RELEASE_TITLE_MAX}
                placeholder="RGB SCRIPTS v1.4.4 Released!"
                className="w-full rounded-xl bg-white/85 border border-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
              />
            </div>
          </div>

          <div className="shrink-0">
            <label htmlFor="script-release-message" className="block text-xs font-medium text-slate-700 mb-1">
              Release Announcement Summary
            </label>
            <input
              id="script-release-message"
              type="text"
              value={releaseMessage}
              onChange={(e) => setReleaseMessage(e.target.value)}
              maxLength={SCRIPT_CONFIG_LIMITS.RELEASE_MESSAGE_MAX}
              placeholder="Describe what is new in this release..."
              className="w-full rounded-xl bg-white/85 border border-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
            />
          </div>

          <div className="flex flex-col flex-1 min-h-[200px]">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label htmlFor="script-code-editor" className="text-xs font-medium text-slate-700">
                Lua Script Code ({code.length.toLocaleString()} chars)
              </label>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".lua,.txt"
                  onChange={(e) => void handleLoadFile(e)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#3b5bfe] bg-[#e8f0fe] hover:bg-[#dce7fe] transition-colors"
                >
                  <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Load .lua / .txt</span>
                </button>
              </div>
            </div>

            <textarea
              id="script-code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={SCRIPT_CONFIG_LIMITS.CODE_MAX}
              spellCheck={false}
              className="flex-1 min-h-[220px] w-full rounded-2xl bg-slate-950 text-slate-100 p-3.5 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe] resize-y"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-xs font-medium text-red-600 shrink-0">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="liquid-glass-button rounded-full px-4 py-2 text-sm font-medium text-slate-700 min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] disabled:opacity-60 shadow-[0_6px_18px_rgba(77,107,254,0.28)] min-h-[40px]"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{submitting ? 'Publishing Live...' : 'Publish Live Script'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
