import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Download,
  Building,
  Mail,
  User,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { ProgressIndicator } from './ProgressIndicator';
import {
  AREAS_OF_INTEREST,
  PREVIOUS_TRAINING_OPTIONS,
  PROFICIENCY_LEVELS,
  REFERRAL_SOURCES,
  PROGRAM_CONSTANTS,
} from '../data/content';
import {
  ApplicationFormData,
  DurationOption,
  SubmittedApplicationReceipt,
  WeeklyHoursOption,
} from '../types';

interface ApplicationFormProps {
  trackSelection?: { track: string; token: number };
  scoreSelection?: { score: number; token: number };
  durationSelection?: { duration: DurationOption; token: number };
  waiverTrigger?: number;
}

const STORAGE_DRAFT_KEY = 'oiiw_application_draft_v4';
const STORAGE_RECEIPT_KEY = 'oiiw_active_receipt_v4';

const SEMESTER_OPTIONS = [
  'Final year / Semester 7',
  'Final year / Semester 8',
  'Final year / Dual Degree',
  'Recent Graduate (2026 Batch)',
] as const;

const INITIAL_FORM_DATA: ApplicationFormData = {
  fullName: '',
  mobile: '',
  email: '',
  college: '',
  branch: '',
  semester: SEMESTER_OPTIONS[0],
  primaryInterest: 'Agentic AI Solutions',
  secondaryInterests: [],
  aiProficiency: 5,
  previousTraining: [],
  previousTrainingOther: '',
  priorLearningLinks: '',
  preferredDuration: '6 months',
  weeklyHours: '10–15 hours',
  whyJoin: '',
  portfolioLinks: '',
  idProofFile: null,
  idProofFileName: '',
  idProofFileSize: 0,
  idProofPreviewUrl: undefined,
  idProofDataUrl: undefined,
  applyFeeWaiver: false,
  waiverReason: '',
  referralSource: 'College WhatsApp group',
  referralSourceOther: '',
  agreedToTerms: false,
};

function getProficiencyTier(score: number) {
  if (score <= 2) return PROFICIENCY_LEVELS[0];
  if (score <= 4) return PROFICIENCY_LEVELS[1];
  if (score <= 6) return PROFICIENCY_LEVELS[2];
  if (score <= 8) return PROFICIENCY_LEVELS[3];
  return PROFICIENCY_LEVELS[4];
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  trackSelection,
  scoreSelection,
  durationSelection,
  waiverTrigger = 0,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState<SubmittedApplicationReceipt | null>(() => {
    try {
      const savedReceipt = localStorage.getItem(STORAGE_RECEIPT_KEY);
      if (savedReceipt) {
        return JSON.parse(savedReceipt);
      }
    } catch {
      // Ignore invalid storage
    }
    return null;
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTrackTokenRef = useRef<number | null>(null);
  const lastScoreTokenRef = useRef<number | null>(null);
  const lastDurationTokenRef = useRef<number | null>(null);
  const lastWaiverTriggerRef = useRef<number>(0);

  const [formData, setFormData] = useState<ApplicationFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validSemester = SEMESTER_OPTIONS.includes(parsed.semester)
          ? parsed.semester
          : SEMESTER_OPTIONS[0];
        return {
          ...INITIAL_FORM_DATA,
          ...parsed,
          semester: validSemester,
          secondaryInterests: Array.isArray(parsed.secondaryInterests)
            ? parsed.secondaryInterests.filter((t: string) => t !== parsed.primaryInterest).slice(0, 2)
            : [],
          previousTraining: Array.isArray(parsed.previousTraining) ? parsed.previousTraining : [],
          idProofFile: null,
          idProofFileName: '',
          idProofFileSize: 0,
          idProofPreviewUrl: undefined,
          idProofDataUrl: undefined,
        };
      }
    } catch {
      // Ignore invalid storage
    }
    return INITIAL_FORM_DATA;
  });

  useEffect(() => {
    if (trackSelection && trackSelection.token !== lastTrackTokenRef.current) {
      lastTrackTokenRef.current = trackSelection.token;
      setFormData(prev => ({
        ...prev,
        primaryInterest: trackSelection.track,
        secondaryInterests: prev.secondaryInterests.filter(t => t !== trackSelection.track),
      }));
      setNoticeMessage(`Primary Track pre-filled: ${trackSelection.track}`);
    }
  }, [trackSelection]);

  useEffect(() => {
    if (scoreSelection && scoreSelection.token !== lastScoreTokenRef.current) {
      lastScoreTokenRef.current = scoreSelection.token;
      setFormData(prev => ({ ...prev, aiProficiency: scoreSelection.score }));
      setNoticeMessage(`AI Self-Assessment (${scoreSelection.score}/10) pre-filled in Step 2.`);
    }
  }, [scoreSelection]);

  useEffect(() => {
    if (durationSelection && durationSelection.token !== lastDurationTokenRef.current) {
      lastDurationTokenRef.current = durationSelection.token;
      setFormData(prev => ({ ...prev, preferredDuration: durationSelection.duration }));
      setNoticeMessage(`Preferred duration (${durationSelection.duration}) pre-filled in Step 2.`);
    }
  }, [durationSelection]);

  useEffect(() => {
    if (waiverTrigger > lastWaiverTriggerRef.current) {
      lastWaiverTriggerRef.current = waiverTrigger;
      setFormData(prev => ({ ...prev, applyFeeWaiver: true }));
      if (validateStep1(false)) {
        setCurrentStep(2);
        setNoticeMessage('Fee Waiver option enabled below. Please provide a brief justification.');
      } else {
        setCurrentStep(1);
        setNoticeMessage('Fee Waiver pre-enabled for Step 2. Complete Step 1 details first to proceed.');
      }
    }
  }, [waiverTrigger]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (formData.idProofPreviewUrl) {
        URL.revokeObjectURL(formData.idProofPreviewUrl);
      }
    };
  }, [formData.idProofPreviewUrl]);

  // Autosave Draft (excluding non-serializable File/Blob state)
  useEffect(() => {
    if (submittedReceipt) return;
    try {
      const {
        idProofFile: _file,
        idProofPreviewUrl: _url,
        idProofDataUrl: _dataUrl,
        idProofFileName: _fileName,
        idProofFileSize: _fileSize,
        ...persistable
      } = formData;
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(persistable));
      const now = new Date();
      setLastSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      // Storage quota ignored
    }
  }, [formData, submittedReceipt]);

  const validateStep1 = (showError = true): boolean => {
    if (formData.fullName.trim().length < 2) {
      if (showError) setErrorMessage('Please enter your full name (at least 2 characters).');
      return false;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      if (showError) setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      if (showError) setErrorMessage('Please enter a valid email address.');
      return false;
    }
    if (formData.college.trim().length < 2) {
      if (showError) setErrorMessage('Please provide your College or University name.');
      return false;
    }
    if (formData.branch.trim().length < 2) {
      if (showError) setErrorMessage('Please specify your Engineering Branch / Specialization.');
      return false;
    }
    if (!formData.primaryInterest) {
      if (showError) setErrorMessage('Please choose your Primary Area of Interest.');
      return false;
    }

    if (showError) setErrorMessage(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (formData.previousTraining.includes('Other') && !formData.previousTrainingOther?.trim()) {
      setErrorMessage('Please specify your other AI training source.');
      return false;
    }
    if (formData.whyJoin.trim().length < 15) {
      setErrorMessage('Please write at least 15 characters explaining why you want to join this program.');
      return false;
    }
    if (!formData.idProofDataUrl || !formData.idProofFileName) {
      setErrorMessage('Please upload your Student ID proof (JPG, PNG, or PDF, max 5 MB).');
      return false;
    }
    if (formData.applyFeeWaiver && (!formData.waiverReason || formData.waiverReason.trim().length < 10)) {
      setErrorMessage('Please briefly explain your financial hardship reason (at least 10 characters).');
      return false;
    }
    if (formData.referralSource === 'Other' && !formData.referralSourceOther?.trim()) {
      setErrorMessage('Please specify how you heard about this program.');
      return false;
    }
    if (!formData.agreedToTerms) {
      setErrorMessage('Please accept the verification & contact consent checkbox to submit.');
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1(true)) {
      setCurrentStep(2);
      setNoticeMessage(null);
      document.getElementById('application-portal')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrimaryChange = (newPrimary: string) => {
    setFormData(prev => ({
      ...prev,
      primaryInterest: newPrimary,
      secondaryInterests: prev.secondaryInterests.filter(t => t !== newPrimary),
    }));
  };

  const handleSecondaryToggle = (trackName: string) => {
    if (trackName === formData.primaryInterest) return;

    setFormData(prev => {
      const exists = prev.secondaryInterests.includes(trackName);
      if (exists) {
        return {
          ...prev,
          secondaryInterests: prev.secondaryInterests.filter(t => t !== trackName),
        };
      }
      if (prev.secondaryInterests.length >= 2) {
        return prev;
      }
      return {
        ...prev,
        secondaryInterests: [...prev.secondaryInterests, trackName],
      };
    });
  };

  const handleTrainingToggle = (option: string) => {
    setFormData(prev => {
      const exists = prev.previousTraining.includes(option);
      if (option === 'None') {
        return { ...prev, previousTraining: exists ? [] : ['None'], previousTrainingOther: '' };
      }

      const filtered = prev.previousTraining.filter(t => t !== 'None');
      if (exists) {
        return {
          ...prev,
          previousTraining: filtered.filter(t => t !== option),
          previousTrainingOther: option === 'Other' ? '' : prev.previousTrainingOther,
        };
      }
      return { ...prev, previousTraining: [...filtered, option] };
    });
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Accepted formats: JPG, PNG, or PDF only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5 MB maximum limit.');
      return;
    }

    setErrorMessage(null);

    if (formData.idProofPreviewUrl) {
      URL.revokeObjectURL(formData.idProofPreviewUrl);
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : undefined;
      if (!result) {
        setErrorMessage('Could not read the selected file. Please try again.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        idProofFile: file,
        idProofFileName: file.name,
        idProofFileSize: file.size,
        idProofPreviewUrl: previewUrl,
        idProofDataUrl: result,
      }));
    };

    reader.onerror = () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setErrorMessage('Failed to read the selected file. Please choose another file.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeUploadedFile = () => {
    if (formData.idProofPreviewUrl) {
      URL.revokeObjectURL(formData.idProofPreviewUrl);
    }
    setFormData(prev => ({
      ...prev,
      idProofFile: null,
      idProofFileName: '',
      idProofFileSize: 0,
      idProofPreviewUrl: undefined,
      idProofDataUrl: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1(true)) {
      setCurrentStep(1);
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const trainingList = formData.previousTraining.map(item =>
        item === 'Other' && formData.previousTrainingOther?.trim()
          ? `Other: ${formData.previousTrainingOther.trim()}`
          : item
      );
      const referralValue =
        formData.referralSource === 'Other' && formData.referralSourceOther?.trim()
          ? `Other: ${formData.referralSourceOther.trim()}`
          : formData.referralSource;

      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          mobile: formData.mobile.replace(/\D/g, ''),
          email: formData.email.trim(),
          college: formData.college.trim(),
          branch: formData.branch.trim(),
          semester: formData.semester,
          primaryInterest: formData.primaryInterest,
          secondaryInterests: formData.secondaryInterests,
          aiProficiency: formData.aiProficiency,
          previousTraining: trainingList,
          priorLearningLinks: formData.priorLearningLinks.trim(),
          preferredDuration: formData.preferredDuration,
          weeklyHours: formData.weeklyHours,
          whyJoin: formData.whyJoin.trim(),
          portfolioLinks: formData.portfolioLinks.trim(),
          idProofFileName: formData.idProofFileName,
          idProofFileSize: formData.idProofFileSize,
          idProofDataUrl: formData.idProofDataUrl,
          applyFeeWaiver: formData.applyFeeWaiver,
          waiverReason: formData.applyFeeWaiver ? formData.waiverReason?.trim() : '',
          referralSource: referralValue,
          agreedToTerms: formData.agreedToTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      const receipt: SubmittedApplicationReceipt = {
        id: data.applicationId,
        submittedAt: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.replace(/\D/g, ''),
        email: formData.email.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        primaryInterest: formData.primaryInterest,
        secondaryInterests: formData.secondaryInterests,
        preferredDuration: formData.preferredDuration,
        weeklyHours: formData.weeklyHours,
        applyFeeWaiver: formData.applyFeeWaiver,
        idProofFileName: formData.idProofFileName,
      };

      localStorage.setItem(STORAGE_RECEIPT_KEY, JSON.stringify(receipt));
      localStorage.removeItem(STORAGE_DRAFT_KEY);
      setSubmittedReceipt(receipt);
      setNoticeMessage(null);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#8b5cf6'],
        });
      } catch {
        // Ignore confetti errors
      }

      document.getElementById('application-portal')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error occurred. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateApplicationTranscript = (): string => {
    if (!submittedReceipt) return '';
    return `
OIIW AI INTERNSHIP + TRAINING PROGRAM - SUBMISSION RECORD
=============================================================
Application ID:      ${submittedReceipt.id}
Date & Time:         ${submittedReceipt.submittedAt}
Status:              Submitted & Staged for Admissions Review

APPLICANT PROFILE:
-------------------------------------------------------------
Full Name:           ${submittedReceipt.fullName}
Mobile Number:       +91 ${submittedReceipt.mobile}
Email:               ${submittedReceipt.email}
College/University:  ${submittedReceipt.college}
Branch:              ${submittedReceipt.branch}

PROGRAM PREFERENCES:
-------------------------------------------------------------
Primary Track:       ${submittedReceipt.primaryInterest}
Secondary Tracks:    ${submittedReceipt.secondaryInterests.join(', ') || 'None'}
Duration:            ${submittedReceipt.preferredDuration}
Weekly Commitment:   ${submittedReceipt.weeklyHours}
Student ID File:     ${submittedReceipt.idProofFileName || 'Uploaded'}
Collaboration:       ${PROGRAM_CONSTANTS.PARTNER_COLLAB}
Financial Aid:       ${submittedReceipt.applyFeeWaiver ? 'YES (Confidential Review Requested)' : 'NO'}
Subsidized Tuition:  ₹${PROGRAM_CONSTANTS.SPECIAL_FEE}/month (If Admitted; ₹0 upfront)
=============================================================
Admissions committee evaluates applications on a rolling basis.
Questions? Contact ${PROGRAM_CONSTANTS.CONTACT_EMAIL} or ${PROGRAM_CONSTANTS.POST_SUBMIT_WHATSAPP_NUMBER}.
    `.trim();
  };

  const handleDownloadSummary = () => {
    const content = generateApplicationTranscript();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OIIW_Application_${submittedReceipt?.id || 'Record'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTranscript = () => {
    const content = generateApplicationTranscript();
    navigator.clipboard.writeText(content).then(() => {
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2500);
    }).catch(() => {
      setErrorMessage('Clipboard access was blocked. Please use the Download button instead.');
    });
  };

  const handleResetForNewApplication = () => {
    localStorage.removeItem(STORAGE_RECEIPT_KEY);
    localStorage.removeItem(STORAGE_DRAFT_KEY);
    removeUploadedFile();
    setSubmittedReceipt(null);
    setFormData(INITIAL_FORM_DATA);
    setErrorMessage(null);
    setNoticeMessage(null);
    setCurrentStep(1);
  };

  const currentTier = getProficiencyTier(formData.aiProficiency);

  return (
    <section id="application-portal" className="py-20 bg-[#0A0E1A] text-white border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Cohort Admissions Portal
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Candidate Application
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Complete both steps to submit your profile for rolling cohort review. Registration is ₹0 with no upfront obligation.
          </p>
        </div>

        {/* Confirmation State */}
        {submittedReceipt ? (
          <div className="bg-white/[0.03] border border-cyan-500/35 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-7 animate-fadeIn">
            <div className="text-center space-y-3 pb-6 border-b border-white/10">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/25">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Application Successfully Received
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{submittedReceipt.fullName}</strong>. Your candidate profile has been recorded for rolling admissions screening.
              </p>

              <div className="inline-block bg-black/60 text-cyan-300 px-4 py-2 rounded-xl font-mono text-xs border border-cyan-500/30">
                Candidate Reference ID: <span className="text-white font-bold">{submittedReceipt.id}</span>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="bg-black/40 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <span>Submitted Profile Summary</span>
                <span className="text-cyan-300 font-semibold">Under Review</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Candidate Name</span>
                  <strong className="text-slate-100">{submittedReceipt.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Contact Mobile</span>
                  <strong className="text-slate-100">+91 {submittedReceipt.mobile}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Institution / College</span>
                  <strong className="text-slate-100">{submittedReceipt.college}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Engineering Branch</span>
                  <strong className="text-slate-100">{submittedReceipt.branch}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Primary Selected Track</span>
                  <strong className="text-cyan-300">{submittedReceipt.primaryInterest}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Secondary Tracks</span>
                  <strong className="text-slate-100">
                    {submittedReceipt.secondaryInterests?.length
                      ? submittedReceipt.secondaryInterests.join(', ')
                      : 'None'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Preferred Duration &amp; Pace</span>
                  <strong className="text-slate-100">
                    {submittedReceipt.preferredDuration} • {submittedReceipt.weeklyHours}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Student ID Proof</span>
                  <strong className="text-slate-100 truncate block">
                    {submittedReceipt.idProofFileName || 'Uploaded'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Authoritative Evaluation Notice */}
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Next Steps &amp; Admissions Contact</span>
              </div>
              <p>
                Applications are screened on a rolling basis. Shortlisted candidates will be contacted via email or WhatsApp ({PROGRAM_CONSTANTS.POST_SUBMIT_WHATSAPP_NUMBER}) with cohort onboarding instructions. You may also write to{' '}
                <a href={PROGRAM_CONSTANTS.CONTACT_MAILTO} className="text-cyan-300 underline">
                  {PROGRAM_CONSTANTS.POST_SUBMIT_EMAIL}
                </a>
                .
              </p>
            </div>

            {/* Utilities: Download, Copy & Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadSummary}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Save Record (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetForNewApplication}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Submit Another Application</span>
              </button>
            </div>
          </div>
        ) : (
          /* Two-Step Form */
          <div className="bg-white/[0.025] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-7">
            <ProgressIndicator
              currentStep={currentStep}
              lastSaved={lastSaved}
              onStepClick={step => {
                if (step === 1) {
                  setCurrentStep(1);
                } else if (step === 2 && validateStep1(true)) {
                  setCurrentStep(2);
                }
              }}
              canNavigateToStep2={validateStep1(false)}
            />

            {noticeMessage && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-center justify-between gap-2 animate-fadeIn">
                <span>{noticeMessage}</span>
                <button
                  type="button"
                  onClick={() => setNoticeMessage(null)}
                  className="text-cyan-300 hover:text-white text-[11px] font-mono cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-rose-500/10 border border-rose-500/35 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1.5">
                  <label htmlFor="field-fullName" className="block text-xs font-semibold text-slate-200">
                    Full Name <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="field-fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="field-mobile" className="block text-xs font-semibold text-slate-200">
                      Mobile Number (WhatsApp preferred) <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono text-xs text-slate-300 border-r border-white/15 pr-2">
                        +91
                      </span>
                      <input
                        id="field-mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="9876543210"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-white/15 bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-email" className="block text-xs font-semibold text-slate-200">
                      Email Address <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                      <input
                        id="field-email"
                        type="email"
                        autoComplete="email"
                        placeholder="rahul@college.edu"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="field-college" className="block text-xs font-semibold text-slate-200">
                    College / University Name <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id="field-college"
                      type="text"
                      placeholder="e.g. Delhi Technological University / VIT / Anna University"
                      value={formData.college}
                      onChange={e => setFormData({ ...formData, college: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="field-branch" className="block text-xs font-semibold text-slate-200">
                      Branch / Specialization <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="field-branch"
                      type="text"
                      placeholder="e.g. Computer Science, ECE, Mechanical, IT"
                      value={formData.branch}
                      onChange={e => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-semester" className="block text-xs font-semibold text-slate-200">
                      Current Year / Semester <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="field-semester"
                        value={formData.semester}
                        onChange={e => setFormData({ ...formData, semester: e.target.value })}
                        className="w-full appearance-none px-4 pr-10 py-2.5 rounded-xl border border-white/15 bg-[#0C101C] focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white"
                      >
                        {SEMESTER_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label htmlFor="field-primaryInterest" className="block text-xs font-semibold text-slate-200">
                    Primary Area of Interest <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="field-primaryInterest"
                      value={formData.primaryInterest}
                      onChange={e => handlePrimaryChange(e.target.value)}
                      className="w-full appearance-none px-4 pr-10 py-2.5 rounded-xl border border-white/15 bg-[#0C101C] focus:outline-none focus:ring-2 focus:ring-cyan-400 text-xs sm:text-sm text-white"
                    >
                      {AREAS_OF_INTEREST.map(area => (
                        <option key={area.id} value={area.name}>
                          {area.name} — ({area.category})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="block text-xs font-semibold text-slate-200">
                      Secondary Interest Areas — select up to 2 <span className="text-slate-400 font-normal">(optional)</span>
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300">
                      {formData.secondaryInterests.length}/2 selected
                      {formData.secondaryInterests.length >= 2 ? ' (deselect one to change)' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AREAS_OF_INTEREST.map(area => {
                      const isPrimary = area.name === formData.primaryInterest;
                      const isSecondary = formData.secondaryInterests.includes(area.name);
                      const isLimitReached = !isSecondary && formData.secondaryInterests.length >= 2;

                      return (
                        <button
                          key={area.id}
                          type="button"
                          disabled={isPrimary || isLimitReached}
                          aria-pressed={isSecondary}
                          onClick={() => handleSecondaryToggle(area.name)}
                          className={`p-2 rounded-xl text-left text-xs border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                            isPrimary
                              ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                              : isSecondary
                              ? 'bg-blue-600/25 border-cyan-400 text-white font-medium cursor-pointer'
                              : isLimitReached
                              ? 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed'
                              : 'bg-black/35 border-white/10 text-slate-300 hover:text-white hover:border-white/25 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{area.name}</span>
                            {isPrimary ? (
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">Primary</span>
                            ) : isSecondary ? (
                              <span className="text-cyan-300 text-xs shrink-0">✓</span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Step 1 of 2 • Candidate Academic Profile &amp; Track Preferences
                  </span>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <span>Continue to Step 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} noValidate className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold text-slate-200">
                    Step 2 of 2: AI Background, Availability &amp; Verification
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Step 1</span>
                  </button>
                </div>

                {/* AI Proficiency Slider with Live Tier Feedback */}
                <div className="space-y-2.5 p-4 bg-black/35 rounded-2xl border border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label htmlFor="field-aiProficiency" className="block text-xs font-semibold text-slate-200">
                      AI Proficiency Self-Rating (1–10) <span className="text-cyan-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {currentTier.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                        {formData.aiProficiency} / 10
                      </span>
                    </div>
                  </div>

                  <input
                    id="field-aiProficiency"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formData.aiProficiency}
                    onChange={e => setFormData({ ...formData, aiProficiency: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>1 (Foundational)</span>
                    <span>5 (Practitioner)</span>
                    <span>10 (Advanced)</span>
                  </div>
                </div>

                {/* Previous Training */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-200">
                    Previous AI Training Sources <span className="text-slate-400 font-normal">(select all that apply)</span>
                  </span>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {PREVIOUS_TRAINING_OPTIONS.map((opt, i) => {
                      const checked = formData.previousTraining.includes(opt);
                      return (
                        <label
                          key={i}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'bg-blue-600/20 border-cyan-400/50 text-white'
                              : 'bg-black/35 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleTrainingToggle(opt)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-cyan-400"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  {formData.previousTraining.includes('Other') && (
                    <div className="pt-1 animate-fadeIn">
                      <label htmlFor="field-previousTrainingOther" className="sr-only">
                        Specify other AI training source
                      </label>
                      <input
                        id="field-previousTrainingOther"
                        type="text"
                        placeholder="Please specify your other AI training source..."
                        value={formData.previousTrainingOther || ''}
                        onChange={e => setFormData({ ...formData, previousTrainingOther: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* Prior AI learning details */}
                <div className="space-y-1.5">
                  <label htmlFor="field-priorLearningLinks" className="block text-xs font-semibold text-slate-200">
                    Prior AI Learning Description / Links <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="field-priorLearningLinks"
                    rows={2}
                    placeholder="Briefly describe AI tools, courses, or projects you have explored..."
                    value={formData.priorLearningLinks}
                    onChange={e => setFormData({ ...formData, priorLearningLinks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Duration & Weekly Commitment */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="field-preferredDuration" className="block text-xs font-semibold text-slate-200">
                      Preferred Internship Duration <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="field-preferredDuration"
                        value={formData.preferredDuration}
                        onChange={e => setFormData({ ...formData, preferredDuration: e.target.value as DurationOption })}
                        className="w-full appearance-none px-3.5 pr-10 py-2.5 rounded-xl border border-white/15 bg-[#0C101C] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="3 months">3 months</option>
                        <option value="6 months">6 months (Recommended)</option>
                        <option value="9 months">9 months</option>
                        <option value="12 months">12 months</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-weeklyHours" className="block text-xs font-semibold text-slate-200">
                      Weekly Time Commitment <span className="text-cyan-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="field-weeklyHours"
                        value={formData.weeklyHours}
                        onChange={e => setFormData({ ...formData, weeklyHours: e.target.value as WeeklyHoursOption })}
                        className="w-full appearance-none px-3.5 pr-10 py-2.5 rounded-xl border border-white/15 bg-[#0C101C] text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="Less than 5 hours">Less than 5 hours</option>
                        <option value="5–10 hours">5–10 hours</option>
                        <option value="10–15 hours">10–15 hours (Recommended)</option>
                        <option value="More than 15 hours">More than 15 hours</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Why join */}
                <div className="space-y-1.5">
                  <label htmlFor="field-whyJoin" className="block text-xs font-semibold text-slate-200">
                    Why do you want to join this program? <span className="text-cyan-400">*</span>
                  </label>
                  <textarea
                    id="field-whyJoin"
                    rows={3}
                    placeholder="Share your placement goals, areas you want to build in, and motivation..."
                    value={formData.whyJoin}
                    onChange={e => setFormData({ ...formData, whyJoin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                </div>

                {/* Portfolio Links */}
                <div className="space-y-1.5">
                  <label htmlFor="field-portfolioLinks" className="block text-xs font-semibold text-slate-200">
                    Links to GitHub, LinkedIn, or Portfolio <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="field-portfolioLinks"
                    type="text"
                    placeholder="https://linkedin.com/in/... or https://github.com/..."
                    value={formData.portfolioLinks}
                    onChange={e => setFormData({ ...formData, portfolioLinks: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Student ID Upload */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="field-idProof" className="block text-xs font-semibold text-slate-200">
                      Upload Student ID Proof <span className="text-cyan-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      JPG, PNG, PDF (Max 5 MB)
                    </span>
                  </div>

                  <input
                    id="field-idProof"
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {formData.idProofFileName && formData.idProofDataUrl ? (
                    <div className="p-3.5 bg-black/40 border border-cyan-500/35 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {formData.idProofPreviewUrl ? (
                          <img
                            src={formData.idProofPreviewUrl}
                            alt="Uploaded Student ID Preview"
                            className="w-10 h-10 object-cover rounded-lg border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/5 text-cyan-400 flex items-center justify-center shrink-0 border border-white/10">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-white truncate">
                            {formData.idProofFileName}
                          </div>
                          <div className="text-[11px] text-cyan-300 font-mono">
                            {formData.idProofFileSize
                              ? `${(formData.idProofFileSize / 1024).toFixed(1)} KB • Ready to upload`
                              : 'Ready to upload'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={removeUploadedFile}
                          aria-label="Remove uploaded ID proof"
                          className="p-1.5 rounded text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onDragEnter={() => setDragActive(true)}
                      onDragLeave={() => setDragActive(false)}
                      onDragOver={e => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        dragActive
                          ? 'border-cyan-400 bg-cyan-500/10'
                          : 'border-white/20 hover:border-cyan-400/60 bg-black/35'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <div className="text-xs font-semibold text-slate-100">
                        Click to upload or drag &amp; drop college ID proof
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Accepted: JPG, PNG, PDF up to 5 MB
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee Waiver Option */}
                <div className="p-4 bg-black/35 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        Do you wish to apply for a need-based fee waiver?
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Confidential evaluation for candidates experiencing genuine financial hardship.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto" role="group" aria-label="Fee waiver request">
                      <button
                        type="button"
                        aria-pressed={formData.applyFeeWaiver}
                        onClick={() => setFormData({ ...formData, applyFeeWaiver: true })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          formData.applyFeeWaiver
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-300 border border-white/10'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        aria-pressed={!formData.applyFeeWaiver}
                        onClick={() => setFormData({ ...formData, applyFeeWaiver: false, waiverReason: '' })}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !formData.applyFeeWaiver
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-slate-300 border border-white/10'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {formData.applyFeeWaiver && (
                    <div className="space-y-1.5 pt-2 animate-fadeIn">
                      <label htmlFor="field-waiverReason" className="block text-xs font-semibold text-slate-200">
                        Brief Justification for Fee Waiver <span className="text-cyan-400">*</span>
                      </label>
                      <textarea
                        id="field-waiverReason"
                        rows={2}
                        placeholder="Briefly explain your financial circumstances..."
                        value={formData.waiverReason || ''}
                        onChange={e => setFormData({ ...formData, waiverReason: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/50 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required={formData.applyFeeWaiver}
                      />
                    </div>
                  )}
                </div>

                {/* Referral Source */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-200">
                    How did you hear about this program?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {REFERRAL_SOURCES.map((source, i) => (
                      <label
                        key={i}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          formData.referralSource === source
                            ? 'bg-blue-600/20 border-cyan-400 text-white font-medium'
                            : 'bg-black/35 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="referralSource"
                          checked={formData.referralSource === source}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              referralSource: source,
                              referralSourceOther: source === 'Other' ? formData.referralSourceOther : '',
                            })
                          }
                          className="text-blue-600"
                        />
                        <span className="truncate">{source}</span>
                      </label>
                    ))}
                  </div>

                  {formData.referralSource === 'Other' && (
                    <div className="pt-1 animate-fadeIn">
                      <label htmlFor="field-referralSourceOther" className="sr-only">
                        Specify how you heard about this program
                      </label>
                      <input
                        id="field-referralSourceOther"
                        type="text"
                        placeholder="Please specify where you heard about us..."
                        value={formData.referralSourceOther || ''}
                        onChange={e => setFormData({ ...formData, referralSourceOther: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="pt-2">
                  <label htmlFor="field-agreedToTerms" className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      id="field-agreedToTerms"
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 shrink-0"
                    />
                    <span>
                      I confirm the details above are accurate and consent to OIIW contacting me regarding my application. My uploaded Student ID will be used strictly for admissions verification.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Step 1</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
