import { describe, expect, it } from "vitest";
import { researchVendor } from "./vendorResearch";

const input = {
  companyName: "Threshold Architectural Doors",
  website: "https://threshold-doors.example",
  businessOwner: "Elena Park",
  intendedUse: "Custom doors, frames, and hardware packages for civic and workplace projects",
};

describe("researchVendor", () => {
  it("returns the curated showcase profile", async () => {
    await expect(researchVendor(input)).resolves.toMatchObject({
      category: "Architectural doors and hardware",
      contactName: "Clara Voss",
      dataAccess: "Business",
      riskTier: "Medium",
    });
  });

  it("returns stable fallback results", async () => {
    const fallback = { ...input, companyName: "Example Studio", website: "example-studio.example" };
    expect(await researchVendor(fallback)).toEqual(await researchVendor(fallback));
  });
});
