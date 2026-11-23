import ScanPage from "@/app/routes/app/scan";
import { TooltipProvider } from "@/components/ui/tooltip";
import { itemScanUrl } from "@/features/labels/lib/item-qr";
import "@/lib/i18n";
import type { UseQrScannerOptions } from "@/lib/interfaces/labels";
import type { InventoryItem } from "@inventory/shared";
import { act, render, screen, waitFor, within } from "@testing-library/react";
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
const scanner = vi.hoisted(() => ({
  options: null as UseQrScannerOptions | null,
}));

const tapeGuid = "57c29217-5e41-4065-8c36-67524fb8bcba";
const deletedItemGuid = "864dc48f-abb4-4529-a0db-f0e89e93009f";

const items: InventoryItem[] = [
  {
    guid: tapeGuid,
    name: "Packing tape",
    location: null,
    quantity: 6,
    reorderLevel: 2,
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
  },
];

vi.mock("@/features/items/api/use-items", () => ({
  useItems: () => ({ items, isPending: false, isError: false, refetch: vi.fn() }),
  useItemActions: () => itemActions,
}));
vi.mock("@/features/scanner/api/use-qr-scanner", () => ({
  useQrScanner: (options: UseQrScannerOptions) => {
    scanner.options = options;
    return { videoRef: { current: null }, status: "scanning" };
  },
}));

function renderScanPage(initialPath = "/app/scan") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <TooltipProvider>
        <ScanPage />
      </TooltipProvider>
    </MemoryRouter>,
  );
}

function scan(scannedText: string) {
  act(() => scanner.options!.onScan(scannedText));
}

describe("ScanPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scanner.options = null;
  });

  it("opens the stock dialog for a scanned label and saves the change", async () => {
    const user = userEvent.setup();
    renderScanPage();
    scan(itemScanUrl("https://stock.example.com", tapeGuid));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Packing tape has 6 in stock."),
    ).toBeInTheDocument();
    expect(scanner.options!.isPaused).toBe(true);

    await user.click(
      within(dialog).getByRole("button", { name: "Save adjustment" }),
    );
    await waitFor(() =>
      expect(itemActions.adjustStock).toHaveBeenCalledWith(
        expect.objectContaining({ guid: tapeGuid }),
        { quantityChange: 1, reason: "received", note: "" },
      ),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(scanner.options!.isPaused).toBe(false);
  });

  it("does not reopen the dialog while the same label stays in view", async () => {
    const user = userEvent.setup();
    renderScanPage();
    const scanLink = itemScanUrl("https://stock.example.com", tapeGuid);
    scan(scanLink);
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    scan(scanLink);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByText("Last scanned")).toBeInTheDocument();
    expect(screen.getByText("Packing tape")).toBeInTheDocument();
  });

  it("explains codes that are not labels or belong to a removed item", () => {
    renderScanPage();
    scan("https://example.com/menu");
    expect(
      screen.getByText("That code is not one of your item labels."),
    ).toBeInTheDocument();

    scan(deletedItemGuid);
    expect(
      screen.getByText(
        "That label belongs to an item that is no longer in your inventory.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the item when arriving from a label scanned outside the app", async () => {
    renderScanPage(`/app/scan?item=${tapeGuid}`);
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Packing tape has 6 in stock."),
    ).toBeInTheDocument();
  });
});
