import { z } from "zod";
import {
  BUILD_UNITS,
  BUILD_UNIT_REMOVAL_COUNT_MAX,
  ITEM_LOCATION_MAX_LENGTH,
  ITEM_MODULE_QUANTITY_MAX,
  ITEM_NAME_MAX_LENGTH,
  ITEM_NOTES_MAX_LENGTH,
  ITEM_PURCHASE_URL_MAX_LENGTH,
  ITEM_TAG_MAX_LENGTH,
  ITEM_TAGS_MAX,
  ITEM_QUANTITY_MAX,
  ITEM_LOT_PRICE_MAX,
  ITEM_UNITS_PER_LOT_MAX,
  STOCK_ADJUSTMENT_REASONS,
  STOCK_MOVEMENT_NOTE_MAX_LENGTH,
  PRICE_PATTERN,
} from "../constants/inventory.constant";
import { formValidationMessage } from "../form-validation";
import { isHttpUrl } from "../inventory";
import { normalizeTags } from "../tags";

const optionalTextSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, formValidationMessage("textTooLong", { max: maxLength }));

const wholeNumberSchema = (min: number, max: number) =>
  z
    .number(formValidationMessage("wholeNumber"))
    .int(formValidationMessage("wholeNumber"))
    .min(min, formValidationMessage("atLeast", { min }))
    .max(max, formValidationMessage("atMost", { max }));

const lotPriceSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || PRICE_PATTERN.test(value), {
    message: formValidationMessage("amountInvalid"),
  })
  .refine((value) => value === "" || Number(value) <= ITEM_LOT_PRICE_MAX, {
    message: formValidationMessage("atMost", { max: ITEM_LOT_PRICE_MAX }),
  });

const itemDetailsShape = {
  name: z
    .string()
    .trim()
    .min(1, formValidationMessage("nameRequired"))
    .max(
      ITEM_NAME_MAX_LENGTH,
      formValidationMessage("textTooLong", { max: ITEM_NAME_MAX_LENGTH }),
    ),
  location: optionalTextSchema(ITEM_LOCATION_MAX_LENGTH),
  reorderLevel: wholeNumberSchema(0, ITEM_QUANTITY_MAX),
  lotPrice: lotPriceSchema,
  unitsPerLot: wholeNumberSchema(1, ITEM_UNITS_PER_LOT_MAX),
  feederModuleQuantity: wholeNumberSchema(0, ITEM_MODULE_QUANTITY_MAX),
  deviceModuleQuantity: wholeNumberSchema(0, ITEM_MODULE_QUANTITY_MAX),
  sortingModuleQuantity: wholeNumberSchema(0, ITEM_MODULE_QUANTITY_MAX),
  purchaseUrl: optionalTextSchema(ITEM_PURCHASE_URL_MAX_LENGTH).refine(
    (value) => value === "" || isHttpUrl(value),
    { message: formValidationMessage("linkInvalid") },
  ),
  tags: z
    .array(
      z
        .string()
        .max(
          ITEM_TAG_MAX_LENGTH,
          formValidationMessage("textTooLong", { max: ITEM_TAG_MAX_LENGTH }),
        ),
    )
    .max(ITEM_TAGS_MAX, formValidationMessage("tooManyTags", { max: ITEM_TAGS_MAX }))
    .transform(normalizeTags),
  notes: optionalTextSchema(ITEM_NOTES_MAX_LENGTH),
};

export const createItemFormSchema = z.object({
  ...itemDetailsShape,
  quantity: wholeNumberSchema(0, ITEM_QUANTITY_MAX),
});

export const updateItemFormSchema = z.object(itemDetailsShape);

export const adjustStockFormSchema = z.object({
  quantityChange: wholeNumberSchema(
    -ITEM_QUANTITY_MAX,
    ITEM_QUANTITY_MAX,
  ).refine((value) => value !== 0, {
    message: formValidationMessage("quantityChangeRequired"),
  }),
  reason: z.enum(STOCK_ADJUSTMENT_REASONS),
  note: optionalTextSchema(STOCK_MOVEMENT_NOTE_MAX_LENGTH),
});

export const buildUnitRemovalFormSchema = z.object({
  buildUnit: z.enum(BUILD_UNITS),
  count: wholeNumberSchema(1, BUILD_UNIT_REMOVAL_COUNT_MAX),
});

export type BuildUnitRemovalFormValues = z.infer<
  typeof buildUnitRemovalFormSchema
>;
export type CreateItemFormValues = z.infer<typeof createItemFormSchema>;
export type UpdateItemFormValues = z.infer<typeof updateItemFormSchema>;
export type AdjustStockFormValues = z.infer<typeof adjustStockFormSchema>;
