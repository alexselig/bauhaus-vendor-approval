import { useState } from "react";
import type { Vendor } from "../domain/model";
import { canApprove, getNextAction } from "../domain/workflow";

export function ApprovalPanel({
  vendor,
  onApprove,
  onReject,
  onAddNote,
}: {
  vendor: Vendor;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onAddNote: (note: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const decided = vendor.status === "Approved" || vendor.status === "Rejected";

  function reject() {
    if (!reason.trim()) {
      setError("Enter a reason before rejecting this vendor");
      return;
    }
    onReject(reason);
    setError("");
  }

  return (
    <section className="workspace-section decision-panel">
      <div className="section-heading"><div><p className="eyebrow">03 / Decision</p><h2>Approval</h2></div></div>
      {decided ? (
        <div className="decision-result"><strong>{vendor.status}</strong>{vendor.decisionReason && <p>{vendor.decisionReason}</p>}</div>
      ) : (
        <>
          <div className={`eligibility ${canApprove(vendor) ? "eligible" : ""}`}>
            <strong>{canApprove(vendor) ? "Ready for approval" : "Approval requirements remain"}</strong>
            <span>{getNextAction(vendor)}</span>
          </div>
          <button className="button button-primary" disabled={!canApprove(vendor)} onClick={onApprove}>Approve vendor</button>
          <label>Rejection reason<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-danger" onClick={reject}>Reject vendor</button>
        </>
      )}
      <div className="note-box">
        <label>Internal note<textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <button className="button button-secondary" disabled={!note.trim()} onClick={() => { onAddNote(note); setNote(""); }}>Add note</button>
      </div>
    </section>
  );
}
