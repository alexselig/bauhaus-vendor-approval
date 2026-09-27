# Bauhaus Vendor Approval Demo - Design

## Purpose

Build a polished, believable procurement demo for an architecture firm named
Bauhaus. The product helps a procurement manager submit vendors, collect and
review required documents, record a lightweight security review, and move each
vendor through an approval decision.

The demo should make two questions easy to answer:

1. Which vendors are approved, blocked, or waiting on someone?
2. What action is needed next to move a vendor forward?

This is a frontend-only demo, not a production procurement system. It uses
realistic seeded data and persists changes in the browser.

## Primary User and Demo Story

The primary user is a procurement manager.

The main walkthrough is:

1. Open the dashboard and identify vendors needing attention.
2. Submit a new vendor with a business owner, category, contact, and risk tier.
3. Open the vendor workspace.
4. Request missing documents from the vendor contact.
5. Mark documents received and complete the security checklist.
6. Record an approval decision.
7. Return to the dashboard and see the updated status and activity.

## Scope

### Included

- Vendor dashboard with summary counts, search, filters, sorting, and a clear
  next-action column.
- Seeded vendor portfolio spanning approved, rejected, under-review,
  documents-requested, and newly submitted states.
- New vendor submission form.
- Vendor review workspace with:
  - company and engagement overview;
  - document checklist;
  - request-documents action;
  - lightweight security review;
  - approval controls;
  - notes and activity timeline.
- Browser persistence using `localStorage`.
- Reset-demo action that restores the original seeded data.
- Responsive behavior suitable for a laptop demo and basic mobile use.

### Excluded

- Authentication and role-based access.
- Real email, file upload, malware scanning, or document parsing.
- Backend, database, integrations, or audit-grade records.
- Multi-step legal, finance, and contract negotiations.
- Vendor-facing portal.
- Production security or compliance claims.

## Information Architecture

The app has two primary routes:

- `/vendors` — portfolio dashboard and new-vendor entry point.
- `/vendors/:vendorId` — the selected vendor's approval workspace.

The dashboard is the default route. A compact global header contains the
Bauhaus wordmark, a procurement label, and the reset-demo control.

## Dashboard

The dashboard prioritizes operational clarity over analytics decoration.

It contains:

- summary metrics for total vendors, approved, in review, and blocked;
- a search field for vendor name, category, owner, or contact;
- filters for status, risk tier, category, and owner;
- a sortable vendor table;
- a prominent `Submit vendor` action.

Each vendor row shows:

- vendor name and category;
- internal business owner;
- risk tier;
- document progress;
- security review state;
- overall approval status;
- age or last activity;
- next action.

Status is communicated by text and color, never color alone.

## Vendor Submission

The submission form collects:

- company name;
- service category;
- business owner;
- vendor contact name and email;
- intended use;
- data-access level;
- initial risk tier.

Submitting creates a vendor in `Submitted` status, adds an activity event, and
opens the new vendor workspace. Required documents are derived from the risk
tier and data-access level.

## Vendor Workspace

The workspace uses a summary header followed by four focused sections.

### Overview

Shows status, risk, owner, contact, intended use, submission date, and a single
recommended next action.

### Documents

Shows a checklist of plausible procurement documents:

- W-9 or tax form;
- certificate of insurance;
- security questionnaire;
- data-processing agreement;
- SOC 2 report when applicable;
- references or portfolio;
- accessibility statement when applicable.

Each item has a state of `Not requested`, `Requested`, `Received`, `Accepted`,
or `Needs revision`. The procurement manager can request all missing documents
or update individual states.

### Security Review

Provides a short checklist covering:

- sensitive-data access;
- authentication approach;
- encryption;
- incident response;
- subprocessors;
- business continuity.

The reviewer records `Pass`, `Concern`, or `Not applicable` for each item and
may add a note. The section computes a review state of `Not started`, `In
progress`, `Needs attention`, or `Complete`.

### Decision and Activity

Approval is available only after all required documents are accepted and the
security review is complete without unresolved concerns. Rejection is always
available but requires a reason. Every meaningful action adds a timestamped
activity item.

## Status Model

Vendor status values are:

- `Submitted`
- `Documents requested`
- `Under review`
- `Approved`
- `Rejected`

The app advances status from actions:

- requesting any document sets `Documents requested`;
- receiving or reviewing materials sets `Under review`;
- approval sets `Approved`;
- rejection sets `Rejected`.

Approved and rejected vendors remain editable only for notes in the demo.

## Seed Data

The initial portfolio contains 12-16 vendors across architecture-relevant
categories such as structural engineering, visualization, materials, printing,
surveying, sustainability consulting, cloud collaboration, and facilities.

The data deliberately includes:

- several approved vendors;
- one recently rejected vendor with a clear reason;
- vendors waiting on insurance, a SOC 2 report, or questionnaire revisions;
- one security review with an unresolved concern;
- different owners, risk tiers, ages, and completion levels.

Names, contacts, documents, and timeline entries are fictional.

## Technical Architecture

Use Vite, React, and TypeScript.

The implementation is divided into:

- route-level dashboard and vendor workspace pages;
- reusable table, filter, status, checklist, timeline, and modal components;
- a typed domain model for vendors, documents, reviews, decisions, and events;
- a small store that owns state transitions and `localStorage` persistence;
- a seed-data module that can recreate the initial state.

Business rules live in domain/store functions rather than UI components. This
keeps the later visual reskin independent from workflow behavior.

## Visual Direction

The first version should be polished but intentionally easy to reskin. Use a
neutral, editorial procurement interface with strong typography, restrained
color, crisp rules, dense tables, and clear hierarchy. Avoid decorative
gradients, glass effects, excessive cards, and rounded-pill-heavy UI.

All colors, type, spacing, borders, and status treatments must be centralized
as design tokens. The future Bauhaus `DESIGN.md` will replace these tokens and
component treatments without changing the data model or workflows.

## Error and Empty States

- Required form fields show inline validation.
- Invalid workflow transitions are disabled and explain what remains.
- Storage parse failures restore seed data and show a non-blocking notice.
- Empty search/filter results explain how to clear filters.
- No action silently succeeds or fails.

## Testing

Automated tests cover:

- vendor submission and required-document derivation;
- document request and status progression;
- security review completion and concern handling;
- approval eligibility;
- rejection reason requirements;
- dashboard search and filtering;
- persistence hydration and reset.

A production build must complete successfully. The final demo should also be
walked manually through the primary story at desktop width.

## Delivery

Create a private repository under the personal GitHub account:
`alexselig/bauhaus-vendor-approval`.

The repository should include setup instructions, a demo-data disclaimer, and
commands for development, testing, and production build. Deployment is not
required in this phase.
