import React, { useState } from 'react';
import { Download, Terminal, History, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import { LaunchHistoryItem } from '../types';
import { generateChromeCommand, generateStandaloneOpenerHtml, downloadFile } from '../utils/tabOpener';

interface AdvancedToolsProps {
  targetUrl: string;
  tabCount: number;
  staggerMs?: number;
  history: LaunchHistoryItem[];
  onSelectHistory: (item: LaunchHistoryItem) => void;
  onClearHistory: () => void;
}

export const AdvancedTools: React.FC<AdvancedToolsProps> = ({
  targetUrl,
  tabCount,
  staggerMs = 5000,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  const [os, setOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [copiedCli, setCopiedCli] = useState(false);

  const cliCommand = targetUrl ? generateChromeCommand(targetUrl, tabCount, os) : '';

  const handleCopyCli = async () => {
    if (!cliCommand) return;
    await navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!targetUrl) return;
    const html = generateStandaloneOpenerHtml(targetUrl, tabCount, staggerMs);
    downloadFile(`twitter_opener_${tabCount}_tabs.html`, html, 'text/html');
  };

  const handleLaunchBlob = () => {
    if (!targetUrl) return;
    const html = generateStandaloneOpenerHtml(targetUrl, tabCount, staggerMs);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Offline Standalone Launcher Section */}
      <div id="standalone-section" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-sky-400" />
              <span>Offline HTML Multi-Tab Launcher</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Generate a standalone HTML launcher file. Open it directly in Chrome to launch {tabCount} tabs without any iframe sandbox restrictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchBlob}
              disabled={!targetUrl}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open Launcher in New Tab</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              disabled={!targetUrl}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .HTML File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Terminal / CLI Section */}
      <div id="cli-section" className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-sky-400" />
              <span>Google Chrome Terminal Command</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Launch all {tabCount} tabs directly through your operating system terminal without any browser pop-up blocker.
            </p>
          </div>

          {/* OS Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-neutral-950 p-1 border border-neutral-800">
            {(['windows', 'mac', 'linux'] as const).map((system) => (
              <button
                key={system}
                type="button"
                onClick={() => setOs(system)}
                className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  os === system
                    ? 'bg-neutral-800 text-sky-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {system === 'windows' ? 'Windows CMD' : system === 'mac' ? 'macOS' : 'Linux'}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-lg border border-neutral-800 bg-neutral-950 p-3.5 font-mono text-xs text-neutral-300">
          <div className="overflow-x-auto whitespace-pre-wrap break-all pr-20 text-neutral-200">
            {targetUrl ? cliCommand : '# Paste a Twitter post link above to generate Chrome terminal command'}
          </div>

          <button
            type="button"
            onClick={handleCopyCli}
            disabled={!targetUrl}
            className="cursor-pointer absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copiedCli ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Launch History */}
      {history.length > 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              <History className="h-4 w-4 text-sky-400" />
              <span>Recent Post Launches</span>
            </h3>

            <button
              type="button"
              onClick={onClearHistory}
              className="cursor-pointer text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="divide-y divide-neutral-800/80">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-neutral-200">@{item.username}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="font-mono text-neutral-400 tabular-nums">Status #{item.statusId}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-sky-400 font-mono tabular-nums">{item.tabCount} Tabs</span>
                  </div>
                  <p className="truncate text-xs text-neutral-500 font-mono mt-0.5">
                    {item.cleanedUrl}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectHistory(item)}
                  className="cursor-pointer shrink-0 rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  Load Post
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
