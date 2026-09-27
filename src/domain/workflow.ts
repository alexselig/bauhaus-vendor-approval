import type {
  DocumentState,
  SecurityCheck,
  SecurityResult,
  Vendor,
  VendorDocument,
  VendorDraft,
} from "./model";

const SECURITY_CHECKS = [
  ["sensitive-data", "Sensitive data access"],
  ["authentication", "Authentication"],
  ["encryption", "Encryption"],
  ["incident-response", "Incident response"],
  ["subprocessors", "Subprocessors"],
  ["continuity", "Business continuity"],
] as const;

function event(description: string, at: string) {
  return {
    id: crypto.randomUUID(),
    at,
    actor: "Alex Morgan",
    description,
  };
}

export function requiredDocumentsFor(draft: VendorDraft, now = ""): VendorDocument[] {
  const names = ["W-9", "Certificate of insurance", "References or portfolio"];
  if (draft.dataAccess !== "None") names.push("Security questionnaire");
  if (draft.dataAccess === "Confidential") names.push("Data processing agreement");
  if (draft.riskTier === "High") names.push("SOC 2 report");

  return names.map((name, index) => ({
    id: `document-${index + 1}`,
    name,
    required: true,
    state: "Requested",
    updatedAt: now,
  }));
}

export function createSecurityChecks(): SecurityCheck[] {
  return SECURITY_CHECKS.map(([id, label]) => ({
    id,
    label,
    result: "Unanswered",
    note: "",
  }));
}

export function createVendor(draft: VendorDraft, now: string): Vendor {
  return {
    ...draft,
    id: crypto.randomUUID(),
    status: "Documents requested",
    submittedAt: now,
    updatedAt: now,
    documents: requiredDocumentsFor(draft, now),
    securityChecks: createSecurityChecks(),
    decisionReason: "",
    notes: "",
    activity: [
      event("Security review started", now),
      event("Document requests prepared and sent to vendor contact", now),
      event("Vendor intake confirmed from demo-generated company data", now),
    ],
  };
}

export function getSecurityState(vendor: Vendor) {
  if (vendor.securityChecks.some((check) => check.result === "Concern")) return "Needs attention";
  if (vendor.securityChecks.every((check) => check.result === "Unanswered")) return "Not started";
  if (vendor.securityChecks.every((check) => check.result !== "Unanswered")) return "Complete";
  return "In progress";
}

export function canApprove(vendor: Vendor) {
  return (
    vendor.documents.filter((item) => item.required).every((item) => item.state === "Accepted") &&
    vendor.securityChecks.every(
      (check) => check.result === "Pass" || check.result === "Not applicable",
    )
  );
}

export function getNextAction(vendor: Vendor) {
  if (vendor.status === "Approved") return "No action required";
  if (vendor.status === "Rejected") return "Review rejection notes";
  const concernCount = vendor.securityChecks.filter((check) => check.result === "Concern").length;
  if (concernCount) return `Resolve ${concernCount} security concern${concernCount > 1 ? "s" : ""}`;
  const missing = vendor.documents.filter((item) => item.required && item.state !== "Accepted");
  if (missing.length) return `${missing.length} document${missing.length > 1 ? "s" : ""} outstanding`;
  if (getSecurityState(vendor) !== "Complete") return "Complete security review";
  return "Ready for approval";
}

export function updateDocument(
  vendor: Vendor,
  documentId: string,
  state: DocumentState,
  now: string,
) {
  const document = vendor.documents.find((item) => item.id === documentId);
  if (!document) throw new Error("Document not found");
  return {
    ...vendor,
    status: vendor.status === "Documents requested" && state !== "Requested"
      ? "Under review" as const
      : vendor.status,
    updatedAt: now,
    documents: vendor.documents.map((item) =>
      item.id === documentId ? { ...item, state, updatedAt: now } : item
    ),
    activity: [event(`${document.name} marked ${state}`, now), ...vendor.activity],
  };
}

export function updateSecurityCheck(
  vendor: Vendor,
  checkId: string,
  result: SecurityResult,
  note: string,
  now: string,
) {
  const check = vendor.securityChecks.find((item) => item.id === checkId);
  if (!check) throw new Error("Security check not found");
  return {
    ...vendor,
    status: vendor.status === "Documents requested" ? "Under review" as const : vendor.status,
    updatedAt: now,
    securityChecks: vendor.securityChecks.map((item) =>
      item.id === checkId ? { ...item, result, note } : item
    ),
    activity: [event(`${check.label} marked ${result}`, now), ...vendor.activity],
  };
}

export function approveVendor(vendor: Vendor, now: string) {
  if (!canApprove(vendor)) throw new Error("Vendor is not ready for approval");
  return {
    ...vendor,
    status: "Approved" as const,
    updatedAt: now,
    activity: [event("Vendor approved for engagement", now), ...vendor.activity],
  };
}

export function rejectVendor(vendor: Vendor, reason: string, now: string) {
  if (!reason.trim()) throw new Error("A rejection reason is required");
  return {
    ...vendor,
    status: "Rejected" as const,
    decisionReason: reason.trim(),
    updatedAt: now,
    activity: [event(`Vendor rejected: ${reason.trim()}`, now), ...vendor.activity],
  };
}

export function addVendorNote(vendor: Vendor, note: string, now: string) {
  if (!note.trim()) throw new Error("A note is required");
  return {
    ...vendor,
    notes: note.trim(),
    updatedAt: now,
    activity: [event(`Note added: ${note.trim()}`, now), ...vendor.activity],
  };
}
