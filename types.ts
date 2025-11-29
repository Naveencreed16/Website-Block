export enum FilterLevel {
  STRICT = 'STRICT',
  MODERATE = 'MODERATE',
  OFF = 'OFF'
}

export enum SafetyCategory {
  ADULT = 'Adult Content',
  VIOLENCE = 'Violence',
  HATE_SPEECH = 'Hate Speech',
  PROFANITY = 'Profanity',
  SAFE = 'Safe'
}

export interface AnalysisResult {
  isSafe: boolean;
  score: number; // 0 to 100, where 100 is completely safe
  categories: SafetyCategory[];
  reasoning: string;
  flaggedPhrases: string[];
}

export interface LogEntry {
  id: string;
  timestamp: number;
  snippet: string;
  result: AnalysisResult;
}

export interface Stats {
  totalScanned: number;
  blockedCount: number;
  categoryBreakdown: Record<string, number>;
}

export interface BlockedSite {
  id: string;
  url: string;
  category: string;
  blockStart: number | null; // Timestamp in ms. If set, blocking starts here.
  blockEnd: number | null;   // Timestamp in ms. If set, blocking ends here.
  // If both are null, blocked permanently.
}