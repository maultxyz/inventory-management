import ChecklistsPage from "@/app/routes/app/checklists";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/lib/i18n";
import type { InventoryItem } from "@inventory/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const itemsState = vi.hoisted(() => ({ items: [] as InventoryItem[] }));

vi.mock("@/features/items/api/use-items", () => ({
  useItems: () => ({
    items: itemsState.items,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

function partWith(
  name: string,
  moduleQuantities: Partial<InventoryItem>,
): InventoryItem {
  return {
    guid: name,
    name,
    location: null,
    quantity: 10,
    reorderLevel: 0,
    lotPriceCents: 0,
    unitsPerLot: 1,
    feederModuleQuantity: 0,
    deviceModuleQuantity: 0,
    sortingModuleQuantity: 0,
    fiveModuleDeviceExtraQuantity: 0,
    purchaseUrl: null,
    tags: [],
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...moduleQuantities,
  };
}

function renderChecklistsPage() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <ChecklistsPage />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

function checklistNamed(moduleName: string) {
  return screen.getByRole("region", { name: moduleName });
}

describe("ChecklistsPage", () => {
  beforeEach(() => {
    itemsState.items = [
      partWith("Positional servo", { sortingModuleQuantity: 3 }),
      partWith("IR sensor", {
        location: "Bin 4",
        feederModuleQuantity: 1,
        sortingModuleQuantity: 1,
      }),
      partWith("M3 nut", { fiveModuleDeviceExtraQuantity: 4 }),
    ];
  });

  it("lists each module's parts with how many go into one module", () => {
    renderChecklistsPage();

    const sorting = within(checklistNamed("Sorting module"));
    expect(sorting.getByText("2 parts")).toBeInTheDocument();
    expect(sorting.getByText("3 ×")).toBeInTheDocument();
    expect(sorting.getByText("Positional servo")).toBeInTheDocument();
    expect(sorting.getByText("Bin 4")).toBeInTheDocument();

    const threeModuleDevice = within(
      checklistNamed("Device module (3-module kit)"),
    );
    expect(threeModuleDevice.getByText(/no items are set up/i)).toBeInTheDocument();
    expect(
      threeModuleDevice.getByRole("button", {
        name: "Print Device module (3-module kit) checklists",
      }),
    ).toBeDisabled();

    const fiveModuleDevice = within(
      checklistNamed("Device module (5-module kit)"),
    );
    expect(fiveModuleDevice.getByText("4 ×")).toBeInTheDocument();
    expect(fiveModuleDevice.getByText("M3 nut")).toBeInTheDocument();
  });

  it("prints six copies of the chosen module's checklist", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    renderChecklistsPage();

    await userEvent.click(
      screen.getByRole("button", { name: "Print Feeder module checklists" }),
    );

    const printSheet = document.querySelector(".checklist-print-sheet");
    expect(printSheet).not.toBeNull();
    expect(
      within(printSheet as HTMLElement).getAllByText("Feeder module"),
    ).toHaveLength(6);
    await vi.waitFor(() => expect(print).toHaveBeenCalledTimes(1));
  });

  it("asks to set up kit parts when no item is one", () => {
    itemsState.items = [partWith("Shipping label", {})];
    renderChecklistsPage();

    expect(screen.getByText("Set up your kit parts")).toBeInTheDocument();
  });
});
