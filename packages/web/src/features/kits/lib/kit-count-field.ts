import type { KIT_COUNT_FIELDS } from "@/lib/constants/kits";

type KitCountField = (typeof KIT_COUNT_FIELDS)[number];

export function kitCountFieldId(kitCountField: KitCountField): string {
  return `kit-plan-${kitCountField}`;
}

export function focusKitCountField(kitCountField: KitCountField): void {
  const input = document.getElementById(kitCountFieldId(kitCountField));
  if (!(input instanceof HTMLInputElement)) return;
  input.focus();
  input.select();
}
