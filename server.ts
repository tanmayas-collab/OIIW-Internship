import express, { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer, { type Transporter } from 'nodemailer';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');
const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_FILE = path.resolve(__dirname, 'applications_store.json');
const CSV_FILE = path.resolve(__dirname, 'applications_db.csv');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const ADMISSIONS_EMAIL = process.env.ADMISSIONS_EMAIL || 'ceo@aarogita.com';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

// Admin authentication configuration (fail-closed in production)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const HAS_CONFIGURED_ADMIN_PASSWORD = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim());
const ADMIN_PASSWORD = HAS_CONFIGURED_ADMIN_PASSWORD
  ? process.env.ADMIN_PASSWORD!.trim()
  : IS_PRODUCTION
  ? ''
  : crypto.randomBytes(12).toString('hex');
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');
const ADMIN_COOKIE_NAME = 'oiiw_admin_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

interface ApplicationRecord {
  id: string;
  submittedAt: string;
  fullName: string;
  mobile: string;
  email: string;
  college: string;
  branch: string;
  semester: string;
  primaryInterest: string;
  secondaryInterests: string[];
  aiProficiency: number;
  previousTraining: string[];
  priorLearningLinks: string;
  preferredDuration: string;
  weeklyHours: string;
  whyJoin: string;
  portfolioLinks: string;
  idProofFileName?: string;
  idProofFileSize?: number;
  idProofStoredFile?: string;
  applyFeeWaiver: boolean;
  waiverReason?: string;
  referralSource: string;
}

const CSV_HEADERS = [
  'Application ID',
  'Submission Timestamp',
  'Full Name',
  'Mobile Number',
  'Email Address',
  'College / University',
  'Branch / Specialization',
  'Semester',
  'Primary Area of Interest',
  'Secondary Interests',
  'AI Proficiency (1-10)',
  'Previous AI Training',
  'Prior Learning Details',
  'Preferred Duration',
  'Weekly Commitment',
  'Why Join Statement',
  'Portfolio / Profile Links',
  'Fee Waiver Requested',
  'Fee Waiver Reason',
  'Referral Source',
  'ID Proof File Name',
];

function escapeHtml(val: unknown): string {
  const str = val === undefined || val === null ? '' : String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCsv(val: unknown): string {
  let str = val === undefined || val === null ? '' : String(val);
  str = str.replace(/\r?\n/g, ' ').trim();
  // Neutralize spreadsheet formula injection (including leading +91 phone numbers)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

function safeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = part.slice(0, eqIndex).trim();
    const val = part.slice(eqIndex + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

function signSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expiresAt })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || !ADMIN_PASSWORD) return false;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return false;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqual(sig, expectedSig)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return (
      typeof decoded?.u === 'string' &&
      safeEqual(decoded.u, ADMIN_USERNAME) &&
      typeof decoded?.exp === 'number' &&
      decoded.exp > Date.now()
    );
  } catch {
    return false;
  }
}

function isRequestAuthenticated(req: Request): boolean {
  if (!ADMIN_PASSWORD) return false;

  const cookies = parseCookies(req.headers.cookie);
  if (verifySessionToken(cookies[ADMIN_COOKIE_NAME])) {
    return true;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  if (authHeader.startsWith('Bearer ')) {
    return safeEqual(authHeader.slice(7).trim(), ADMIN_PASSWORD);
  }

  if (authHeader.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(authHeader.slice(6).trim(), 'base64').toString('utf-8');
      const colonIdx = decoded.indexOf(':');
      if (colonIdx <= 0) return false;
      const user = decoded.slice(0, colonIdx);
      const pass = decoded.slice(colonIdx + 1);
      return safeEqual(user, ADMIN_USERNAME) && safeEqual(pass, ADMIN_PASSWORD);
    } catch {
      return false;
    }
  }

  return false;
}

function requireAdminApiAuth(req: Request, res: Response, next: NextFunction): void {
  if (IS_PRODUCTION && !HAS_CONFIGURED_ADMIN_PASSWORD) {
    res.status(503).json({ error: 'Admin access is not configured on the server.' });
    return;
  }
  if (!isRequestAuthenticated(req)) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  next();
}

function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, number[]>();

  const cleanupInterval = setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, timestamps] of hits.entries()) {
      const fresh = timestamps.filter(ts => ts > cutoff);
      if (fresh.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, fresh);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));
  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const cutoff = now - windowMs;
    const recent = (hits.get(ip) || []).filter(ts => ts > cutoff);

    if (recent.length >= maxRequests) {
      res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
      return;
    }

    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}

function loadStoredApplications(): ApplicationRecord[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Could not read applications_store.json, starting with empty store:', err);
  }
  return [];
}

function formatCsvRow(app: ApplicationRecord): string {
  return [
    escapeCsv(app.id),
    escapeCsv(app.submittedAt),
    escapeCsv(app.fullName),
    escapeCsv(`+91 ${app.mobile}`),
    escapeCsv(app.email),
    escapeCsv(app.college),
    escapeCsv(app.branch),
    escapeCsv(app.semester),
    escapeCsv(app.primaryInterest),
    escapeCsv((app.secondaryInterests || []).join('; ')),
    escapeCsv(app.aiProficiency),
    escapeCsv((app.previousTraining || []).join('; ')),
    escapeCsv(app.priorLearningLinks),
    escapeCsv(app.preferredDuration),
    escapeCsv(app.weeklyHours),
    escapeCsv(app.whyJoin),
    escapeCsv(app.portfolioLinks),
    escapeCsv(app.applyFeeWaiver ? 'YES' : 'NO'),
    escapeCsv(app.waiverReason || 'N/A'),
    escapeCsv(app.referralSource),
    escapeCsv(app.idProofFileName || 'None'),
  ].join(',');
}

function atomicWriteFile(filePath: string, content: string): void {
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, content, 'utf-8');
  fs.renameSync(tempPath, filePath);
}

function rebuildCsvDatabase(apps: ApplicationRecord[]): void {
  try {
    const headerLine = CSV_HEADERS.map(h => `"${h}"`).join(',');
    const rows = [...apps].reverse().map(formatCsvRow);
    const csvContent = [headerLine, ...rows].join('\n') + '\n';
    atomicWriteFile(CSV_FILE, csvContent);
  } catch (err) {
    console.error('Failed to write CSV database:', err);
  }
}

let persistenceChain: Promise<void> = Promise.resolve();

function persistApplications(apps: ApplicationRecord[]): Promise<void> {
  const snapshot = [...apps];
  persistenceChain = persistenceChain
    .then(() => {
      atomicWriteFile(DATA_FILE, JSON.stringify(snapshot, null, 2));
      rebuildCsvDatabase(snapshot);
    })
    .catch(err => {
      console.error('Persistence failure:', err);
    });
  return persistenceChain;
}

function saveUploadedIdProof(
  appId: string,
  originalFileName: string,
  dataUrl: string
): { storedFileName: string; safeOriginalName: string; byteSize: number } {
  const match = dataUrl.match(/^data:(image\/jpeg|image\/jpg|image\/png|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error('Invalid Student ID format. Accepted formats: JPG, PNG, or PDF.');
  }

  const mime = match[1];
  const base64Payload = match[2];
  const buffer = Buffer.from(base64Payload, 'base64');

  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error('Student ID file must be non-empty and under 5 MB.');
  }

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  };
  const ext = extMap[mime] || 'bin';
  const storedFileName = `${appId}.${ext}`;
  const safeOriginalName = path.basename(originalFileName).replace(/[^\w.\- ]/g, '_').slice(0, 120) || storedFileName;

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  fs.writeFileSync(path.resolve(UPLOADS_DIR, storedFileName), buffer);
  return { storedFileName, safeOriginalName, byteSize: buffer.length };
}

// Initialize store and keep JSON + CSV synchronized
const applications: ApplicationRecord[] = loadStoredApplications();
rebuildCsvDatabase(applications);

// Optional SMTP Transport
let mailTransporter: Transporter | null = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (e) {
    console.warn('SMTP transporter configuration failed:', e);
  }
}

// System Knowledge Base for Gemini Chatbot (aligned with frontend content.ts)
const OIIW_SYSTEM_INSTRUCTION = `
You are the official "OIIW Admissions Counselor" — an authoritative, clear, and helpful technical advisor for the OIIW AI Internship + Training Program.
Target Audience: Final-Year B.Tech Students (Semesters 7/8 or Dual Degree) and recent 2026 graduates preparing for engineering placements and AI careers.

CORE PROGRAM FACTS:
- Program Name: OIIW AI Internship + Training Program
- Industry Collaboration: Offered in collaboration with a Gurugram-based Pvt. Ltd. Partner (342P, Sector 38, Gurugram – 122001). Students work on guided, client-aligned project deliverables mentored by practitioners.
- Tracks: 13 specialized domains across Agentic AI Solutions, Vibe Coding, App Development, AI Automation, Data & Analytics, Product & UX, AI for Marketing, AI for Sales, Content Development, AI Video Generation, Research & Analysis, Business Operations, and Training & EdTech. Candidates select 1 primary track and up to 2 secondary tracks.
- Duration & Commitment: 3, 6, 9, or 12 months (Online / Hybrid), with a recommended commitment of 10–15 hours/week.
- Selection Process (3 Stages):
  1. Submit Application: Free 2-step profile form on the website (₹0 upfront registration fee).
  2. Rolling Screening: Admissions team evaluates academic profile, track fit, and commitment.
  3. Admission & Onboarding: Selected candidates receive enrollment instructions; tuition applies only if admitted and enrolled.
- Tuition & Financial Aid:
  * Subsidized Cohort Tuition: ₹996 per month (53% off standard ₹2,100/month) for applications submitted by November 30.
  * Need-Based Fee Waiver: Confidentially evaluated case-by-case in Step 2 of the application without affecting selection review.
- Certification & Career Support:
  * Verified Internship Certification awarded upon completion and review of assigned project deliverables.
  * Top performers may be considered for paid internship roles within OIIW's client network.
- Direct Contact: ${ADMISSIONS_EMAIL} or WhatsApp +91 70500 02000.

TONE:
- Professional, concise, objective, and accurate. Avoid salesy hype or exclamation spam.
`;

function getSmartFallbackResponse(userPrompt: string): string {
  const q = userPrompt.toLowerCase();

  if (q.includes('waiver') || q.includes('financial') || q.includes('hardship') || q.includes('scholarship')) {
    return `**Need-Based Fee Waiver:**
• Candidates experiencing genuine financial hardship can select **Yes** under Fee Waiver in Step 2 and provide a brief justification.
• Waiver requests are reviewed confidentially on a case-by-case basis and do **not** prejudice your admissions evaluation.`;
  }

  if (q.includes('fee') || q.includes('cost') || q.includes('price') || q.includes('₹') || q.includes('996') || q.includes('2100') || q.includes('tuition') || q.includes('pay')) {
    return `**Cohort Tuition & Payment Timing:**
• **Application Fee:** ₹0 upfront. You pay only if you are shortlisted and decide to enroll.
• **Subsidized Cohort Tuition:** ₹996/month (53% off the standard ₹2,100/month rate) for applications submitted by November 30.
• **Fee Waiver:** Need-based financial assistance can be requested confidentially in Step 2.`;
  }

  if (q.includes('duration') || q.includes('month') || q.includes('hour') || q.includes('time') || q.includes('schedule')) {
    return `**Duration & Weekly Commitment:**
• Choose from **3, 6, 9, or 12 months** (6 months is the most popular track).
• Format is **Online / Hybrid** with a recommended **10–15 hours/week** schedule designed to fit alongside final-year classes and placement preparation.`;
  }

  if (q.includes('gurugram') || q.includes('partner') || q.includes('company') || q.includes('oiiw') || q.includes('address')) {
    return `**About OIIW & Gurugram Collaboration:**
• OIIW undertakes AI and automation projects for clients and trains students through guided project deliverables.
• This cohort runs in collaboration with a **Gurugram-based Pvt. Ltd. Partner** (342P, Sector 38, Gurugram – 122001).`;
  }

  if (q.includes('coding') || q.includes('code') || q.includes('python') || q.includes('branch') || q.includes('eligibility') || q.includes('who can')) {
    return `**Eligibility & Technical Background:**
• Open to **final-year B.Tech students** (Semesters 7/8, Dual Degree) and **recent 2026 graduates** across all engineering branches.
• Technical builders focus on **Agentic AI Solutions**, **Vibe Coding**, **App Development**, **AI Automation**, and **Data & Analytics**.
• Non-coding tracks are also available across **AI Marketing**, **AI Sales**, **Product & UX**, **Content**, and **Business Operations**.`;
  }

  if (q.includes('vibe coding') || q.includes('vibe') || q.includes('agentic') || q.includes('agent') || q.includes('scope')) {
    return `**Technical Scope — Agentic AI & Vibe Coding:**
• **Agentic AI Solutions:** Design multi-step autonomous reasoning workflows that integrate external tools and APIs.
• **Vibe Coding:** Prompt-driven rapid software prototyping using modern AI coding models, emphasizing system architecture and product iteration.`;
  }

  if (q.includes('certificate') || q.includes('placement') || q.includes('job') || q.includes('paid') || q.includes('deliverable') || q.includes('evaluat')) {
    return `**Deliverables, Certification & Placement Support:**
• **Client-Aligned Deliverables:** Work on guided workflows, prompt pipelines, and functional prototypes reviewed weekly by practitioners.
• **Verified Internship Certification:** Awarded upon successful completion and review of required deliverables.
• **Client Network Referrals:** Top performers may be considered for paid internship roles within OIIW's client network.`;
  }

  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('whatsapp')) {
    return `**Admissions Contact:**
• Email: **${ADMISSIONS_EMAIL}**
• WhatsApp: **+91 70500 02000**
• Submit your 2-step profile directly via the application form on this page.`;
  }

  return `Welcome to the OIIW AI Internship + Training Program admissions desk.
Offered in collaboration with our Gurugram-based Pvt. Ltd. Partner, this program equips final-year B.Tech students and 2026 graduates with guided client AI deliverables across 13 tracks.
Ask about **tracks**, **tuition & waivers**, **durations**, **eligibility**, or **certification**.`;
}

function renderAdminLoginPage(errorMessage?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OIIW Admissions Console • Sign In</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #080B13; color: #E2E8F0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { width: 100%; max-width: 400px; background: #0D1220; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 28px; box-shadow: 0 24px 48px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; font-weight: 800; color: #FFF; margin-bottom: 6px; }
    p { font-size: 13px; color: #94A3B8; margin-bottom: 20px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #CBD5E1; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15); background: #080B13; color: #FFF; font-size: 14px; margin-bottom: 14px; }
    input:focus { outline: none; border-color: #38BDF8; }
    button { width: 100%; padding: 11px; border: none; border-radius: 10px; background: #2563EB; color: #FFF; font-size: 14px; font-weight: 700; cursor: pointer; }
    button:hover { background: #1D4ED8; }
    .err { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35); color: #FCA5A5; padding: 10px 12px; border-radius: 10px; font-size: 12px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>OIIW Admissions Console</h1>
    <p>Administrator authentication is required to view candidate records.</p>
    ${errorMessage ? `<div class="err">${escapeHtml(errorMessage)}</div>` : ''}
    <form method="POST" action="/admin/login">
      <label for="username">Username</label>
      <input id="username" name="username" type="text" autocomplete="username" required value="${escapeHtml(ADMIN_USERNAME)}">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
      <button type="submit">Sign In</button>
    </form>
  </div>
</body>
</html>`;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  const chatRateLimiter = createRateLimiter(60 * 1000, 30);
  const submitRateLimiter = createRateLimiter(60 * 1000, 10);
  const loginRateLimiter = createRateLimiter(15 * 60 * 1000, 15);

  // Gemini AI client initialization
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }

  // Chatbot API Endpoint
  app.post('/api/chat', chatRateLimiter, async (req: Request, res: Response) => {
    try {
      const { message, history } = req.body || {};

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const trimmedMessage = message.trim().slice(0, 1000);

      if (ai && process.env.GEMINI_API_KEY) {
        try {
          const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-6)) {
              if (h && typeof h.text === 'string' && h.text.trim()) {
                contents.push({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text.trim().slice(0, 1000) }],
                });
              }
            }
          }

          contents.push({
            role: 'user',
            parts: [{ text: trimmedMessage }],
          });

          const geminiResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: OIIW_SYSTEM_INSTRUCTION,
            },
          });

          const replyText = geminiResponse.text || getSmartFallbackResponse(trimmedMessage);
          res.json({ reply: replyText });
          return;
        } catch (apiError: unknown) {
          const errMsg = apiError instanceof Error ? apiError.message : String(apiError);
          console.warn('Gemini API call failed, falling back to local knowledge base:', errMsg);
          res.json({ reply: getSmartFallbackResponse(trimmedMessage) });
          return;
        }
      }

      res.json({ reply: getSmartFallbackResponse(trimmedMessage) });
    } catch (error) {
      console.error('Server error in /api/chat:', error);
      res.status(500).json({
        reply: `I am experiencing a brief connection issue. You can still submit your application on this page or email ${ADMISSIONS_EMAIL}.`,
      });
    }
  });

  // Application Submission API Endpoint
  app.post('/api/submit-application', submitRateLimiter, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};

      const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
      const mobile = typeof body.mobile === 'string' ? body.mobile.replace(/\D/g, '') : '';
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const college = typeof body.college === 'string' ? body.college.trim() : '';
      const branch = typeof body.branch === 'string' ? body.branch.trim() : '';
      const primaryInterest = typeof body.primaryInterest === 'string' ? body.primaryInterest.trim() : '';
      const whyJoin = typeof body.whyJoin === 'string' ? body.whyJoin.trim() : '';
      const applyFeeWaiver = Boolean(body.applyFeeWaiver);
      const waiverReason = typeof body.waiverReason === 'string' ? body.waiverReason.trim() : '';

      if (fullName.length < 2) {
        res.status(400).json({ error: 'Please provide your full name (at least 2 characters).' });
        return;
      }
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        res.status(400).json({ error: 'Please provide a valid 10-digit Indian mobile number.' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        res.status(400).json({ error: 'Please provide a valid email address.' });
        return;
      }
      if (college.length < 2 || branch.length < 2 || !primaryInterest) {
        res.status(400).json({ error: 'College, branch, and primary area of interest are required.' });
        return;
      }
      if (whyJoin.length < 15) {
        res.status(400).json({ error: 'Please write at least 15 characters explaining why you want to join.' });
        return;
      }
      if (applyFeeWaiver && waiverReason.length < 10) {
        res.status(400).json({ error: 'Please provide a brief reason for your fee waiver request.' });
        return;
      }
      if (body.agreedToTerms !== true) {
        res.status(400).json({ error: 'You must agree to the verification and contact terms before submitting.' });
        return;
      }
      if (typeof body.idProofDataUrl !== 'string' || !body.idProofDataUrl || typeof body.idProofFileName !== 'string') {
        res.status(400).json({ error: 'Please upload your Student ID proof (JPG, PNG, or PDF, max 5 MB).' });
        return;
      }

      const appId = `OIIW-${new Date().getFullYear()}-${crypto.randomInt(10000, 100000)}`;

      let savedProof: { storedFileName: string; safeOriginalName: string; byteSize: number };
      try {
        savedProof = saveUploadedIdProof(appId, body.idProofFileName, body.idProofDataUrl);
      } catch (uploadErr: unknown) {
        const msg = uploadErr instanceof Error ? uploadErr.message : 'Invalid Student ID upload.';
        res.status(400).json({ error: msg });
        return;
      }

      const rawProficiency = parseInt(String(body.aiProficiency), 10);
      const aiProficiency = Number.isFinite(rawProficiency) ? Math.min(10, Math.max(1, rawProficiency)) : 5;

      const secondaryInterests = Array.isArray(body.secondaryInterests)
        ? body.secondaryInterests
            .filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0 && item !== primaryInterest)
            .slice(0, 2)
        : [];

      const previousTraining = Array.isArray(body.previousTraining)
        ? body.previousTraining.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];

      const application: ApplicationRecord = {
        id: appId,
        submittedAt: new Date().toISOString(),
        fullName,
        mobile,
        email,
        college,
        branch,
        semester: typeof body.semester === 'string' && body.semester.trim() ? body.semester.trim() : 'Final year / Semester 7',
        primaryInterest,
        secondaryInterests,
        aiProficiency,
        previousTraining,
        priorLearningLinks: typeof body.priorLearningLinks === 'string' ? body.priorLearningLinks.trim() : '',
        preferredDuration: typeof body.preferredDuration === 'string' && body.preferredDuration.trim() ? body.preferredDuration.trim() : '6 months',
        weeklyHours: typeof body.weeklyHours === 'string' && body.weeklyHours.trim() ? body.weeklyHours.trim() : '10–15 hours',
        whyJoin,
        portfolioLinks: typeof body.portfolioLinks === 'string' ? body.portfolioLinks.trim() : '',
        idProofFileName: savedProof.safeOriginalName,
        idProofFileSize: savedProof.byteSize,
        idProofStoredFile: savedProof.storedFileName,
        applyFeeWaiver,
        waiverReason: applyFeeWaiver ? waiverReason : '',
        referralSource: typeof body.referralSource === 'string' && body.referralSource.trim() ? body.referralSource.trim() : 'Website',
      };

      applications.unshift(application);
      await persistApplications(applications);

      // Optional Google Sheets Webhook forwarding
      if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
        fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(application),
          signal: AbortSignal.timeout(6000),
        }).catch(err => console.warn('Google Sheets Webhook dispatch note:', err));
      }

      // Prepare email notification text
      const emailSubject = `[NEW APPLICATION] ${appId} - ${application.fullName} (${application.college})`;
      const emailBody = `
NEW OIIW AI INTERNSHIP APPLICATION RECEIVED
============================================================
Application ID:      ${appId}
Submission Date:     ${application.submittedAt}

APPLICANT PROFILE:
------------------------------------------------------------
Full Name:           ${application.fullName}
Mobile Number:       +91 ${application.mobile}
Email Address:       ${application.email}
College/University:  ${application.college}
Branch/Spec:         ${application.branch}
Current Semester:    ${application.semester}

PROGRAM PREFERENCES:
------------------------------------------------------------
Primary Track:       ${application.primaryInterest}
Secondary Tracks:    ${application.secondaryInterests.join(', ') || 'None'}
Duration:            ${application.preferredDuration}
Weekly Commitment:   ${application.weeklyHours}
AI Proficiency:      ${application.aiProficiency} / 10
Prior Training:      ${application.previousTraining.join(', ') || 'None'}
Prior Learning:      ${application.priorLearningLinks || 'None provided'}
Why Join:            ${application.whyJoin}
Portfolio/Links:     ${application.portfolioLinks || 'None provided'}
Student ID Proof:    ${application.idProofFileName} (${((application.idProofFileSize || 0) / 1024).toFixed(1)} KB)
Fee Waiver:          ${application.applyFeeWaiver ? 'YES - REASON: ' + application.waiverReason : 'NO'}
Referral Source:     ${application.referralSource}

Destination Mailbox: ${ADMISSIONS_EMAIL}
============================================================
      `.trim();

      console.log(`📬 [APPLICATION RECORDED] ${appId} (${application.fullName}) -> ${ADMISSIONS_EMAIL}`);

      // Asynchronous outbound email dispatch (best-effort)
      (async () => {
        try {
          const mailPayload = {
            _subject: emailSubject,
            _template: 'table',
            _captcha: 'false',
            _replyto: application.email,
            'Application ID': appId,
            'Full Name': application.fullName,
            'Mobile': `+91 ${application.mobile}`,
            'Email': application.email,
            'College': application.college,
            'Branch': application.branch,
            'Semester': application.semester,
            'Primary Track': application.primaryInterest,
            'Secondary Tracks': application.secondaryInterests.join(', ') || 'None',
            'Preferred Duration': application.preferredDuration,
            'Weekly Hours': application.weeklyHours,
            'AI Proficiency': `${application.aiProficiency} / 10`,
            'Fee Waiver': application.applyFeeWaiver ? `YES - ${application.waiverReason}` : 'NO',
            'Why Join': application.whyJoin,
            'Portfolio Links': application.portfolioLinks || 'None',
            'Student ID File': application.idProofFileName || 'None',
            'Referral': application.referralSource || 'Direct',
          };

          const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(ADMISSIONS_EMAIL)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(mailPayload),
            signal: AbortSignal.timeout(6000),
          });
          const formSubmitData: { success?: string; message?: string } | null = await formSubmitRes.json().catch(() => null);
          if (formSubmitData && formSubmitData.success !== 'false') {
            console.log(`✅ Automated HTTPS email dispatched to ${ADMISSIONS_EMAIL} for ${appId}`);
          } else {
            console.log('ℹ️ FormSubmit delivery note:', formSubmitData?.message || formSubmitRes.status);
          }
        } catch (httpMailErr) {
          console.warn('Automated HTTPS mail dispatch attempt failed:', httpMailErr);
        }

        if (mailTransporter) {
          try {
            await mailTransporter.sendMail({
              from: process.env.SMTP_FROM || 'admissions@oiiw.org',
              to: ADMISSIONS_EMAIL,
              replyTo: application.email,
              subject: emailSubject,
              text: emailBody,
            });
            console.log(`✅ SMTP email sent to ${ADMISSIONS_EMAIL} for ${appId}`);
          } catch (sendError) {
            console.warn('SMTP delivery attempt failed:', sendError);
          }
        }
      })();

      res.status(200).json({
        success: true,
        applicationId: appId,
        message: 'Application recorded successfully in admissions review queue.',
      });
    } catch (err) {
      console.error('Application submission error:', err);
      res.status(500).json({ error: 'Failed to record application. Please try again.' });
    }
  });

  // Admin Login / Logout routes
  app.post('/admin/login', loginRateLimiter, (req: Request, res: Response) => {
    if (IS_PRODUCTION && !HAS_CONFIGURED_ADMIN_PASSWORD) {
      res.status(503).send('Admin access is disabled until ADMIN_PASSWORD is configured.');
      return;
    }

    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD)) {
      const token = signSessionToken(username);
      res.cookie(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: IS_PRODUCTION,
        maxAge: SESSION_TTL_MS,
        path: '/',
      });
      res.redirect('/admin');
      return;
    }

    res.status(401).setHeader('Content-Type', 'text/html');
    res.send(renderAdminLoginPage('Invalid username or password.'));
  });

  app.post('/admin/logout', (_req: Request, res: Response) => {
    res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
    res.redirect('/admin');
  });

  // Private Admin Database Console (Protected)
  app.get('/admin', (req: Request, res: Response) => {
    if (IS_PRODUCTION && !HAS_CONFIGURED_ADMIN_PASSWORD) {
      res.status(503).setHeader('Content-Type', 'text/html');
      res.send(renderAdminLoginPage('Admin console is disabled in production until ADMIN_PASSWORD is set.'));
      return;
    }

    if (!isRequestAuthenticated(req)) {
      res.status(401).setHeader('Content-Type', 'text/html');
      res.send(renderAdminLoginPage());
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OIIW Admissions Database • Administrator Console</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #080B13; color: #E2E8F0; padding: 24px; }
    .container { max-width: 1440px; margin: 0 auto; }
    .header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .title-area h1 { font-size: 24px; font-weight: 800; color: #FFF; }
    .title-area p { font-size: 13px; color: #94A3B8; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: #2563EB; color: #FFF; }
    .btn-primary:hover { background: #1D4ED8; }
    .btn-success { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .btn-success:hover { background: rgba(16, 185, 129, 0.25); }
    .btn-ghost { background: rgba(255,255,255,0.06); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.12); }
    .btn-ghost:hover { background: rgba(255,255,255,0.12); color: #FFF; }
    .search-box { width: 100%; margin-bottom: 20px; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; color: #FFF; font-size: 14px; font-family: inherit; }
    .search-box:focus { outline: none; border-color: #38BDF8; }
    .table-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow-x: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 1000px; }
    th { text-align: left; padding: 14px 16px; background: rgba(255,255,255,0.03); color: #94A3B8; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.08); }
    td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; }
    tr:hover { background: rgba(255,255,255,0.02); }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .badge-track { background: rgba(56, 189, 248, 0.1); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.25); }
    .badge-waiver-yes { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-waiver-no { background: rgba(255, 255, 255, 0.05); color: #94A3B8; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .empty-state { text-align: center; padding: 60px 20px; color: #94A3B8; font-size: 14px; }
    .proof-link { color: #38BDF8; text-decoration: underline; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-area">
        <h1>OIIW Admissions Database</h1>
        <p>Total Registered Applications: <strong>${applications.length}</strong> • Synced JSON Store &amp; CSV</p>
      </div>
      <div class="actions">
        <a href="/api/export-csv" download class="btn btn-success">Download CSV</a>
        <a href="/admin" class="btn btn-primary">Refresh</a>
        <form method="POST" action="/admin/logout" style="display:inline;">
          <button type="submit" class="btn btn-ghost">Sign Out</button>
        </form>
      </div>
    </div>

    <input type="text" id="searchInput" class="search-box" placeholder="Search by student name, college, email, mobile, or track..." oninput="filterTable()">

    <div class="table-card">
      <table id="appsTable">
        <thead>
          <tr>
            <th>ID / Date</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>College &amp; Branch</th>
            <th>Tracks</th>
            <th>Duration</th>
            <th>AI Score</th>
            <th>Waiver</th>
            <th>Student ID Proof</th>
          </tr>
        </thead>
        <tbody>
          ${
            applications.length === 0
              ? '<tr><td colspan="9" class="empty-state">No student applications recorded yet.</td></tr>'
              : applications
                  .map(app => {
                    const formattedDate = new Date(app.submittedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });
                    const secondary =
                      app.secondaryInterests && app.secondaryInterests.length > 0
                        ? `<div style="color:#94A3B8;font-size:10px;margin-top:4px;">+ ${escapeHtml(app.secondaryInterests.join(', '))}</div>`
                        : '';
                    const waiverCell = app.applyFeeWaiver
                      ? `<span class="badge badge-waiver-yes" title="${escapeHtml(app.waiverReason || '')}">YES</span><div style="color:#FCA5A5;font-size:10px;margin-top:4px;max-width:160px;">${escapeHtml(app.waiverReason || '')}</div>`
                      : '<span class="badge badge-waiver-no">NO</span>';
                    const idProofCell = app.idProofStoredFile
                      ? `<a class="proof-link" href="/admin/id-proof/${encodeURIComponent(app.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(app.idProofFileName || 'View File')}</a>`
                      : `<span style="color:#94A3B8;font-size:11px;">${escapeHtml(app.idProofFileName || 'None')}</span>`;

                    return `
            <tr>
              <td>
                <span class="mono" style="color:#38BDF8;font-weight:700;">${escapeHtml(app.id)}</span>
                <div style="color:#94A3B8;font-size:10px;margin-top:3px;">${escapeHtml(formattedDate)}</div>
              </td>
              <td>
                <strong style="color:#FFF;font-size:13px;">${escapeHtml(app.fullName)}</strong>
                <div style="color:#94A3B8;font-size:11px;margin-top:2px;">${escapeHtml(app.semester || 'Final Year')}</div>
              </td>
              <td>
                <div class="mono" style="color:#E2E8F0;">+91 ${escapeHtml(app.mobile)}</div>
                <div style="color:#94A3B8;font-size:11px;margin-top:2px;">${escapeHtml(app.email)}</div>
              </td>
              <td>
                <div style="color:#E2E8F0;">${escapeHtml(app.college)}</div>
                <div style="color:#94A3B8;font-size:11px;margin-top:2px;">${escapeHtml(app.branch)}</div>
              </td>
              <td>
                <span class="badge badge-track">${escapeHtml(app.primaryInterest)}</span>
                ${secondary}
              </td>
              <td>
                <span style="color:#FFF;font-weight:600;">${escapeHtml(app.preferredDuration)}</span>
                <div style="color:#94A3B8;font-size:10px;">${escapeHtml(app.weeklyHours)}</div>
              </td>
              <td>
                <span class="mono" style="color:#FBBF24;font-weight:700;">${escapeHtml(app.aiProficiency)}</span> / 10
              </td>
              <td>${waiverCell}</td>
              <td>${idProofCell}</td>
            </tr>`;
                  })
                  .join('')
          }
        </tbody>
      </table>
    </div>
  </div>

  <script>
    function filterTable() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.querySelectorAll('#appsTable tbody tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });

  // Protected Student ID Proof Download Endpoint
  app.get('/admin/id-proof/:id', requireAdminApiAuth, (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
      res.status(400).json({ error: 'Invalid application ID.' });
      return;
    }

    const record = applications.find(a => a.id === id);
    if (!record || !record.idProofStoredFile) {
      res.status(404).json({ error: 'Uploaded ID proof not found for this application.' });
      return;
    }

    const safeFileName = path.basename(record.idProofStoredFile);
    const fullPath = path.resolve(UPLOADS_DIR, safeFileName);
    if (!fullPath.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'Stored file missing on disk.' });
      return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"`);
    res.sendFile(fullPath);
  });

  // Protected CSV Export Endpoint
  app.get('/api/export-csv', requireAdminApiAuth, (_req: Request, res: Response) => {
    rebuildCsvDatabase(applications);
    if (fs.existsSync(CSV_FILE)) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="oiiw_applications_google_sheets.csv"');
      res.sendFile(CSV_FILE);
    } else {
      res.status(404).json({ error: 'No applications CSV available yet.' });
    }
  });

  // Protected JSON Applications Endpoint
  app.get('/api/applications', requireAdminApiAuth, (_req: Request, res: Response) => {
    res.json({
      total: applications.length,
      applications,
    });
  });

  // Health check endpoint (non-sensitive operational summary only)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      totalApplications: applications.length,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasSmtpConfigured: Boolean(mailTransporter),
      adminConfigured: IS_PRODUCTION ? HAS_CONFIGURED_ADMIN_PASSWORD : true,
    });
  });

  // Return JSON 404 for unknown API endpoints instead of falling through to SPA HTML
  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Mount Vite or static production server
  if (IS_PRODUCTION) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OIIW Server running on http://0.0.0.0:${PORT} (${IS_PRODUCTION ? 'production' : 'development'})`);
    if (!HAS_CONFIGURED_ADMIN_PASSWORD) {
      if (IS_PRODUCTION) {
        console.warn('⚠️  ADMIN_PASSWORD is not set in production; /admin and protected exports are disabled.');
      } else {
        console.log(`🔐 Dev Admin Login -> http://localhost:${PORT}/admin | user: ${ADMIN_USERNAME} | pass: ${ADMIN_PASSWORD}`);
      }
    }
  });
}

startServer();
