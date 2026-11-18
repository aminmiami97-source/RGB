export type ExecutorId = 'solara' | 'xeno';

export type UpdateCategory = 'Added' | 'Improved' | 'Fixed' | 'Security';

export type AppView = 'home' | 'dashboard' | 'executors' | 'credits' | 'account';

export interface ScriptChangeItem {
  id: string;
  title: string;
  description: string;
  category: UpdateCategory;
  timestamp: string;
}

export interface ScriptRelease {
  version: string;
  codename: string;
  releasedAt: string;
  summary: string;
  isInitial?: boolean;
  changes: ScriptChangeItem[];
}

export interface ExecutorProfile {
  id: ExecutorId;
  name: string;
  tagline: string;
  compatibilityScore: string;
  frameOverhead: string;
  downloadUrl: string;
  recommendedFlags: string[];
  supportedApis: string[];
  notes: string;
}

export interface NewUpdateInput {
  version: string;
  codename: string;
  title: string;
  description: string;
  category: UpdateCategory;
}

export interface LiveScriptState {
  version: string;
  releaseTitle: string;
  releaseMessage: string;
  code: string;
  updatedAt: string;
  isFromCloud: boolean;
}

export interface OfficialScriptInput {
  version: string;
  releaseTitle: string;
  releaseMessage: string;
  code: string;
}

