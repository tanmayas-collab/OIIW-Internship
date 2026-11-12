export interface AreaOfInterest {
  id: string;
  name: string;
  category: 'Tech & Code' | 'Marketing & Growth' | 'Business & Ops' | 'Content & Media';
  tagline: string;
  whatYouMayWorkOn: string;
  badge?: string;
  iconName: string;
}

export type DurationOption = '3 months' | '6 months' | '9 months' | '12 months';
export type WeeklyHoursOption = 'Less than 5 hours' | '5–10 hours' | '10–15 hours' | 'More than 15 hours';

export interface ApplicationFormData {
  // Step 1
  fullName: string;
  mobile: string;
  email: string;
  college: string;
  branch: string;
  semester: string;
  primaryInterest: string;
  secondaryInterests: string[];

  // Step 2
  aiProficiency: number;
  previousTraining: string[];
  previousTrainingOther?: string;
  priorLearningLinks: string;
  preferredDuration: DurationOption;
  weeklyHours: WeeklyHoursOption;
  whyJoin: string;
  portfolioLinks: string;
  idProofFile: File | null;
  idProofFileName?: string;
  idProofFileSize?: number;
  idProofPreviewUrl?: string;
  idProofDataUrl?: string;
  applyFeeWaiver: boolean;
  waiverReason?: string;
  referralSource: string;
  referralSourceOther?: string;
  agreedToTerms: boolean;
}

export interface SubmittedApplicationReceipt {
  id: string;
  submittedAt: string;
  fullName: string;
  mobile: string;
  email: string;
  college: string;
  branch: string;
  primaryInterest: string;
  secondaryInterests: string[];
  preferredDuration: string;
  weeklyHours: string;
  applyFeeWaiver: boolean;
  idProofFileName?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Eligibility & Coding' | 'Fees & Waiver' | 'Internship & Projects';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
