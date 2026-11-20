import { apiPost } from "@/lib/api/client";
import type {
  BuildUnitRemovalFormValues,
  PartNeed,
  Result,
} from "@inventory/shared";

export function removeBuildUnits(values: BuildUnitRemovalFormValues) {
  return apiPost<Result<PartNeed[]>>("/api/build-unit-removals", values);
}
