import { Code2, Copy, Cpu } from 'lucide-react';
import { CREDITS_LINE, formatVersionDisplay } from '../utils/scriptData';

interface CreditsSectionProps {
  latestVersion: string;
  onGetScript: () => void;
}

const CONTRIBUTORS = [
  {
    name: 'RGB5.6 AGROX',
    role: 'AI Model · Architecture & Optimization',
    summary:
      'AI model used to co-design the RGB script architecture, Solara and Xeno compatibility, and release tooling.',
    icon: Cpu,
  },
  {
    name: 'Alex',
    role: 'Human Developer · Creator & Maintainer',
    summary:
      'Human developer behind RGB, leading script development, live release publishing, and executor verification starting from v1.0.0.',
    icon: Code2,
  },
];

export function CreditsSection({ latestVersion, onGetScript }: CreditsSectionProps) {
  const versionLabel = formatVersionDisplay(latestVersion);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-9 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-mono-tabular font-semibold text-[#3b5bfe]">
            RGB {versionLabel}
          </span>
          <span aria-hidden="true">·</span>
          <span>Transparency &amp; Project Attribution</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-emerald-700">Live Release</span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight text-[#1a2238] text-balance">
          {CREDITS_LINE}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Built transparently by the human developer Alex with AI-assisted engineering from the
          RGB5.6 Agrox model.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onGetScript}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[#4d6bfe] hover:bg-[#3a59f7] shadow-[0_6px_18px_rgba(77,107,254,0.28)] min-h-[44px] transition-colors"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            <span>Copy RGB {versionLabel} Script</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CONTRIBUTORS.map((member) => {
          const Icon = member.icon;
          return (
            <div key={member.name} className="liquid-glass liquid-glass-interactive rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#4d6bfe]/10 border border-[#4d6bfe]/20 flex items-center justify-center text-[#3b5bfe] shrink-0">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#1a2238]">
                    {member.name}
                  </h2>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{member.summary}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
