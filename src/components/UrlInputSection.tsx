import React from 'react';
import { Clipboard, X, Check, ArrowUpRight, AlertCircle, Sparkles } from 'lucide-react';
import { TwitterPostInfo } from '../types';
import { SAMPLE_TWEETS } from '../utils/twitter';

interface UrlInputSectionProps {
  inputUrl: string;
  onUrlChange: (value: string) => void;
  parsedInfo: TwitterPostInfo;
  onSelectSample: (sampleUrl: string) => void;
  stripTrackingParams: boolean;
  onToggleStripTracking: () => void;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  inputUrl,
  onUrlChange,
  parsedInfo,
  onSelectSample,
  stripTrackingParams,
  onToggleStripTracking,
}) => {
  const [copiedNotification, setCopiedNotification] = React.useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onUrlChange(text.trim());
      }
    } catch {
      // Fallback: prompt or focus
      const el = document.getElementById('twitter-url-input');
      if (el) el.focus();
    }
  };

  const handleClear = () => {
    onUrlChange('');
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white">
            Twitter / X Post URL
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Paste one single post link. Analytics tracking queries are automatically cleaned.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={onToggleStripTracking}
            className={`cursor-pointer px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              stripTrackingParams
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Removes URL tracking clutter such as ?s=20 and ?t=..."
          >
            Clean URL Mode: {stripTrackingParams ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* URL Input Form Box */}
      <div className="relative flex items-center">
        <input
          id="twitter-url-input"
          type="text"
          value={inputUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://x.com/username/status/1234567890123456789"
          className={`w-full rounded-lg border bg-neutral-950 px-4 py-3 pl-10 pr-24 font-mono text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 transition-all ${
            inputUrl && !parsedInfo.isValid
              ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/20'
              : parsedInfo.isValid
              ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
              : 'border-neutral-800 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />

        {/* Left X / Twitter Icon */}
        <div className="pointer-events-none absolute left-3 text-neutral-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        {/* Right action buttons: Clear + Paste */}
        <div className="absolute right-2 flex items-center gap-1">
          {inputUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              title="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handlePaste}
            className="cursor-pointer inline-flex items-center gap-1 rounded bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
            title="Paste URL from clipboard"
          >
            <Clipboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </button>
        </div>
      </div>

      {/* Validation or Info Row */}
      {inputUrl && !parsedInfo.isValid && (
        <div className="mt-2.5 flex items-start gap-2 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{parsedInfo.errorMessage}</span>
        </div>
      )}

      {parsedInfo.isValid && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800/80 pt-3">
          {/* Metadata strictly unboxed with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Valid Post
            </span>
            <span aria-hidden="true">·</span>
            <span>Author: <strong className="text-neutral-200">@{parsedInfo.username}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Status ID: {parsedInfo.statusId}</span>
          </div>

          <a
            href={parsedInfo.cleanedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>Preview single post</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Sample Links Quick Selector */}
      <div className="mt-4 pt-3 border-t border-neutral-800/60 flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Quick Test Samples:
        </span>
        {SAMPLE_TWEETS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => onSelectSample(sample.url)}
            className="cursor-pointer text-xs font-medium text-neutral-400 hover:text-sky-300 bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 rounded px-2.5 py-1 transition-colors"
            title={`${sample.description} (${sample.url})`}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
