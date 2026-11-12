import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { WhyJoinSection } from './components/WhyJoinSection';
import { AreasOfInterestSection } from './components/AreasOfInterestSection';
import { AssessmentTool } from './components/AssessmentTool';
import { CurriculumRoadmap } from './components/CurriculumRoadmap';
import { FeeAndWaiverSection } from './components/FeeAndWaiverSection';
import { ApplicationForm } from './components/ApplicationForm';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { DurationOption } from './types';

export default function App() {
  const [trackSelection, setTrackSelection] = useState<{ track: string; token: number } | undefined>(undefined);
  const [scoreSelection, setScoreSelection] = useState<{ score: number; token: number } | undefined>(undefined);
  const [durationSelection, setDurationSelection] = useState<{ duration: DurationOption; token: number } | undefined>(undefined);
  const [waiverTrigger, setWaiverTrigger] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatQuery, setChatQuery] = useState<{ text: string; token: number } | undefined>(undefined);

  const scrollToForm = () => {
    const el = document.getElementById('application-portal');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleApplyClick = () => {
    scrollToForm();
  };

  const handleSelectTrack = (trackName: string) => {
    setTrackSelection({ track: trackName, token: Date.now() });
    scrollToForm();
  };

  const handleSelectScore = (score: number) => {
    setScoreSelection({ score, token: Date.now() });
    scrollToForm();
  };

  const handleSelectDuration = (duration: DurationOption) => {
    setDurationSelection({ duration, token: Date.now() });
    scrollToForm();
  };

  const handleRequestWaiver = () => {
    setWaiverTrigger(prev => prev + 1);
    scrollToForm();
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleOpenChatWithQuery = (query: string) => {
    setChatQuery({ text: query, token: Date.now() });
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080B13] text-white flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar onApplyClick={handleApplyClick} />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onApplyClick={handleApplyClick}
          onOpenChat={handleOpenChat}
        />

        {/* Why Join & What You Will Gain */}
        <WhyJoinSection />

        {/* About OIIW & Gurugram Collaboration */}
        <AboutSection />

        {/* 13 Areas of Interest Interactive Directory */}
        <AreasOfInterestSection
          onSelectTrack={handleSelectTrack}
          onOpenAssessment={() => document.getElementById('assessment')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* Curriculum, Roadmap & Duration Breakdown */}
        <CurriculumRoadmap onSelectDuration={handleSelectDuration} />

        {/* AI Proficiency Self-Assessment Tool (1-10) */}
        <AssessmentTool onApplyWithScore={handleSelectScore} />

        {/* Fee & Financial Assistance Section */}
        <FeeAndWaiverSection
          onRegisterClick={handleApplyClick}
          onRequestWaiverClick={handleRequestWaiver}
        />

        {/* Two-Step Application Portal */}
        <ApplicationForm
          trackSelection={trackSelection}
          scoreSelection={scoreSelection}
          durationSelection={durationSelection}
          waiverTrigger={waiverTrigger}
        />

        {/* Frequently Asked Questions */}
        <FaqSection onOpenChatWithQuery={handleOpenChatWithQuery} />
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Powered Admissions Counselor Chatbot */}
      <ChatbotWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(prev => !prev)}
        externalQuery={chatQuery}
        onApplyClick={handleApplyClick}
      />
    </div>
  );
}
