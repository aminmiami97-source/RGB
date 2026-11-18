import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { NewUpdateInput, UpdateCategory } from '../types/script';
import {
  SCRIPT_UPDATE_LIMITS,
  suggestNextVersion,
  validateNewUpdate,
} from '../utils/scriptData';

interface LogUpdateModalProps {
  open: boolean;
  latestVersion: string;
  hasExistingReleases: boolean;
  onClose: () => void;
  onSubmit: (input: NewUpdateInput) => Promise<void>;
}

export function LogUpdateModal({
  open,
  latestVersion,
  hasExistingReleases,
  onClose,
  onSubmit,
}: LogUpdateModalProps) {
  const [version, setVersion] = useState(() =>
    suggestNextVersion(latestVersion, hasExistingReleases)
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<UpdateCategory>('Added');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setVersion(suggestNextVersion(latestVersion, hasExistingReleases));
      setTitle('');
      setDescription('');
      setCategory(hasExistingReleases ? 'Improved' : 'Added');
      setErrorMessage(null);
      setSubmitting(false);
    }
  }, [open, latestVersion, hasExistingReleases]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: NewUpdateInput = {
      version,
      codename: version.trim() === '1.0.0' ? 'Initial Release' : 'Script Patch',
      title,
      description,
      category,
    };
    const check = validateNewUpdate(payload);
    if (!check.valid) {
      setErrorMessage(check.error ?? 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to publish update right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm p-4"
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
        aria-labelledby="log-update-title"
        className="liquid-glass-elevated w-full max-w-lg rounded-3xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="log-update-title" className="font-display text-xl font-semibold text-[#1a2238]">
              Log RGB Script Update
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publishes a new RGB script change to the live updates feed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close publish update dialog"
            className="rounded-full p-2 text-slate-500 hover:text-slate-900 hover:bg-white/70 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="update-version" className="block text-xs font-medium text-slate-700 mb-1">
                Version
              </label>
              <input
                id="update-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                maxLength={SCRIPT_UPDATE_LIMITS.VERSION_MAX}
                placeholder="1.0.0"
                className="w-full rounded-xl bg-white/80 border border-white px-3 py-2 text-sm font-mono-tabular text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
              />
            </div>

            <div>
              <label htmlFor="update-category" className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                id="update-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as UpdateCategory)}
                className="w-full rounded-xl bg-white/80 border border-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
              >
                <option value="Added">Added</option>
                <option value="Improved">Improved</option>
                <option value="Fixed">Fixed</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="update-title" className="block text-xs font-medium text-slate-700 mb-1">
              Update Title
            </label>
            <input
              id="update-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={SCRIPT_UPDATE_LIMITS.TITLE_MAX}
              placeholder="Initial RGB Script Core"
              className="w-full rounded-xl bg-white/80 border border-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
            />
          </div>

          <div>
            <label htmlFor="update-description" className="block text-xs font-medium text-slate-700 mb-1">
              Change Details
            </label>
            <textarea
              id="update-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={SCRIPT_UPDATE_LIMITS.DESCRIPTION_MAX}
              placeholder="Describe what changed in the RGB script..."
              className="w-full rounded-xl bg-white/80 border border-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d6bfe]"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-xs font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
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
              className="rounded-full px-5 py-2 text-sm font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] disabled:opacity-60 shadow-[0_6px_18px_rgba(77,107,254,0.28)] min-h-[40px]"
            >
              {submitting ? 'Publishing...' : 'Publish Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
