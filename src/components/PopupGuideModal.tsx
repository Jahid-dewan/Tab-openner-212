import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { testPopupPermission } from '../utils/tabOpener';

interface PopupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (allowed: boolean) => void;
}

export const PopupGuideModal: React.FC<PopupGuideModalProps> = ({
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'allowed' | 'blocked'>('idle');

  if (!isOpen) return null;

  const handleRunTest = async () => {
    setTestResult('testing');
    const allowed = await testPopupPermission();
    setTestResult(allowed ? 'allowed' : 'blocked');
    if (onStatusUpdated) onStatusUpdated(allowed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          title="Close guide"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2.5 text-sky-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Chrome Pop-up Permission Guide
            </h3>
            <p className="text-xs text-neutral-400">
              How to enable Google Chrome to open all 30 tabs without being blocked
            </p>
          </div>
        </div>

        {/* Live Permission Checker Widget */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-neutral-300">
                Current Chrome Pop-up Status
              </span>
              <p className="text-xs text-neutral-400 mt-0.5">
                Run an instant test to check if Chrome currently permits multi-tab launch.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunTest}
              disabled={testResult === 'testing'}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {testResult === 'testing' ? 'Testing...' : 'Test Chrome Now'}
            </button>
          </div>

          {testResult === 'allowed' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span><strong>Pop-ups are ALLOWED!</strong> You can now launch 30 tabs at once without interruption.</span>
            </div>
          )}

          {testResult === 'blocked' && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span><strong>Pop-ups are BLOCKED.</strong> Follow the 3 steps below to unblock.</span>
            </div>
          )}
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-4 text-xs text-neutral-300">
          <div className="flex items-start gap-3 rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 font-mono text-xs font-bold text-sky-400">
              1
            </span>
            <div>
              <h4 className="font-semibold text-white">Find the Pop-up Icon in Chrome Address Bar</h4>
              <p className="text-neutral-400 mt-0.5">
                After you click <strong>Start</strong>, look at the far right end of Chrome&apos;s address bar (where the URL is). You will see an icon with a red symbol: <span className="font-mono text-amber-300 bg-neutral-800 px-1 py-0.5 rounded">🚫 Pop-ups blocked</span>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 font-mono text-xs font-bold text-sky-400">
              2
            </span>
            <div>
              <h4 className="font-semibold text-white">Select &quot;Always Allow&quot;</h4>
              <p className="text-neutral-400 mt-0.5">
                Click on the icon, choose <strong>&quot;Always allow pop-ups and redirects from this site&quot;</strong>, and click <strong>Done</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-neutral-800/80 bg-neutral-950/40 p-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 font-mono text-xs font-bold text-sky-400">
              3
            </span>
            <div>
              <h4 className="font-semibold text-white">Click START Again</h4>
              <p className="text-neutral-400 mt-0.5">
                Click the blue <strong>START</strong> button again. All 30 Chrome tabs will instantly open in the background!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-xs font-medium text-white transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
