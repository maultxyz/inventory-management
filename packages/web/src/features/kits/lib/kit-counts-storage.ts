import {
  EMPTY_KIT_COUNTS,
  KIT_COUNTS_STORAGE_KEY,
} from "@/lib/constants/inventory";
import { kitPlanFormSchema } from "@/schemas/kit-plan.schema";
import type { KitCounts } from "@inventory/shared";

export function readStoredKitCounts(): KitCounts {
  try {
    const stored = localStorage.getItem(KIT_COUNTS_STORAGE_KEY);
    if (!stored) return EMPTY_KIT_COUNTS;
    const parsed = kitPlanFormSchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : EMPTY_KIT_COUNTS;
  } catch {
    return EMPTY_KIT_COUNTS;
  }
}

export function storeKitCounts(kitCounts: KitCounts): void {
  try {
    localStorage.setItem(KIT_COUNTS_STORAGE_KEY, JSON.stringify(kitCounts));
  } catch (error) {
    console.warn("Saving the planned kit counts failed", error);
  }
}
