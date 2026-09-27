# Door Manufacturer Demo Vendor Rename

## Decision

Replace the automated-intake showcase vendor with a fictional commercial door
manufacturer:

- Company: `Threshold Architectural Doors`
- Website: `https://threshold-doors.example`
- Category: `Architectural doors and hardware`
- Contact: `Clara Voss`
- Email: `clara@threshold-doors.example`
- Intended use: `Custom doors, frames, and hardware packages for civic and workplace projects`
- Data access: `Business`
- Risk tier: `Medium`

## Scope

Update the curated research result, prefilled intake form, tests, README demo
walkthrough, and implementation-plan examples. Preserve the existing procurement
workflow, approval rules, dashboard data, and Bauhaus architecture-firm identity.

The rename must remove every active reference to Meridian Envelope Systems,
its old domain, contact, building-envelope category, and facade-consulting use
case.

## Verification

- Search the repository for stale showcase-vendor references.
- Run the complete test suite.
- Run the production build.
- Confirm the automated intake opens a Threshold Architectural Doors review.
