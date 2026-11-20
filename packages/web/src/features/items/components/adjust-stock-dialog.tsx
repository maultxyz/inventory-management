import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WholeNumberInput } from "@/components/whole-number-input";
import { STOCK_DIALOG_DIRECTION_KEYS } from "@/lib/constants/hotkeys";
import {
  ADJUSTMENT_REASONS_BY_DIRECTION,
  EMPTY_ADJUST_STOCK_FORM,
  STOCK_ADJUSTMENT_DIRECTIONS,
} from "@/lib/constants/inventory";
import { formatQuantity } from "@/lib/format";
import type {
  AdjustStockDialogProps,
  AdjustStockFormProps,
  BulkAdjustStockDialogProps,
  StockAdjustmentDirection,
} from "@/lib/interfaces/inventory";
import {
  adjustStockDialogFormSchema,
  type AdjustStockDialogFormValues,
} from "@/schemas/adjust-stock.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StockAdjustmentReason } from "@inventory/shared";
import { IconLoader2, IconMinus, IconPlus } from "@tabler/icons-react";
import { useMemo, type KeyboardEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

function AdjustStockForm({
  description,
  quantityInStock,
  showsQuantityAfter,
  initialDirection = "add",
  onOpenChange,
  onSubmit,
}: AdjustStockFormProps) {
  const { t } = useTranslation("inventory");
  const { t: tCommon } = useTranslation("common");
  const resolver = useMemo(
    () => zodResolver(adjustStockDialogFormSchema(quantityInStock)),
    [quantityInStock],
  );
  const form = useForm<AdjustStockDialogFormValues>({
    resolver,
    defaultValues: {
      ...EMPTY_ADJUST_STOCK_FORM,
      direction: initialDirection,
      reason: ADJUSTMENT_REASONS_BY_DIRECTION[initialDirection][0],
    },
    mode: "onChange",
  });
  const direction = form.watch("direction");
  const quantity = form.watch("quantity");
  const signedQuantityChange = direction === "add" ? quantity : -quantity;
  const quantityAfter = quantityInStock + signedQuantityChange;
  const reasonOptions = ADJUSTMENT_REASONS_BY_DIRECTION[direction].map(
    (reason) => ({ value: reason, label: t(`reasons.${reason}`) }),
  );

  const changeDirection = (nextDirection: StockAdjustmentDirection) => {
    form.setValue("direction", nextDirection, { shouldValidate: true });
    form.setValue("reason", ADJUSTMENT_REASONS_BY_DIRECTION[nextDirection][0]);
    void form.trigger("quantity");
  };

  const handleSubmit = async (values: AdjustStockDialogFormValues) => {
    const isSaved = await onSubmit({
      quantityChange:
        values.direction === "add" ? values.quantity : -values.quantity,
      reason: values.reason,
      note: values.note,
    });
    if (isSaved) onOpenChange(false);
  };

  const saveOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void form.handleSubmit(handleSubmit)();
  };

  const handleQuantityKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keyDirection = STOCK_DIALOG_DIRECTION_KEYS[event.key];
    if (!keyDirection) {
      saveOnEnter(event);
      return;
    }
    event.preventDefault();
    changeDirection(keyDirection);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("items.adjust.title")}</DialogTitle>
        <DialogDescription>{description}        </DialogDescription>
      </DialogHeader>
      <form
        id="adjust-stock-form"
        className="flex flex-col gap-3 md:gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div
          role="group"
          aria-label={t("items.adjust.direction")}
          className="grid grid-cols-2 gap-1.5"
        >
          {STOCK_ADJUSTMENT_DIRECTIONS.map((option) => (
            <Button
              key={option}
              type="button"
              variant={direction === option ? "outline-selected" : "outline"}
              aria-pressed={direction === option}
              onClick={() => changeDirection(option)}
            >
              {option === "add" ? <IconPlus /> : <IconMinus />}
              {t(`items.adjust.directions.${option}`)}
              <Kbd className="touch:hidden">
                {option === "add" ? "+" : tCommon("hotkeys.keys.minus")}
              </Kbd>
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-2">
          <Controller
            name="quantity"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="adjust-stock-quantity">
                  {t("items.adjust.quantity")}
                </FieldLabel>
                <WholeNumberInput
                  id="adjust-stock-quantity"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  min={1}
                  invalid={fieldState.invalid}
                  autoFocus
                  onKeyDown={handleQuantityKeyDown}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="reason"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="adjust-stock-reason">
                  {t("items.adjust.reason")}
                </FieldLabel>
                <Select
                  items={reasonOptions}
                  value={field.value}
                  onValueChange={(reason) =>
                    field.onChange(reason as StockAdjustmentReason)
                  }
                >
                  <SelectTrigger id="adjust-stock-reason" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
        <Controller
          name="note"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="adjust-stock-note">
                {t("items.adjust.note")}{" "}
                <span className="font-normal text-foreground/70">
                  ({t("items.form.optional")})
                </span>
              </FieldLabel>
              <Input
                {...field}
                id="adjust-stock-note"
                placeholder={t("items.adjust.notePlaceholder")}
                onKeyDown={saveOnEnter}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <p
          role="status"
          className="rounded-lg bg-foreground/6 px-3 py-2 text-xs text-foreground empty:hidden"
        >
          {showsQuantityAfter &&
          Number.isInteger(quantityAfter) &&
          quantityAfter >= 0
            ? t("items.adjust.resulting", {
                quantity: formatQuantity(quantityAfter),
              })
            : null}
        </p>
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          form="adjust-stock-form"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <IconLoader2 className="animate-spin" />
          )}
          {t("items.adjust.submit")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AdjustStockDialog({
  item,
  initialDirection,
  onOpenChange,
  onSubmit,
}: AdjustStockDialogProps) {
  const { t } = useTranslation("inventory");
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent>
        {item && (
          <AdjustStockForm
            key={item.guid}
            description={t("items.adjust.description", {
              name: item.name,
              quantity: formatQuantity(item.quantity),
            })}
            quantityInStock={item.quantity}
            showsQuantityAfter
            initialDirection={initialDirection}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function BulkAdjustStockDialog({
  items,
  initialDirection,
  onOpenChange,
  onSubmit,
}: BulkAdjustStockDialogProps) {
  const { t } = useTranslation("inventory");
  const lowestQuantity = Math.min(
    ...(items ?? []).map((item) => item.quantity),
  );
  return (
    <Dialog open={!!items} onOpenChange={onOpenChange}>
      <DialogContent>
        {items && (
          <AdjustStockForm
            description={t("items.bulk.adjustDescription", {
              count: items.length,
              lowest: formatQuantity(lowestQuantity),
            })}
            quantityInStock={lowestQuantity}
            showsQuantityAfter={false}
            initialDirection={initialDirection}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
