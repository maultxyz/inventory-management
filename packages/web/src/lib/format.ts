import {
  INVENTORY_CURRENCY,
  UNIT_COST_MAX_FRACTION_DIGITS,
} from "@/lib/constants/inventory";

const currencyFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: INVENTORY_CURRENCY,
});
const unitCostFormat = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: INVENTORY_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: UNIT_COST_MAX_FRACTION_DIGITS,
});
const quantityFormat = new Intl.NumberFormat();
const signedQuantityFormat = new Intl.NumberFormat(undefined, {
  signDisplay: "exceptZero",
});
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCurrencyFromCents(cents: number): string {
  return currencyFormat.format(cents / 100);
}

export function formatUnitCostFromCents(unitCostCents: number): string {
  return unitCostFormat.format(unitCostCents / 100);
}

export function formatQuantity(quantity: number): string {
  return quantityFormat.format(quantity);
}

export function formatSignedQuantity(quantityChange: number): string {
  return signedQuantityFormat.format(quantityChange);
}

export function formatDateTime(isoDateTime: string): string {
  return dateTimeFormat.format(new Date(isoDateTime));
}
