import { describe, expect, it } from "vitest";
import { researchVendor } from "./vendorResearch";

const input = {
  companyName: "Meridian Envelope Systems",
  website: "https://meridian-envelope.example",
  businessOwner: "Elena Park",
  intendedUse: "Facade consulting for civic projects",
};

describe("researchVendor", () => {
  it("returns the curated showcase profile", async () => {
    await expect(researchVendor(input)).resolves.toMatchObject({
      category: "Building envelope",
      contactName: "Noah Bennett",
      dataAccess: "Confidential",
      riskTier: "High",
    });
  });

  it("returns stable fallback results", async () => {
    const fallback = { ...input, companyName: "Example Studio", website: "example-studio.example" };
    expect(await researchVendor(fallback)).toEqual(await researchVendor(fallback));
  });
});
