export type DetectiveStage =
  | "hero"
  | "intro"
  | "types"
  | "redflags"
  | "url_lab"
  | "trust_trap"
  | "social_eng"
  | "human_ai"
  | "quiz"
  | "boss"
  | "results";

export type LearningMode = "quick" | "deep" | "detective" | "quiz_only";

export interface DetectiveProfile {
  xp: number;
  level: number;
  accuracy: number;
  streak: number;
  questionsCompleted: number;
  correctAnswers: number;
  redFlagsFound: number;
  totalTimeSeconds: number;
  unlockedBadges: string[];
  skills: {
    investigation: number;
    urlAwareness: number;
    socialEngineering: number;
  };
}

export const INITIAL_PROFILE: DetectiveProfile = {
  xp: 0,
  level: 1,
  accuracy: 100,
  streak: 0,
  questionsCompleted: 0,
  correctAnswers: 0,
  redFlagsFound: 0,
  totalTimeSeconds: 0,
  unlockedBadges: [],
  skills: {
    investigation: 3,
    urlAwareness: 3,
    socialEngineering: 3,
  },
};

export const BADGES = [
  { id: "red_flag_hunter", title: "Red Flag Hunter", desc: "Found 5+ hidden threat indicators", icon: "🔍" },
  { id: "url_detective", title: "URL Detective", desc: "Mastered multi-subdomain and TLD anatomy", icon: "🔗" },
  { id: "inbox_guardian", title: "Inbox Guardian", desc: "Triaged complex corporate spear phishing", icon: "📧" },
  { id: "social_analyst", title: "Social Engineering Analyst", desc: "Identified psychological manipulation tactics", icon: "🧠" },
  { id: "ai_challenger", title: "AI Challenger", desc: "Calibrated human confidence with AI models", icon: "🤖" },
  { id: "phishing_defender", title: "Phishing Defender", desc: "Defeated the Boss Level Perfect Phish", icon: "🛡" },
];

export const PHISHING_TYPES_DATA = [
  {
    id: "email",
    title: "Email Phishing",
    tag: "Broad Spectrum",
    def: "Mass fraudulent emails designed to harvest credentials, extract wire transfers, or distribute malware.",
    example: "Fake invoice alert with a malicious HTML attachment or spoofed cloud login link.",
    warning: "Mismatched sender address, generic greeting ('Valued Customer'), manufactured urgency.",
    attackerGoal: "Cast a wide net hoping a small percentage of users panic and submit credentials.",
    defense: "Verify sender envelope headers, never click unverified links, confirm via trusted bookmark.",
  },
  {
    id: "spear",
    title: "Spear Phishing",
    tag: "Targeted Attack",
    def: "Customized attacks aimed at a specific individual or organization using researched reconnaissance.",
    example: "An email referencing your exact department, ongoing sprint, and supervisor by name.",
    warning: "Unexpected requests for confidential documents with high urgency from known names on new domains.",
    attackerGoal: "Establish immediate familiarity to bypass normal scrutiny.",
    defense: "Verify unusual requests out-of-band (phone, in-person, secure chat) before acting.",
  },
  {
    id: "whaling",
    title: "Whaling",
    tag: "Executive Tier",
    def: "High-level phishing targeting C-suite executives, board members, or financial controllers.",
    example: "Fake regulatory inquiry or emergency acquisition non-disclosure document sent to the CEO.",
    warning: "Urgent legal or acquisition matters requiring immediate unverified document signing.",
    attackerGoal: "Gain administrative credentials, trade secrets, or initiate multi-million dollar transfers.",
    defense: "Mandate multi-party cryptographic approvals for all sensitive financial operations.",
  },
  {
    id: "smishing",
    title: "Smishing (SMS / Messaging)",
    tag: "Mobile Channel",
    def: "Phishing delivered via SMS, WhatsApp, Telegram, or other direct mobile messaging apps.",
    example: "SMS: 'Your bank card has been suspended. Tap https://sec-auth.xyz/verify to unlock.'",
    warning: "Shortlinks, foreign numbers claiming to be domestic services, countdown timers.",
    attackerGoal: "Exploit hurried mobile users who cannot easily inspect full destination URLs.",
    defense: "Never tap links in unsolicited SMS alerts. Open your bank app independently.",
  },
  {
    id: "vishing",
    title: "Vishing (Voice Call)",
    tag: "Audio Social Eng",
    def: "Voice-based phishing using phone calls, deepfake voice clones, or automated IVR systems.",
    example: "Caller claiming to be from corporate IT support demanding a one-time passcode (OTP).",
    warning: "Unsolicited calls demanding screen sharing, password disclosures, or OTP readouts.",
    attackerGoal: "Use real-time conversational pressure to extract 2FA tokens before they expire.",
    defense: "Hang up immediately and call the official internal IT extension listed in the company directory.",
  },
  {
    id: "clone",
    title: "Clone Phishing",
    tag: "Replication Attack",
    def: "An exact replica of a legitimate previously received email, modified with a malicious link or file.",
    example: "A re-sent vendor invoice with the message 'Updated payment details attached for previous order.'",
    warning: "Duplicate emails claiming a previous attachment was faulty or updated.",
    attackerGoal: "Leverage existing trust from a real conversation that recently occurred.",
    defense: "Check previous email threads and confirm bank detail changes with the vendor over phone.",
  },
  {
    id: "pharming",
    title: "Pharming",
    tag: "DNS Hijack",
    def: "Redirecting users to fraudulent cloned websites through DNS poisoning or local hosts tampering.",
    example: "Typing your bank's real address into the browser, but DNS routes you to an attacker's clone.",
    warning: "Certificate validation warnings, unexpected page errors, missing saved browser passwords.",
    attackerGoal: "Capture credentials even when the victim typed the correct legitimate address.",
    defense: "Use DNSSEC-validated DNS resolvers, inspect SSL certificate issuer, use password managers.",
  },
  {
    id: "bec",
    title: "Business Email Compromise",
    tag: "Corporate Fraud",
    def: "Attackers compromise an executive or vendor email account to manipulate financial transfers.",
    example: "CEO's real email sending a request to the accountant: 'Wire $45,000 to this vendor today.'",
    warning: "Sudden deviations from standard invoice procedures, requests to bypass accounting controls.",
    attackerGoal: "Exploit hierarchical authority to execute unauthorized wire transfers.",
    defense: "Strict dual-authorization policy for all payments above baseline thresholds.",
  },
];

export const TRUST_TRAP_SCENARIOS = [
  {
    id: 1,
    message: "Your delivery could not be completed today. Pay $1.49 re-delivery fee to reschedule.",
    isPhish: true,
    sender: "alerts@parcel-post-tracking.info",
    url: "https://parcel-tracking-update.info/pay",
    explanation: "Carriers do not demand small credit card fees via unverified SMS links. This is a classic credential & card harvesting lure.",
    clues: ["Lookalike domain .info", "Fee demand for standard parcel", "Unsolicited text"],
  },
  {
    id: 2,
    message: "Security Notice: Your Google Account password was changed from Chrome on macOS.",
    isPhish: false,
    sender: "no-reply@accounts.google.com",
    url: "https://myaccount.google.com/notifications",
    explanation: "Sent from the authentic Google accounts subdomain with zero urgency countdown. The link leads to the legitimate myaccount.google.com interface.",
    clues: ["Authentic accounts.google.com domain", "Informational notice with no extortion threat", "Clean security header"],
  },
  {
    id: 3,
    message: "HR Dept: Please review the updated Q3 Compensation adjustments attached in the spreadsheet.",
    isPhish: true,
    sender: "hr-payroll@comp-portal-secure.xyz",
    url: "https://comp-portal-secure.xyz/login",
    explanation: "Attackers exploit curiosity regarding salary. The domain is registered on a cheap .xyz TLD rather than corporate infrastructure.",
    clues: ["Curiosity bait (salary)", "Untrusted .xyz domain", "External unverified portal"],
  },
  {
    id: 4,
    message: "IT Helpdesk: Mandatory security certificate update. Run the attached patch file by 5 PM.",
    isPhish: true,
    sender: "it-support@internal-company-desk.co",
    url: "attachment: cert_update_v4.exe",
    explanation: "IT departments push updates via centralized endpoint management (MDM), never by asking users to run executable (.exe) email attachments.",
    clues: ["Executable .exe attachment", "Urgent deadline", "Lookalike .co domain"],
  },
];

export const SOCIAL_ENG_SCENARIOS = [
  {
    id: 1,
    title: "The Executive Gift Card Request",
    scenario: "An employee receives a message from someone claiming to be the CEO: 'I am in an urgent meeting with clients and need you to quickly purchase $500 in Apple gift cards for attendees. Send me the codes immediately.'",
    correctTechnique: "Authority & Urgency",
    options: ["Authority & Urgency", "Reciprocity & Curiosity", "Scarcity & Technical Proof", "Familiarity & Reward"],
    psychology: "Authority makes employees reluctant to question requests from leadership, while urgency prevents them from taking time to verify through normal channels.",
  },
  {
    id: 2,
    title: "The Critical Security Vulnerability",
    scenario: "An email arrives: 'CRITICAL SECURITY BREACH: Your password has been compromised in a dark web leak. Your account will be permanently deleted in 10 minutes if you do not click here to reset it.'",
    correctTechnique: "Fear & Urgency",
    options: ["Fear & Urgency", "Reciprocity & Trust", "Familiarity & Authority", "Reward & Scarcity"],
    psychology: "Fear and panic trigger emotional, impulsive reactions that bypass analytical reasoning, forcing immediate compliance.",
  },
  {
    id: 3,
    title: "The Exclusive Beta Access",
    scenario: "A Slack message from an unknown user: 'You have been selected as one of only 5 employees to test the new unreleased AI assistant! Click here to activate your exclusive token before slots run out.'",
    correctTechnique: "Curiosity & Scarcity",
    options: ["Curiosity & Scarcity", "Fear & Authority", "Urgency & Obligation", "Reciprocity & Penalty"],
    psychology: "Scarcity creates artificial value and fear of missing out (FOMO), while curiosity entices users into clicking unknown links.",
  },
];

export const BOSS_SCENARIO = {
  title: "Operation: The Perfect Phish",
  difficulty: "Level 5 — Highly Convincing",
  sender: "Alex Mercer <alex.mercer@corp-portal-cloud.com>",
  replyTo: "alex.mercer.replies@relay-mail-gateway.ru",
  subject: "Updated Shared Drive Access & Compliance Acknowledgment (Action Required)",
  body: `Hi Team,

As part of our Q4 information security audit, all active team members are required to review and acknowledge the updated Cloud Collaboration Policy.

I have staged the compliance brief and department share permissions in the shared workspace below:

[OPEN COMPLIANCE WORKSPACE]
https://corp-portal-cloud.com.shared-drive-auth.net/s/compliance-2026

Please complete the acknowledgment by end of day today so we can finalize the audit documentation.

Best regards,
Alex Mercer
Director of Information Security & Compliance`,
  tools: [
    { id: "sender", label: "Inspect Sender", clue: "Sender displays corporate styling, but envelope Return-Path routes to a Russian relay gateway (.ru)." },
    { id: "url", label: "Inspect URL", clue: "The URL begins with 'corp-portal-cloud.com' as a subdomain prefix, but the true destination owner is 'shared-drive-auth.net'." },
    { id: "attachment", label: "Inspect Attachments", clue: "No direct file attached, but the link loads an external OAuth permission consent screen requesting full inbox read access." },
    { id: "language", label: "Analyze Language", clue: "Professional, polite tone with low overt aggression, making it significantly harder to detect than obvious spam." },
    { id: "domain", label: "Verify Domain", clue: "WHOIS lookup reveals 'shared-drive-auth.net' was registered 3 days ago in an offshore privacy sanctuary." },
    { id: "trusted_channel", label: "Verify Out-of-Band", clue: "You call Alex Mercer directly on Teams: Alex confirms no compliance audit email was sent by security today." },
  ],
  correctAction: "Report to Security & Independently Verify",
  actions: [
    { label: "Click Link and Sign In", correct: false, explanation: "Dangerous. This grants an attacker unauthorized OAuth access to your corporate inbox." },
    { label: "Reply Asking for Confirmation", correct: false, explanation: "Flawed. The reply-to address routes directly back to the attacker's mail server." },
    { label: "Report to Security & Independently Verify", correct: true, explanation: "Perfect forensic response. You confirmed with the real sender and alerted the SOC team." },
    { label: "Delete and Ignore", correct: false, explanation: "Suboptimal. Deleting prevents your own breach, but leaves other colleagues vulnerable." },
  ],
};
