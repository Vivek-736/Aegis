export type QuizCategory =
  | "url-red-flags"
  | "sms-tactics"
  | "qr-quishing"
  | "email-headers"
  | "social-engineering"
  | "brand-impersonation"
  | "technical-indicators";

export interface QuizQuestion {
  /** Stable 1-based id across the whole bank */
  id: number;
  category: QuizCategory;
  question: string;
  options: [string, string, string, string];
  /** Index into `options` for the correct choice */
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

/**
 * Static quiz bank — 100 questions authored once (no runtime AI).
 * Ten are drawn at random per session by the quiz UI.
 */
export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "url-red-flags",
    question:
      "In https://paypal.com.secure-login.ru/login, which is the real registered domain the page belongs to?",
    options: ["paypal.com", "secure-login.ru", "com", "paypal"],
    answer: 1,
    explanation:
      "Domains are read right to left. paypal.com is only a subdomain here; secure-login.ru is what the owner actually registered.",
  },
  {
    id: 2,
    category: "url-red-flags",
    question:
      "A colleague sends a bit.ly link and you are not sure where it goes. What is the safest first step?",
    options: [
      "Click it to see where it lands",
      "Expand or preview the shortened link to reveal the real destination",
      "Assume it is safe because a colleague sent it",
      "Forward it to someone else to check",
    ],
    answer: 1,
    explanation:
      "Link expanders and preview tools show the final URL without you visiting the page itself.",
  },
  {
    id: 3,
    category: "url-red-flags",
    question: "Which of these URLs is most suspicious?",
    options: [
      "https://www.amazon.com/orders",
      "https://amaz0n-login.xyz/verify",
      "https://mail.google.com",
      "https://github.com/settings",
    ],
    answer: 1,
    explanation:
      "Brand name misspelled with digits, plus an unrelated cheap TLD (.xyz) — a classic phishing pattern.",
  },
  {
    id: 4,
    category: "url-red-flags",
    question: "What can the @ symbol in https://bank.com@evil.example/ do?",
    options: [
      "Marks a public profile",
      "Everything before @ is just userinfo; the real host is evil.example",
      "Adds encryption",
      "Redirects to bank.com",
    ],
    answer: 1,
    explanation:
      "Browsers ignore the text before @ as username info, so the page actually loads from the host after it.",
  },
  {
    id: 5,
    category: "url-red-flags",
    question:
      "What is the real registered domain of https://accounts.google.com.evil-site.com/login?",
    options: ["accounts.google.com", "evil-site.com", "google.com", "login"],
    answer: 1,
    explanation:
      "Read from the right: .com is the suffix, so evil-site.com is the registered domain. The Google part is decorative.",
  },
  {
    id: 6,
    category: "url-red-flags",
    question:
      "A login page uses http:// instead of https://. What does that mean?",
    options: [
      "Nothing important",
      "Credentials would travel unencrypted — a red flag on any login page",
      "The page loads faster",
      "The site is more secure",
    ],
    answer: 1,
    explanation:
      "Without HTTPS, everything you type can be read or modified in transit. No real login page ships this way.",
  },
  {
    id: 7,
    category: "url-red-flags",
    question:
      "Which URL is most likely a typosquat designed to imitate a real brand?",
    options: [
      "https://github.com",
      "https://githuhb.com",
      "https://wikipedia.org/wiki/Phishing",
      "https://google.com",
    ],
    answer: 1,
    explanation:
      "githuhb.com swaps one letter to look almost identical to the real domain while belonging to someone else.",
  },
  {
    id: 8,
    category: "url-red-flags",
    question:
      "Why is a brand-new site on .xyz weaker evidence of trust than mybank.com?",
    options: [
      ".xyz domains are encrypted",
      "Unusual TLDs are cheap and rarely used by real banks, so the mismatch is a signal",
      ".xyz domains are illegal",
      ".xyz resolves faster",
    ],
    answer: 1,
    explanation:
      "A real bank would use its own well-known domain. Cheap, unfamiliar TLDs combined with brand names are a common phish trait.",
  },
  {
    id: 9,
    category: "url-red-flags",
    question:
      "A URL displays as apple.com but uses lookalike characters (for example a Cyrillic a). What is happening?",
    options: [
      "It really is apple.com",
      "The host is a different domain built with homoglyph characters",
      "HTTPS makes it safe",
      "It resolves to Apple servers",
    ],
    answer: 1,
    explanation:
      "Homoglyph (lookalike) characters make a foreign domain render almost identically to the real brand name.",
  },
  {
    id: 10,
    category: "url-red-flags",
    question:
      "A trusted site link contains ?redirect=https://evil.com. What should you think?",
    options: [
      "Harmless query parameter",
      "It may be an open redirect bouncing you to a malicious site",
      "Always safe because the first domain is trusted",
      "It encrypts the destination",
    ],
    answer: 1,
    explanation:
      "Open redirects are commonly abused to lend a trusted domain's reputation to a phishing page one hop away.",
  },
  {
    id: 11,
    category: "url-red-flags",
    question: "Which of these is NOT inherently suspicious on its own?",
    options: [
      "https://paypal.com",
      "https://paypa1-secure.com/verify",
      "http://free-iPhone-prize.top/win",
      "https://verify-your-account.ru/login",
    ],
    answer: 0,
    explanation:
      "The exact brand domain over HTTPS is legitimate. The others pair brand words with misspellings or unrelated TLDs.",
  },
  {
    id: 12,
    category: "url-red-flags",
    question:
      "A link redirects through five different domains before showing a login page. What does that suggest?",
    options: [
      "Normal marketing tracking",
      "Deliberate obfuscation of the final destination — a common phishing technique",
      "Faster content delivery",
      "A content delivery network",
    ],
    answer: 1,
    explanation:
      "Long redirect chains hide where the user really ends up and are a standard evasion trick.",
  },
  {
    id: 13,
    category: "url-red-flags",
    question:
      "Which check best confirms a login page really belongs to your bank?",
    options: [
      "The logo looks correct",
      "Type your bank's known address yourself (or use your bookmark) and check the domain in the address bar",
      "The page uses HTTPS",
      "The page loaded quickly",
    ],
    answer: 1,
    explanation:
      "Logos and HTTPS are trivial to copy. Starting from an address you already trust, and verifying the domain, is what actually proves identity.",
  },
  {
    id: 14,
    category: "url-red-flags",
    question:
      "A bank email links to a login page at a bare IP address like http://203.0.113.10/login. What does that suggest?",
    options: [
      "An internal router page",
      "It skips the domain system entirely — genuine organisations do not send bare-IP login links",
      "A faster server",
      "A valid certificate",
    ],
    answer: 1,
    explanation:
      "Real banks always use their registered domain. Bare IP links cannot be tied to any brand and are a strong red flag.",
  },
  {
    id: 15,
    category: "url-red-flags",
    question:
      "What is the real registered domain of https://www.bbc.co.uk.news-daily.net/?",
    options: ["bbc.co.uk", "news-daily.net", "bbc.co.uk.news-daily.net", "net"],
    answer: 1,
    explanation:
      "The real host is the part before the path: www.bbc.co.uk.news-daily.net, whose registered domain is news-daily.net. The familiar names inside are decoration.",
  },
  {
    id: 16,
    category: "sms-tactics",
    question:
      "\"Your account will be suspended in 24 hours unless you verify now.\" Which tactic is this?",
    options: ["Urgency and threat", "Social proof", "A reward offer", "Technical support"],
    answer: 0,
    explanation:
      "A ticking clock plus a penalty pushes you to act before you think — the core pressure tactic in SMS phishing.",
  },
  {
    id: 17,
    category: "sms-tactics",
    question:
      "An unknown number texts you a bit.ly link claiming a parcel is held. What should you do?",
    options: [
      "Click it to track the parcel",
      "Ignore the link and check delivery status through the official carrier app or site yourself",
      "Reply with your address to confirm",
      "Forward the text to friends",
    ],
    answer: 1,
    explanation:
      "Verify through a channel you chose, not the one the message hands you. Shortened links from unknown senders are a classic smishing move.",
  },
  {
    id: 18,
    category: "sms-tactics",
    question: "Which phrase is the classic SMS urgency trigger?",
    options: [
      "Please review at your convenience",
      "Act now or your account is locked",
      "No rush, whenever suits",
      "Only if you have time",
    ],
    answer: 1,
    explanation:
      "Immediate consequence plus immediate action is the standard formula for pressure-based message scams.",
  },
  {
    id: 19,
    category: "sms-tactics",
    question:
      "\"You've won a $1,000 gift card! Click to claim.\" What type of scam is this?",
    options: [
      "A prize or reward lure (smishing)",
      "An invoice notification",
      "A support message",
      "An MFA code",
    ],
    answer: 0,
    explanation:
      "Unexpected winnings exist to trigger excitement and a fast click — the reward version of phishing.",
  },
  {
    id: 20,
    category: "sms-tactics",
    question: "A phishing scam delivered by SMS text message is commonly called?",
    options: ["Smishing", "Phishing", "Vishing", "Quishing"],
    answer: 0,
    explanation:
      "Smishing = SMS + phishing. Vishing is voice calls, quishing is QR codes, phishing is the general term.",
  },
  {
    id: 21,
    category: "sms-tactics",
    question:
      "A text claims to be from the tax office and demands immediate payment in gift cards. Why is this definitely a scam?",
    options: [
      "Gift cards are illegal",
      "Government agencies never demand untraceable gift-card payment under threat of arrest",
      "Tax offices only accept card",
      "The message arrived by SMS",
    ],
    answer: 1,
    explanation:
      "Gift cards are a favourite of scammers because they are untraceable and irreversible. No real authority pays that way.",
  },
  {
    id: 22,
    category: "sms-tactics",
    question:
      "\"Is this you in this video?\" with an unfamiliar link. What tactic is being used?",
    options: [
      "Curiosity bait leading to a credential or malware page",
      "A legitimate friend sharing a clip",
      "Multi-factor authentication",
      "A delivery notification",
    ],
    answer: 0,
    explanation:
      "The message makes you want to see yourself — the click happens before the critical thinking does.",
  },
  {
    id: 23,
    category: "sms-tactics",
    question:
      "A bank SMS asks you to reply with the one-time code it just sent you. What is wrong here?",
    options: [
      "Nothing, if the sender looks right",
      "Banks never ask for your one-time code — sharing it hands over your account",
      "Only sharing it once is allowed",
      "Codes should be sent by email instead",
    ],
    answer: 1,
    explanation:
      "The code is the key to your account. Anyone asking for it, however official they sound, is running a takeover scam.",
  },
  {
    id: 24,
    category: "sms-tactics",
    question:
      "Which detail most strongly suggests a delivery text is fake?",
    options: [
      "It mentions a parcel",
      "It asks for card details to release the parcel",
      "It includes the courier's logo",
      "It arrived outside office hours",
    ],
    answer: 1,
    explanation:
      "Legitimate couriers do not collect card payments through a text link. Entering card details on the resulting page is the actual goal.",
  },
  {
    id: 25,
    category: "sms-tactics",
    question:
      "A text appears to come from your bank's usual shortcode number. What does that prove?",
    options: [
      "Nothing definitive — sender IDs can be spoofed, so still verify independently",
      "It proves the message is authentic",
      "It is impossible to fake",
      "Your phone has been hacked",
    ],
    answer: 0,
    explanation:
      "SMS sender IDs are trivially spoofed. The apparent origin is a hint, never proof.",
  },
  {
    id: 26,
    category: "sms-tactics",
    question:
      "\"Hi Mum, I've changed my number — this is my new phone.\" Then comes an urgent money request. What is this?",
    options: [
      "A family-impersonation scam",
      "A wrong-number mistake",
      "A bank notification",
      "A legitimate request",
    ],
    answer: 0,
    explanation:
      "The 'new number' message builds a false pretext so the urgent transfer request seems to come from family.",
  },
  {
    id: 27,
    category: "sms-tactics",
    question:
      "Which combination in a text message is the strongest overall phishing signal?",
    options: [
      "It includes an order number",
      "A URL shortener plus grammar errors plus an urgent deadline",
      "It arrives during business hours",
      "It uses your first name",
    ],
    answer: 1,
    explanation:
      "No single trait is proof, but a hidden destination, sloppy language, and time pressure together match the standard smish template.",
  },
  {
    id: 28,
    category: "sms-tactics",
    question:
      "A text says \"Reply YES to confirm your identity.\" Why might replying be a bad idea?",
    options: [
      "It can confirm your number is active for more scams, or subscribe you to premium charges",
      "Replies cost money always",
      "It deletes your messages",
      "It shares your contacts",
    ],
    answer: 0,
    explanation:
      "A simple reply validates the number for future targeting and, in some scams, triggers premium-rate charges.",
  },
  {
    id: 29,
    category: "sms-tactics",
    question:
      "You suddenly receive a flood of unsolicited MFA codes. What is likely happening?",
    options: [
      "An attacker who already has your password is running an MFA fatigue attack — secure the account and change the password",
      "Your phone is glitching",
      "Your carrier is running a promotion",
      "A friend is logging in",
    ],
    answer: 0,
    explanation:
      "The spam of prompts is designed to wear you down into approving one. Treat it as an active takeover attempt.",
  },
  {
    id: 30,
    category: "sms-tactics",
    question:
      "A text contains a QR code instead of a link. Why does that make the message riskier?",
    options: [
      "The destination stays hidden on a small screen and bypasses mobile link-preview warnings",
      "QR codes cannot be blocked",
      "SMS is encrypted with the code",
      "QR codes expire too quickly",
    ],
    answer: 0,
    explanation:
      "You cannot hover or preview a QR destination, and scanners rarely show the URL before opening it.",
  },
  {
    id: 31,
    category: "qr-quishing",
    question: "\"Quishing\" refers to phishing delivered via?",
    options: ["A QR code", "An email", "A voice call", "A social media post"],
    answer: 0,
    explanation:
      "Quishing = QR + phishing. The code hides the destination until it has already been scanned.",
  },
  {
    id: 32,
    category: "qr-quishing",
    question:
      "You notice a sticker with a QR code placed on top of a printed parking sign's original code. What should you do?",
    options: [
      "Scan it — QR codes are harmless",
      "Treat the sticker as tampering and use the official parking app or the printed URL instead",
      "Peel it off and bin it, then scan the original anyway without checking",
      "Trust it because it is on a public sign",
    ],
    answer: 1,
    explanation:
      "Overlay stickers are the most common physical QR attack. Do not scan a code you know has been tampered with.",
  },
  {
    id: 33,
    category: "qr-quishing",
    question:
      "A scanned QR code opens a URL whose domain is a misspelling of a popular brand. What is the verdict?",
    options: [
      "Safe — QR codes are regulated",
      "Suspicious — treat it as phishing until verified through the real brand's site",
      "Safe because the page uses HTTPS",
      "Safe if it loads quickly",
    ],
    answer: 1,
    explanation:
      "The code is just a transport. The destination domain decides the risk, and a misspelled brand domain fails that test.",
  },
  {
    id: 34,
    category: "qr-quishing",
    question: "Why are QR codes especially effective for phishers?",
    options: [
      "They bypass visual inspection of the URL before the page opens",
      "They are encrypted end to end",
      "Phones cannot block them",
      "They can only be scanned once",
    ],
    answer: 0,
    explanation:
      "With a normal link you can at least read the address first. A QR hides it behind a scanner screen.",
  },
  {
    id: 35,
    category: "qr-quishing",
    question:
      "A restaurant table QR claims you must log in with Google to view the menu. What is the red flag?",
    options: [
      "Menus should never require credentials",
      "Google login is always unsafe",
      "Restaurants are not allowed QR codes",
      "Menus must be PDFs",
    ],
    answer: 0,
    explanation:
      "A credential prompt on a menu is a harvested-login page in disguise. Real menus do not need your account.",
  },
  {
    id: 36,
    category: "qr-quishing",
    question:
      "A QR code at a market stall asks for your card details to pay. What is the safest approach?",
    options: [
      "Scan and enter your card details",
      "Confirm through the official merchant site or payment app yourself, not the scanned page",
      "Enter details if the page looks professional",
      "Screenshot the code for later",
    ],
    answer: 1,
    explanation:
      "Whoever controls the page controls the payment form. Reach the merchant through a route you trust first.",
  },
  {
    id: 37,
    category: "qr-quishing",
    question:
      "A slip on your parcel has a QR code claiming an unpaid customs fee. What is this?",
    options: [
      "A delivery-fee quishing scam",
      "A normal courier procedure",
      "An official customs invoice",
      "A warranty registration",
    ],
    answer: 0,
    explanation:
      "Fake customs and redelivery fees are a well-worn QR scam. Couriers bill such fees through official channels, not QR payment pages.",
  },
  {
    id: 38,
    category: "qr-quishing",
    question:
      "Why should a QR payload be read with a real decoder instead of asking an AI model what the code says?",
    options: [
      "A decoder returns the exact payload deterministically; a model can hallucinate it",
      "AI models cannot see images",
      "Decoders are free and models are not",
      "QR codes are invisible to AI",
    ],
    answer: 0,
    explanation:
      "Deciding where a code points is deterministic work. An approximate reading is not good enough for a security decision.",
  },
  {
    id: 39,
    category: "qr-quishing",
    question:
      "An email from the IT department contains a QR: \"Scan to re-enable your account.\" Likely what?",
    options: [
      "Quishing aimed at harvesting your credentials",
      "A legitimate MFA enrolment",
      "An internal test",
      "A routine newsletter",
    ],
    answer: 0,
    explanation:
      "Account-recovery pressure plus a hidden destination is the standard quishing template. IT re-enables accounts through normal channels.",
  },
  {
    id: 40,
    category: "qr-quishing",
    question:
      "After scanning, the address reads https://login.microsoftonline.com.evil-rr.net. What is the real domain?",
    options: ["login.microsoftonline.com", "evil-rr.net", "microsoftonline", ".net"],
    answer: 1,
    explanation:
      "Everything left of evil-rr.net is decorative subdomain text. Your credentials would go to evil-rr.net.",
  },
  {
    id: 41,
    category: "qr-quishing",
    question:
      "A QR expands to a link shortener. What should you do before opening it?",
    options: [
      "Open it immediately",
      "Preview or expand the shortener to see the final destination first",
      "Assume it is safe",
      "Rescan the code to get a different link",
    ],
    answer: 1,
    explanation:
      "Expanding shows the real target URL without visiting it — the same caution you would apply to any shortened link.",
  },
  {
    id: 42,
    category: "qr-quishing",
    question:
      "A hotel QR opens a WiFi login page asking for your email and account password. What is the risk?",
    options: [
      "Credential harvesting on a fake portal",
      "Nothing — hotel portals always need passwords",
      "At worst, some spam emails",
      "Safe as long as the page has HTTPS",
    ],
    answer: 0,
    explanation:
      "A captive portal only needs a room number or code. Asking for your real password means the page is collecting logins.",
  },
  {
    id: 43,
    category: "qr-quishing",
    question: "What is the clearest physical sign of a malicious QR code?",
    options: [
      "A sticker placed over the original printed code",
      "The code is black and white",
      "The code is square",
      "The code is small",
    ],
    answer: 0,
    explanation:
      "Tampering over a legitimate code is how attackers hijack posters, menus, and parking signs.",
  },
  {
    id: 44,
    category: "qr-quishing",
    question: "What is a good everyday habit when you scan QR codes?",
    options: [
      "Scan everything as fast as possible",
      "Preview the URL, check the domain, and prefer the official app for services you use",
      "Turn off browser warnings",
      "Scan codes from screenshots without thinking",
    ],
    answer: 1,
    explanation:
      "Preview, domain check, official app — three cheap habits that defeat almost every consumer-level QR attack.",
  },
  {
    id: 45,
    category: "email-headers",
    question: "What does the Return-Path header tell you?",
    options: [
      "Where bounce replies go — it can reveal a different real sender than the displayed From address",
      "The body of the message",
      "The encryption key used",
      "Whether the message was read",
    ],
    answer: 0,
    explanation:
      "A Return-Path on a domain that does not match the From domain is a quiet sign the message was not sent where it claims.",
  },
  {
    id: 46,
    category: "email-headers",
    question: "What do the Received headers in an email show?",
    options: [
      "The chain of mail servers the message passed through",
      "The attachments included",
      "The sender's signature",
      "The contact list",
    ],
    answer: 0,
    explanation:
      "Each server in the path adds its own Received line, so the trail exposes where the message really originated.",
  },
  {
    id: 47,
    category: "email-headers",
    question:
      "A domain publishes v=spf1 -all in its SPF record. What does that mean?",
    options: [
      "No server is authorized to send for that domain, so any mail claiming it is forged",
      "All servers may send freely",
      "The domain signs with DKIM",
      "The domain whitelists everyone",
    ],
    answer: 0,
    explanation:
      "-all means 'deny everything'. If you still receive mail from that domain, it did not come from an authorized server.",
  },
  {
    id: 48,
    category: "email-headers",
    question:
      "The display name says \"PayPal Support\" but the address is support@paypa1-secure.top. Which part is real?",
    options: [
      "The actual address — display names are free text anyone can set",
      "The display name",
      "Neither",
      "The avatar image",
    ],
    answer: 0,
    explanation:
      "Sender names are cosmetic. The domain in the actual address is the only part that identifies who sent it.",
  },
  {
    id: 49,
    category: "email-headers",
    question: "What does a failing DKIM signature suggest?",
    options: [
      "The message was altered in transit or was not authorized by the signing domain",
      "The message is definitely safe",
      "The message is merely promotional",
      "The message has no virus",
    ],
    answer: 0,
    explanation:
      "DKIM cryptographically binds the message to the sending domain. A failure means the contents or sender do not match the signature.",
  },
  {
    id: 50,
    category: "email-headers",
    question: "What does a DMARC policy of p=reject do?",
    options: [
      "It tells receivers to reject mail that fails authentication for that domain",
      "It allows all mail through",
      "It encrypts messages",
      "It marks mail as safe",
    ],
    answer: 0,
    explanation:
      "Reject is the strictest DMARC setting: unauthenticated impersonation should be dropped, not delivered.",
  },
  {
    id: 51,
    category: "email-headers",
    question:
      "The From says Apple Support, but Reply-To points to a random Gmail address. What does that mean?",
    options: [
      "Replies go straight to the attacker — a classic impersonation mismatch",
      "Apple uses Gmail for support",
      "Nothing unusual",
      "The message is encrypted",
    ],
    answer: 0,
    explanation:
      "A Reply-To that differs from the From domain quietly reroutes your response to whoever is running the scam.",
  },
  {
    id: 52,
    category: "email-headers",
    question:
      "The X-Mailer header shows an unusual bulk-sending tool. What conclusion should you draw?",
    options: [
      "It is one suspicious signal among several — combine it with SPF, DKIM, and the domain before judging",
      "The email is definitely phishing",
      "The email is definitely safe",
      "The email contains malware",
    ],
    answer: 0,
    explanation:
      "Headers like X-Mailer are context, not proof. Bulk tools are used by marketers and scammers alike.",
  },
  {
    id: 53,
    category: "email-headers",
    question: "You see Received-SPF: fail on an unexpected message. First action?",
    options: [
      "Treat it as an unverified spoof and do not click its links",
      "Reply to ask who they are",
      "Whitelist the sender",
      "Forward it to coworkers",
    ],
    answer: 0,
    explanation:
      "SPF failure means the sending server was not authorized by the From domain. That is enough to stop interacting with it.",
  },
  {
    id: 54,
    category: "email-headers",
    question: "Where do you find the original headers in most mail apps?",
    options: [
      "A \"Show original\", \"View raw message\", or similar menu item",
      "The message theme settings",
      "The trash folder",
      "The contacts list",
    ],
    answer: 0,
    explanation:
      "Mail clients hide the raw headers behind a menu — you cannot verify authentication results without them.",
  },
  {
    id: 55,
    category: "email-headers",
    question: "Which combination most strongly authenticates an email?",
    options: [
      "SPF pass, DKIM pass, and DMARC pass — all aligned with the exact From domain",
      "A well-designed HTML template",
      "A corporate logo and signature",
      "The absence of attachments",
    ],
    answer: 0,
    explanation:
      "Three independent checks all aligning on the visible From domain is the practical gold standard for mail authentication.",
  },
  {
    id: 56,
    category: "email-headers",
    question:
      "Message-ID reads <abc@mail-evil-xyz.com> but From says no-reply@chase.com. What does that suggest?",
    options: [
      "The message was sent through an unrelated mail server — spoofed or compromised",
      "Chase uses that server normally",
      "Nothing unusual",
      "The message is signed",
    ],
    answer: 0,
    explanation:
      "The Message-ID is stamped by the sending mailer. A domain nobody would trust sitting behind it reveals the true origin.",
  },
  {
    id: 57,
    category: "email-headers",
    question:
      "An email shows the link text https://chase.com. How do you see where it really goes?",
    options: [
      "Hover over it (or long-press on mobile) to preview the actual target URL first",
      "Trust the visible text",
      "Check the sender's font",
      "Forward it for a second opinion",
    ],
    answer: 0,
    explanation:
      "Link text is arbitrary HTML. The underlying href is the destination, and previews reveal it before you commit.",
  },
  {
    id: 58,
    category: "email-headers",
    question:
      "What does Content-Type: multipart/alternative tell you?",
    options: [
      "The email carries multiple versions of the same content, typically plain text and HTML",
      "The message is encrypted",
      "The message contains malware",
      "The message is digitally signed",
    ],
    answer: 0,
    explanation:
      "It is a normal structure — but it means the pretty HTML you see and the plain-text version can differ, so inspect both.",
  },
  {
    id: 59,
    category: "social-engineering",
    question: "What is pretexting?",
    options: [
      "Inventing a believable backstory to trick someone into sharing information",
      "Breaking into a system with code",
      "Encrypting a message",
      "Guessing passwords mechanically",
    ],
    answer: 0,
    explanation:
      "A pretext is the story an attacker tells — a courier, an auditor, a colleague — that makes the request seem routine.",
  },
  {
    id: 60,
    category: "social-engineering",
    question:
      "A caller says they are from IT and needs your password to fix your account. What should you do?",
    options: [
      "Give it — they work in IT",
      "Refuse; IT never needs your password, and verify the request through an official channel",
      "Give them only the first few characters",
      "Call them back on the number they give you",
    ],
    answer: 1,
    explanation:
      "No legitimate helpdesk ever asks for your password. Verifying through a directory you already trust closes the trick.",
  },
  {
    id: 61,
    category: "social-engineering",
    question: "What is tailgating in security terms?",
    options: [
      "Following an authorised person into a secure area without challenging them",
      "Sending a phishing email",
      "Scanning a QR code closely",
      "Installing malware",
    ],
    answer: 0,
    explanation:
      "Politeness is the exploit: people hold doors for someone carrying boxes instead of asking for a badge.",
  },
  {
    id: 62,
    category: "social-engineering",
    question:
      "Which pair of pressures is most common in successful phishing messages?",
    options: [
      "Calm courtesy and patience",
      "Urgency combined with authority",
      "Boredom and neutrality",
      "Humor and curiosity only",
    ],
    answer: 1,
    explanation:
      "'Do this now, because I said so, and I am above you' — urgency plus authority short-circuits verification.",
  },
  {
    id: 63,
    category: "social-engineering",
    question:
      "Why does least privilege reduce damage from a compromised account?",
    options: [
      "The account can only reach what it genuinely needs, limiting the blast radius",
      "It makes passwords longer",
      "It reduces email size",
      "It speeds up Wi-Fi",
    ],
    answer: 0,
    explanation:
      "If a phished account can only touch a narrow slice of systems, the attacker inherits that same narrow slice.",
  },
  {
    id: 64,
    category: "social-engineering",
    question:
      "An email that appears to be from your CEO demands an urgent wire transfer. What is this attack mainly exploiting?",
    options: [
      "Authority and urgency from a spoofed executive (business email compromise)",
      "A malformed attachment",
      "A real message from the CEO",
      "Currency exchange rates",
    ],
    answer: 0,
    explanation:
      "BEC works because people comply fast with perceived executives, especially when the request is time-boxed.",
  },
  {
    id: 65,
    category: "social-engineering",
    question:
      "A request asks you to keep the purchase secret from the rest of the team. How should you read that?",
    options: [
      "Secrecy pressure — a classic manipulation tactic; real business requests are not hidden",
      "Normal discretion",
      "Required by policy",
      "A sign of a senior client",
    ],
    answer: 0,
    explanation:
      "Isolating you from the colleagues who would question the request is a deliberate step in the scam playbook.",
  },
  {
    id: 66,
    category: "social-engineering",
    question:
      "Someone claims to be your new finance officer. What best verifies them?",
    options: [
      "A detail only the real person would know, checked through a channel you already have",
      "How confident they sound",
      "The logo on their email",
      "How quickly they reply",
    ],
    answer: 0,
    explanation:
      "Out-of-band verification — using a known number or in-person check — defeats a fabricated identity.",
  },
  {
    id: 67,
    category: "social-engineering",
    question:
      "A coworker's chat asks you to buy gift cards urgently for a client and promises reimbursement. What is this?",
    options: [
      "Gift-card social engineering using a hijacked or spoofed colleague account",
      "A normal marketing budget",
      "A standard expense process",
      "An audit requirement",
    ],
    answer: 0,
    explanation:
      "Gift cards are untraceable, so scammers using compromised accounts push staff to buy them 'for the company'.",
  },
  {
    id: 68,
    category: "social-engineering",
    question:
      "An attacker does you a small favour first, then asks for a bigger one. Which principle is being exploited?",
    options: ["Reciprocity", "Rate limiting", "Hashing", "Multi-factor authentication"],
    answer: 0,
    explanation:
      "People feel obliged to return favours. The attacker manufactures the favour to cash in the debt.",
  },
  {
    id: 69,
    category: "social-engineering",
    question:
      "Why do attackers research a target's public posts before making contact?",
    options: [
      "Names, tools, and org details let them craft a credible, personalised pretext",
      "Public posts contain passwords",
      "It speeds up the connection",
      "It bypasses firewalls",
    ],
    answer: 0,
    explanation:
      "A lure that references your real project, boss, or conference is far more convincing than a generic blast.",
  },
  {
    id: 70,
    category: "social-engineering",
    question:
      "You receive an unexpected invoice attachment referencing a meeting you never had. What should you do?",
    options: [
      "Open it to see what it is about",
      "Treat it as suspicious and verify with the sender through a known contact before opening",
      "Reply with your billing details",
      "Forward it to the whole team",
    ],
    answer: 1,
    explanation:
      "Malicious invoices ride on your politeness. Confirm the sender exists and meant to contact you before opening anything.",
  },
  {
    id: 71,
    category: "social-engineering",
    question: "What is the safest response to a suspected vishing phone call?",
    options: [
      "Hang up and call back on the official number published by the organisation",
      "Stay on the line to gather more information",
      "Share your account number to prove identity",
      "Follow their instructions to secure the account",
    ],
    answer: 0,
    explanation:
      "Ending the call and redialling a known-good number guarantees you reach the real organisation, not the attacker.",
  },
  {
    id: 72,
    category: "social-engineering",
    question:
      "A stranger offers to fix slow performance and asks for remote access to your computer. What is this?",
    options: [
      "An unsolicited remote-access scam — never grant control to a cold caller",
      "A legitimate support service",
      "A manufacturer warranty check",
      "A routine maintenance prompt",
    ],
    answer: 0,
    explanation:
      "Once they have control they can install malware, harvest saved passwords, and lock you out entirely.",
  },
  {
    id: 73,
    category: "brand-impersonation",
    question: "Which sender is most likely a genuine Microsoft notice?",
    options: [
      "no-reply@microsoft.com",
      "security@microsoft-support.com",
      "alert@micros0ft.top",
      "ms-noreply@outlook-support.net",
    ],
    answer: 0,
    explanation:
      "Only the exact corporate domain belongs to Microsoft. Hyphenated and digit-lookalike domains are attacker-registered.",
  },
  {
    id: 74,
    category: "brand-impersonation",
    question:
      "An email asks you to confirm your card PIN to avoid suspension. What will a real bank do?",
    options: [
      "Never ask for your PIN or password by email",
      "Ask once for verification",
      "Ask inside the email itself",
      "Ask by SMS if you prefer",
    ],
    answer: 0,
    explanation:
      "PINs and passwords are secret by design. Any channel asking for them while claiming to be your bank is fraudulent.",
  },
  {
    id: 75,
    category: "brand-impersonation",
    question:
      "A WhatsApp message from \"Amazon\" contains a QR code to cancel an order. What is happening?",
    options: [
      "Brand impersonation combined with quishing — Amazon does not cancel orders this way",
      "A new Amazon feature",
      "A safe refund shortcut",
      "An official partner service",
    ],
    answer: 0,
    explanation:
      "Unsolicited channel plus a hidden destination plus an order threat — the impersonation trifecta.",
  },
  {
    id: 76,
    category: "brand-impersonation",
    question:
      "\"Your Netflix billing is on hold — update at netflix-billing-secure.com.\" What are the red flags?",
    options: [
      "Brand impersonation plus an unrelated attacker-owned domain",
      "Only the punctuation",
      "None — it looks official",
      "The URL length",
    ],
    answer: 0,
    explanation:
      "Real billing pages live on netflix.com. Attaching the brand name to a separate domain is the whole trick.",
  },
  {
    id: 77,
    category: "brand-impersonation",
    question: "A login page has a pixel-perfect company logo. What does that prove?",
    options: [
      "Nothing — logos and layouts are trivially copied",
      "The page is authentic",
      "The page has a valid certificate",
      "The page is hosted officially",
    ],
    answer: 0,
    explanation:
      "Visual fidelity is free for attackers. Identity lives in the domain, not the artwork.",
  },
  {
    id: 78,
    category: "brand-impersonation",
    question:
      "You get a password-reset email for an account you never created. What is the most likely intent?",
    options: [
      "Someone is probing or trying to bind your details to a new account — ignore it and secure the address",
      "You get a free account",
      "A simple typo",
      "A legitimate promotion",
    ],
    answer: 0,
    explanation:
      "Reset spam often means someone is enrolling your contact details elsewhere. Do not follow the link; monitor the account.",
  },
  {
    id: 79,
    category: "brand-impersonation",
    question:
      "A text says a tax refund is pending, with a link to claim it. What is the reality?",
    options: [
      "Tax agencies do not announce refunds via random links — this is impersonation",
      "Normal refund processing",
      "A government pilot scheme",
      "Safe if the link uses HTTPS",
    ],
    answer: 0,
    explanation:
      "Refund lures harvest credentials on fake government portals. Real agencies write to accounts you filed through.",
  },
  {
    id: 80,
    category: "brand-impersonation",
    question:
      "After a suspicious text claims to be from your bank, how should you really contact the bank?",
    options: [
      "Use the number on the back of your card or the official app",
      "Use the number included in the text",
      "Reply to the text",
      "Open the link they sent",
    ],
    answer: 0,
    explanation:
      "Contact details you already hold are trustworthy. Anything delivered by the suspect message is part of the trap.",
  },
  {
    id: 81,
    category: "brand-impersonation",
    question:
      "Which is the most common money-focused brand lure in phishing messages?",
    options: [
      "An overpayment or refund notice that asks you to click and log in",
      "A newsletter with no links",
      "A plain receipt with no call to action",
      "A shipping confirmation without a link",
    ],
    answer: 0,
    explanation:
      "Something is 'owed' to you — curiosity plus reward gets the click, and the login page collects the credentials.",
  },
  {
    id: 82,
    category: "brand-impersonation",
    question:
      "A verified-looking social account DMs you a guaranteed investment return. How much does verification help?",
    options: [
      "Very little — badges can be faked, bought, or taken over; treat unsolicited offers as scams",
      "It proves legitimacy",
      "It means a regulator approved it",
      "It guarantees returns",
    ],
    answer: 0,
    explanation:
      "Impersonation of verified accounts, and takeover of real ones, is routine. An unsolicited money-making offer is itself the red flag.",
  },
  {
    id: 83,
    category: "brand-impersonation",
    question:
      "Your telco texts that your number will be deactivated unless you 're-link your SIM' via a link. Risk?",
    options: [
      "A SIM-swap lure — do not click; contact the telco through official channels",
      "A normal network maintenance message",
      "Safe if the page uses HTTPS",
      "A promotional offer",
    ],
    answer: 0,
    explanation:
      "Falling for it hands the attacker control of your number, which then defeats SMS-based account verification.",
  },
  {
    id: 84,
    category: "brand-impersonation",
    question: "What is consistent with a genuine Apple security email?",
    options: [
      "It never asks for your password, and directs you to type apple.com yourself",
      "It gives you a one-hour deadline to click",
      "It links to appleid-verify.icu",
      "It attaches an HTML form to fill in",
    ],
    answer: 0,
    explanation:
      "Real security mail informs; it does not extract. Urgency, lookalike domains, and attached forms are the impersonator's toolkit.",
  },
  {
    id: 85,
    category: "brand-impersonation",
    question:
      "A friend's email suddenly pitches an exclusive crypto deal. What should you assume first?",
    options: [
      "Their account is likely compromised — verify through a different channel before acting",
      "They genuinely invested",
      "It is safe because you know them",
      "An automated newsletter they signed up for",
    ],
    answer: 0,
    explanation:
      "Takeover-and-blast scams ride on existing trust. A quick separate-channel check exposes it instantly.",
  },
  {
    id: 86,
    category: "brand-impersonation",
    question: "Which of these could genuinely be Apple's own domain?",
    options: [
      "appIe.com (capital I instead of l)",
      "apple.com",
      "appleid-verify.icu",
      "secure-apple.top",
    ],
    answer: 1,
    explanation:
      "Only apple.com is registered by Apple. The others are lookalikes built from the brand words with attacker-owned suffixes.",
  },
  {
    id: 87,
    category: "technical-indicators",
    question:
      "WHOIS shows a domain registered two days ago claiming to be a bank. How should you weigh that?",
    options: [
      "As a strong suspicion signal — real banks do not run on brand-new domains",
      "As irrelevant",
      "As proof the site was hacked",
      "As a sign it is safer than average",
    ],
    answer: 0,
    explanation:
      "Domain age is one of the cheapest, most reliable infrastructure signals: phishing kits rotate fresh domains constantly.",
  },
  {
    id: 88,
    category: "technical-indicators",
    question: "What does an SSL/TLS certificate actually prove?",
    options: [
      "The connection is encrypted to whoever controls the domain — not that the site is trustworthy",
      "The site is safe to use",
      "The company behind it was verified",
      "The site is free of malware",
    ],
    answer: 0,
    explanation:
      "Certificates vouch for transport security, not intent. Phishing sites happily hold valid certificates.",
  },
  {
    id: 89,
    category: "technical-indicators",
    question:
      "A certificate from Let's Encrypt covers paypa1-secure.xyz. What can you conclude?",
    options: [
      "Nothing positive — certificates are automated and free, and say nothing about legitimacy",
      "The site is backed by PayPal",
      "The site passed a bank-grade audit",
      "The site has extended validation",
    ],
    answer: 0,
    explanation:
      "DV certificates validate domain control only. Obtaining one takes seconds and costs nothing.",
  },
  {
    id: 90,
    category: "technical-indicators",
    question: "A site redirects from http:// to https://. What does that tell you?",
    options: [
      "Normal transport hygiene — it does not make the content itself safe",
      "The site is trustworthy",
      "Phishing cannot happen over HTTPS",
      "The page is encrypted end to end",
    ],
    answer: 0,
    explanation:
      "HTTPS is the floor, not a recommendation. The redirect only upgrades transport for whatever page you landed on.",
  },
  {
    id: 91,
    category: "technical-indicators",
    question:
      "A link hops through eight redirects across several domains before reaching a login page. How is this treated?",
    options: [
      "As an obfuscation indicator — redirect count belongs in the infrastructure score",
      "As normal CDN behaviour",
      "As an SEO feature",
      "As a guarantee of safety",
    ],
    answer: 0,
    explanation:
      "Long, cross-domain chains exist to frustrate inspection. Recording the hop count preserves the evidence.",
  },
  {
    id: 92,
    category: "technical-indicators",
    question:
      "A threat feed flags the site's IP as historically linked to malware hosting. What does the system do?",
    options: [
      "Records an infrastructure hit with the feed as its provenance — a hostile signal, not a neutral one",
      "Ignores it as stale data",
      "Treats the site as safe",
      "Blocks the user instead",
    ],
    answer: 0,
    explanation:
      "External intelligence contributes a scored, attributed signal. Nothing is silently discarded or inverted.",
  },
  {
    id: 93,
    category: "technical-indicators",
    question:
      "A site combines WHOIS privacy, a three-day-old registration, and hosting far from the claimed company. What is this?",
    options: [
      "A composite of weak provenance signals that together raise infrastructure risk",
      "Ordinary privacy practice",
      "Proof of a data breach",
      "Evidence the site is safe",
    ],
    answer: 0,
    explanation:
      "No single trait is decisive, but stacked anonymity signals are exactly what freshly built phishing infrastructure looks like.",
  },
  {
    id: 94,
    category: "technical-indicators",
    question:
      "An email links to a.b.c.d.e.malicious.com. Why does deep subdomain nesting matter?",
    options: [
      "Unusual depth is a common evasion trick — inspect the full host, not just a familiar fragment",
      "It proves the site is corporate",
      "It speeds up DNS",
      "It encrypts the request",
    ],
    answer: 0,
    explanation:
      "Attackers bury their real domain behind layers of decorative labels so a glance catches the familiar part first.",
  },
  {
    id: 95,
    category: "technical-indicators",
    question:
      "A payment form shows a padlock, but the domain is sberbank-payments.top. What does the padlock mean?",
    options: [
      "Only that transport is encrypted — the domain still decides who receives your data",
      "The site is the real bank",
      "The payment is regulated",
      "The page cannot be a phishing page",
    ],
    answer: 0,
    explanation:
      "Encrypting the pipe to an attacker is still encryption. The padlock answers 'is it private?', not 'is it legitimate?'.",
  },
  {
    id: 96,
    category: "technical-indicators",
    question: "What is certificate transparency (CT) useful for?",
    options: [
      "A public log of every issued certificate, so lookalike domains issuing certs can be spotted",
      "Making connections faster",
      "Encrypting email content",
      "Hiding the site owner's identity",
    ],
    answer: 0,
    explanation:
      "CT logs let defenders watch for certificates issued against brand-lookalike domains, often before campaigns launch.",
  },
  {
    id: 97,
    category: "technical-indicators",
    question:
      "A login page is hosted on a budget VPS range far from the brand's known infrastructure. Signal?",
    options: [
      "A mismatch with the brand's real hosting profile — a legitimate infrastructure-severity signal",
      "Proof of a mirror site",
      "Nothing at all",
      "Evidence of a content delivery network",
    ],
    answer: 0,
    explanation:
      "Real brands sit on their own recognisable infrastructure. Sudden divergence is worth scoring, with provenance recorded.",
  },
  {
    id: 98,
    category: "technical-indicators",
    question: "A sender domain publishes _dmarc with p=none. What does that mean?",
    options: [
      "The domain does not enforce DMARC, so spoofed mail claiming it may still be delivered",
      "All spoofed mail is rejected",
      "The domain is guaranteed safe",
      "Messages are end-to-end encrypted",
    ],
    answer: 0,
    explanation:
      "p=none is monitoring only. The domain offers no protective policy, so its absence cannot be read as a safety signal.",
  },
  {
    id: 99,
    category: "technical-indicators",
    question:
      "Which combination is the strongest 'safe' infrastructure profile?",
    options: [
      "An old registered domain, a cert matching the exact domain, the brand's real hosting, and few redirects",
      "HTTPS alone",
      "A short URL",
      "A visible padlock icon",
    ],
    answer: 0,
    explanation:
      "Trust accumulates from several independent, verifiable facts — none of them alone is sufficient.",
  },
  {
    id: 100,
    category: "technical-indicators",
    question:
      "A WHOIS lookup fails during analysis. Why must that never be scored as 'safe'?",
    options: [
      "Missing data means unknown, not clean — the signal must be marked unavailable rather than zero risk",
      "Failed queries are usually fine to ignore",
      "WHOIS results are optional decoration",
      "Unavailable checks default to safe by definition",
    ],
    answer: 0,
    explanation:
      "Treating absence of evidence as evidence of safety hides risk. Unavailable is its own explicit state in every signal.",
  },
];