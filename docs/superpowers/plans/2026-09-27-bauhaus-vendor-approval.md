# Bauhaus Vendor Approval Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished frontend demo where a procurement manager enters a vendor name and website, reviews an automatically populated intake form, triggers document and security reviews, and tracks the vendor through approval.

**Architecture:** Use a Vite React application with typed domain functions owning all workflow rules and a small React context store owning persistence. Route-level pages compose focused intake, dashboard, document, security, decision, and activity components. Simulated company research is deterministic and isolated behind a service interface so the later visual reskin does not affect behavior.

**Tech Stack:** Vite, React, TypeScript, React Router, Vitest, Testing Library, CSS custom properties, `localStorage`

## Global Constraints

- The product is a frontend-only demo with no live research, email, upload, scanning, backend, database, or authentication.
- The primary user is a procurement manager.
- The main automation starts from a company name and website.
- Every generated field is editable before vendor confirmation.
- Confirming a vendor automatically requests required documents and starts the security review.
- Approval requires all required documents to be accepted and no unresolved security concerns.
- Rejection requires a reason.
- All demo data is fictional and generated results are labeled as demo-generated.
- The authoritative visual reference is `https://claude.ai/artifact/66et3aWAsBME7ahXYGbPdY`.
- Visual tokens and component behavior must remain separable.
- The repository is `alexselig/bauhaus-vendor-approval`.

## File Structure

```text
src/
  app/
    App.tsx                 Route shell and global navigation
    App.test.tsx            Primary demo-flow integration test
  components/
    ActivityTimeline.tsx    Timestamped vendor activity
    ApprovalPanel.tsx       Eligibility, approve, reject, and notes
    DocumentChecklist.tsx   Required-document states and actions
    EmptyState.tsx          Shared zero-result presentation
    MetricStrip.tsx         Dashboard summary metrics
    SecurityReview.tsx      Security checklist and computed state
    StatusBadge.tsx         Text-plus-color status treatment
    VendorTable.tsx         Sortable vendor portfolio table
  domain/
    model.ts                Domain types and constants
    workflow.ts             Pure transitions and derived state
    workflow.test.ts        Workflow rule tests
  features/
    intake/
      NewVendorPage.tsx     Research, review, and confirmation flow
      NewVendorPage.test.tsx
      vendorResearch.ts     Deterministic fake research service
      vendorResearch.test.ts
    vendors/
      VendorDetailPage.tsx  Vendor review workspace
      VendorsPage.tsx       Dashboard filters and portfolio
      VendorsPage.test.tsx
  state/
    VendorStore.tsx         React context, persistence, and actions
    persistence.ts          Safe localStorage hydration
    persistence.test.ts
  data/
    seed.ts                 Fictional portfolio and reset source
  styles/
    tokens.css              Replaceable visual tokens
    global.css              Layout and component styles
  main.tsx                  Browser entry point
README.md                   Setup and demo walkthrough
package.json                Scripts and dependencies
vite.config.ts              Vite and Vitest configuration
```

---

### Task 1: Scaffold the Application and Domain Model

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/domain/model.ts`
- Create: `src/data/seed.ts`

**Interfaces:**
- Produces: `Vendor`, `VendorDocument`, `SecurityCheck`, `ActivityEvent`, `VendorStatus`, `RiskTier`, `DocumentState`, `SecurityResult`, `VendorDraft`, and `createSeedVendors(): Vendor[]`.
- Consumes: no project code.

- [ ] **Step 1: Create the package and test configuration**

```json
{
  "name": "bauhaus-vendor-approval",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "jsdom": "^27.0.0",
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  }
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

- [ ] **Step 2: Define the complete domain model**

Create `src/domain/model.ts`:

```ts
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
```

- [ ] **Step 3: Create 14 fictional vendors**

Create `src/data/seed.ts` with `createSeedVendors()` returning fresh objects on
each call. Include categories such as structural engineering, visualization,
materials, printing, surveying, sustainability, cloud collaboration, and
facilities. Use fictional names including:

```ts
const vendorNames = [
  "Northline Structural",
  "Lumen Renderworks",
  "TerraForm Materials",
  "Fieldmark Surveying",
  "Carbon Arc Consulting",
  "Planroom Cloud",
  "StudioPrint Works",
  "Civic Access Labs",
  "Gridline MEP",
  "Monument Facilities",
  "Atlas Model Shop",
  "Keystone Acoustics",
  "Harbor Site Services",
  "Juniper Workplace",
];
```

Make the portfolio contain at least four approved vendors, one rejected
vendor, one unresolved security concern, and three vendors blocked on distinct
documents. Every event timestamp must be a fixed ISO string so tests remain
deterministic.

- [ ] **Step 4: Add the browser entry point**

Create `index.html`, `src/main.tsx`, and `src/test/setup.ts`:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { VendorStoreProvider } from "./state/VendorStore";
import "./styles/tokens.css";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <VendorStoreProvider>
        <App />
      </VendorStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Install dependencies and verify the scaffold**

Run: `npm install && npm run build`

Expected: dependencies install and the build initially fails only because
`App`, `VendorStore`, and style files are introduced in later tasks. Do not
commit generated `dist/`.

- [ ] **Step 6: Commit the scaffold and domain data**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src
git commit -m "chore: scaffold vendor approval demo"
```

---

### Task 2: Implement Workflow Rules and Persistence

**Files:**
- Create: `src/domain/workflow.ts`
- Create: `src/domain/workflow.test.ts`
- Create: `src/state/persistence.ts`
- Create: `src/state/persistence.test.ts`
- Create: `src/state/VendorStore.tsx`

**Interfaces:**
- Consumes: domain types and `createSeedVendors()`.
- Produces: `requiredDocumentsFor(draft)`, `createVendor(draft, now)`,
  `getSecurityState(vendor)`, `canApprove(vendor)`, `getNextAction(vendor)`,
  `updateDocument(vendor, documentId, state, now)`,
  `updateSecurityCheck(vendor, checkId, result, note, now)`,
  `approveVendor(vendor, now)`, `rejectVendor(vendor, reason, now)`,
  `loadVendors(storage)`, `saveVendors(storage, vendors)`, and
  `useVendorStore()`.

- [ ] **Step 1: Write failing workflow tests**

Create `src/domain/workflow.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  approveVendor,
  canApprove,
  createVendor,
  rejectVendor,
  requiredDocumentsFor,
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
  it("requires security and data documents for a high-risk vendor", () => {
    expect(requiredDocumentsFor(draft).map((item) => item.name)).toEqual(
      expect.arrayContaining([
        "W-9",
        "Certificate of insurance",
        "Security questionnaire",
        "Data processing agreement",
        "SOC 2 report",
      ]),
    );
  });

  it("creates a vendor with requested documents and a started review", () => {
    const vendor = createVendor(draft, "2026-09-27T21:00:00.000Z");
    expect(vendor.status).toBe("Documents requested");
    expect(vendor.documents.every((item) => item.state === "Requested")).toBe(true);
    expect(vendor.securityChecks.every((item) => item.result === "Unanswered")).toBe(true);
  });

  it("blocks approval until requirements are complete", () => {
    expect(canApprove(createVendor(draft, "2026-09-27T21:00:00.000Z"))).toBe(false);
  });

  it("requires a reason to reject", () => {
    const vendor = createVendor(draft, "2026-09-27T21:00:00.000Z");
    expect(() => rejectVendor(vendor, " ", "2026-09-27T22:00:00.000Z")).toThrow(
      "A rejection reason is required",
    );
  });

  it("refuses invalid approval", () => {
    const vendor = createVendor(draft, "2026-09-27T21:00:00.000Z");
    expect(() => approveVendor(vendor, "2026-09-27T22:00:00.000Z")).toThrow(
      "Vendor is not ready for approval",
    );
  });
});
```

- [ ] **Step 2: Run workflow tests and verify failure**

Run: `npm test -- src/domain/workflow.test.ts`

Expected: FAIL because `src/domain/workflow.ts` does not exist.

- [ ] **Step 3: Implement pure workflow functions**

Create `src/domain/workflow.ts`. Use immutable returns and this document rule:

```ts
export function requiredDocumentsFor(draft: VendorDraft): VendorDocument[] {
  const names = ["W-9", "Certificate of insurance", "References or portfolio"];
  if (draft.dataAccess !== "None") names.push("Security questionnaire");
  if (draft.dataAccess === "Confidential") names.push("Data processing agreement");
  if (draft.riskTier === "High") names.push("SOC 2 report");

  return names.map((name, index) => ({
    id: `document-${index + 1}`,
    name,
    required: true,
    state: "Requested",
    updatedAt: "",
  }));
}
```

Define six security checks with stable IDs for sensitive data, authentication,
encryption, incident response, subprocessors, and business continuity.
`canApprove()` returns true only when every required document is `Accepted`,
every check is answered, and no check is `Concern`.

- [ ] **Step 4: Run workflow tests**

Run: `npm test -- src/domain/workflow.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing persistence tests**

Create `src/state/persistence.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSeedVendors } from "../data/seed";
import { loadVendors, saveVendors } from "./persistence";

function memoryStorage(initial?: string): Storage {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
    removeItem: () => { value = null; },
    clear: () => { value = null; },
    key: () => null,
    get length() { return value ? 1 : 0; },
  };
}

it("round-trips vendors", () => {
  const storage = memoryStorage();
  const vendors = createSeedVendors();
  saveVendors(storage, vendors);
  expect(loadVendors(storage).vendors).toEqual(vendors);
  expect(loadVendors(storage).recovered).toBe(false);
});

it("recovers from invalid saved data", () => {
  const result = loadVendors(memoryStorage("{bad"));
  expect(result.vendors).toHaveLength(14);
  expect(result.recovered).toBe(true);
});
```

- [ ] **Step 6: Implement persistence and store**

Use storage key `bauhaus.vendor-demo.v1`. `loadVendors()` returns
`{ vendors: Vendor[]; recovered: boolean }`. `VendorStoreProvider` exposes:

```ts
interface VendorStoreValue {
  vendors: Vendor[];
  recoveryNotice: boolean;
  addVendor(draft: VendorDraft): Vendor;
  updateDocument(vendorId: string, documentId: string, state: DocumentState): void;
  updateSecurity(vendorId: string, checkId: string, result: SecurityResult, note: string): void;
  addNote(vendorId: string, note: string): void;
  approve(vendorId: string): void;
  reject(vendorId: string, reason: string): void;
  resetDemo(): void;
}
```

Persist after every state-changing action. Throw explicit errors for missing
vendor IDs rather than silently returning.

- [ ] **Step 7: Run domain and persistence tests**

Run: `npm test -- src/domain/workflow.test.ts src/state/persistence.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit workflow behavior**

```bash
git add src/domain src/state src/data/seed.ts
git commit -m "feat: add vendor approval workflow"
```

---

### Task 3: Build Simulated Vendor Research and Automated Intake

**Files:**
- Create: `src/features/intake/vendorResearch.ts`
- Create: `src/features/intake/vendorResearch.test.ts`
- Create: `src/features/intake/NewVendorPage.tsx`
- Create: `src/features/intake/NewVendorPage.test.tsx`

**Interfaces:**
- Consumes: `VendorDraft` and `useVendorStore().addVendor`.
- Produces: `researchVendor(input): Promise<VendorDraft>` and the `/vendors/new`
  route page.

- [ ] **Step 1: Write failing research tests**

```ts
import { describe, expect, it } from "vitest";
import { researchVendor } from "./vendorResearch";

describe("researchVendor", () => {
  it("returns the curated Threshold demo profile", async () => {
    const result = await researchVendor({
      companyName: "Threshold Architectural Doors",
      website: "https://threshold-doors.example",
      businessOwner: "Elena Park",
      intendedUse: "Custom doors, frames, and hardware packages for civic and workplace projects",
    });

    expect(result).toMatchObject({
      category: "Architectural doors and hardware",
      contactName: "Clara Voss",
      dataAccess: "Business",
      riskTier: "Medium",
    });
  });

  it("generates stable fallback data from any company name", async () => {
    const first = await researchVendor({
      companyName: "Example Studio",
      website: "https://example-studio.example",
      businessOwner: "Maya Chen",
      intendedUse: "Concept visualization",
    });
    const second = await researchVendor({
      companyName: "Example Studio",
      website: "https://example-studio.example",
      businessOwner: "Maya Chen",
      intendedUse: "Concept visualization",
    });
    expect(second).toEqual(first);
  });
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/features/intake/vendorResearch.test.ts`

Expected: FAIL because the research service does not exist.

- [ ] **Step 3: Implement deterministic research**

Create a curated profile for:

```ts
export const SHOWCASE_VENDOR = {
  companyName: "Threshold Architectural Doors",
  website: "https://threshold-doors.example",
  category: "Architectural doors and hardware",
  contactName: "Clara Voss",
  contactEmail: "clara@threshold-doors.example",
  dataAccess: "Business",
  riskTier: "Medium",
} as const;
```

`researchVendor()` must wait 1,800 ms in the browser so the automation sequence
is visible. Under `import.meta.env.MODE === "test"`, resolve immediately. For
fallbacks, derive an index from a simple sum of company-name character codes
and select stable values from fixed category, contact, access, and risk arrays.

- [ ] **Step 4: Write the failing intake-page test**

```tsx
it("researches, allows edits, and confirms a vendor", async () => {
  const user = userEvent.setup();
  render(<TestApp initialEntries={["/vendors/new"]} />);

  await user.type(screen.getByLabelText("Company name"), "Threshold Architectural Doors");
  await user.type(screen.getByLabelText("Website"), "https://threshold-doors.example");
  await user.selectOptions(screen.getByLabelText("Business owner"), "Elena Park");
  await user.type(screen.getByLabelText("Intended use"), "Custom doors, frames, and hardware packages for civic and workplace projects");
  await user.click(screen.getByRole("button", { name: "Research and prepare submission" }));

  expect(await screen.findByDisplayValue("Architectural doors and hardware")).toBeInTheDocument();
  expect(screen.getByText("Demo-generated company data")).toBeInTheDocument();

  await user.clear(screen.getByLabelText("Vendor contact"));
  await user.type(screen.getByLabelText("Vendor contact"), "Cora Voss");
  await user.click(screen.getByRole("button", { name: "Confirm and start review" }));

  expect(await screen.findByText("Documents requested")).toBeInTheDocument();
});
```

- [ ] **Step 5: Implement the three-state intake page**

`NewVendorPage` has three explicit phases:

1. `input` - company name, website, owner, and intended use.
2. `researching` - visible progress list with timed completed states for
   identity, services, contact, data access, risk, and requirements.
3. `review` - editable complete `VendorDraft` plus the
   `Demo-generated company data` disclosure.

On confirmation call `addVendor(draft)` and navigate to `/vendors/:vendorId`.
Show inline required-field errors and keep all entered data after validation
failures.

- [ ] **Step 6: Run intake tests**

Run:
`npm test -- src/features/intake/vendorResearch.test.ts src/features/intake/NewVendorPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit automated intake**

```bash
git add src/features/intake
git commit -m "feat: automate vendor intake demo"
```

---

### Task 4: Build the Vendor Dashboard

**Files:**
- Create: `src/components/MetricStrip.tsx`
- Create: `src/components/StatusBadge.tsx`
- Create: `src/components/VendorTable.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/features/vendors/VendorsPage.tsx`
- Create: `src/features/vendors/VendorsPage.test.tsx`

**Interfaces:**
- Consumes: `Vendor[]`, `getNextAction(vendor)`, React Router navigation, and
  `useVendorStore()`.
- Produces: `/vendors` page with metrics, search, filters, sorting, reset, and
  vendor navigation.

- [ ] **Step 1: Write failing dashboard tests**

```tsx
it("filters vendors by search and status", async () => {
  const user = userEvent.setup();
  render(<TestApp initialEntries={["/vendors"]} />);

  expect(screen.getByRole("heading", { name: "Vendor approvals" })).toBeInTheDocument();
  await user.type(screen.getByLabelText("Search vendors"), "Northline");
  expect(screen.getByText("Northline Structural")).toBeInTheDocument();
  expect(screen.queryByText("Lumen Renderworks")).not.toBeInTheDocument();

  await user.clear(screen.getByLabelText("Search vendors"));
  await user.selectOptions(screen.getByLabelText("Status"), "Approved");
  expect(screen.getAllByText("Approved").length).toBeGreaterThan(1);
  expect(screen.queryByText("Documents requested")).not.toBeInTheDocument();
});

it("shows an actionable empty state", async () => {
  const user = userEvent.setup();
  render(<TestApp initialEntries={["/vendors"]} />);
  await user.type(screen.getByLabelText("Search vendors"), "no matching vendor");
  expect(screen.getByText("No vendors match these filters")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run dashboard tests and verify failure**

Run: `npm test -- src/features/vendors/VendorsPage.test.tsx`

Expected: FAIL because the dashboard does not exist.

- [ ] **Step 3: Implement dashboard derivations**

In `VendorsPage`, keep this filter state:

```ts
interface Filters {
  query: string;
  status: VendorStatus | "All";
  risk: RiskTier | "All";
  category: string | "All";
  owner: string | "All";
  sort: "updated-desc" | "name-asc" | "risk-desc";
}
```

Search case-insensitively across company name, category, owner, contact name,
and contact email. Risk order is `High`, `Medium`, `Low`. Metrics show total,
approved, active review, and blocked; blocked means a required document is
`Needs revision` or a security check is `Concern`.

- [ ] **Step 4: Implement the vendor table**

Use semantic `<table>` markup. Every row is keyboard navigable through a
vendor-name link. Columns are Vendor, Owner, Risk, Documents, Security, Status,
Updated, and Next action. Render status text through `StatusBadge`, not through
color-only dots.

- [ ] **Step 5: Implement reset and new-vendor actions**

`Submit vendor` navigates to `/vendors/new`. `Reset demo` opens a native
confirmation dialog and calls `resetDemo()` only after confirmation.

- [ ] **Step 6: Run dashboard tests**

Run: `npm test -- src/features/vendors/VendorsPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the dashboard**

```bash
git add src/components src/features/vendors/VendorsPage.tsx src/features/vendors/VendorsPage.test.tsx
git commit -m "feat: add vendor approval dashboard"
```

---

### Task 5: Build the Vendor Review Workspace

**Files:**
- Create: `src/components/ActivityTimeline.tsx`
- Create: `src/components/ApprovalPanel.tsx`
- Create: `src/components/DocumentChecklist.tsx`
- Create: `src/components/SecurityReview.tsx`
- Create: `src/features/vendors/VendorDetailPage.tsx`
- Create: `src/features/vendors/VendorDetailPage.test.tsx`

**Interfaces:**
- Consumes: vendor store actions and workflow derivations.
- Produces: `/vendors/:vendorId` workspace.

- [ ] **Step 1: Write failing workspace tests**

```tsx
it("updates documents and security checks", async () => {
  const user = userEvent.setup();
  render(<TestApp initialEntries={["/vendors/vendor-under-review"]} />);

  await user.selectOptions(screen.getByLabelText("W-9 status"), "Accepted");
  expect(screen.getByText(/W-9 accepted/)).toBeInTheDocument();

  await user.selectOptions(screen.getByLabelText("Encryption result"), "Pass");
  expect(screen.getByText(/Encryption marked Pass/)).toBeInTheDocument();
});

it("explains why approval is blocked", () => {
  render(<TestApp initialEntries={["/vendors/vendor-security-concern"]} />);
  expect(screen.getByRole("button", { name: "Approve vendor" })).toBeDisabled();
  expect(screen.getByText(/Resolve 1 security concern/)).toBeInTheDocument();
});

it("requires a rejection reason", async () => {
  const user = userEvent.setup();
  render(<TestApp initialEntries={["/vendors/vendor-under-review"]} />);
  await user.click(screen.getByRole("button", { name: "Reject vendor" }));
  expect(screen.getByText("Enter a reason before rejecting this vendor")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run workspace tests and verify failure**

Run: `npm test -- src/features/vendors/VendorDetailPage.test.tsx`

Expected: FAIL because the workspace components do not exist.

- [ ] **Step 3: Implement overview and documents**

The page header shows vendor name, category, status, risk, business owner,
contact, submission date, intended use, and `getNextAction(vendor)`.
`DocumentChecklist` renders every document as a row with a labeled select.
Approved or rejected vendors render document controls disabled.

- [ ] **Step 4: Implement security review**

`SecurityReview` renders the six checks with `Pass`, `Concern`, and
`Not applicable` controls plus a note input. Show computed state:

```ts
type SecurityState = "Not started" | "In progress" | "Needs attention" | "Complete";
```

Persist each change immediately and add an activity item that includes the
check label and result.

- [ ] **Step 5: Implement decision controls**

`ApprovalPanel` renders:

- an eligibility summary listing exact incomplete documents and concerns;
- an enabled `Approve vendor` button only when `canApprove(vendor)` is true;
- a rejection-reason textarea;
- a `Reject vendor` button that shows an inline error for an empty reason;
- a general note field and `Add note` action.

After a decision, replace controls with the decision and reason while leaving
notes enabled.

- [ ] **Step 6: Implement activity timeline**

Sort events descending by timestamp. Render actor, description, and a formatted
date. Use a semantic ordered list. Do not synthesize events inside the
component; it only presents `vendor.activity`.

- [ ] **Step 7: Handle missing vendors**

For an unknown ID, render `Vendor not found` with a link back to `/vendors`.
Do not fall back to another vendor.

- [ ] **Step 8: Run workspace tests**

Run: `npm test -- src/features/vendors/VendorDetailPage.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit the workspace**

```bash
git add src/components src/features/vendors/VendorDetailPage.tsx src/features/vendors/VendorDetailPage.test.tsx
git commit -m "feat: add vendor review workspace"
```

---

### Task 6: Integrate Routes and Add the Replaceable Visual System

**Files:**
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: all route pages and `VendorStoreProvider`.
- Produces: complete navigable and responsive demo.

- [ ] **Step 1: Write the failing primary-flow integration test**

```tsx
it("completes automated intake and opens the generated review", async () => {
  const user = userEvent.setup();
  render(<TestApp initialEntries={["/vendors/new"]} />);

  await user.type(screen.getByLabelText("Company name"), "Threshold Architectural Doors");
  await user.type(screen.getByLabelText("Website"), "https://threshold-doors.example");
  await user.selectOptions(screen.getByLabelText("Business owner"), "Elena Park");
  await user.type(screen.getByLabelText("Intended use"), "Custom doors, frames, and hardware packages for civic and workplace projects");
  await user.click(screen.getByRole("button", { name: "Research and prepare submission" }));
  await screen.findByText("Demo-generated company data");
  await user.click(screen.getByRole("button", { name: "Confirm and start review" }));

  expect(await screen.findByRole("heading", { name: "Threshold Architectural Doors" })).toBeInTheDocument();
  expect(screen.getByText("Documents requested")).toBeInTheDocument();
  expect(screen.getByText(/Document requests prepared/)).toBeInTheDocument();
  expect(screen.getByText(/Security review started/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Implement routing and shell**

Create `src/app/App.tsx`:

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import { NewVendorPage } from "../features/intake/NewVendorPage";
import { VendorDetailPage } from "../features/vendors/VendorDetailPage";
import { VendorsPage } from "../features/vendors/VendorsPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="wordmark" href="/vendors">BAUHAUS</a>
        <span className="product-label">Vendor approval</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/vendors" replace />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/new" element={<NewVendorPage />} />
          <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="*" element={<Navigate to="/vendors" replace />} />
        </Routes>
      </main>
    </div>
  );
}
```

Use `Link` rather than `<a>` in the final implementation so client-side
navigation does not reload the app.

- [ ] **Step 3: Define replaceable design tokens**

Inspect the supplied design artifact in an authenticated browser and translate
its colors, typography, spacing, borders, and status treatments into
`src/styles/tokens.css`. Keep the following complete fallback token set only
when the artifact is temporarily inaccessible:

```css
:root {
  --color-canvas: #f7f6f2;
  --color-panel: #ffffff;
  --color-ink: #161616;
  --color-muted: #66645f;
  --color-rule: #d8d5cd;
  --color-accent: #1e4d42;
  --color-approved: #2e6759;
  --color-review: #87661d;
  --color-blocked: #9b3f2e;
  --color-info: #355d7a;
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --rule: 1px solid var(--color-rule);
}
```

Keep selectors in `global.css` semantic and component-oriented. Do not hardcode
colors outside `tokens.css`.

- [ ] **Step 4: Implement responsive layout**

At widths below `760px`:

- stack dashboard controls;
- allow the vendor table wrapper to scroll horizontally;
- collapse two-column workspace sections into one column;
- keep primary actions full width;
- preserve visible field labels.

Use crisp borders, minimal elevation, restrained status fills, and no
decorative gradients or glass effects.

- [ ] **Step 5: Run the integration test**

Run: `npm test -- src/app/App.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run the complete suite and production build**

Run: `npm test && npm run build`

Expected: all tests pass and Vite writes a successful production build to
`dist/`.

- [ ] **Step 7: Commit app integration**

```bash
git add src/app src/styles src/main.tsx
git commit -m "feat: integrate Bauhaus procurement demo"
```

---

### Task 7: Document and Verify the Demo

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Modify: `docs/superpowers/specs/2026-09-27-bauhaus-vendor-approval-design.md`
  only if implementation reveals a genuine design correction.

**Interfaces:**
- Consumes: the completed application.
- Produces: reproducible setup and a concise demo script.

- [ ] **Step 1: Add repository hygiene**

Create `.gitignore`:

```gitignore
node_modules/
dist/
.DS_Store
coverage/
*.local
```

- [ ] **Step 2: Write the README**

Include:

```md
# Bauhaus Vendor Approval

A fictional frontend demo for an architecture firm's procurement workflow.
All companies, contacts, documents, and review results are demo data.

## Run locally

```bash
npm install
npm run dev
```

## Demo walkthrough

1. Open Vendor approvals and scan the blocked and active vendors.
2. Select Submit vendor.
3. Enter `Threshold Architectural Doors` and
   `https://threshold-doors.example`.
4. Choose Elena Park and describe the architectural-door package.
5. Run the simulated research, review the populated form, and confirm.
6. Inspect the automatically requested documents and started security review.
7. Complete requirements and approve the vendor.

## Commands

- `npm run dev` - start the local demo
- `npm test` - run behavior tests
- `npm run build` - create a production build
```

- [ ] **Step 3: Verify the primary walkthrough manually**

Run: `npm run dev -- --host 127.0.0.1`

Verify:

1. Dashboard loads with 14 vendors and credible mixed states.
2. Search, filters, sorting, and reset work.
3. Threshold research visibly progresses and fills the expected fields.
4. Generated fields remain editable.
5. Confirmation creates the vendor, requests documents, and starts security.
6. Approval stays blocked until all requirements are complete.
7. Rejection cannot proceed without a reason.
8. Refresh preserves changes.
9. Reset restores exactly the seeded portfolio.

Expected: all nine checks pass without console errors.

- [ ] **Step 4: Run final automated verification**

Run: `npm test && npm run build && git status --short`

Expected: tests pass, build succeeds, and only the README and `.gitignore`
changes remain uncommitted.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md .gitignore
git commit -m "docs: add demo setup and walkthrough"
git push
```
