import type {
  DataAccess,
  DocumentState,
  RiskTier,
  SecurityResult,
  Vendor,
  VendorStatus,
} from "../domain/model";
import { createSecurityChecks, requiredDocumentsFor } from "../domain/workflow";

interface SeedInput {
  id: string;
  companyName: string;
  category: string;
  owner: string;
  risk: RiskTier;
  access: DataAccess;
  status: VendorStatus;
  updatedAt: string;
  documentStates?: DocumentState[];
  securityResults?: SecurityResult[];
  reason?: string;
}

const seeds: SeedInput[] = [
  { id: "northline", companyName: "Northline Structural", category: "Structural engineering", owner: "Maya Chen", risk: "Medium", access: "Business", status: "Approved", updatedAt: "2026-09-25T16:30:00.000Z" },
  { id: "lumen", companyName: "Lumen Renderworks", category: "Visualization", owner: "Jon Bell", risk: "Low", access: "None", status: "Approved", updatedAt: "2026-09-23T14:10:00.000Z" },
  { id: "terraform", companyName: "TerraForm Materials", category: "Materials", owner: "Elena Park", risk: "Medium", access: "Business", status: "Documents requested", updatedAt: "2026-09-27T18:00:00.000Z", documentStates: ["Accepted", "Requested", "Accepted", "Received"] },
  { id: "vendor-under-review", companyName: "Fieldmark Surveying", category: "Surveying", owner: "Maya Chen", risk: "Medium", access: "Business", status: "Under review", updatedAt: "2026-09-27T17:20:00.000Z", documentStates: ["Received", "Accepted", "Accepted", "Accepted"], securityResults: ["Pass", "Pass", "Unanswered"] },
  { id: "carbon-arc", companyName: "Carbon Arc Consulting", category: "Sustainability consulting", owner: "Sam Rivera", risk: "Low", access: "None", status: "Approved", updatedAt: "2026-09-20T10:45:00.000Z" },
  { id: "vendor-security-concern", companyName: "Planroom Cloud", category: "Cloud collaboration", owner: "Elena Park", risk: "High", access: "Confidential", status: "Under review", updatedAt: "2026-09-27T19:10:00.000Z", documentStates: ["Accepted", "Accepted", "Accepted", "Accepted", "Accepted", "Accepted"], securityResults: ["Pass", "Pass", "Pass", "Concern", "Pass", "Pass"] },
  { id: "studioprint", companyName: "StudioPrint Works", category: "Printing", owner: "Jon Bell", risk: "Low", access: "None", status: "Approved", updatedAt: "2026-09-18T11:00:00.000Z" },
  { id: "civic-access", companyName: "Civic Access Labs", category: "Accessibility consulting", owner: "Sam Rivera", risk: "Medium", access: "Business", status: "Rejected", updatedAt: "2026-09-24T13:00:00.000Z", reason: "Unable to meet insurance requirements for public-sector work." },
  { id: "gridline", companyName: "Gridline MEP", category: "MEP engineering", owner: "Maya Chen", risk: "Medium", access: "Business", status: "Documents requested", updatedAt: "2026-09-26T15:40:00.000Z", documentStates: ["Accepted", "Needs revision", "Accepted", "Accepted"] },
  { id: "monument", companyName: "Monument Facilities", category: "Facilities", owner: "Elena Park", risk: "High", access: "Confidential", status: "Documents requested", updatedAt: "2026-09-27T12:15:00.000Z", documentStates: ["Accepted", "Accepted", "Accepted", "Accepted", "Accepted", "Requested"] },
  { id: "atlas", companyName: "Atlas Model Shop", category: "Model fabrication", owner: "Jon Bell", risk: "Low", access: "None", status: "Submitted", updatedAt: "2026-09-27T09:30:00.000Z", documentStates: ["Not requested", "Not requested", "Not requested"] },
  { id: "keystone", companyName: "Keystone Acoustics", category: "Acoustical engineering", owner: "Sam Rivera", risk: "Medium", access: "Business", status: "Under review", updatedAt: "2026-09-26T20:30:00.000Z", documentStates: ["Accepted", "Accepted", "Received", "Accepted"], securityResults: ["Pass", "Pass", "Pass", "Pass"] },
  { id: "harbor", companyName: "Harbor Site Services", category: "Site logistics", owner: "Maya Chen", risk: "Low", access: "None", status: "Approved", updatedAt: "2026-09-16T09:20:00.000Z" },
  { id: "juniper", companyName: "Juniper Workplace", category: "Furniture systems", owner: "Elena Park", risk: "Medium", access: "Business", status: "Documents requested", updatedAt: "2026-09-25T17:00:00.000Z", documentStates: ["Accepted", "Accepted", "Needs revision", "Accepted"] },
];

function websiteFor(name: string) {
  return `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.example`;
}

function contactFor(name: string) {
  const first = name.split(" ")[0].toLowerCase();
  const domain = new URL(websiteFor(name)).hostname;
  return { name: `${name.split(" ")[0]} Partnerships`, email: `${first}@${domain}` };
}

function applyStates<T extends { state?: DocumentState; result?: SecurityResult }>(
  items: T[],
  values: Array<DocumentState | SecurityResult> | undefined,
  approvedValue: DocumentState | SecurityResult,
) {
  return items.map((item, index) => {
    const value = values?.[index] ?? approvedValue;
    return "state" in item ? { ...item, state: value as DocumentState } : { ...item, result: value as SecurityResult };
  });
}

export function createSeedVendors(): Vendor[] {
  return seeds.map((seed, index) => {
    const contact = contactFor(seed.companyName);
    const draft = {
      companyName: seed.companyName,
      website: websiteFor(seed.companyName),
      category: seed.category,
      businessOwner: seed.owner,
      contactName: contact.name,
      contactEmail: contact.email,
      intendedUse: `${seed.category} services for active Bauhaus projects.`,
      dataAccess: seed.access,
      riskTier: seed.risk,
    };
    const documents = requiredDocumentsFor(draft, seed.updatedAt);
    const approved = seed.status === "Approved";
    return {
      ...draft,
      id: seed.id,
      status: seed.status,
      submittedAt: `2026-09-${String(4 + index).padStart(2, "0")}T15:00:00.000Z`,
      updatedAt: seed.updatedAt,
      documents: applyStates(
        documents,
        seed.documentStates,
        approved ? "Accepted" : "Requested",
      ),
      securityChecks: applyStates(
        createSecurityChecks(),
        seed.securityResults,
        approved ? "Pass" : "Unanswered",
      ),
      decisionReason: seed.reason ?? "",
      notes: "",
      activity: [
        {
          id: `${seed.id}-activity-1`,
          at: seed.updatedAt,
          actor: index % 2 ? "Alex Morgan" : seed.owner,
          description: seed.status === "Approved"
            ? "Vendor approved for engagement"
            : seed.status === "Rejected"
              ? `Vendor rejected: ${seed.reason}`
              : "Review record updated",
        },
        {
          id: `${seed.id}-activity-2`,
          at: `2026-09-${String(4 + index).padStart(2, "0")}T15:00:00.000Z`,
          actor: seed.owner,
          description: "Vendor submitted for procurement review",
        },
      ],
    };
  });
}
