import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { UrlInputSection } from './components/UrlInputSection';
import { TabCountSlider } from './components/TabCountSlider';
import { LaunchController } from './components/LaunchController';
import { TabGrid } from './components/TabGrid';
import { PopupGuideModal } from './components/PopupGuideModal';
import { AdvancedTools } from './components/AdvancedTools';
import { parseTwitterUrl } from './utils/twitter';
import { openSingleTab, testPopupPermission } from './utils/tabOpener';
import { TabItem, LaunchStats, LaunchHistoryItem } from './types';

const STORAGE_KEY_HISTORY = 'tablaunch_x_history_v1';

export default function App() {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [tabCount, setTabCount] = useState<number>(30); // Default to 30 as requested!
  const [stripTrackingParams, setStripTrackingParams] = useState<boolean>(true);
  const [staggerMs, setStaggerMs] = useState<number>(5000); // 5-second delay between tab openings
  const [countdownMs, setCountdownMs] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('launcher');

  const [popupStatus, setPopupStatus] = useState<'unknown' | 'testing' | 'allowed' | 'blocked'>('unknown');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [showBlockedBanner, setShowBlockedBanner] = useState<boolean>(false);
  const [copiedUrls, setCopiedUrls] = useState<boolean>(false);

  // Tabs array tracking individual state
  const [tabs, setTabs] = useState<TabItem[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      label: `Tab #${i + 1}`,
      status: 'idle',
    }))
  );

  const [stats, setStats] = useState<LaunchStats>({
    total: 30,
    opened: 0,
    blocked: 0,
    isLaunching: false,
    progressPercent: 0,
  });

  const [history, setHistory] = useState<LaunchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const cancelRef = useRef<boolean>(false);
  const skipWaitRef = useRef<boolean>(false);

  // Parse Twitter / X Post URL
  const parsedInfo = React.useMemo(() => parseTwitterUrl(inputUrl), [inputUrl]);
  const effectiveUrl = stripTrackingParams && parsedInfo.isValid ? parsedInfo.cleanedUrl : inputUrl.trim();

  // Keep tabs array synchronized with tabCount
  useEffect(() => {
    setTabs((prev) => {
      const newTabs: TabItem[] = [];
      for (let i = 1; i <= tabCount; i++) {
        const existing = prev.find((t) => t.id === i);
        newTabs.push(
          existing || {
            id: i,
            label: `Tab #${i}`,
            status: 'idle',
          }
        );
      }
      return newTabs;
    });

    setStats((prev) => ({
      ...prev,
      total: tabCount,
      progressPercent: prev.isLaunching ? prev.progressPercent : 0,
    }));
  }, [tabCount]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 10)));
    } catch {
      // Storage unavailable or full
    }
  }, [history]);

  // Test popups permission on demand
  const handleTestPopups = async () => {
    setPopupStatus('testing');
    const allowed = await testPopupPermission();
    setPopupStatus(allowed ? 'allowed' : 'blocked');
    if (!allowed) {
      setShowBlockedBanner(true);
      setIsGuideModalOpen(true);
    }
  };

  const handleSkipWait = () => {
    skipWaitRef.current = true;
  };

  // Launch All Tabs Action with 5s delay support
  const handleStartLaunch = async () => {
    if (!parsedInfo.isValid || !effectiveUrl) return;

    cancelRef.current = false;
    skipWaitRef.current = false;
    setShowBlockedBanner(false);
    setCountdownMs(0);

    // Reset tabs status
    setTabs((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'idle',
        openedAt: undefined,
      }))
    );

    setStats({
      total: tabCount,
      opened: 0,
      blocked: 0,
      isLaunching: true,
      progressPercent: 0,
    });

    let openedCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < tabCount; i++) {
      if (cancelRef.current) break;

      const tabId = i + 1;

      // If this is not the first tab and delay > 0, wait with countdown timer
      if (i > 0 && staggerMs > 0) {
        let remaining = staggerMs;
        while (remaining > 0 && !cancelRef.current && !skipWaitRef.current) {
          setCountdownMs(remaining);
          const chunk = Math.min(50, remaining);
          await new Promise((res) => setTimeout(res, chunk));
          remaining -= chunk;
        }
        setCountdownMs(0);
        skipWaitRef.current = false;

        if (cancelRef.current) break;
      }

      // Mark tab as opening
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, status: 'opening' } : t))
      );

      // Attempt window.open
      const result = openSingleTab(effectiveUrl);

      if (result.success) {
        openedCount++;
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId ? { ...t, status: 'opened', openedAt: Date.now() } : t
          )
        );
      } else {
        blockedCount++;
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId ? { ...t, status: 'blocked' } : t
          )
        );
      }

      const percent = Math.round(((i + 1) / tabCount) * 100);
      setStats({
        total: tabCount,
        opened: openedCount,
        blocked: blockedCount,
        isLaunching: true,
        progressPercent: percent,
      });
    }

    setCountdownMs(0);
    setStats((prev) => ({
      ...prev,
      isLaunching: false,
    }));

    if (blockedCount > 0) {
      setShowBlockedBanner(true);
      setPopupStatus('blocked');
    } else {
      setPopupStatus('allowed');
    }

    // Add to history
    if (parsedInfo.isValid && parsedInfo.username && parsedInfo.statusId) {
      const newItem: LaunchHistoryItem = {
        id: `${Date.now()}_${parsedInfo.statusId}`,
        url: inputUrl,
        cleanedUrl: parsedInfo.cleanedUrl,
        username: parsedInfo.username,
        statusId: parsedInfo.statusId,
        tabCount,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev.filter((h) => h.statusId !== parsedInfo.statusId)].slice(0, 10));
    }
  };

  const handleCancelLaunch = () => {
    cancelRef.current = true;
    setCountdownMs(0);
    setStats((prev) => ({ ...prev, isLaunching: false }));
  };

  const handleOpenSingleTab = (tabId: number) => {
    if (!effectiveUrl) return;
    const res = openSingleTab(effectiveUrl);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              status: res.success ? 'opened' : 'blocked',
              openedAt: res.success ? Date.now() : undefined,
            }
          : t
      )
    );
    if (!res.success) {
      setShowBlockedBanner(true);
    }
  };

  const handleOpenNextBlockedTab = () => {
    if (!effectiveUrl) return;
    const nextBlocked = tabs.find((t) => t.status === 'blocked');
    if (nextBlocked) {
      handleOpenSingleTab(nextBlocked.id);
    }
  };

  const handleRetryBlockedTabs = async () => {
    if (!effectiveUrl) return;
    const blocked = tabs.filter((t) => t.status === 'blocked');
    for (const tab of blocked) {
      handleOpenSingleTab(tab.id);
      await new Promise((r) => setTimeout(r, 60));
    }
  };

  // Keyboard shortcut: Spacebar opens next blocked tab without scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        const hasBlocked = tabs.some((t) => t.status === 'blocked');
        if (hasBlocked) {
          e.preventDefault();
          handleOpenNextBlockedTab();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, effectiveUrl]);

  const handleCopyAllUrls = async () => {
    if (!effectiveUrl) return;
    const urls = Array(tabCount).fill(effectiveUrl).join('\n');
    await navigator.clipboard.writeText(urls);
    setCopiedUrls(true);
    setTimeout(() => setCopiedUrls(false), 2000);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
  };

  const handleSelectHistory = (item: LaunchHistoryItem) => {
    setInputUrl(item.cleanedUrl);
    setTabCount(item.tabCount);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {
      // Ignore
    }
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'guide') {
      setIsGuideModalOpen(true);
      return;
    }
    const el = document.getElementById(`${sectionId}-section`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Bar */}
      <Header
        onTestPopups={handleTestPopups}
        popupStatus={popupStatus}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Lead */}
        <section className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Twitter Post Multi-Tab Opener
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Paste one X / Twitter post URL, select up to 30 simultaneous Chrome tabs, and click Start. Clean URL sanitization removes tracking parameters automatically.
          </p>
        </section>

        {/* Section 1: URL Input */}
        <section id="launcher-section" className="space-y-6">
          <UrlInputSection
            inputUrl={inputUrl}
            onUrlChange={setInputUrl}
            parsedInfo={parsedInfo}
            onSelectSample={handleSelectSample}
            stripTrackingParams={stripTrackingParams}
            onToggleStripTracking={() => setStripTrackingParams((v) => !v)}
          />

          {/* Section 2: Tab Count Selector (Limit 30) */}
          <TabCountSlider
            count={tabCount}
            onChange={setTabCount}
            maxLimit={30}
          />

          {/* Section 3: Start Launch Controller */}
          <LaunchController
            onStartLaunch={handleStartLaunch}
            onCancelLaunch={handleCancelLaunch}
            onSkipWait={handleSkipWait}
            countdownMs={countdownMs}
            stats={stats}
            targetCount={tabCount}
            disabled={!parsedInfo.isValid || stats.isLaunching}
            staggerMs={staggerMs}
            onChangeStagger={setStaggerMs}
            showBlockedBanner={showBlockedBanner}
            onOpenPopupGuide={() => setIsGuideModalOpen(true)}
          />
        </section>

        {/* Section 4: Visual Tab Roster Grid (1 to 30) */}
        <section id="roster-section">
          <TabGrid
            tabs={tabs}
            targetUrl={effectiveUrl}
            onOpenSingleTab={handleOpenSingleTab}
            onOpenNextBlockedTab={handleOpenNextBlockedTab}
            onRetryBlockedTabs={handleRetryBlockedTabs}
            onCopyAllUrls={handleCopyAllUrls}
            onOpenGuide={() => setIsGuideModalOpen(true)}
            copied={copiedUrls}
          />
        </section>

        {/* Section 5: Offline Launcher, CLI Commands & History */}
        <section id="tools-section">
          <AdvancedTools
            targetUrl={effectiveUrl}
            tabCount={tabCount}
            staggerMs={staggerMs}
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-neutral-900 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">TabLaunch X</span>
            <span>·</span>
            <span>Single Twitter Post Multi-Tab Opener</span>
            <span>·</span>
            <span className="font-mono tabular-nums">Max Limit: 30 Tabs</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Pop-up Help
            </button>
            <a
              href="https://support.google.com/chrome/answer/95472"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Chrome Pop-up Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Chrome Pop-up Guide Modal */}
      <PopupGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onStatusUpdated={(allowed) => setPopupStatus(allowed ? 'allowed' : 'blocked')}
      />
    </div>
  );
}
