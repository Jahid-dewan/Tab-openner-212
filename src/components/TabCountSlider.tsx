import React from 'react';
import { Minus, Plus, Layers, Info } from 'lucide-react';

interface TabCountSliderProps {
  count: number;
  onChange: (value: number) => void;
  maxLimit?: number;
}

export const TabCountSlider: React.FC<TabCountSliderProps> = ({
  count,
  onChange,
  maxLimit = 30,
}) => {
  const PRESETS = [1, 5, 10, 15, 20, 25, 30];

  const handleIncrement = () => {
    if (count < maxLimit) onChange(count + 1);
  };

  const handleDecrement = () => {
    if (count > 1) onChange(count - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onChange(1);
    } else {
      const clamped = Math.min(Math.max(1, val), maxLimit);
      onChange(clamped);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-white">
              Target Chrome Tabs
            </h2>
            <span className="text-xs text-sky-400 font-mono">
              (Limit: {maxLimit} Max)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure how many simultaneous tabs to launch with your selected Twitter post.
          </p>
        </div>

        {/* Counter Display & Direct Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={count <= 1}
            className="cursor-pointer rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Decrease 1 tab"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={maxLimit}
              value={count}
              onChange={handleInputChange}
              className="w-16 rounded-lg border border-neutral-700 bg-neutral-950 py-1.5 text-center font-mono text-lg font-bold text-sky-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 tabular-nums"
            />
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={count >= maxLimit}
            className="cursor-pointer rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 hover:bg-neutral-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Increase 1 tab"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Range Slider */}
      <div className="space-y-2 mt-4">
        <div className="relative">
          <input
            type="range"
            min={1}
            max={maxLimit}
            step={1}
            value={count}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500 focus:outline-none"
          />
        </div>

        {/* Dynamic Scale Markers */}
        <div className="flex justify-between text-[11px] text-neutral-500 font-mono tabular-nums px-0.5">
          <span>1 Tab</span>
          <span>10 Tabs</span>
          <span>20 Tabs</span>
          <span className="font-semibold text-sky-400">30 Tabs (Max)</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-4 border-t border-neutral-800/80">
        <span className="text-xs text-neutral-400 mr-2 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> Quick Presets:
        </span>
        {PRESETS.map((p) => {
          const isSelected = count === p;
          const isMax = p === maxLimit;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`cursor-pointer px-3 py-1 text-xs font-mono font-medium rounded-md transition-all tabular-nums ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-sm ring-1 ring-sky-400'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700/60'
              }`}
            >
              {p} {isMax ? 'Tabs (Max)' : 'Tabs'}
            </button>
          );
        })}
      </div>

      {/* Performance & RAM Hint */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-neutral-950/60 border border-neutral-800 px-3 py-2 text-xs text-neutral-400">
        <Info className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
        <span>
          Launching <strong className="text-neutral-200 font-mono">{count}</strong> Chrome tabs at once will allocate approx{' '}
          <span className="font-mono text-sky-300 tabular-nums">
            {(count * 0.06).toFixed(1)} – {(count * 0.12).toFixed(1)} GB
          </span>{' '}
          memory in Google Chrome.
        </span>
      </div>
    </div>
  );
};
