import {
  ITEM_QUANTITY_MAX,
  STOCK_ADJUSTMENT_REASONS,
  STOCK_MOVEMENT_NOTE_MAX_LENGTH,
  formValidationMessage,
} from "@inventory/shared";
import { z } from "zod";

export function adjustStockDialogFormSchema(quantityInStock: number) {
  return z
    .object({
      direction: z.enum(["add", "remove"]),
      quantity: z
        .number(formValidationMessage("wholeNumber"))
        .int(formValidationMessage("wholeNumber"))
        .min(1, formValidationMessage("atLeast", { min: 1 }))
        .max(
          ITEM_QUANTITY_MAX,
          formValidationMessage("atMost", { max: ITEM_QUANTITY_MAX }),
        ),
      reason: z.enum(STOCK_ADJUSTMENT_REASONS),
      note: z
        .string()
        .trim()
        .max(
          STOCK_MOVEMENT_NOTE_MAX_LENGTH,
          formValidationMessage("textTooLong", {
            max: STOCK_MOVEMENT_NOTE_MAX_LENGTH,
          }),
        ),
    })
    .refine(
      (values) =>
        values.direction === "add" || values.quantity <= quantityInStock,
      {
        path: ["quantity"],
        message: formValidationMessage("notEnoughStock", {
          available: quantityInStock,
        }),
      },
    );
}

export type AdjustStockDialogFormValues = z.infer<
  ReturnType<typeof adjustStockDialogFormSchema>
>;
