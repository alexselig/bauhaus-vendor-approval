import { describe, expect, it } from "vitest";
import {
  approveVendor,
  canApprove,
  createVendor,
  rejectVendor,
  requiredDocumentsFor,
  updateDocument,
  updateSecurityCheck,
} from "./workflow";

const draft = {
  companyName: "Threshold Architectural Doors",
  website: "https://threshold-doors.example",
  category: "Architectural doors and hardware",
  businessOwner: "Elena Park",
  contactName: "Clara Voss",
  contactEmail: "clara@threshold-doors.example",
  intendedUse: "Custom doors, frames, and hardware packages for civic and workplace projects",
  dataAccess: "Business" as const,
  riskTier: "Medium" as const,
};

describe("vendor workflow", () => {
  it("derives requirements for a business-data vendor", () => {
    expect(requiredDocumentsFor(draft).map((item) => item.name)).toEqual(
      expect.arrayContaining([
        "W-9",
        "Certificate of insurance",
        "Security questionnaire",
      ]),
    );
    expect(requiredDocumentsFor(draft).map((item) => item.name)).not.toContain("SOC 2 report");
  });

  it("automatically requests documents and starts security review", () => {
    const vendor = createVendor(draft, "2026-09-27T21:00:00.000Z");
    expect(vendor.status).toBe("Documents requested");
    expect(vendor.documents.every((item) => item.state === "Requested")).toBe(true);
    expect(vendor.securityChecks.every((item) => item.result === "Unanswered")).toBe(true);
    expect(vendor.activity.map((item) => item.description)).toEqual(
      expect.arrayContaining(["Security review started", "Document requests prepared and sent to vendor contact"]),
    );
  });

  it("allows approval only after documents and security are complete", () => {
    let vendor = createVendor(draft, "2026-09-27T21:00:00.000Z");
    for (const document of vendor.documents) {
      vendor = updateDocument(vendor, document.id, "Accepted", "2026-09-27T22:00:00.000Z");
    }
    for (const check of vendor.securityChecks) {
      vendor = updateSecurityCheck(vendor, check.id, "Pass", "", "2026-09-27T22:00:00.000Z");
    }
    expect(canApprove(vendor)).toBe(true);
    expect(approveVendor(vendor, "2026-09-27T23:00:00.000Z").status).toBe("Approved");
  });

  it("rejects an empty rejection reason", () => {
    const vendor = createVendor(draft, "2026-09-27T21:00:00.000Z");
    expect(() => rejectVendor(vendor, " ", "2026-09-27T22:00:00.000Z")).toThrow(
      "A rejection reason is required",
    );
  });
});
