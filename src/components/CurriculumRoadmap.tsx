import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { DurationOption } from '../types';

interface CurriculumRoadmapProps {
  onSelectDuration: (duration: DurationOption) => void;
}

export const CurriculumRoadmap: React.FC<CurriculumRoadmapProps> = ({ onSelectDuration }) => {
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>('6 months');

  const durationDetails: Record<
    DurationOption,
    {
      title: string;
      tagline: string;
      badge: string;
      keyFocus: string[];
      idealFor: string;
    }
  > = {
    '3 months': {
      title: '3-Month Fast-Track Program',
      tagline: 'Rapid fundamentals, essential tooling, and 1 complete client-style guided project deliverable.',
      badge: 'Quick Ramp-Up',
      keyFocus: [
        'AI fundamentals & GenAI practical applications',
        'Prompt design & workflow automation tools',
        'Single end-to-end domain project',
        'Resume bullet points & interview talking points',
      ],
      idealFor: 'Students with upcoming placement drives seeking a focused, verified project deliverable.',
    },
    '6 months': {
      title: '6-Month Comprehensive Track',
      tagline: 'Deep hands-on immersion, Agentic AI, Vibe Coding prototyping, and 2 substantial portfolio deliverables.',
      badge: 'Most Popular',
      keyFocus: [
        'Advanced Generative AI, tool integration & automation',
        'Agentic AI concepts & autonomous business solutions',
        'Vibe Coding: AI-assisted rapid application prototyping',
        '2 Guided project deliverables + mentor code reviews',
        'Detailed placement mock review & interview readiness',
      ],
      idealFor: 'Final-year students balancing depth and college schedules for strong campus placement readiness.',
    },
    '9 months': {
      title: '9-Month Advanced Industry Track',
      tagline: 'Extended client-facing workflows, deeper automation architectures, and multi-disciplinary project experience.',
      badge: 'Extended Scope',
      keyFocus: [
        'Full spectrum of Agentic AI, LLM tooling, and custom agent design',
        'Multi-domain cross collaboration (e.g., Marketing AI + Product UX)',
        '3 Client-aligned project deliverables',
        'Priority consideration for paid internship opportunities',
      ],
      idealFor: 'Students preparing for high-bar product and engineering roles requiring multi-project depth.',
    },
    '12 months': {
      title: '12-Month Mastery & Fellowship Track',
      tagline: 'Complete annual immersion from training to guided execution and top-tier client placement readiness.',
      badge: 'Maximum Depth',
      keyFocus: [
        'Comprehensive curriculum across selected primary & secondary tracks',
        'End-to-end production architecture & client stakeholder presentations',
        'Multiple live deliverables and continuous mentoring',
        'Direct recommendation pipeline for paid internship & client roles',
      ],
      idealFor: 'Builders seeking maximum portfolio strength, sustained client exposure, and full-year mentoring.',
    },
  };

  const corePillars = [
    { title: 'AI Fundamentals & Practical Applications', desc: 'Understanding models, multimodal prompts, and real-world utility.' },
    { title: 'Generative AI & Prompt Engineering', desc: 'Context injection, few-shot prompts, responsible AI, and evaluation.' },
    { title: 'AI Tools & Automation Workflows', desc: 'Connecting APIs, automating repetitive manual tasks, and productivity.' },
    { title: 'Agentic AI Concepts & Solution Design', desc: 'Building multi-step reasoning agents that use external tools.' },
    { title: 'Vibe Coding & Rapid Prototyping', desc: 'Prompt-driven software development without syntax fatigue.' },
    { title: 'Domain-Specific Project in Selected Area', desc: 'Deep dive into Marketing, Sales, App Dev, Operations, or Data.' },
    { title: 'Research & Professional Presentation', desc: 'Communicating project results clearly to stakeholders.' },
    { title: 'Portfolio & Placement Interview Readiness', desc: 'Resume crafting, GitHub showcase, and placement interview simulations.' },
  ];

  return (
    <section id="curriculum" className="py-20 bg-[#0A0E1A] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Curriculum &amp; Roadmap
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Program Structure
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Combines structured online learning, practical assignments, mentor guidance, and client project deliverables.
          </p>
        </div>

        {/* 8 Core Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-14">
          {corePillars.map((pillar, i) => (
            <div key={i} className="bg-white/[0.025] hover:bg-white/[0.045] p-5 rounded-2xl border border-white/10 transition-colors">
              <div className="text-xs font-mono text-cyan-400 mb-2">0{i + 1}</div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5 leading-snug">
                {pillar.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Duration Details Card */}
        <div className="bg-white/[0.025] rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white">
                Select Your Duration
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Choose a timeline to inspect project deliverables and pre-fill your application.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10" role="group" aria-label="Program duration options">
              {(['3 months', '6 months', '9 months', '12 months'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={selectedDuration === d}
                  onClick={() => setSelectedDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    selectedDuration === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-xl font-bold text-white">
                  {durationDetails[selectedDuration].title}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {durationDetails[selectedDuration].badge}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {durationDetails[selectedDuration].tagline}
              </p>

              <p className="text-xs text-slate-400">
                <strong className="text-slate-200">Best fit:</strong> {durationDetails[selectedDuration].idealFor}
              </p>

              <div className="grid sm:grid-cols-2 gap-2 pt-2">
                {durationDetails[selectedDuration].keyFocus.map((focus, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-black/35 p-2.5 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{focus}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-black/60 p-6 rounded-2xl border border-white/10 space-y-4">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Track Deliverables</span>
                </span>
                <div className="text-base font-bold text-white mt-1.5">
                  Live Project Portfolio
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Verified client deliverables and placement interview defense assets.
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>10–15 hrs/week • Online / Hybrid</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified Internship Certification</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectDuration(selectedDuration)}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <span>Pre-fill {selectedDuration} in Form</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
