import { expect, it } from "vitest";
import { createSeedVendors } from "../data/seed";
import { loadVendors, saveVendors } from "./persistence";

function memoryStorage(initial: string | null = null): Storage {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
    removeItem: () => { value = null; },
    clear: () => { value = null; },
    key: () => null,
    get length() { return value ? 1 : 0; },
  };
}

it("round-trips vendors", () => {
  const storage = memoryStorage();
  const vendors = createSeedVendors();
  saveVendors(storage, vendors);
  expect(loadVendors(storage)).toEqual({ vendors, recovered: false });
});

it("recovers from invalid data", () => {
  const result = loadVendors(memoryStorage("{bad"));
  expect(result.vendors).toHaveLength(14);
  expect(result.recovered).toBe(true);
});
