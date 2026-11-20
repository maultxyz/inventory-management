import { KIT_PLAN_COUNT_MAX, formValidationMessage } from "@inventory/shared";
import { z } from "zod";

const kitCountSchema = z
  .number(formValidationMessage("wholeNumber"))
  .int(formValidationMessage("wholeNumber"))
  .min(0, formValidationMessage("atLeast", { min: 0 }))
  .max(
    KIT_PLAN_COUNT_MAX,
    formValidationMessage("atMost", { max: KIT_PLAN_COUNT_MAX }),
  );

export const kitPlanFormSchema = z.object({
  threeModuleKits: kitCountSchema,
  fiveModuleKits: kitCountSchema,
});
