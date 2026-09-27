import type { Vendor } from "../domain/model";
import { createSeedVendors } from "../data/seed";

export const STORAGE_KEY = "bauhaus.vendor-demo.v1";

export function loadVendors(storage: Storage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { vendors: createSeedVendors(), recovered: false };
  try {
    const vendors = JSON.parse(raw) as Vendor[];
    if (!Array.isArray(vendors)) throw new Error("Saved vendors must be an array");
    return { vendors, recovered: false };
  } catch {
    return { vendors: createSeedVendors(), recovered: true };
  }
}

export function saveVendors(storage: Storage, vendors: Vendor[]) {
  storage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}
