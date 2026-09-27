import { Link } from "react-router-dom";
import type { Vendor } from "../domain/model";
import { getNextAction, getSecurityState } from "../domain/workflow";
import { StatusBadge } from "./StatusBadge";

export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Vendor</th><th>Owner</th><th>Risk</th><th>Documents</th>
            <th>Security</th><th>Status</th><th>Updated</th><th>Next action</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => {
            const accepted = vendor.documents.filter((item) => item.state === "Accepted").length;
            return (
              <tr key={vendor.id}>
                <td><Link className="vendor-link" to={`/vendors/${vendor.id}`}>{vendor.companyName}</Link><small>{vendor.category}</small></td>
                <td>{vendor.businessOwner}</td>
                <td><StatusBadge value={vendor.riskTier} /></td>
                <td>{accepted}/{vendor.documents.length}</td>
                <td>{getSecurityState(vendor)}</td>
                <td><StatusBadge value={vendor.status} /></td>
                <td>{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(vendor.updatedAt))}</td>
                <td className="next-action">{getNextAction(vendor)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
