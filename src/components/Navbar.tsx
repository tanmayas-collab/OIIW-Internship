import React, { useState, useEffect } from 'react';
import {
  Clock,
  ArrowRight,
  Menu,
  X,
  Mail,
} from 'lucide-react';
import { PROGRAM_CONSTANTS } from '../data/content';

interface NavbarProps {
  onApplyClick: () => void;
}

const NAV_LINKS = [
  { href: '#why-join', id: 'why-join', label: 'Why Join' },
  { href: '#about', id: 'about', label: 'About' },
  { href: '#areas', id: 'areas', label: 'Tracks' },
  { href: '#curriculum', id: 'curriculum', label: 'Curriculum' },
  { href: '#assessment', id: 'assessment', label: 'Self-Assessment' },
  { href: '#fees', id: 'fees', label: 'Fees' },
  { href: '#faqs', id: 'faqs', label: 'FAQs' },
];

export const Navbar: React.FC<NavbarProps> = ({ onApplyClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(PROGRAM_CONSTANTS.DEADLINE_DATE).getTime();
      const now = Date.now();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          expired: false,
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map(link => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.25, 0.5] }
    );

    sections.forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <header className="sticky top-0 z-40 w-full overflow-x-clip border-b border-white/10 bg-[#080B13]/92 backdrop-blur-xl">
      {/* Top Announcement Bar */}
      <div className="border-b border-white/5 bg-gradient-to-r from-blue-950/45 via-indigo-950/35 to-cyan-950/35 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="font-semibold text-cyan-300">Live Project Cohort:</span>
            <span className="text-slate-300">
              Guided client deliverables <span className="hidden sm:inline">• {PROGRAM_CONSTANTS.PARTNER_COLLAB}</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-md border border-white/10">
              <Clock className="w-3 h-3 text-cyan-400" />
              {timeLeft.expired ? (
                <span className="text-amber-300 font-semibold">November Intake Closed • Rolling Waitlist Open</span>
              ) : (
                <>
                  <span className="text-slate-400">Intake closes in:</span>
                  <span className="text-white font-bold tabular-nums">
                    {pad(timeLeft.days)}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
                  </span>
                </>
              )}
            </div>
            <span className="text-slate-400">₹0 Application Fee</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <nav aria-label="Primary Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            OI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">OIIW</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">
                AI Internship
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">B.Tech Final-Year Cohort</p>
          </div>
        </a>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs uppercase tracking-wider font-semibold">
          {NAV_LINKS.map(link => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded ${
                  isActive
                    ? 'text-cyan-300 border-b border-cyan-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={PROGRAM_CONSTANTS.CONTACT_MAILTO}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            title={`Email admissions at ${PROGRAM_CONSTANTS.CONTACT_EMAIL}`}
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contact Us</span>
          </a>

          <button
            type="button"
            onClick={onApplyClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span>Apply for Cohort</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={onApplyClick}
            className="sm:hidden px-3 py-1.5 text-xs font-bold text-white rounded-md bg-blue-600 hover:bg-blue-500 cursor-pointer"
          >
            Apply for Cohort
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#080B13] px-5 py-6 space-y-4 shadow-2xl">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
            {NAV_LINKS.map(link => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 px-2 rounded-lg transition-colors ${
                  activeSection === link.id ? 'bg-white/5 text-cyan-300' : 'hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <a
              href={PROGRAM_CONSTANTS.CONTACT_MAILTO}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-200 hover:text-white rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email {PROGRAM_CONSTANTS.CONTACT_EMAIL}</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onApplyClick();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white rounded-lg bg-blue-600 hover:bg-blue-500 shadow-md cursor-pointer"
            >
              Apply for Cohort
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
