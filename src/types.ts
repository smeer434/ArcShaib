export enum RiskLevel {
  SAFE = 0,
  WARNING = 1,
  DANGER = 2
}

export interface Finding {
  findingId: string;
  issueTitle: string;
  description: string;
  severity: "SAFE" | "WARNING" | "DANGER";
  remediation: string;
}

export interface AuditResult {
  address: string;
  usdcBalance: number;
  eurcBalance: number;
  txCount: number;
  contractInteractions: number;
  riskLevel: "SAFE" | "WARNING" | "DANGER";
  overallRiskScore: number;
  summary: string;
  associatedScams: string[];
  mitigationAdvice: string[];
  findings: Finding[];
}

export interface IntelAlert {
  id: string;
  title: string;
  severity: "SAFE" | "WARNING" | "DANGER";
  publishDate: string;
  summary: string;
}
