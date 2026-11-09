import React from 'react';
import { ExternalLink, Copy, Check, AlertCircle, RefreshCw, ShieldAlert, Zap, HelpCircle } from 'lucide-react';
import { TabItem } from '../types';

interface TabGridProps {
  tabs: TabItem[];
  targetUrl: string;
  onOpenSingleTab: (id: number) => void;
  onOpenNextBlockedTab: () => void;
  onRetryBlockedTabs: () => void;
  onCopyAllUrls: () => void;
  onOpenGuide: () => void;
  copied: boolean;
}

export const TabGrid: React.FC<TabGridProps> = ({
  tabs,
  targetUrl,
  onOpenSingleTab,
  onOpenNextBlockedTab,
  onRetryBlockedTabs,
  onCopyAllUrls,
  onOpenGuide,
  copied,
}) => {
  const blockedTabs = tabs.filter((t) => t.status === 'blocked');
  const openedTabs = tabs.filter((t) => t.status === 'opened');
  const blockedCount = blockedTabs.length;

  return (
    <div id="roster-section" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <span>Visual Tab Roster</span>
            <span className="font-mono text-xs text-sky-400 font-normal">
              ({tabs.length} Tabs Allocated)
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time status of each individual tab. Opened: <strong className="text-emerald-400 font-mono">{openedTabs.length}</strong> · Blocked: <strong className="text-amber-400 font-mono">{blockedCount}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {blockedCount > 0 && (
            <button
              type="button"
              onClick={onRetryBlockedTabs}
              disabled={!targetUrl}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors whitespace-nowrap shrink-0"
              title="Attempt to open all blocked tabs again"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry {blockedCount} Blocked</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCopyAllUrls}
            disabled={!targetUrl}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            title="Copies all URLs to paste into Chrome extensions or bookmarks"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied {tabs.length} Links!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy {tabs.length} URLs</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Blocked Alert & Quick Unblock Bar */}
      {blockedCount > 0 && (
        <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400 shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <span>Chrome blocked {blockedCount} tabs from opening automatically</span>
                </h4>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Look at the top-right of your Chrome address bar for the <span className="font-mono bg-neutral-900 px-1 py-0.5 rounded border border-neutral-700 text-white">🚫</span> icon → click it and select <strong>&quot;Always allow pop-ups and redirects&quot;</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={onOpenNextBlockedTab}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-neutral-950 transition-colors shadow-sm"
                title="Open next blocked tab with a native click gesture (or press Spacebar)"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Open Next (Spacebar)</span>
              </button>

              <button
                type="button"
                onClick={onOpenGuide}
                className="cursor-pointer inline-flex items-center gap-1 text-xs text-amber-300 hover:text-white underline font-medium p-1.5"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
        {tabs.map((tab) => {
          const isOpened = tab.status === 'opened';
          const isBlocked = tab.status === 'blocked';
          const isOpening = tab.status === 'opening';

          return (
            <div
              key={tab.id}
              className={`relative flex flex-col justify-between rounded-lg border p-3 transition-all ${
                isOpened
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                  : isBlocked
                  ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                  : isOpening
                  ? 'border-sky-500/50 bg-sky-950/20 text-sky-200 animate-pulse'
                  : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tabular-nums text-neutral-300">
                  #{tab.id < 10 ? `0${tab.id}` : tab.id}
                </span>

                {isOpened && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-400 font-medium">
                    <Check className="h-3 w-3" /> Opened
                  </span>
                )}
                {isBlocked && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-amber-400 font-medium">
                    <AlertCircle className="h-3 w-3" /> Blocked
                  </span>
                )}
                {isOpening && (
                  <span className="text-[11px] text-sky-400 font-medium">
                    Launching...
                  </span>
                )}
                {!isOpened && !isBlocked && !isOpening && (
                  <span className="text-[11px] text-neutral-500">
                    Ready
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[11px]">
                <button
                  type="button"
                  onClick={() => onOpenSingleTab(tab.id)}
                  disabled={!targetUrl}
                  className={`cursor-pointer inline-flex items-center gap-1 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    isBlocked
                      ? 'text-amber-400 hover:text-amber-300 hover:underline'
                      : 'text-sky-400 hover:text-sky-300 hover:underline'
                  }`}
                  title={`Directly open Tab #${tab.id} in Chrome`}
                >
                  <span>{isBlocked ? 'Retry Tab' : 'Open'}</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>

                {tab.openedAt && (
                  <span className="text-neutral-500 font-mono text-[10px]">
                    {new Date(tab.openedAt).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
