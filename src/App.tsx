import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { AccountView } from './components/AccountView';
import { CreditsSection } from './components/CreditsSection';
import { DashboardView } from './components/DashboardView';
import { EditScriptModal } from './components/EditScriptModal';
import { ExecutorsView } from './components/ExecutorsView';
import { LogUpdateModal } from './components/LogUpdateModal';
import { Navbar } from './components/Navbar';
import { ReleaseBanner } from './components/ReleaseBanner';
import { ScriptChatbotDrawer } from './components/ScriptChatbotDrawer';
import { ScriptToast } from './components/ScriptToast';
import { StartingPage } from './components/StartingPage';
import { useAuthProfile } from './hooks/useAuthProfile';
import { useScriptStore } from './hooks/useScriptStore';
import type { AppView, ExecutorId } from './types/script';
import { CREDITS_LINE, canUserPublishUpdates, formatVersionDisplay } from './utils/scriptData';

function getInitialView(): AppView {
  if (typeof window === 'undefined') {
    return 'home';
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('autostart') === '1') {
    return 'dashboard';
  }
  const viewParam = params.get('view');
  if (
    viewParam === 'dashboard' ||
    viewParam === 'executors' ||
    viewParam === 'credits' ||
    viewParam === 'account'
  ) {
    return viewParam;
  }
  return 'home';
}

export default function App() {
  const {
    releases,
    updatesLoading,
    liveScript,
    latestVersion,
    activeExecutor,
    setActiveExecutor,
    liveSyncEnabled,
    setLiveSyncEnabled,
    lastSyncedAt,
    publishUpdate,
    deleteUpdate,
    updateOfficialScript,
    refreshNow,
    copyScriptToPC,
    downloadScriptToPC,
    copyFeedback,
    dismissCopyFeedback,
    releaseNoticeVisible,
    dismissReleaseNotice,
  } = useScriptStore();

  const {
    user,
    authReady,
    profile,
    authBusy,
    authError,
    signInWithGoogle,
    signOutAccount,
    updatePreferredExecutor,
  } = useAuthProfile(activeExecutor, setActiveExecutor);

  const [activeView, setActiveView] = useState<AppView>(getInitialView);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [editScriptModalOpen, setEditScriptModalOpen] = useState(false);

  const justCopied = Boolean(copyFeedback?.visible);
  const canPublishUpdates = canUserPublishUpdates(user);
  const versionLabel = formatVersionDisplay(latestVersion);

  const handleNavigate = useCallback((view: AppView, initialSearch?: string) => {
    if (typeof initialSearch === 'string') {
      setDashboardSearch(initialSearch);
    } else if (view !== 'dashboard') {
      setDashboardSearch('');
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopyForExecutor = useCallback(
    (executor: ExecutorId) => {
      void copyScriptToPC(executor);
    },
    [copyScriptToPC]
  );

  const handleExecutorChange = useCallback(
    (executor: ExecutorId) => {
      void updatePreferredExecutor(executor);
    },
    [updatePreferredExecutor]
  );

  const handleOpenLogModal = useCallback(() => {
    if (canPublishUpdates) {
      setLogModalOpen(true);
    }
  }, [canPublishUpdates]);

  const handleOpenEditScriptModal = useCallback(() => {
    if (canPublishUpdates) {
      setEditScriptModalOpen(true);
    }
  }, [canPublishUpdates]);

  useEffect(() => {
    if (!canPublishUpdates && logModalOpen) {
      setLogModalOpen(false);
    }
    if (!canPublishUpdates && editScriptModalOpen) {
      setEditScriptModalOpen(false);
    }
  }, [canPublishUpdates, logModalOpen, editScriptModalOpen]);

  useEffect(() => {
    document.title = `RGB ${versionLabel} — Script Hub & Real-Time Updates`;
  }, [versionLabel]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-rgb-canvas relative overflow-x-clip">
        {/* Ambient drifting refractive orbs for Liquid Glass depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="rgb-ambient-orb-a absolute -top-28 left-[12%] h-[420px] w-[420px] rounded-full bg-radial from-[#9cb8ff]/35 via-[#b8ceff]/15 to-transparent blur-3xl" />
          <div className="rgb-ambient-orb-b absolute top-[28%] right-[8%] h-[380px] w-[380px] rounded-full bg-radial from-[#a5b4fc]/30 via-[#bae6fd]/15 to-transparent blur-3xl" />
        </div>

        {/* Subtle architectural grid overlay */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-rgb-grid" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar
            activeView={activeView}
            onNavigate={(view) => handleNavigate(view)}
            onGetScript={() => void copyScriptToPC()}
            justCopied={justCopied}
            isSignedIn={Boolean(user)}
          />

          <ReleaseBanner
            visible={releaseNoticeVisible}
            liveScript={liveScript}
            justCopied={justCopied}
            onGetScript={() => void copyScriptToPC()}
            onViewScript={() => handleNavigate('dashboard')}
            onDismiss={dismissReleaseNotice}
          />

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeView === 'home' && (
                  <StartingPage
                    latestVersion={latestVersion}
                    releases={releases}
                    activeExecutor={activeExecutor}
                    onSelectExecutor={handleExecutorChange}
                    onGetScript={() => void copyScriptToPC()}
                    onNavigate={handleNavigate}
                    justCopied={justCopied}
                  />
                )}

                {activeView === 'dashboard' && (
                  <DashboardView
                    releases={releases}
                    updatesLoading={updatesLoading}
                    liveScript={liveScript}
                    latestVersion={latestVersion}
                    activeExecutor={activeExecutor}
                    onSelectExecutor={handleExecutorChange}
                    liveSyncEnabled={liveSyncEnabled}
                    onToggleLiveSync={() => setLiveSyncEnabled((prev) => !prev)}
                    lastSyncedAt={lastSyncedAt}
                    onRefreshNow={() => void refreshNow()}
                    canPublishUpdates={canPublishUpdates}
                    onOpenLogModal={handleOpenLogModal}
                    onOpenEditScriptModal={handleOpenEditScriptModal}
                    onDeleteUpdate={
                      canPublishUpdates ? (id) => void deleteUpdate(id, user) : undefined
                    }
                    onGetScript={() => void copyScriptToPC()}
                    onDownloadScript={downloadScriptToPC}
                    justCopied={justCopied}
                    initialSearch={dashboardSearch}
                  />
                )}

                {activeView === 'executors' && (
                  <ExecutorsView
                    latestVersion={latestVersion}
                    activeExecutor={activeExecutor}
                    onSelectExecutor={handleExecutorChange}
                    onCopyForExecutor={handleCopyForExecutor}
                    justCopied={justCopied}
                  />
                )}

                {activeView === 'credits' && (
                  <CreditsSection
                    latestVersion={latestVersion}
                    onGetScript={() => void copyScriptToPC()}
                  />
                )}

                {activeView === 'account' && (
                  <AccountView
                    user={user}
                    authReady={authReady}
                    profile={profile}
                    authBusy={authBusy}
                    authError={authError}
                    activeExecutor={activeExecutor}
                    onSignInWithGoogle={() => void signInWithGoogle()}
                    onSignOut={() => void signOutAccount()}
                    onUpdatePreferredExecutor={(exec) => void updatePreferredExecutor(exec)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {activeView !== 'home' && (
            <footer className="border-t border-white/70 bg-white/35 backdrop-blur-md mt-8">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <p className="font-medium text-slate-700">{CREDITS_LINE}</p>
                <div className="flex items-center gap-4">
                  <span className="font-mono-tabular">RGB {versionLabel} · Live</span>
                  <span aria-hidden="true">·</span>
                  <span>Solara &amp; Xeno</span>
                </div>
              </div>
            </footer>
          )}
        </div>

        <LogUpdateModal
          open={logModalOpen && canPublishUpdates}
          latestVersion={latestVersion}
          hasExistingReleases={releases.length > 0}
          onClose={() => setLogModalOpen(false)}
          onSubmit={(input) => publishUpdate(input, user)}
        />

        <EditScriptModal
          open={editScriptModalOpen && canPublishUpdates}
          liveScript={liveScript}
          onClose={() => setEditScriptModalOpen(false)}
          onSubmit={(input) => updateOfficialScript(input, user)}
        />

        <ScriptToast
          feedback={copyFeedback}
          onDismiss={dismissCopyFeedback}
        />

        <ScriptChatbotDrawer
          releases={releases}
          latestVersion={latestVersion}
        />
      </div>
    </MotionConfig>
  );
}
