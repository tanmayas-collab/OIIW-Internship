import React, { useState, useEffect, useRef } from 'react';
import { Check, Save } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: 1 | 2;
  lastSaved?: string | null;
  onStepClick?: (step: 1 | 2) => void;
  canNavigateToStep2?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  lastSaved,
  onStepClick,
  canNavigateToStep2 = false,
}) => {
  const targetPercent = currentStep === 1 ? 50 : 100;
  const [animatedPercent, setAnimatedPercent] = useState<number>(targetPercent);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startPercentRef = useRef<number>(animatedPercent);

  useEffect(() => {
    startPercentRef.current = animatedPercent;
    startTimeRef.current = null;

    const DURATION = 380;
    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const stepAnimation = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = easeInOutCubic(progress);

      setAnimatedPercent(
        startPercentRef.current + (targetPercent - startPercentRef.current) * eased
      );

      if (progress < 1) {
        animRef.current = requestAnimationFrame(stepAnimation);
      } else {
        setAnimatedPercent(targetPercent);
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(stepAnimation);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [currentStep, targetPercent]);

  return (
    <div className="space-y-4 select-none" aria-label={`Form Progress: Step ${currentStep} of 2`}>
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4 text-xs font-semibold">
        {/* Step 1 Node */}
        <button
          type="button"
          onClick={() => onStepClick && onStepClick(1)}
          aria-current={currentStep === 1 ? 'step' : undefined}
          className={`flex items-center gap-2.5 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1 -ml-1 ${
            onStepClick ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
          }`}
          title="Step 1: Academic Profile & Track Selection"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
              currentStep === 1
                ? 'bg-cyan-400 text-black shadow-[0_0_14px_rgba(6,182,212,0.5)] ring-2 ring-cyan-300/60'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {currentStep === 2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
          </div>

          <div>
            <span className={`block text-xs font-bold transition-colors ${currentStep === 1 ? 'text-white' : 'text-slate-300'}`}>
              Step 1: Profile &amp; Tracks
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {currentStep === 1 ? 'In progress' : 'Completed'}
            </span>
          </div>
        </button>

        {/* Step 2 Node */}
        <button
          type="button"
          onClick={() => canNavigateToStep2 && onStepClick && onStepClick(2)}
          disabled={!canNavigateToStep2 && currentStep === 1}
          aria-current={currentStep === 2 ? 'step' : undefined}
          className={`flex items-center gap-2.5 transition-all text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1 -mr-1 ${
            canNavigateToStep2 || currentStep === 2 ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed opacity-70'
          }`}
          title="Step 2: AI Background & ID Verification"
        >
          <div className="text-right">
            <span className={`block text-xs font-bold transition-colors ${currentStep === 2 ? 'text-white' : 'text-slate-400'}`}>
              Step 2: AI Background &amp; ID
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {currentStep === 2 ? 'Final stage' : canNavigateToStep2 ? 'Ready' : 'Complete Step 1'}
            </span>
          </div>

          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
              currentStep === 2
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-[0_0_16px_rgba(6,182,212,0.6)] ring-2 ring-cyan-300/70'
                : 'bg-white/5 text-slate-400 border border-white/15'
            }`}
          >
            2
          </div>
        </button>
      </div>

      {/* Continuous Progress Bar */}
      <div className="space-y-1.5">
        <div
          className="h-2 w-full bg-black/60 rounded-full border border-white/10 p-0.5 relative overflow-hidden shadow-inner"
          role="progressbar"
          aria-valuenow={Math.round(animatedPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 relative transition-none"
            style={{ width: `${animatedPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Status Readout & Draft Autosave Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Step {currentStep} of 2</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 tabular-nums">{Math.round(animatedPercent)}%</span>
          </div>

          {lastSaved && (
            <div className="flex items-center gap-1 text-slate-400">
              <Save className="w-3 h-3 text-cyan-400" />
              <span>Draft autosaved {lastSaved}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
