import type { DataAccess, RiskTier, VendorDraft } from "../../domain/model";

export interface ResearchInput {
  companyName: string;
  website: string;
  businessOwner: string;
  intendedUse: string;
}

export const SHOWCASE_VENDOR = {
  companyName: "Meridian Envelope Systems",
  website: "https://meridian-envelope.example",
  category: "Building envelope",
  contactName: "Noah Bennett",
  contactEmail: "noah@meridian-envelope.example",
  dataAccess: "Confidential" as DataAccess,
  riskTier: "High" as RiskTier,
};

const categories = [
  "Architecture technology",
  "Building systems",
  "Materials",
  "Visualization",
  "Site services",
];
const firstNames = ["Avery", "Morgan", "Jordan", "Taylor", "Riley"];
const lastNames = ["Stone", "Reed", "Brooks", "Quinn", "Hayes"];
const access: DataAccess[] = ["None", "Business", "Confidential"];
const risk: RiskTier[] = ["Low", "Medium", "High"];

export async function researchVendor(input: ResearchInput): Promise<VendorDraft> {
  if (import.meta.env.MODE !== "test") {
    await new Promise((resolve) => window.setTimeout(resolve, 1800));
  }
  const isShowcase = input.companyName.trim().toLowerCase() === SHOWCASE_VENDOR.companyName.toLowerCase();
  if (isShowcase) return { ...input, ...SHOWCASE_VENDOR };

  const score = [...input.companyName].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const website = input.website.startsWith("http") ? input.website : `https://${input.website}`;
  const domain = new URL(website).hostname.replace(/^www\./, "");
  const first = firstNames[score % firstNames.length];
  const last = lastNames[(score * 3) % lastNames.length];
  return {
    ...input,
    website,
    category: categories[score % categories.length],
    contactName: `${first} ${last}`,
    contactEmail: `${first.toLowerCase()}@${domain}`,
    dataAccess: access[score % access.length],
    riskTier: risk[(score + 1) % risk.length],
  };
}
