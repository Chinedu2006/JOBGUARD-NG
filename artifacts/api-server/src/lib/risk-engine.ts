export type RiskLevel = "low" | "caution" | "high" | "very-high";
export type SignalSeverity = "red-flag" | "warning" | "positive";

export type DetectedSignal = {
  severity: SignalSeverity;
  title: string;
  explanation: string;
  score: number;
};

export type ExtractedInformation = {
  organization: string | null;
  opportunityType: string | null;
  location: string | null;
  deadline: string | null;
  contactMethod: string | null;
  paymentRequested: string | null;
  website: string | null;
};

export type AnalysisResult = {
  riskScore: number;
  riskLevel: RiskLevel;
  detectedSignals: DetectedSignal[];
  recommendation: string;
  extractedInformation: ExtractedInformation;
};

type Rule = {
  pattern: RegExp;
  score: number;
  severity: SignalSeverity;
  title: string;
  explanation: string;
};

// Keep scoring weights in one place so the assessment is explainable and easy to tune.
export const RISK_RULES: Rule[] = [
  {
    pattern: /\b(pay|payment|fee|fees|transfer|registration|processing fee|secure your slot|deposit)\b/i,
    score: 25,
    severity: "red-flag",
    title: "Payment requested",
    explanation: "Legitimate recruitment and scholarship opportunities generally should not require applicants to pay to secure a position.",
  },
  {
    pattern: /\b(bvn|nin|otp|one[- ]time password|password|pin|bank details|account number)\b/i,
    score: 20,
    severity: "red-flag",
    title: "Sensitive information requested",
    explanation: "The message asks for identity, banking, or account credentials that should not be shared with an unverified contact.",
  },
  {
    pattern: /\b(telegram|whatsapp|dm me|message me|send to my personal|gmail\.com|yahoo\.com|outlook\.com)\b/i,
    score: 15,
    severity: "warning",
    title: "Suspicious contact method",
    explanation: "The opportunity relies on informal messaging or a personal inbox instead of a traceable official application channel.",
  },
  {
    pattern: /\b(immediately|urgent|urgently|today only|act now|last chance|limited slots|before midnight|hurry)\b/i,
    score: 10,
    severity: "warning",
    title: "Urgency language",
    explanation: "Pressure to act immediately is a common tactic used to stop applicants from checking the organization or offer.",
  },
  {
    pattern: /\b(guaranteed job|100% job|sure job|automatic employment|you have been selected)\b/i,
    score: 10,
    severity: "warning",
    title: "Unrealistic promise",
    explanation: "Guaranteed employment or selection claims are unusual before a transparent application and assessment process.",
  },
  {
    pattern: /\b(₦|ngn|naira|\$)\s?[\d,]{4,}|\b(make|earn|salary|income)\b.{0,40}\b(₦|ngn|\$)\s?[\d,]{4,}/i,
    score: 10,
    severity: "warning",
    title: "Unrealistic earnings promise",
    explanation: "The financial promise may be disproportionate to the role or used to make an upfront payment feel worthwhile.",
  },
  {
    pattern: /https?:\/\/(?!([\w-]+\.)?(gov\.ng|edu\.ng|org\.ng|linkedin\.com|myworkdayjobs\.com)\b)[^\s]+/i,
    score: 5,
    severity: "warning",
    title: "Unverified link",
    explanation: "The link does not clearly match a known official or organizational domain. Verify it independently before opening or applying.",
  },
];

const typePatterns: Array<[RegExp, string]> = [
  [/\b(scholarship|bursary)\b/i, "Scholarship"],
  [/\b(internship|intern)\b/i, "Internship"],
  [/\b(grant|funding)\b/i, "Grant"],
  [/\b(fellowship)\b/i, "Fellowship"],
  [/\b(nysc|recruitment|employment|job|vacancy|role)\b/i, "Job / recruitment"],
];

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) return match[0];
  }
  return null;
}

function extractInformation(text: string, url?: string): ExtractedInformation {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const organization =
    text.match(/\b(?:at|from|with|by)\s+([A-Z][A-Za-z&.'-]*(?:\s+[A-Z][A-Za-z&.'-]*){0,4})/)?.[1] ??
    null;
  const opportunityType = typePatterns.find(([pattern]) => pattern.test(text))?.[1] ?? null;
  const location = firstMatch(text, [
    /\b(Lagos|Abuja|Port Harcourt|Ibadan|Enugu|Kano|Kaduna|Nigeria|Remote|Hybrid)\b/i,
  ]);
  const deadline =
    text.match(/\b(?:deadline|closes|apply by|before)\s*:?\s*([A-Za-z0-9,/-]+\s?[A-Za-z0-9,/-]*)/i)?.[1] ??
    null;
  const contactMethod = firstMatch(text, [
    /\b(?:[\w.+-]+@(?!gmail\.com|yahoo\.com|outlook\.com)[\w.-]+\.[A-Za-z]{2,})\b/i,
    /\b(?:[\w.+-]+@(gmail\.com|yahoo\.com|outlook\.com))\b/i,
    /\bWhatsApp\b/i,
    /\bTelegram\b/i,
    /\bDM\b/i,
  ]);
  const paymentRequested = firstMatch(text, [
    /(?:₦|NGN)\s?[\d,]+/i,
    /\b(?:registration|processing|application|transport|training)\s+fee\b/i,
    /\bpay\s+(?:to|a|the)\b/i,
  ]);
  const website = url ?? text.match(/https?:\/\/[^\s)]+/i)?.[0] ?? null;

  return {
    organization: organization ? organization.replace(/[.,;:]$/, "") : null,
    opportunityType,
    location,
    deadline,
    contactMethod,
    paymentRequested,
    website,
  };
}

export function analyzeOpportunity(text: string, url?: string): AnalysisResult {
  const normalizedText = `${text} ${url ?? ""}`.trim();
  const detectedSignals = RISK_RULES.filter((rule) => rule.pattern.test(normalizedText)).map(
    ({ pattern: _pattern, ...signal }) => signal,
  );

  if (detectedSignals.length === 0) {
    detectedSignals.push({
      severity: "positive",
      title: "No major warning signs detected",
      explanation: "The submitted content did not match the common warning signs in our checklist. Verify it through the organization’s official source before sharing information.",
      score: 0,
    });
  }

  const riskScore = Math.min(
    100,
    detectedSignals.reduce((total, signal) => total + signal.score, 0) +
      (detectedSignals.length >= 2 ? 15 : 0),
  );
  const riskLevel: RiskLevel =
    riskScore <= 30 ? "low" : riskScore <= 60 ? "caution" : riskScore <= 80 ? "high" : "very-high";

  const recommendation =
    riskLevel === "very-high" || riskLevel === "high"
      ? "Do not send money. Do not share your BVN, NIN or OTP. Verify through the organization’s official channel."
      : riskLevel === "caution"
        ? "Proceed carefully. Pause before sharing information and confirm the opportunity through an official source."
        : "No major warning signs detected, but verify the opportunity through the organization’s official source before sharing sensitive information.";

  return {
    riskScore,
    riskLevel,
    detectedSignals,
    recommendation,
    extractedInformation: extractInformation(text, url),
  };
}