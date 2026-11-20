import { TagInput } from "@/components/tag-input";
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
import { EMPTY_BULK_TAGS_FORM } from "@/lib/constants/inventory";
import type { BulkTagsDialogProps } from "@/lib/interfaces/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BULK_TAG_MODES,
  bulkTagsFormSchema,
  tagsOfItems,
  type BulkTagsFormValues,
  type InventoryItem,
} from "@inventory/shared";
import { IconLoader2, IconMinus, IconPlus } from "@tabler/icons-react";
import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

function BulkTagsForm({
  items,
  tagSuggestions,
  onOpenChange,
  onSubmit,
}: BulkTagsDialogProps & { items: InventoryItem[] }) {
  const { t } = useTranslation("inventory");
  const { t: tCommon } = useTranslation("common");
  const form = useForm<BulkTagsFormValues>({
    resolver: zodResolver(bulkTagsFormSchema),
    defaultValues: EMPTY_BULK_TAGS_FORM,
    mode: "onChange",
  });
  const mode = useWatch({ control: form.control, name: "mode" });
  const tagsOnItems = useMemo(() => tagsOfItems(items), [items]);

  const handleSubmit = async (values: BulkTagsFormValues) => {
    if (await onSubmit(values)) onOpenChange(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("items.bulk.tags.title")}</DialogTitle>
        <DialogDescription>
          {items.length === 1
            ? t("items.bulk.tags.descriptionOne", { name: items[0].name })
            : t("items.bulk.tags.description", { count: items.length })}
        </DialogDescription>
      </DialogHeader>
      <form
        id="bulk-tags-form"
        className="flex flex-col gap-3 md:gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div
          role="group"
          aria-label={t("items.bulk.tags.mode")}
          className="grid grid-cols-2 gap-1.5"
        >
          {BULK_TAG_MODES.map((option) => (
            <Button
              key={option}
              type="button"
              variant={mode === option ? "outline-selected" : "outline"}
              aria-pressed={mode === option}
              onClick={() =>
                form.setValue("mode", option, { shouldValidate: true })
              }
            >
              {option === "add" ? <IconPlus /> : <IconMinus />}
              {t(`items.bulk.tags.modes.${option}`)}
            </Button>
          ))}
        </div>
        <Controller
          name="tags"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="bulk-tags">
                {t(`items.bulk.tags.tagsLabel.${mode}`)}
              </FieldLabel>
              <TagInput
                id="bulk-tags"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                suggestions={mode === "add" ? tagSuggestions : tagsOnItems}
                placeholder={t("items.form.tagsPlaceholder")}
                invalid={fieldState.invalid}
                autoFocus
              />
              {fieldState.invalid && fieldState.isTouched && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {tCommon("cancel")}
        </Button>
        <Button
          type="submit"
          form="bulk-tags-form"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <IconLoader2 className="animate-spin" />
          )}
          {t(`items.bulk.tags.submit.${mode}`)}
        </Button>
      </DialogFooter>
    </>
  );
}

export function BulkTagsDialog({
  items,
  tagSuggestions,
  onOpenChange,
  onSubmit,
}: BulkTagsDialogProps) {
  return (
    <Dialog open={!!items} onOpenChange={onOpenChange}>
      <DialogContent>
        {items && (
          <BulkTagsForm
            items={items}
            tagSuggestions={tagSuggestions}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
