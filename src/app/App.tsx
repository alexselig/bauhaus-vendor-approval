import { Link, Navigate, Route, Routes } from "react-router-dom";
import { NewVendorPage } from "../features/intake/NewVendorPage";
import { VendorDetailPage } from "../features/vendors/VendorDetailPage";
import { VendorsPage } from "../features/vendors/VendorsPage";

export function App() {
  return (
    <div className="app-shell">
      <header className="masthead">
        <Link className="wordmark" to="/vendors"><span className="brand-shape" />BAUHAUS</Link>
        <span className="product-label">Vendor approval / Procurement</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/vendors" replace />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/vendors/new" element={<NewVendorPage />} />
          <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="*" element={<Navigate to="/vendors" replace />} />
        </Routes>
      </main>
    </div>
  );
}
