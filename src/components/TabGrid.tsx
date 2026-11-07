import React from 'react';
import { ExternalLink, Copy, Check, AlertCircle } from 'lucide-react';
import { TabItem } from '../types';

interface TabGridProps {
  tabs: TabItem[];
  targetUrl: string;
  onOpenSingleTab: (id: number) => void;
  onCopyAllUrls: () => void;
  copied: boolean;
}

export const TabGrid: React.FC<TabGridProps> = ({
  tabs,
  targetUrl,
  onOpenSingleTab,
  onCopyAllUrls,
  copied,
}) => {
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
            Real-time status of each individual tab. If Chrome blocked any tab, you can click it individually here.
          </p>
        </div>

        <button
          type="button"
          onClick={onCopyAllUrls}
          disabled={!targetUrl}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          title="Copies 30 copies of the URL to paste into Chrome extensions or bookmarks"
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

      {/* Grid of up to 30 tabs */}
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
                  className="cursor-pointer inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                  title={`Directly open Tab #${tab.id} in Chrome`}
                >
                  <span>Open</span>
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
