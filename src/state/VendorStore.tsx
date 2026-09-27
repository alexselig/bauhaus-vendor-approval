import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createSeedVendors } from "../data/seed";
import type {
  DocumentState,
  SecurityResult,
  Vendor,
  VendorDraft,
} from "../domain/model";
import {
  addVendorNote,
  approveVendor,
  createVendor,
  rejectVendor,
  updateDocument as transitionDocument,
  updateSecurityCheck,
} from "../domain/workflow";
import { loadVendors, saveVendors, STORAGE_KEY } from "./persistence";

interface VendorStoreValue {
  vendors: Vendor[];
  recoveryNotice: boolean;
  addVendor(draft: VendorDraft): Vendor;
  updateDocument(vendorId: string, documentId: string, state: DocumentState): void;
  updateSecurity(vendorId: string, checkId: string, result: SecurityResult, note: string): void;
  addNote(vendorId: string, note: string): void;
  approve(vendorId: string): void;
  reject(vendorId: string, reason: string): void;
  resetDemo(): void;
}

const VendorStoreContext = createContext<VendorStoreValue | null>(null);

function now() {
  return new Date().toISOString();
}

export function VendorStoreProvider({
  children,
  storage = window.localStorage,
}: {
  children: ReactNode;
  storage?: Storage;
}) {
  const initial = useMemo(() => loadVendors(storage), [storage]);
  const [vendors, setVendors] = useState(initial.vendors);
  const [recoveryNotice, setRecoveryNotice] = useState(initial.recovered);

  useEffect(() => saveVendors(storage, vendors), [storage, vendors]);

  const updateVendor = useCallback((vendorId: string, updater: (vendor: Vendor) => Vendor) => {
    setVendors((current) => {
      if (!current.some((vendor) => vendor.id === vendorId)) throw new Error("Vendor not found");
      return current.map((vendor) => vendor.id === vendorId ? updater(vendor) : vendor);
    });
  }, []);

  const value = useMemo<VendorStoreValue>(() => ({
    vendors,
    recoveryNotice,
    addVendor(draft) {
      const vendor = createVendor(draft, now());
      setVendors((current) => [vendor, ...current]);
      return vendor;
    },
    updateDocument(vendorId, documentId, state) {
      updateVendor(vendorId, (vendor) => transitionDocument(vendor, documentId, state, now()));
    },
    updateSecurity(vendorId, checkId, result, note) {
      updateVendor(vendorId, (vendor) => updateSecurityCheck(vendor, checkId, result, note, now()));
    },
    addNote(vendorId, note) {
      updateVendor(vendorId, (vendor) => addVendorNote(vendor, note, now()));
    },
    approve(vendorId) {
      updateVendor(vendorId, (vendor) => approveVendor(vendor, now()));
    },
    reject(vendorId, reason) {
      updateVendor(vendorId, (vendor) => rejectVendor(vendor, reason, now()));
    },
    resetDemo() {
      storage.removeItem(STORAGE_KEY);
      setVendors(createSeedVendors());
      setRecoveryNotice(false);
    },
  }), [recoveryNotice, storage, updateVendor, vendors]);

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore() {
  const value = useContext(VendorStoreContext);
  if (!value) throw new Error("useVendorStore must be used within VendorStoreProvider");
  return value;
}
