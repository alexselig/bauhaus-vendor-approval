# Bauhaus Vendor Approval

A fictional frontend demo for an architecture firm's procurement workflow. It
shows automated vendor intake, document requests, security review, and approval
tracking. All companies, contacts, documents, and review results are demo data.

## Run locally

```bash
npm install
npm run dev
```

## Demo walkthrough

1. Open **Vendor approvals** and scan the active and blocked vendors.
2. Select **Submit vendor**.
3. Use the prefilled `Threshold Architectural Doors` and
   `https://threshold-doors.example`.
4. Run the simulated research and review the completed internal form.
5. Confirm the vendor to request documents and start security review.
6. Update the document and security checks, then approve or reject the vendor.

Changes persist in the browser. Use **Reset demo** to restore the original
14-vendor portfolio.

## Commands

- `npm run dev` - start the local demo
- `npm test` - run behavior tests
- `npm run build` - create a production build

## Design system

The visual reference supplied for this project is:
https://claude.ai/artifact/66et3aWAsBME7ahXYGbPdY

Visual primitives are isolated in `src/styles/tokens.css` so the interface can
be matched or updated without changing workflow behavior.
