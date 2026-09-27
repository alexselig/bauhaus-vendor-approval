import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { VendorDraft } from "../../domain/model";
import { useVendorStore } from "../../state/VendorStore";
import { researchVendor, SHOWCASE_VENDOR } from "./vendorResearch";

type Phase = "input" | "researching" | "review";

const owners = ["Elena Park", "Maya Chen", "Jon Bell", "Sam Rivera"];
const initialInput = {
  companyName: SHOWCASE_VENDOR.companyName,
  website: SHOWCASE_VENDOR.website,
  businessOwner: "Elena Park",
  intendedUse: "Custom doors, frames, and hardware packages for civic and workplace projects",
};

export function NewVendorPage() {
  const navigate = useNavigate();
  const { addVendor } = useVendorStore();
  const [phase, setPhase] = useState<Phase>("input");
  const [input, setInput] = useState(initialInput);
  const [draft, setDraft] = useState<VendorDraft | null>(null);
  const [error, setError] = useState("");

  async function runResearch(event: FormEvent) {
    event.preventDefault();
    if (!input.companyName.trim() || !input.website.trim() || !input.intendedUse.trim()) {
      setError("Company name, website, and intended use are required.");
      return;
    }
    setError("");
    setPhase("researching");
    try {
      setDraft(await researchVendor(input));
      setPhase("review");
    } catch (researchError) {
      setError(researchError instanceof Error ? researchError.message : "Research could not be completed.");
      setPhase("input");
    }
  }

  function confirmVendor(event: FormEvent) {
    event.preventDefault();
    if (!draft || Object.values(draft).some((value) => !String(value).trim())) {
      setError("Complete every field before starting the review.");
      return;
    }
    const vendor = addVendor(draft);
    navigate(`/vendors/${vendor.id}`);
  }

  return (
    <div className="page narrow-page">
      <Link className="back-link" to="/vendors">← Vendor approvals</Link>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Automated intake</p>
          <h1>Submit a new vendor</h1>
          <p>Start with the company basics. Bauhaus prepares the internal procurement record and launches the required reviews.</p>
        </div>
      </div>

      {phase === "input" && (
        <form className="panel form-grid" onSubmit={runResearch}>
          <label>Company name<input value={input.companyName} onChange={(event) => setInput({ ...input, companyName: event.target.value })} /></label>
          <label>Website<input value={input.website} onChange={(event) => setInput({ ...input, website: event.target.value })} /></label>
          <label>Business owner<select value={input.businessOwner} onChange={(event) => setInput({ ...input, businessOwner: event.target.value })}>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label>
          <label className="full-field">Intended use<textarea rows={4} value={input.intendedUse} onChange={(event) => setInput({ ...input, intendedUse: event.target.value })} /></label>
          {error && <p className="form-error full-field">{error}</p>}
          <div className="automation-note full-field">
            <strong>Demo automation</strong>
            <span>This simulates company research and form completion. No live external data is used.</span>
          </div>
          <button className="button button-primary full-field" type="submit">Research and prepare submission</button>
        </form>
      )}

      {phase === "researching" && (
        <section className="panel research-state" aria-live="polite">
          <div className="research-mark">B</div>
          <p className="eyebrow">Preparing vendor record</p>
          <h2>Researching {input.companyName}</h2>
          <div className="progress-track"><span /></div>
          <ol className="automation-steps">
            <li>Verify company identity and services</li>
            <li>Locate the vendor contact</li>
            <li>Assess data access and initial risk</li>
            <li>Select required documents and security checks</li>
          </ol>
        </section>
      )}

      {phase === "review" && draft && (
        <form className="panel form-grid" onSubmit={confirmVendor}>
          <div className="generated-banner full-field"><strong>Demo-generated company data</strong><span>Review and edit every field before confirmation.</span></div>
          <label>Company name<input value={draft.companyName} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} /></label>
          <label>Website<input value={draft.website} onChange={(event) => setDraft({ ...draft, website: event.target.value })} /></label>
          <label>Service category<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>
          <label>Business owner<select value={draft.businessOwner} onChange={(event) => setDraft({ ...draft, businessOwner: event.target.value })}>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label>
          <label>Vendor contact<input value={draft.contactName} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} /></label>
          <label>Contact email<input type="email" value={draft.contactEmail} onChange={(event) => setDraft({ ...draft, contactEmail: event.target.value })} /></label>
          <label>Data access<select value={draft.dataAccess} onChange={(event) => setDraft({ ...draft, dataAccess: event.target.value as VendorDraft["dataAccess"] })}><option>None</option><option>Business</option><option>Confidential</option></select></label>
          <label>Initial risk<select value={draft.riskTier} onChange={(event) => setDraft({ ...draft, riskTier: event.target.value as VendorDraft["riskTier"] })}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label className="full-field">Intended use<textarea rows={4} value={draft.intendedUse} onChange={(event) => setDraft({ ...draft, intendedUse: event.target.value })} /></label>
          {error && <p className="form-error full-field">{error}</p>}
          <div className="form-actions full-field">
            <button className="button button-secondary" type="button" onClick={() => setPhase("input")}>Back</button>
            <button className="button button-primary" type="submit">Confirm and start review</button>
          </div>
        </form>
      )}
    </div>
  );
}
