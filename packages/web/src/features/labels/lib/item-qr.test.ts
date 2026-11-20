import {
  itemGuidFromScannedText,
  itemScanUrl,
  labelSheetsOfPrintJob,
} from "@/features/labels/lib/item-qr";
import type { InventoryItem } from "@inventory/shared";
import { describe, expect, it } from "vitest";

const itemGuid = "57c29217-5e41-4065-8c36-67524fb8bcba";

describe("item QR codes", () => {
  it("builds a scan link that opens the app on the scan page", () => {
    expect(itemScanUrl("https://stock.example.com", itemGuid)).toBe(
      `https://stock.example.com/app/scan?item=${itemGuid}`,
    );
  });

  it("reads the item from a scan link on any host", () => {
    expect(
      itemGuidFromScannedText(itemScanUrl("https://stock.example.com", itemGuid)),
    ).toBe(itemGuid);
    expect(
      itemGuidFromScannedText(
        `http://localhost:5173/app/scan?item=${itemGuid.toUpperCase()}  `,
      ),
    ).toBe(itemGuid);
  });

  it("accepts a bare item id", () => {
    expect(itemGuidFromScannedText(itemGuid)).toBe(itemGuid);
  });

  it("rejects codes that are not item labels", () => {
    expect(itemGuidFromScannedText("https://example.com/")).toBeNull();
    expect(
      itemGuidFromScannedText("https://example.com/app/scan?item=12345"),
    ).toBeNull();
    expect(itemGuidFromScannedText("WIFI:S:Shop;T:WPA;P:secret;;")).toBeNull();
    expect(itemGuidFromScannedText("")).toBeNull();
  });

  it("repeats each item once per copy, keeping items together", () => {
    const items = [{ guid: "a" }, { guid: "b" }] as InventoryItem[];
    const sheets = labelSheetsOfPrintJob({
      items,
      copies: 2,
      labelsAlreadyUsed: 0,
    });
    expect(sheets).toHaveLength(1);
    expect(sheets[0].map((item) => item?.guid)).toEqual(["a", "a", "b", "b"]);
  });

  it("leaves used positions blank and continues onto further sheets", () => {
    const items = [{ guid: "a" }] as InventoryItem[];
    const sheets = labelSheetsOfPrintJob({
      items,
      copies: 4,
      labelsAlreadyUsed: 28,
    });
    expect(sheets.map((sheet) => sheet.length)).toEqual([30, 2]);
    expect(sheets[0].slice(0, 28).every((item) => item === null)).toBe(true);
    expect(sheets[0].slice(28).map((item) => item?.guid)).toEqual(["a", "a"]);
    expect(sheets[1].map((item) => item?.guid)).toEqual(["a", "a"]);
  });
});
