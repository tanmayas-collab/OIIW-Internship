import React from 'react';
import { PROGRAM_CONSTANTS } from '../data/content';
import { Mail, MapPin, ShieldCheck, ArrowUp, Building2, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050810] text-slate-400 text-xs border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Brand & Provider Info */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm">
                OI
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight">OIIW</span>
                <span className="text-[10px] ml-2 font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10">
                  AI Internship
                </span>
                <p className="text-[11px] text-slate-300">For Final-Year B.Tech &amp; 2026 Graduates</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              OIIW undertakes AI and automation projects for industry clients and equips students with practical engineering deliverables through structured mentorship.
            </p>

            {/* Partner and Gurugram Address */}
            <div className="p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-1.5 max-w-sm">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs">
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Industry Partner: {PROGRAM_CONSTANTS.PROVIDER_NAME}</span>
              </div>
              <div className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{PROGRAM_CONSTANTS.PROVIDER_ADDRESS}</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3 space-y-3">
            <h2 className="text-[11px] font-mono text-slate-200 uppercase tracking-wider">
              Navigation
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <a href="#why-join" className="hover:text-white transition-colors">Why Join</a>
              <a href="#about" className="hover:text-white transition-colors">About OIIW</a>
              <a href="#areas" className="hover:text-white transition-colors">13 Tracks</a>
              <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
              <a href="#assessment" className="hover:text-white transition-colors">Assessment</a>
              <a href="#fees" className="hover:text-white transition-colors">Fees</a>
              <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
              <a href="#application-portal" className="text-cyan-300 hover:underline">Apply for Cohort</a>
            </div>
          </div>

          {/* Contact Us Col */}
          <div className="md:col-span-4 space-y-3.5">
            <h2 className="text-[11px] font-mono text-slate-200 uppercase tracking-wider">
              Direct Enquiry &amp; Support
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Questions on eligibility, domain tracks, or admissions screening? Reach our team directly:
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={PROGRAM_CONSTANTS.CONTACT_MAILTO}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                title={`Email ${PROGRAM_CONSTANTS.CONTACT_EMAIL}`}
              >
                <Mail className="w-4 h-4 text-cyan-200" />
                <span>{PROGRAM_CONSTANTS.CONTACT_EMAIL}</span>
              </a>

              <a
                href={PROGRAM_CONSTANTS.WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>{PROGRAM_CONSTANTS.WHATSAPP_NUMBER}</span>
              </a>
            </div>

            <div className="text-[11px] text-slate-400 font-mono pt-1">
              Subsidized tuition ₹{PROGRAM_CONSTANTS.SPECIAL_FEE}/mo valid through {PROGRAM_CONSTANTS.DEADLINE_LABEL}
            </div>
          </div>
        </div>

        {/* Footnote with Provider & Gurugram Address */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              OIIW AI Internship + Training Program • {PROGRAM_CONSTANTS.PARTNER_COLLAB} ({PROGRAM_CONSTANTS.PROVIDER_ADDRESS})
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} OIIW. All rights reserved.</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label="Back to top"
              title="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
