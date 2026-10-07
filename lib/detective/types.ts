export interface DetectiveState {
  xp: number;
  quizScore: number;
  questionsCompleted: number;
  correctAnswers: number;
  currentStreak: number;
  redFlagsFound: number;
  unlockedLevel: number;
  badges: {
    redFlagHunter: boolean;
    urlDetective: boolean;
    phishingDefender: boolean;
  };
}

export const INITIAL_DETECTIVE_STATE: DetectiveState = {
  xp: 0,
  quizScore: 0,
  questionsCompleted: 0,
  correctAnswers: 0,
  currentStreak: 0,
  redFlagsFound: 0,
  unlockedLevel: 1,
  badges: {
    redFlagHunter: false,
    urlDetective: false,
    phishingDefender: false,
  },
};

export const PHISHING_TYPES = [
  {
    id: "email",
    title: "Email Phishing",
    definition: "Mass fraudulent emails crafted to trick victims into handing over credentials, clicking malware links, or sharing data.",
    example: "A generic message claiming your parcel could not be delivered, demanding an immediate $1.50 re-delivery payment via an untrusted portal.",
    warnings: [
      "Mismatched sender address versus organization name",
      "Generic greetings like 'Dear Customer'",
    ],
  },
  {
    id: "spear",
    title: "Spear Phishing",
    definition: "Highly customized attacks tailored to a specific individual, department, or company using researched personal details.",
    example: "An email referencing your exact project name and manager asking you to review an urgent shared OneDrive document link.",
    warnings: [
      "Unexpected document requests from colleagues with unusual urgency",
      "Subtle domain typosquats imitating company infrastructure",
    ],
  },
  {
    id: "smishing",
    title: "Smishing (SMS)",
    definition: "Deceptive text messages using shortlinks and urgent alerts to exploit mobile users on the go.",
    example: "SMS: 'Your bank card has been suspended. Tap http://bnk-sec.link/v to unblock within 15 minutes.'",
    warnings: [
      "Shortened or obscured URLs with countdown timers",
      "Requests to verify financial accounts via SMS links",
    ],
  },
  {
    id: "vishing",
    title: "Vishing (Voice)",
    definition: "Phone scams and automated voice calls impersonating IT support, government agencies, or law enforcement.",
    example: "A caller claiming to be from Microsoft Support stating your workstation is actively broadcasting viruses.",
    warnings: [
      "Unsolicited calls demanding immediate remote desktop access",
      "High-pressure demands for one-time passcodes (OTP)",
    ],
  },
  {
    id: "whaling",
    title: "Whaling",
    definition: "High-level phishing aimed specifically at C-suite executives, board members, or finance directors.",
    example: "A fake legal subpoena or urgent confidential acquisition notice sent directly to the CFO's inbox.",
    warnings: [
      "Confidential transaction requests bypassing standard approval chains",
      "Spoofed executive communication requesting emergency wire transfers",
    ],
  },
  {
    id: "bec",
    title: "Business Email Compromise (BEC)",
    definition: "Attackers compromise or spoof trusted vendor/executive inboxes to redirect wire transfers or invoice payouts.",
    example: "An email appearing to come from your regular supplier stating their banking details have changed for today's invoice.",
    warnings: [
      "Last-minute bank account changes sent solely via email",
      "Urgent requests to bypass two-person authorization controls",
    ],
  },
];

export const URL_CHALLENGES = [
  {
    id: 1,
    url: "https://www.microsoft.com/security",
    isMostSuspicious: false,
    protocol: "https://",
    subdomain: "www.",
    domain: "microsoft",
    tld: ".com",
    path: "/security",
    risk: "Legitimate",
    explanation: "Authentic Microsoft domain. The registered domain before the .com TLD is microsoft.",
  },
  {
    id: 2,
    url: "https://microsoft.account-security.example.com",
    isMostSuspicious: false,
    protocol: "https://",
    subdomain: "microsoft.",
    domain: "account-security.example",
    tld: ".com",
    path: "",
    risk: "Deceptive Subdomain",
    explanation: "Microsoft appears as a prefix subdomain, but the actual registered domain is account-security.example.com.",
  },
  {
    id: 3,
    url: "https://micr0soft-login.example.com",
    isMostSuspicious: false,
    protocol: "https://",
    subdomain: "",
    domain: "micr0soft-login.example",
    tld: ".com",
    path: "",
    risk: "Typosquat & Lookalike",
    explanation: "Uses a zero ('0') instead of the letter 'o' to imitate Microsoft.",
  },
  {
    id: 4,
    url: "https://google.com.verify-user.example.net",
    isMostSuspicious: true,
    protocol: "https://",
    subdomain: "google.com.verify-user.",
    domain: "example",
    tld: ".net",
    path: "",
    risk: "Critical Multi-Subdomain Lure",
    explanation: "Embeds google.com deep in the subdomain chain. The true destination owner is example.net.",
  },
];
