# Door Manufacturer Demo Vendor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the automated-intake showcase company with a coherent fictional architectural door manufacturer.

**Architecture:** Keep the existing deterministic `SHOWCASE_VENDOR` integration and workflow unchanged. Update the curated vendor identity at its source, then update tests, prefilled copy, documentation, and historical executable examples so repository search returns no stale showcase references.

**Tech Stack:** React, TypeScript, Vitest, Markdown

## Global Constraints

- Company: `Threshold Architectural Doors`
- Website: `https://threshold-doors.example`
- Category: `Architectural doors and hardware`
- Contact: `Clara Voss`
- Email: `clara@threshold-doors.example`
- Intended use: `Custom doors, frames, and hardware packages for civic and workplace projects`
- Data access: `Business`
- Risk tier: `Medium`
- Preserve the Bauhaus architecture-firm identity and all workflow behavior.

---

### Task 1: Rename the Showcase Vendor Everywhere

**Files:**
- Modify: `src/features/intake/vendorResearch.ts`
- Modify: `src/features/intake/NewVendorPage.tsx`
- Modify: `src/features/intake/vendorResearch.test.ts`
- Modify: `src/domain/workflow.test.ts`
- Modify: `src/app/App.test.tsx`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-09-27-bauhaus-vendor-approval.md`

**Interfaces:**
- Consumes: the existing `SHOWCASE_VENDOR` object and deterministic `researchVendor()` match.
- Produces: the same types and behavior with Threshold Architectural Doors as the curated result.

- [ ] **Step 1: Update the failing expectations first**

Replace the test fixtures and assertions with:

```ts
const input = {
  companyName: "Threshold Architectural Doors",
  website: "https://threshold-doors.example",
  businessOwner: "Elena Park",
  intendedUse: "Custom doors, frames, and hardware packages for civic and workplace projects",
};
```

Assert:

```ts
expect(result).toMatchObject({
  category: "Architectural doors and hardware",
  contactName: "Clara Voss",
  dataAccess: "Business",
  riskTier: "Medium",
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
npm test -- src/features/intake/vendorResearch.test.ts src/domain/workflow.test.ts src/app/App.test.tsx
```

Expected: failures reference the previous showcase values.

- [ ] **Step 3: Update the curated vendor and intake defaults**

Set `SHOWCASE_VENDOR` to:

```ts
export const SHOWCASE_VENDOR = {
  companyName: "Threshold Architectural Doors",
  website: "https://threshold-doors.example",
  category: "Architectural doors and hardware",
  contactName: "Clara Voss",
  contactEmail: "clara@threshold-doors.example",
  dataAccess: "Business" as DataAccess,
  riskTier: "Medium" as RiskTier,
};
```

Set the default intended use in `NewVendorPage.tsx` to:

```ts
"Custom doors, frames, and hardware packages for civic and workplace projects"
```

- [ ] **Step 4: Update documentation and executable examples**

Replace the old company, domain, contact, category, and use-case text in
`README.md` and the original implementation plan. Keep historical architecture
decisions unchanged.

- [ ] **Step 5: Verify no stale identity remains**

Run:

```bash
rg -n "Meridian|meridian-envelope|Noah Bennett|Building envelope|Facade consulting" \
  src README.md
```

Expected: no matches.

- [ ] **Step 6: Run complete verification**

Run:

```bash
npm test && npm run build
```

Expected: 10 tests pass and the production build succeeds.

- [ ] **Step 7: Commit and push**

```bash
git add src README.md docs/superpowers
git commit -m "chore: rename showcase vendor as door manufacturer"
git push origin main
```
