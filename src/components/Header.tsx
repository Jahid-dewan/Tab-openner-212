import React from 'react';
import { ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onTestPopups: () => void;
  popupStatus: 'unknown' | 'testing' | 'allowed' | 'blocked';
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onTestPopups,
  popupStatus,
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('launcher')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-sky-400">
              TabLaunch X
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
          <button
            onClick={() => onNavigate('launcher')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              activeSection === 'launcher' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Tab Opener
          </button>
          <button
            onClick={() => onNavigate('roster')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              activeSection === 'roster' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Visual Tab Grid
          </button>
          <button
            onClick={() => onNavigate('guide')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              activeSection === 'guide' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Chrome Pop-up Guide
          </button>
          <button
            onClick={() => onNavigate('standalone')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              activeSection === 'standalone' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Offline HTML Launcher
          </button>
          <button
            onClick={() => onNavigate('cli')}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-white ${
              activeSection === 'cli' ? 'text-sky-400 font-semibold' : ''
            }`}
          >
            Chrome CLI Commands
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onTestPopups}
            disabled={popupStatus === 'testing'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800 hover:text-white active:scale-95 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            title="Verify if Google Chrome allows multiple pop-up tabs from this website"
          >
            {popupStatus === 'allowed' ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Pop-ups Allowed</span>
              </>
            ) : popupStatus === 'blocked' ? (
              <>
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Pop-ups Blocked (Click to Fix)</span>
              </>
            ) : popupStatus === 'testing' ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span>Testing Chrome...</span>
              </>
            ) : (
              <>
                <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                <span>Check Pop-up Status</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
