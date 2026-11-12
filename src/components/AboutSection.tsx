import React from 'react';
import { Building2, Target, Network, MapPin } from 'lucide-react';
import { PROGRAM_CONSTANTS } from '../data/content';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-[#0A0E1A] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              About OIIW
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Practical AI Training Backed by Real Client Projects
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              OIIW undertakes AI and automation projects for industry clients and creates structured internship pathways through its engineering collaborations and partner network.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 shrink-0 self-start lg:self-auto">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Partner Hub: {PROGRAM_CONSTANTS.PROVIDER_ADDRESS}</span>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/[0.03] hover:bg-white/[0.05] p-7 rounded-2xl border border-white/10 transition-all">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center mb-5 border border-cyan-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Gurugram Industry Collaboration</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This cohort is offered <strong className="text-white">{PROGRAM_CONSTANTS.PARTNER_COLLAB.replace(/^In /, 'in ')}</strong>. Admitted students work on guided AI deliverables with weekly practitioner reviews.
            </p>
          </div>

          <div className="bg-white/[0.03] hover:bg-white/[0.05] p-7 rounded-2xl border border-white/10 transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-300 flex items-center justify-center mb-5 border border-purple-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Beyond Classroom Theory</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Move past toy notebooks. Build structured prompt pipelines, client automation prototypes, and documented system architectures ready for technical interviews.
            </p>
          </div>

          <div className="bg-white/[0.03] hover:bg-white/[0.05] p-7 rounded-2xl border border-white/10 transition-all">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Clientele &amp; Referral Pathway</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              OIIW collaborates across multiple client domains. High-performing interns who ship verified deliverables may be considered for paid roles as opportunities arise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
