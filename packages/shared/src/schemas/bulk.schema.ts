import { z } from "zod";
import {
  BULK_ITEMS_MAX,
  BULK_TAG_MODES,
  ITEM_TAG_MAX_LENGTH,
  ITEM_TAGS_MAX,
} from "../constants/inventory.constant";
import { formValidationMessage } from "../form-validation";
import { normalizeTags } from "../tags";
import { adjustStockFormSchema } from "./inventory.schema";

const itemGuidsSchema = z.array(z.uuid()).min(1).max(BULK_ITEMS_MAX);

export const bulkTagsFormSchema = z.object({
  mode: z.enum(BULK_TAG_MODES),
  tags: z
    .array(
      z
        .string()
        .max(
          ITEM_TAG_MAX_LENGTH,
          formValidationMessage("textTooLong", { max: ITEM_TAG_MAX_LENGTH }),
        ),
    )
    .max(
      ITEM_TAGS_MAX,
      formValidationMessage("tooManyTags", { max: ITEM_TAGS_MAX }),
    )
    .transform(normalizeTags)
    .refine((tags) => tags.length > 0, {
      message: formValidationMessage("tagRequired"),
    }),
});

export const bulkDeleteItemsSchema = z.object({ itemGuids: itemGuidsSchema });

export const bulkTagItemsSchema = bulkTagsFormSchema.extend({
  itemGuids: itemGuidsSchema,
});

export const bulkAdjustStockSchema = adjustStockFormSchema.extend({
  itemGuids: itemGuidsSchema,
});

export type BulkTagsFormValues = z.infer<typeof bulkTagsFormSchema>;
export type BulkDeleteItemsInput = z.infer<typeof bulkDeleteItemsSchema>;
export type BulkTagItemsInput = z.infer<typeof bulkTagItemsSchema>;
export type BulkAdjustStockInput = z.infer<typeof bulkAdjustStockSchema>;
