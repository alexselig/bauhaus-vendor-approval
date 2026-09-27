import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it } from "vitest";
import { VendorStoreProvider } from "../state/VendorStore";
import { App } from "./App";

beforeEach(() => localStorage.clear());

it("shows the seeded approval portfolio", () => {
  render(<MemoryRouter initialEntries={["/vendors"]}><VendorStoreProvider><App /></VendorStoreProvider></MemoryRouter>);
  expect(screen.getByRole("heading", { name: "Vendor approvals" })).toBeInTheDocument();
  expect(screen.getByText("Northline Structural")).toBeInTheDocument();
  expect(screen.getByText("Planroom Cloud")).toBeInTheDocument();
});

it("runs automated intake and opens the review workspace", async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={["/vendors/new"]}><VendorStoreProvider><App /></VendorStoreProvider></MemoryRouter>);
  await user.click(screen.getByRole("button", { name: "Research and prepare submission" }));
  expect(await screen.findByText("Demo-generated company data")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Confirm and start review" }));
  expect(await screen.findByRole("heading", { name: "Meridian Envelope Systems" })).toBeInTheDocument();
  expect(screen.getAllByText("Documents requested").length).toBeGreaterThan(0);
  expect(screen.getByText("Security review started")).toBeInTheDocument();
});
