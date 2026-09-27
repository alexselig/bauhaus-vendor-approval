import type { DocumentState, Vendor } from "../domain/model";

const states: DocumentState[] = ["Requested", "Received", "Accepted", "Needs revision"];

export function DocumentChecklist({
  vendor,
  onChange,
}: {
  vendor: Vendor;
  onChange: (documentId: string, state: DocumentState) => void;
}) {
  const locked = vendor.status === "Approved" || vendor.status === "Rejected";
  return (
    <section className="workspace-section">
      <div className="section-heading"><div><p className="eyebrow">01 / Evidence</p><h2>Required documents</h2></div><strong>{vendor.documents.filter((item) => item.state === "Accepted").length}/{vendor.documents.length}</strong></div>
      <div className="checklist">
        {vendor.documents.map((document) => (
          <div className="check-row" key={document.id}>
            <div><strong>{document.name}</strong><span>{document.required ? "Required" : "Optional"}</span></div>
            <select aria-label={`${document.name} status`} disabled={locked} value={document.state} onChange={(event) => onChange(document.id, event.target.value as DocumentState)}>
              {states.map((state) => <option key={state}>{state}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
