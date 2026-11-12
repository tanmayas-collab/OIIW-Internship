import React from 'react';
import {
  ArrowRight,
  Building2,
  Bot,
  Sparkles,
  ShieldCheck,
  Briefcase,
  Clock,
  Globe,
  Award,
  Cpu,
} from 'lucide-react';
import { PROGRAM_CONSTANTS } from '../data/content';

interface HeroProps {
  onApplyClick: () => void;
  onOpenChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onApplyClick, onOpenChat }) => {
  return (
    <section className="relative overflow-hidden bg-[#080B13] bg-grid-subtle text-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-white/10">
      {/* Background Subtle Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[460px] bg-gradient-to-b from-blue-600/18 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-7">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Final-Year B.Tech &amp; 2026 Graduates
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-200 border border-white/10">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                {PROGRAM_CONSTANTS.PARTNER_COLLAB}
              </span>

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                Rolling Admissions
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.1]">
                Build Real AI Systems.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Graduate Placement-Ready.
                </span>
              </h1>

              <p className="text-base sm:text-lg font-bold text-slate-200">
                OIIW AI Internship + Training Program
              </p>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Move beyond theoretical coursework. Engineer production-grade AI workflows, develop autonomous Agentic AI systems, and ship guided client deliverables that hold up under technical interview scrutiny.
              </p>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 uppercase tracking-wider font-mono">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Execution</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-1">Client Deliverables</div>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Duration</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-1">3–12 Months</div>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Format</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white mt-1">Online / Hybrid</div>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 uppercase tracking-wider font-mono">
                  <Award className="w-3.5 h-3.5" />
                  <span>Credential</span>
                </div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-1">Verified Certificate</div>
              </div>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onApplyClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>Apply for Cohort</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Ask Admissions Counselor</span>
              </button>
            </div>

            {/* Authoritative Standard Note */}
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>₹0 upfront registration fee • Evaluated on academic profile, track fit, and weekly commitment</span>
            </div>
          </div>

          {/* Right Column: Unified Cohort Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-[#0C101D] to-[#0A0D18] border border-white/15 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300">
                  {PROGRAM_CONSTANTS.COHORT_LABEL}
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  10–15 hrs / week
                </span>
              </div>

              {/* Admissions Screening Notice */}
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200 bg-cyan-500/10 px-3 py-2 rounded-xl border border-cyan-500/25">
                <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>Limited Cohort Seats • Applications Reviewed on Rolling Basis</span>
              </div>

              {/* Live Project Track Value */}
              <div className="space-y-1.5">
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Client Deliverables &amp; Technical Mentorship</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Work on guided client-aligned AI systems {PROGRAM_CONSTANTS.PARTNER_COLLAB.replace(/^In /, 'in ')}, with weekly practitioner reviews.
                </p>
              </div>

              {/* Selection Process */}
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-2.5 text-xs">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center justify-between">
                  <span>Selection Procedure</span>
                  <span className="text-slate-400 font-normal">3 Stages</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300 font-mono text-center">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-cyan-300 block font-bold">1. Apply</span>
                    <span className="text-[10px] text-slate-400">Free 2-step form</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-cyan-300 block font-bold">2. Screen</span>
                    <span className="text-[10px] text-slate-400">Rolling review</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <span className="text-emerald-400 block font-bold">3. Onboard</span>
                    <span className="text-[10px] text-slate-400">Pay if admitted</span>
                  </div>
                </div>
              </div>

              {/* Tuition Info */}
              <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Subsidized Tuition (If Admitted):</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-extrabold text-white text-base">₹{PROGRAM_CONSTANTS.SPECIAL_FEE} / mo</span>
                    <span className="text-slate-400 line-through text-xs">₹{PROGRAM_CONSTANTS.REGULAR_FEE} / mo</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono text-right shrink-0">
                  Intake Deadline<br />
                  <span className="text-cyan-300 font-semibold">{PROGRAM_CONSTANTS.DEADLINE_LABEL}</span>
                </div>
              </div>

              {/* Primary Application Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={onApplyClick}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span>Apply for Cohort</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                  <span>• ₹0 Registration Fee</span>
                  <span>• Need-Based Waiver Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
