import React, { useState } from 'react';
import { AREAS_OF_INTEREST } from '../data/content';
import {
  Megaphone,
  TrendingUp,
  FileText,
  Video,
  Search,
  GraduationCap,
  Zap,
  BarChart3,
  Layout,
  Briefcase,
  Code,
  Bot,
  Sparkles,
  ArrowRight,
  Compass,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Megaphone,
  TrendingUp,
  FileText,
  Video,
  Search,
  GraduationCap,
  Zap,
  BarChart3,
  Layout,
  Briefcase,
  Code,
  Bot,
  Sparkles,
};

interface AreasOfInterestSectionProps {
  onSelectTrack: (trackName: string) => void;
  onOpenAssessment?: () => void;
}

export const AreasOfInterestSection: React.FC<AreasOfInterestSectionProps> = ({
  onSelectTrack,
  onOpenAssessment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTrackId, setActiveTrackId] = useState<string>('agentic-ai');

  const categories = ['All', 'Tech & Code', 'Marketing & Growth', 'Content & Media', 'Business & Ops'];

  const filteredAreas =
    selectedCategory === 'All'
      ? AREAS_OF_INTEREST
      : AREAS_OF_INTEREST.filter(a => a.category === selectedCategory);

  return (
    <section id="areas" className="py-20 bg-[#0A0E1A] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              13 Domain Specializations
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Areas of Interest
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Choose 1 primary specialization and up to 2 secondary tracks in your application. Training, mentor matching, and guided deliverables align with your selection.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter tracks by category">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.map(area => {
            const Icon = iconMap[area.iconName] || Code;
            const isSelected = activeTrackId === area.id;

            return (
              <article
                key={area.id}
                className={`group p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-950/45 to-slate-900/70 border-cyan-500/45 shadow-lg shadow-cyan-500/5'
                    : 'bg-white/[0.025] hover:bg-white/[0.045] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 text-cyan-400 flex items-center justify-center transition-colors border border-white/10">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300">{area.category}</span>
                    </div>

                    {area.badge && (
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {area.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {area.name}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1.5 mb-4 leading-relaxed">
                    {area.tagline}
                  </p>

                  <div className="p-3.5 bg-black/35 rounded-xl border border-white/10 text-xs space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Deliverables Scope
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {area.whatYouMayWorkOn}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {isSelected ? 'Selected Track' : 'Available Track'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTrackId(area.id);
                      onSelectTrack(area.name);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1.5 py-0.5"
                  >
                    <span>Select Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}

          {/* Balance the 13-card 3-column grid when viewing All */}
          {selectedCategory === 'All' && (
            <div className="sm:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-dashed border-cyan-500/30 bg-gradient-to-br from-blue-950/30 via-[#0C1222] to-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Cross-Domain Flexibility</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  Not sure which specialization fits your background?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Combine 1 Primary Track with up to 2 Secondary Tracks in the application form, or run the 1–10 Self-Assessment below to match your current AI fluency with the right project scope.
                </p>
              </div>
              {onOpenAssessment && (
                <button
                  type="button"
                  onClick={onOpenAssessment}
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span>Take Self-Assessment</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
