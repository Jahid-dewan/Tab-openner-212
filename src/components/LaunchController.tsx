import React, { useState } from 'react';
import { Rocket, Pause, AlertTriangle, CheckCircle2, ShieldAlert, FastForward, Clock } from 'lucide-react';
import { LaunchStats } from '../types';

interface LaunchControllerProps {
  onStartLaunch: () => void;
  onCancelLaunch: () => void;
  onSkipWait: () => void;
  countdownMs: number;
  stats: LaunchStats;
  targetCount: number;
  disabled: boolean;
  staggerMs: number;
  onChangeStagger: (ms: number) => void;
  showBlockedBanner: boolean;
  onOpenPopupGuide: () => void;
}

export const LaunchController: React.FC<LaunchControllerProps> = ({
  onStartLaunch,
  onCancelLaunch,
  onSkipWait,
  countdownMs,
  stats,
  targetCount,
  disabled,
  staggerMs,
  onChangeStagger,
  showBlockedBanner,
  onOpenPopupGuide,
}) => {
  const [customSeconds, setCustomSeconds] = useState<string>('5');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const SPEED_MODES = [
    { label: '5s Delay (Default)', value: 5000, desc: '5 seconds between each tab' },
    { label: '3s Delay', value: 3000, desc: '3 seconds between each tab' },
    { label: '1s Delay', value: 1000, desc: '1 second between each tab' },
    { label: 'Instant (0s)', value: 0, desc: 'Simultaneous blast' },
  ];

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomSeconds(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onChangeStagger(Math.round(num * 1000));
    }
  };

  const currentTabOpening = stats.opened + stats.blocked + (stats.isLaunching ? 1 : 0);
  const remainingSeconds = (countdownMs / 1000).toFixed(1);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Speed / Stagger control */}
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Delay Between Tabs
            </span>
            <span className="text-xs text-sky-400 font-mono">
              ({staggerMs === 0 ? 'Instant' : `${(staggerMs / 1000).toFixed(1)}s delay`})
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {SPEED_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => {
                  setIsCustomMode(false);
                  onChangeStagger(mode.value);
                }}
                disabled={stats.isLaunching}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  !isCustomMode && staggerMs === mode.value
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm font-semibold'
                    : 'bg-neutral-950/70 text-neutral-400 border border-neutral-800 hover:text-white'
                } disabled:opacity-50`}
                title={mode.desc}
              >
                {mode.label}
              </button>
            ))}

            {/* Custom Delay Option */}
            <div className="flex items-center gap-1.5 bg-neutral-950/70 border border-neutral-800 rounded-lg px-2.5 py-1">
              <span className="text-xs text-neutral-400">Custom:</span>
              <input
                type="number"
                min="0"
                max="60"
                step="0.5"
                value={customSeconds}
                onChange={(e) => {
                  setIsCustomMode(true);
                  handleCustomChange(e);
                }}
                disabled={stats.isLaunching}
                className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-center text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
              <span className="text-xs text-neutral-400">sec</span>
            </div>
          </div>
        </div>

        {/* Start / Cancel Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {stats.isLaunching ? (
            <div className="flex items-center gap-2">
              {countdownMs > 0 && (
                <button
                  type="button"
                  onClick={onSkipWait}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 px-3.5 py-2.5 text-xs font-semibold text-sky-300 transition-colors"
                  title="Immediately open the next tab without waiting"
                >
                  <FastForward className="h-3.5 w-3.5" />
                  <span>Skip Wait</span>
                </button>
              )}

              <button
                type="button"
                onClick={onCancelLaunch}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-red-600/90 hover:bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all active:scale-95"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Stop ({stats.opened}/{targetCount})</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStartLaunch}
              disabled={disabled}
              className="cursor-pointer group relative inline-flex items-center justify-center gap-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 px-7 py-3 text-sm font-bold text-neutral-950 shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/30 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="font-mono tabular-nums">
                START — Open {targetCount} {targetCount === 1 ? 'Tab' : 'Tabs'} ({staggerMs / 1000}s Delay)
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Countdown Timer Banner during 5-second Delay */}
      {stats.isLaunching && countdownMs > 0 && (
        <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-950/20 px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
            <span className="text-neutral-300">
              5-Second delay active: Tab <strong className="text-white font-mono">#{currentTabOpening}</strong> opening in{' '}
              <strong className="text-sky-300 font-mono text-sm tabular-nums">{remainingSeconds}s</strong>...
            </span>
          </div>

          <button
            type="button"
            onClick={onSkipWait}
            className="cursor-pointer text-xs text-sky-400 hover:text-sky-300 underline font-medium self-start sm:self-auto"
          >
            Open Tab #{currentTabOpening} immediately →
          </button>
        </div>
      )}

      {/* Progress & Live Metrics Bar */}
      {(stats.isLaunching || stats.opened > 0 || stats.blocked > 0) && (
        <div className="mt-5 space-y-2 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-xs text-neutral-300 font-mono">
            <span className="flex items-center gap-2">
              {stats.isLaunching ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>
                    Opening tab {stats.opened + stats.blocked + (countdownMs > 0 ? 0 : 1)} of {targetCount}...
                  </span>
                </>
              ) : stats.blocked > 0 ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Launch finished with {stats.blocked} blocked tabs
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All {stats.opened} tabs opened successfully!
                </span>
              )}
            </span>
            <span className="tabular-nums font-semibold text-white">
              {stats.progressPercent}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-950 border border-neutral-800">
            <div
              className={`h-full transition-all duration-150 ${
                stats.blocked > 0 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span>Opened: <strong className="text-emerald-400 tabular-nums">{stats.opened}</strong></span>
            <span>Blocked by Chrome: <strong className="text-amber-400 tabular-nums">{stats.blocked}</strong></span>
            <span>Target: <strong className="text-white tabular-nums">{targetCount}</strong></span>
          </div>
        </div>
      )}

      {/* Pop-up Blocker Warning Notice */}
      {showBlockedBanner && (
        <div className="mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-amber-300">
                Chrome Pop-up Blocker Stopped Additional Tabs
              </h4>
              <p className="text-amber-200/90 leading-relaxed">
                Google Chrome protects users by blocking mass tab creation by default. To open all 30 tabs at once:
              </p>
              <ol className="list-decimal pl-4 space-y-1 mt-1 text-amber-100 font-medium">
                <li>Look at the top-right corner of your Chrome URL address bar.</li>
                <li>Click the red pop-up icon <span className="font-mono bg-neutral-900/60 px-1 py-0.5 rounded border border-neutral-700">🚫 [Pop-up blocked]</span>.</li>
                <li>Select <strong>&quot;Always allow pop-ups and redirects from this site&quot;</strong> and click Done.</li>
                <li>Click <strong>&quot;START&quot;</strong> again to open all 30 tabs without restriction!</li>
              </ol>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenPopupGuide}
                  className="cursor-pointer underline text-amber-300 hover:text-white font-medium"
                >
                  View Step-by-Step Chrome Guide with Screenshots
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
