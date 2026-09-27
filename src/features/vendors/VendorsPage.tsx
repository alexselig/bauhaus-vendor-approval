import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/EmptyState";
import { MetricStrip } from "../../components/MetricStrip";
import { VendorTable } from "../../components/VendorTable";
import type { RiskTier, VendorStatus } from "../../domain/model";
import { useVendorStore } from "../../state/VendorStore";

const emptyFilters = {
  query: "",
  status: "All" as VendorStatus | "All",
  risk: "All" as RiskTier | "All",
  owner: "All",
  sort: "updated-desc",
};

export function VendorsPage() {
  const { vendors, resetDemo, recoveryNotice } = useVendorStore();
  const [filters, setFilters] = useState(emptyFilters);
  const owners = [...new Set(vendors.map((vendor) => vendor.businessOwner))].sort();

  const filtered = useMemo(() => {
    const query = filters.query.toLowerCase();
    return vendors
      .filter((vendor) => !query || [
        vendor.companyName, vendor.category, vendor.businessOwner,
        vendor.contactName, vendor.contactEmail,
      ].some((value) => value.toLowerCase().includes(query)))
      .filter((vendor) => filters.status === "All" || vendor.status === filters.status)
      .filter((vendor) => filters.risk === "All" || vendor.riskTier === filters.risk)
      .filter((vendor) => filters.owner === "All" || vendor.businessOwner === filters.owner)
      .sort((a, b) => {
        if (filters.sort === "name-asc") return a.companyName.localeCompare(b.companyName);
        if (filters.sort === "risk-desc") return ["High", "Medium", "Low"].indexOf(a.riskTier) - ["High", "Medium", "Low"].indexOf(b.riskTier);
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [filters, vendors]);

  function confirmReset() {
    if (window.confirm("Reset all demo changes and restore the original vendor portfolio?")) {
      resetDemo();
      setFilters(emptyFilters);
    }
  }

  return (
    <div className="page">
      {recoveryNotice && <div className="notice">Saved demo data was unreadable, so the original portfolio was restored.</div>}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Procurement workspace</p>
          <h1>Vendor approvals</h1>
          <p>Track every review, missing document, and decision in one queue.</p>
        </div>
        <div className="heading-actions">
          <button className="button button-secondary" onClick={confirmReset}>Reset demo</button>
          <Link className="button button-primary" to="/vendors/new">Submit vendor</Link>
        </div>
      </div>
      <MetricStrip vendors={vendors} />
      <section className="panel">
        <div className="filters">
          <label className="search-field">Search vendors<input aria-label="Search vendors" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Name, category, owner…" /></label>
          <label>Status<select aria-label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as VendorStatus | "All" })}><option>All</option><option>Submitted</option><option>Documents requested</option><option>Under review</option><option>Approved</option><option>Rejected</option></select></label>
          <label>Risk<select aria-label="Risk" value={filters.risk} onChange={(event) => setFilters({ ...filters, risk: event.target.value as RiskTier | "All" })}><option>All</option><option>High</option><option>Medium</option><option>Low</option></select></label>
          <label>Owner<select aria-label="Owner" value={filters.owner} onChange={(event) => setFilters({ ...filters, owner: event.target.value })}><option>All</option>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label>
          <label>Sort<select aria-label="Sort" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}><option value="updated-desc">Recent activity</option><option value="name-asc">Vendor name</option><option value="risk-desc">Highest risk</option></select></label>
        </div>
        {filtered.length ? <VendorTable vendors={filtered} /> : <EmptyState onClear={() => setFilters(emptyFilters)} />}
      </section>
    </div>
  );
}
