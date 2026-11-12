import React, { useState } from 'react';
import { PROFICIENCY_LEVELS } from '../data/content';
import { ArrowRight, Compass } from 'lucide-react';

interface AssessmentToolProps {
  onApplyWithScore: (score: number) => void;
}

export const AssessmentTool: React.FC<AssessmentToolProps> = ({ onApplyWithScore }) => {
  const [activeScore, setActiveScore] = useState<number>(4);

  const getLevelInfo = (score: number) => {
    if (score <= 2) return PROFICIENCY_LEVELS[0];
    if (score <= 4) return PROFICIENCY_LEVELS[1];
    if (score <= 6) return PROFICIENCY_LEVELS[2];
    if (score <= 8) return PROFICIENCY_LEVELS[3];
    return PROFICIENCY_LEVELS[4];
  };

  const currentLevel = getLevelInfo(activeScore);

  return (
    <section id="assessment" className="py-20 bg-[#080B13] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Interactive Diagnostic
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            AI Proficiency Self-Assessment
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Rate your current AI knowledge from 1 to 10. Be honest—this helps assign suitable training tracks, mentors, and project complexity.
          </p>
        </div>

        {/* Card */}
        <div className="max-w-4xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Select Your Current Level: 1 to 10
            </span>
            <div className="text-2xl font-black text-cyan-400">
              Level {activeScore} of 10
            </div>
          </div>

          {/* 1-10 Buttons */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2" role="group" aria-label="AI proficiency rating from 1 to 10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
              const isSelected = activeScore === num;
              return (
                <button
                  key={num}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveScore(num)}
                  className={`h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base flex flex-col items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 border border-cyan-400 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                  }`}
                >
                  <span>{num}</span>
                  <span className={`text-[9px] font-normal ${isSelected ? 'text-cyan-100' : 'text-slate-400'}`}>
                    {num <= 2 ? 'Found' : num <= 6 ? 'Mid' : 'Adv'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Diagnosis Block */}
          <div className="mt-8 bg-black/40 rounded-2xl p-6 border border-white/10 grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Rating: {currentLevel.range} / 10
                </span>
                <span className="text-base font-bold text-white">
                  {currentLevel.label}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentLevel.description}
              </p>

              <div className="pt-1 flex items-start gap-2 text-xs text-slate-300">
                <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Recommended Roadmap:</strong> {currentLevel.recommendedFocus}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-stretch justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
              <button
                type="button"
                onClick={() => onApplyWithScore(activeScore)}
                className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>Use Score ({activeScore}/10) in Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                Pre-fills Step 2 automatically
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
