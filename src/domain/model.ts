export type VendorStatus =
  | "Submitted"
  | "Documents requested"
  | "Under review"
  | "Approved"
  | "Rejected";

export type RiskTier = "Low" | "Medium" | "High";
export type DataAccess = "None" | "Business" | "Confidential";
export type DocumentState =
  | "Not requested"
  | "Requested"
  | "Received"
  | "Accepted"
  | "Needs revision";
export type SecurityResult = "Unanswered" | "Pass" | "Concern" | "Not applicable";

export interface VendorDocument {
  id: string;
  name: string;
  required: boolean;
  state: DocumentState;
  updatedAt: string;
}

export interface SecurityCheck {
  id: string;
  label: string;
  result: SecurityResult;
  note: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  description: string;
}

export interface VendorDraft {
  companyName: string;
  website: string;
  category: string;
  businessOwner: string;
  contactName: string;
  contactEmail: string;
  intendedUse: string;
  dataAccess: DataAccess;
  riskTier: RiskTier;
}

export interface Vendor extends VendorDraft {
  id: string;
  status: VendorStatus;
  submittedAt: string;
  updatedAt: string;
  documents: VendorDocument[];
  securityChecks: SecurityCheck[];
  decisionReason: string;
  notes: string;
  activity: ActivityEvent[];
}
