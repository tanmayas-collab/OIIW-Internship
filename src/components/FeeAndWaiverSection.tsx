import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PROGRAM_CONSTANTS } from '../data/content';

interface FeeAndWaiverSectionProps {
  onRegisterClick: () => void;
  onRequestWaiverClick?: () => void;
}

export const FeeAndWaiverSection: React.FC<FeeAndWaiverSectionProps> = ({
  onRegisterClick,
  onRequestWaiverClick,
}) => {
  const [previewMonths, setPreviewMonths] = useState<3 | 6 | 9 | 12>(6);
  const totalSubsidized = PROGRAM_CONSTANTS.SPECIAL_FEE * previewMonths;
  const totalRegular = PROGRAM_CONSTANTS.REGULAR_FEE * previewMonths;

  return (
    <section id="fees" className="py-20 bg-[#080B13] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Tuition &amp; Financial Assistance
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Cohort Tuition Structure
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Applying is 100% free (₹0 registration fee). Tuition applies only after your application is shortlisted and you choose to enroll.
          </p>
        </div>

        {/* Unified Pricing Card */}
        <div className="max-w-3xl bg-white/[0.025] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Admitted Cohort Tuition
              </span>
              <div className="flex flex-wrap items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-bold text-white">
                  ₹{PROGRAM_CONSTANTS.SPECIAL_FEE}
                </span>
                <span className="text-slate-300 text-xs sm:text-sm">
                  / month (Subsidized Rate • {PROGRAM_CONSTANTS.DISCOUNT_PERCENT}% off)
                  <span className="ml-2 text-slate-400 font-normal">
                    (Standard: <span className="line-through">₹{PROGRAM_CONSTANTS.REGULAR_FEE}/mo</span>)
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-cyan-200 font-medium bg-cyan-400/10 px-3 py-1.5 rounded-xl border border-cyan-400/25 shrink-0 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Intake Deadline: {PROGRAM_CONSTANTS.DEADLINE_LABEL}</span>
            </div>
          </div>

          {/* Transparent Duration Estimator */}
          <div className="p-4 rounded-2xl bg-black/35 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Estimated Cohort Total ({previewMonths} Months)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-white">
                  ₹{totalSubsidized.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ₹{totalRegular.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  (Save ₹{(totalRegular - totalSubsidized).toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto" role="group" aria-label="Preview tuition by duration">
              {([3, 6, 9, 12] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={previewMonths === m}
                  onClick={() => setPreviewMonths(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    previewMonths === m
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables / Inclusions */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-200">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Program Inclusions
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Guided client project deliverables with practitioner mentors</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Hands-on curriculum (Agentic AI systems &amp; Vibe Coding)</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Weekly architecture reviews &amp; interview defense portfolio</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Verified Internship Certification upon project completion</span>
              </div>
            </div>
          </div>

          {/* Need-based Financial Aid note */}
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-white">Need-Based Financial Assistance:</strong>
                <p className="text-slate-300">
                  Candidates experiencing verified financial hardship may request a confidential fee waiver in Step 2 without affecting selection review.
                </p>
              </div>
            </div>
            {onRequestWaiverClick && (
              <button
                type="button"
                onClick={onRequestWaiverClick}
                className="shrink-0 text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline cursor-pointer self-start sm:self-center"
              >
                Apply with Waiver →
              </button>
            )}
          </div>

          {/* Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onRegisterClick}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>Apply for Cohort Admission</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <span className="text-xs text-slate-400 font-mono">
              ₹0 Upfront • Rolling Admissions Review
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
