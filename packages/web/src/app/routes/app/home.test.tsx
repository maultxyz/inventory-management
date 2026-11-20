import HomePage from "@/app/routes/app/home";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/lib/i18n";
import type { InventoryItem } from "@inventory/shared";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const itemActions = vi.hoisted(() => ({
  addItem: vi.fn(async () => true),
  saveItem: vi.fn(async () => true),
  removeItem: vi.fn(async () => true),
  adjustStock: vi.fn(async () => true),
  adjustStockOfItems: vi.fn(async () => true),
  editTagsOfItems: vi.fn(async () => true),
  removeItems: vi.fn(async () => true),
  removeBuildUnitsFromStock: vi.fn(async () => true),
}));
const itemsState = vi.hoisted(() => ({ items: [] as InventoryItem[] }));

vi.mock("@/features/items/api/use-items", () => ({
  useItems: () => ({
    items: itemsState.items,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useItemActions: () => itemActions,
}));
vi.mock("@/features/stock-movements/api/use-stock-movements", () => ({
  useStockMovements: () => ({
    movements: [],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/kits/lib/kit-counts-storage", () => ({
  readStoredKitCounts: () => ({ threeModuleKits: 0, fiveModuleKits: 0 }),
  storeKitCounts: vi.fn(),
}));

function partWith(
  name: string,
  quantity: number,
  moduleQuantities: Partial<InventoryItem>,
): InventoryItem {
  return {
    guid: name,
    name,
    location: null,
    quantity,
    reorderLevel: 0,
    lotPriceCents: 0,
    unitsPerLot: 1,
    feederModuleQuantity: 0,
    deviceModuleQuantity: 0,
    sortingModuleQuantity: 0,
    purchaseUrl: null,
    tags: [],
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...moduleQuantities,
  };
}

function renderHomePage() {
  return render(
    <MemoryRouter>
      <TooltipProvider>
        <HomePage />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

function tileNamed(label: string) {
  return screen.getByText(label, { selector: "dt" }).parentElement!;
}

describe("HomePage kit stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    itemsState.items = [
      partWith("Positional servo", 20, { sortingModuleQuantity: 3 }),
      partWith("IR sensor", 9, {
        feederModuleQuantity: 1,
        sortingModuleQuantity: 1,
      }),
      partWith("Controller board", 3, { deviceModuleQuantity: 1 }),
      partWith("Feeder servo", 2, { feederModuleQuantity: 1 }),
      partWith("Shipping label", 500, {}),
    ];
  });

  it("shows how many kits and modules can be packed and what limits them", () => {
    renderHomePage();
    expect(within(tileNamed("3-module kits")).getByText("2")).toBeInTheDocument();
    expect(
      within(tileNamed("3-module kits")).getByText(
        "Limited by Feeder servo and 2 others",
      ),
    ).toBeInTheDocument();
    expect(within(tileNamed("5-module kits")).getByText("1")).toBeInTheDocument();
    expect(
      within(tileNamed("Sorting modules")).getByText("6"),
    ).toBeInTheDocument();
    expect(
      within(tileNamed("Device modules")).getByText(
        "Limited by Controller board",
      ),
    ).toBeInTheDocument();
  });

  it("plans kits and lists what is in stock and what is missing", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await user.type(screen.getByLabelText("3-module kits needed"), "1");
    await user.type(screen.getByLabelText("5-module kits needed"), "1");

    expect(
      await screen.findByText(
        "You are missing 2 parts for 1 3-module kit and 1 5-module kit.",
      ),
    ).toBeInTheDocument();
    const servoRow = screen.getByRole("row", { name: /Positional servo/ });
    expect(within(servoRow).getByText("24")).toBeInTheDocument();
    expect(within(servoRow).getByText("20")).toBeInTheDocument();
    expect(within(servoRow).getByText("4 short")).toBeInTheDocument();
    const boardRow = screen.getByRole("row", { name: /Controller board/ });
    expect(within(boardRow).getByText("Enough")).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Shipping label/ })).toBeNull();
  });

  it("removes a kit from inventory and blocks more than the stock allows", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await user.click(
      screen.getByRole("button", { name: /^Remove from inventory/ }),
    );
    const dialog = await screen.findByRole("dialog");
    const removeButton = within(dialog).getByRole("button", {
      name: "Remove parts",
    });
    const countInput = within(dialog).getByLabelText("How many");

    await user.clear(countInput);
    await user.type(countInput, "3");
    expect(
      await within(dialog).findByText("You do not have enough parts for this."),
    ).toBeInTheDocument();
    expect(removeButton).toBeDisabled();

    await user.clear(countInput);
    await user.type(countInput, "2");
    await waitFor(() => expect(removeButton).toBeEnabled());
    await user.click(removeButton);
    await waitFor(() =>
      expect(itemActions.removeBuildUnitsFromStock).toHaveBeenCalledWith({
        buildUnit: "threeModuleKit",
        count: 2,
      }),
    );
  });

  it("opens the removal dialog and the planner fields from the keyboard", async () => {
    const user = userEvent.setup();
    renderHomePage();
    await user.keyboard("5");
    expect(screen.getByLabelText("5-module kits needed")).toHaveFocus();
    await user.keyboard("{Escape}r");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("asks for kit parts to be set up when no item is one", () => {
    itemsState.items = [partWith("Shipping label", 500, {})];
    renderHomePage();
    expect(screen.getByText("Set up your kit parts")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Remove from inventory/ }),
    ).toBeNull();
  });
});
