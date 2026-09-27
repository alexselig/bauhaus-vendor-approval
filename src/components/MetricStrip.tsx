import type { Vendor } from "../domain/model";

export function MetricStrip({ vendors }: { vendors: Vendor[] }) {
  const metrics = [
    ["Total vendors", vendors.length],
    ["Approved", vendors.filter((vendor) => vendor.status === "Approved").length],
    ["Active review", vendors.filter((vendor) => ["Documents requested", "Under review"].includes(vendor.status)).length],
    ["Blocked", vendors.filter((vendor) =>
      vendor.documents.some((document) => document.state === "Needs revision") ||
      vendor.securityChecks.some((check) => check.result === "Concern")
    ).length],
  ];
  return (
    <section className="metric-strip" aria-label="Vendor summary">
      {metrics.map(([label, value]) => (
        <div className="metric" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
