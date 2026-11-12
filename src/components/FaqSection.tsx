import React, { useState } from 'react';
import { FAQS } from '../data/content';
import { ChevronDown, Search, Sparkles } from 'lucide-react';

interface FaqSectionProps {
  onOpenChatWithQuery: (q: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenChatWithQuery }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const categories = ['All', 'General', 'Eligibility & Coding', 'Fees & Waiver', 'Internship & Projects'];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className="py-20 bg-[#0A0E1A] text-white border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3 mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            FAQs
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Everything you need to know about the OIIW AI Internship + Training Program, Gurugram partner collaboration, fees, and eligibility.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            aria-label="Search frequently asked questions"
            placeholder="Search questions (e.g. coding, fee, Gurugram, certificate, vibe coding)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-14 py-3 rounded-xl border border-white/10 bg-black/40 text-xs sm:text-sm text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8" role="group" aria-label="Filter FAQs by category">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-2.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              const panelId = `faq-panel-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {faq.question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 hidden sm:inline px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {faq.category}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div id={panelId} className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-black/25">
                      <p className="mt-2 text-slate-300">{faq.answer}</p>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Need clarification?</span>
                        <button
                          type="button"
                          onClick={() => onOpenChatWithQuery(faq.question)}
                          className="text-cyan-300 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Ask AI Counselor</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white/[0.02] rounded-2xl border border-white/10 text-slate-300 text-xs">
              No matching questions found for "{searchQuery}". Try clearing the filter or ask our AI Counselor directly!
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
