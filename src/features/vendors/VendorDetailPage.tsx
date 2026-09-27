import { Link, useParams } from "react-router-dom";
import { ActivityTimeline } from "../../components/ActivityTimeline";
import { ApprovalPanel } from "../../components/ApprovalPanel";
import { DocumentChecklist } from "../../components/DocumentChecklist";
import { SecurityReview } from "../../components/SecurityReview";
import { StatusBadge } from "../../components/StatusBadge";
import { getNextAction } from "../../domain/workflow";
import { useVendorStore } from "../../state/VendorStore";

export function VendorDetailPage() {
  const { vendorId } = useParams();
  const store = useVendorStore();
  const vendor = store.vendors.find((item) => item.id === vendorId);

  if (!vendor) {
    return <div className="page narrow-page"><h1>Vendor not found</h1><Link to="/vendors">Return to vendor approvals</Link></div>;
  }

  return (
    <div className="page">
      <Link className="back-link" to="/vendors">← Vendor approvals</Link>
      <section className="vendor-hero">
        <div>
          <p className="eyebrow">{vendor.category}</p>
          <h1>{vendor.companyName}</h1>
          <a href={vendor.website} target="_blank" rel="noreferrer">{vendor.website.replace("https://", "")}</a>
        </div>
        <div className="hero-status"><StatusBadge value={vendor.status} /><StatusBadge value={`${vendor.riskTier} risk`} /></div>
      </section>
      <section className="overview-grid">
        <div><span>Business owner</span><strong>{vendor.businessOwner}</strong></div>
        <div><span>Vendor contact</span><strong>{vendor.contactName}</strong><a href={`mailto:${vendor.contactEmail}`}>{vendor.contactEmail}</a></div>
        <div><span>Data access</span><strong>{vendor.dataAccess}</strong></div>
        <div><span>Next action</span><strong>{getNextAction(vendor)}</strong></div>
        <div className="overview-wide"><span>Intended use</span><strong>{vendor.intendedUse}</strong></div>
      </section>
      <div className="workspace-grid">
        <div>
          <DocumentChecklist vendor={vendor} onChange={(documentId, state) => store.updateDocument(vendor.id, documentId, state)} />
          <SecurityReview vendor={vendor} onChange={(checkId, result, note) => store.updateSecurity(vendor.id, checkId, result, note)} />
        </div>
        <aside>
          <ApprovalPanel vendor={vendor} onApprove={() => store.approve(vendor.id)} onReject={(reason) => store.reject(vendor.id, reason)} onAddNote={(note) => store.addNote(vendor.id, note)} />
          <ActivityTimeline events={vendor.activity} />
        </aside>
      </div>
    </div>
  );
}
