import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Users, 
  FileCode, 
  Award, 
  BadgeDollarSign, 
  BrainCircuit, 
  Cpu
} from 'lucide-react';

export const WhyJoinSection: React.FC = () => {
  const gains = [
    {
      title: 'Structured Practical AI Engineering',
      desc: 'Industry-designed progressive curriculum bridging classroom coursework and production tooling.',
      icon: Layers,
    },
    {
      title: 'Hands-on Project Deliverables',
      desc: 'Work on actual AI workflows and client-facing tasks rather than passive video lectures.',
      icon: Cpu,
    },
    {
      title: 'Mentor Feedback & Weekly Reviews',
      desc: 'Direct reviews from experienced practitioners to refine your prompt architecture and code.',
      icon: Users,
    },
    {
      title: 'Agentic AI & Vibe Coding',
      desc: 'Stay ahead of the curve with modern multi-step AI agents and rapid prompt-driven development.',
      icon: BrainCircuit,
      highlight: true,
    },
    {
      title: 'Portfolio-Ready for Placements',
      desc: 'Complete projects you can demonstrate and defend with confidence in campus interview rounds.',
      icon: FileCode,
    },
    {
      title: 'Presenting AI Skills in Interviews',
      desc: 'Learn how to articulate real AI problem-solving on your resume, LinkedIn, and GitHub profile.',
      icon: Sparkles,
    },
    {
      title: 'Official Internship Certification',
      desc: 'Receive an official verified credential upon completion of required project deliverables.',
      icon: Award,
    },
    {
      title: 'Paid Internship Consideration',
      desc: 'Top performers completing deliverables may be considered for paid roles within OIIW’s client network.',
      icon: BadgeDollarSign,
      highlight: true,
    },
  ];

  const whoShouldApply = [
    'Candidates targeting AI engineering, automation, data, software, app dev, analytics, or product roles.',
    'Engineers seeking a structured transition from academic coursework into production-level AI capabilities.',
    'Final-year students actively preparing for campus placements and technical interviews.',
    'Ambitious builders who prioritize demonstrable project deliverables over theoretical certificates.',
    'Engineers who can commit 10–15 hours per week of disciplined project execution.',
  ];

  return (
    <section id="why-join" className="py-20 bg-[#080B13] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-14">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Why Join
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Move from “I Have Studied AI” to “I Have Worked on AI Projects”
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Many final-year students possess theoretical knowledge but limited practical execution. This program bridges that critical gap before your placement season.
          </p>
        </div>

        {/* Gains Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gains.map((gain, idx) => {
            const Icon = gain.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all ${
                  gain.highlight
                    ? 'bg-gradient-to-b from-blue-950/40 to-slate-900/60 border-cyan-500/30'
                    : 'bg-white/[0.03] hover:bg-white/[0.05] border-white/10'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    gain.highlight
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {gain.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {gain.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Who Should Apply Strip */}
        <div className="mt-14 p-8 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Candidate Profile</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Who Should Apply</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Open to final-year B.Tech students across all engineering branches (CSE, IT, ECE, Mechanical, Civil, EE, AI/DS).
              </p>
            </div>

            <div className="lg:col-span-8 space-y-2.5">
              {whoShouldApply.map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
