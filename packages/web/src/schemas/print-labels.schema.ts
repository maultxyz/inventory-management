import { LABEL_COPIES_MAX, LABELS_PER_SHEET } from "@/lib/constants/labels";
import { formValidationMessage } from "@inventory/shared";
import { z } from "zod";

const wholeNumberBetween = (min: number, max: number) =>
  z
    .number(formValidationMessage("wholeNumber"))
    .int(formValidationMessage("wholeNumber"))
    .min(min, formValidationMessage("atLeast", { min }))
    .max(max, formValidationMessage("atMost", { max }));

export const printLabelsFormSchema = z.object({
  copies: wholeNumberBetween(1, LABEL_COPIES_MAX),
  labelsAlreadyUsed: wholeNumberBetween(0, LABELS_PER_SHEET - 1),
});

export type PrintLabelsFormValues = z.infer<typeof printLabelsFormSchema>;
