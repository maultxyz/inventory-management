import ItemsPage from "@/app/routes/app/items";
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

function itemWith(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    guid: overrides.name ?? "guid",
    name: "Widget",
    location: null,
    quantity: 10,
    reorderLevel: 2,
    lotPriceCents: 250,
    unitsPerLot: 1,
    feederModuleQuantity: 0,
    deviceModuleQuantity: 0,
    sortingModuleQuantity: 0,
    purchaseUrl: null,
    tags: [],
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderItemsPage(initialPath = "/app/items") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <TooltipProvider>
        <ItemsPage />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

describe("ItemsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    itemsState.items = [
      itemWith({ name: "Packing tape", location: "Shelf B2" }),
      itemWith({ name: "Box, medium", location: "Shelf B1", quantity: 2 }),
      itemWith({ name: "Label printer", quantity: 0 }),
    ];
  });

  it("lists items with their stock status as text", () => {
    renderItemsPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "Items" }),
    ).toBeInTheDocument();
    const lowStockRow = screen.getByRole("row", { name: /Box, medium/ });
    expect(within(lowStockRow).getByText("Low stock")).toBeInTheDocument();
    const outOfStockRow = screen.getByRole("row", { name: /Label printer/ });
    expect(within(outOfStockRow).getByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("filters the list as the search text changes", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.type(screen.getByRole("searchbox"), "shelf b2");
    expect(screen.getByRole("row", { name: /Packing tape/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Box, medium/ })).toBeNull();
    expect(screen.getByText("1 of 3 items")).toBeInTheDocument();
  });

  it("applies the stock status filter from the URL", () => {
    renderItemsPage("/app/items?status=needsRestock");
    expect(screen.queryByRole("row", { name: /Packing tape/ })).toBeNull();
    expect(screen.getByRole("row", { name: /Box, medium/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Label printer/ })).toBeInTheDocument();
  });

  it("shows the empty state when there are no items", () => {
    itemsState.items = [];
    renderItemsPage();
    expect(screen.getByText("No items yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("adds an item from the form and blocks a blank name", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.click(screen.getByRole("button", { name: /^Add item/ }));
    const dialog = await screen.findByRole("dialog");
    const submitButton = within(dialog).getByRole("button", {
      name: "Add item",
    });
    expect(submitButton).toBeDisabled();

    await user.type(within(dialog).getByLabelText("Name"), "Bubble wrap");
    await user.type(within(dialog).getByLabelText(/Lot price/), "35");
    const unitsPerLotInput = within(dialog).getByLabelText("Units per lot");
    await user.clear(unitsPerLotInput);
    await user.type(unitsPerLotInput, "10");
    expect(
      within(dialog).getByText(
        "Unit cost: $3.50 (lot price divided by units per lot).",
      ),
    ).toBeInTheDocument();
    const quantityInput = within(dialog).getByLabelText("Quantity in stock");
    await user.clear(quantityInput);
    await user.type(quantityInput, "12");
    await waitFor(() => expect(submitButton).toBeEnabled());
    await user.click(submitButton);

    await waitFor(() => expect(itemActions.addItem).toHaveBeenCalledTimes(1));
    expect(itemActions.addItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Bubble wrap",
        quantity: 12,
        lotPrice: "35",
        unitsPerLot: 10,
      }),
    );
  });

  it("prints a label with a QR code for every item shown", async () => {
    const user = userEvent.setup();
    const print = vi.fn();
    vi.stubGlobal("print", print);
    renderItemsPage("/app/items?q=shelf");
    await user.click(screen.getByRole("button", { name: /^Print labels/ }));
    const dialog = await screen.findByRole("dialog");
    const copiesInput = within(dialog).getByLabelText("Copies each");
    await user.clear(copiesInput);
    await user.type(copiesInput, "2");
    await user.click(
      within(dialog).getByRole("button", { name: "Print 4 labels on 1 sheet" }),
    );

    await waitFor(() => expect(print).toHaveBeenCalledTimes(1));
    const printSheet = document.querySelector(".label-print-sheet")!;
    expect(printSheet.querySelectorAll("svg")).toHaveLength(4);
    expect(within(printSheet as HTMLElement).getAllByText("Packing tape")).toHaveLength(2);
    expect(within(printSheet as HTMLElement).getAllByText("Box, medium")).toHaveLength(2);
    expect(within(printSheet as HTMLElement).queryByText("Label printer")).toBeNull();

    window.dispatchEvent(new Event("afterprint"));
    await waitFor(() =>
      expect(document.querySelector(".label-print-sheet")).toBeNull(),
    );
    vi.unstubAllGlobals();
  });

  it("adjusts stock from the keyboard alone", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("row", { name: /Box, medium/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await user.keyboard("{ArrowUp}a");
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Packing tape has 10 in stock."),
    ).toBeInTheDocument();

    await user.keyboard("-");
    expect(
      within(dialog).getByRole("button", { name: /^Remove stock/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("4{Enter}");
    await waitFor(() =>
      expect(itemActions.adjustStock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Packing tape" }),
        { quantityChange: -4, reason: "sold", note: "" },
      ),
    );
  });

  it("opens the stock dialog ready to remove with the minus key", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.keyboard("{ArrowDown}-");
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: /^Remove stock/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(dialog).getByText("Stock after this change: 9")).toBeInTheDocument();
  });

  it("has shortcuts for search, a new item and unpicking", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.getByRole("row", { name: /Packing tape/ })).not.toHaveAttribute(
      "aria-current",
    );
    await user.keyboard("a");
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.keyboard("n");
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("Name")).toBeInTheDocument();
  });

  it("does not fire shortcuts while typing in the search field", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.type(screen.getByRole("searchbox"), "na");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("searchbox")).toHaveValue("na");
  });

  it("opens the purchase link of the picked item and saves a new link", async () => {
    const user = userEvent.setup();
    const open = vi.fn();
    vi.stubGlobal("open", open);
    itemsState.items = [
      itemWith({
        name: "Packing tape",
        purchaseUrl: "https://shop.example.com/tape",
      }),
      itemWith({ name: "Box, medium" }),
    ];
    renderItemsPage();
    const buyLink = screen.getByRole("link", { name: "Buy more Packing tape" });
    expect(buyLink).toHaveAttribute("href", "https://shop.example.com/tape");
    expect(buyLink).toHaveAttribute("target", "_blank");
    expect(buyLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByRole("link", { name: "Buy more Box, medium" })).toBeNull();
    await user.keyboard("{ArrowDown}b");
    expect(open).toHaveBeenCalledWith(
      "https://shop.example.com/tape",
      "_blank",
      "noopener,noreferrer",
    );
    await user.keyboard("{ArrowDown}b");
    expect(open).toHaveBeenCalledTimes(1);

    await user.keyboard("e");
    const dialog = await screen.findByRole("dialog");
    const linkInput = within(dialog).getByLabelText(/Purchase link/);
    await user.type(linkInput, "shop.example.com/box");
    expect(
      await within(dialog).findByText(
        "Enter a full link starting with http:// or https://.",
      ),
    ).toBeInTheDocument();
    await user.clear(linkInput);
    await user.type(linkInput, "https://shop.example.com/box");
    const saveButton = within(dialog).getByRole("button", {
      name: "Save changes",
    });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);
    await waitFor(() =>
      expect(itemActions.saveItem).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Box, medium" }),
        expect.objectContaining({
          purchaseUrl: "https://shop.example.com/box",
        }),
      ),
    );
    vi.unstubAllGlobals();
  });

  it("tags an item from the form and filters the list by tag", async () => {
    const user = userEvent.setup();
    itemsState.items = [
      itemWith({ name: "Packing tape", tags: ["Amazon"] }),
      itemWith({ name: "Box, medium" }),
    ];
    renderItemsPage("/app/items?tag=amazon");
    expect(screen.getByRole("row", { name: /Packing tape/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Box, medium/ })).toBeNull();
    expect(
      within(screen.getByRole("list", { name: "Tags of Packing tape" })).getByText(
        "Amazon",
      ),
    ).toBeInTheDocument();

    await user.keyboard("{ArrowDown}e");
    const dialog = await screen.findByRole("dialog");
    const tagInput = within(dialog).getByLabelText(/^Tags/);
    await user.type(tagInput, "DigiKey{Enter}amazon,Local shop");
    await user.click(
      within(dialog).getByRole("button", { name: "Remove tag Amazon" }),
    );
    const saveButton = within(dialog).getByRole("button", {
      name: "Save changes",
    });
    await user.click(saveButton);
    await waitFor(() =>
      expect(itemActions.saveItem).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Packing tape" }),
        expect.objectContaining({ tags: ["DigiKey", "Local shop"] }),
      ),
    );
  });

  it("selects items and applies bulk actions to them", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.click(screen.getByRole("checkbox", { name: "Select Packing tape" }));
    await user.click(screen.getByRole("checkbox", { name: "Select Box, medium" }));
    const bar = screen.getByRole("region", { name: "Actions for selected items" });
    expect(within(bar).getByText("2 selected")).toBeInTheDocument();

    await user.click(within(bar).getByRole("button", { name: /^Adjust stock/ }));
    const adjustDialog = await screen.findByRole("dialog");
    expect(
      within(adjustDialog).getByText(/each of the 2 selected items.*lowest stock among them is 2/),
    ).toBeInTheDocument();
    await user.click(
      within(adjustDialog).getByRole("button", { name: /^Remove stock/ }),
    );
    const quantityInput = within(adjustDialog).getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "3");
    expect(
      await within(adjustDialog).findByText("Only 2 in stock."),
    ).toBeInTheDocument();
    await user.clear(quantityInput);
    await user.type(quantityInput, "2");
    const saveButton = within(adjustDialog).getByRole("button", {
      name: "Save adjustment",
    });
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);
    await waitFor(() =>
      expect(itemActions.adjustStockOfItems).toHaveBeenCalledWith(
        [
          expect.objectContaining({ name: "Packing tape" }),
          expect.objectContaining({ name: "Box, medium" }),
        ],
        { quantityChange: -2, reason: "sold", note: "" },
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Actions for selected items" }),
      ).toBeNull(),
    );
  });

  it("selects with the keyboard, tags in bulk and deletes in bulk", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.keyboard("{ArrowDown}x{ArrowDown}x");
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    await user.keyboard("t");
    const tagsDialog = await screen.findByRole("dialog");
    await user.type(within(tagsDialog).getByLabelText("Tags to add"), "Amazon{Enter}");
    const addButton = within(tagsDialog)
      .getAllByRole("button", { name: "Add tags" })
      .find((button) => button.getAttribute("type") === "submit")!;
    await waitFor(() => expect(addButton).toBeEnabled());
    await user.click(addButton);
    await waitFor(() =>
      expect(itemActions.editTagsOfItems).toHaveBeenCalledWith(
        [
          expect.objectContaining({ name: "Packing tape" }),
          expect.objectContaining({ name: "Box, medium" }),
        ],
        { mode: "add", tags: ["Amazon"] },
      ),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.keyboard("{Shift>}A{/Shift}");
    expect(screen.getByText("3 selected")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Select all items shown" }),
    ).toBeChecked();
    await user.keyboard("{Delete}");
    const deleteDialog = await screen.findByRole("dialog");
    await user.click(
      within(deleteDialog).getByRole("button", { name: "Delete 3 items" }),
    );
    await waitFor(() =>
      expect(itemActions.removeItems).toHaveBeenCalledWith([
        expect.objectContaining({ name: "Packing tape" }),
        expect.objectContaining({ name: "Box, medium" }),
        expect.objectContaining({ name: "Label printer" }),
      ]),
    );
  });

  it("only acts on selected items that are still shown", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.keyboard("{Shift>}A{/Shift}");
    expect(screen.getByText("3 selected")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "tape");
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");
    expect(screen.queryByText(/selected$/)).toBeNull();
  });

  it("refuses to remove more stock than the item has", async () => {
    const user = userEvent.setup();
    renderItemsPage();
    await user.click(
      screen.getByRole("button", { name: "Adjust stock for Box, medium" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /^Remove stock/ }),
    );
    const quantityInput = within(dialog).getByLabelText("Quantity");
    await user.clear(quantityInput);
    await user.type(quantityInput, "5");
    expect(
      await within(dialog).findByText("Only 2 in stock."),
    ).toBeInTheDocument();
    const saveButton = within(dialog).getByRole("button", {
      name: "Save adjustment",
    });
    expect(saveButton).toBeDisabled();

    await user.clear(quantityInput);
    await user.type(quantityInput, "2");
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);
    await waitFor(() =>
      expect(itemActions.adjustStock).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Box, medium" }),
        { quantityChange: -2, reason: "sold", note: "" },
      ),
    );
  });
});
