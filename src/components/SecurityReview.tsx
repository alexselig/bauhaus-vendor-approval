import type { SecurityResult, Vendor } from "../domain/model";
import { getSecurityState } from "../domain/workflow";
import { StatusBadge } from "./StatusBadge";

const results: SecurityResult[] = ["Unanswered", "Pass", "Concern", "Not applicable"];

export function SecurityReview({
  vendor,
  onChange,
}: {
  vendor: Vendor;
  onChange: (checkId: string, result: SecurityResult, note: string) => void;
}) {
  const locked = vendor.status === "Approved" || vendor.status === "Rejected";
  return (
    <section className="workspace-section">
      <div className="section-heading"><div><p className="eyebrow">02 / Risk</p><h2>Security review</h2></div><StatusBadge value={getSecurityState(vendor)} /></div>
      <div className="checklist">
        {vendor.securityChecks.map((check) => (
          <div className="security-row" key={check.id}>
            <strong>{check.label}</strong>
            <select aria-label={`${check.label} result`} disabled={locked} value={check.result} onChange={(event) => onChange(check.id, event.target.value as SecurityResult, check.note)}>
              {results.map((result) => <option key={result}>{result}</option>)}
            </select>
            <input aria-label={`${check.label} note`} disabled={locked} placeholder="Optional reviewer note" value={check.note} onChange={(event) => onChange(check.id, check.result, event.target.value)} />
          </div>
        ))}
      </div>
    </section>
  );
}
