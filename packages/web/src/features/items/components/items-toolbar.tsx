import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOTKEY_SEARCH_ATTRIBUTE } from "@/lib/constants/hotkeys";
import {
  FILTER_SELECT_TRIGGER_CLASS,
  STOCK_STATUS_FILTERS,
} from "@/lib/constants/inventory";
import { ALL_TAGS_FILTER } from "@/lib/constants/tags";
import type {
  ItemsToolbarProps,
  StockStatusFilter,
} from "@/lib/interfaces/inventory";
import { IconSearch } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function ItemsToolbar({
  filters,
  tags,
  onFiltersChange,
}: ItemsToolbarProps) {
  const { t } = useTranslation("inventory");
  const tagOptions = [
    { value: ALL_TAGS_FILTER, label: t("items.toolbar.allTags") },
    ...tags.map((tag) => ({ value: tag, label: tag })),
  ];
  const statusOptions = STOCK_STATUS_FILTERS.map((status) => ({
    value: status,
    label: t(`items.toolbar.statusFilters.${status}`),
  }));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:gap-1.5">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <IconSearch
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground touch:left-3 touch:size-4"
        />
        <Input
          type="search"
          aria-label={t("items.toolbar.searchLabel")}
          placeholder={t("items.toolbar.searchPlaceholder")}
          value={filters.searchText}
          onChange={(event) =>
            onFiltersChange({ searchText: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") event.currentTarget.blur();
          }}
          className="pl-8 touch:pl-10"
          {...{ [HOTKEY_SEARCH_ATTRIBUTE]: "" }}
        />
      </div>
      <div className="flex gap-2 sm:contents">
        {tags.length > 0 && (
          <Select
            items={tagOptions}
            value={filters.tag}
            onValueChange={(tag) =>
              onFiltersChange({ tag: tag ?? ALL_TAGS_FILTER })
            }
          >
            <SelectTrigger
              aria-label={t("items.toolbar.tagLabel")}
              className={FILTER_SELECT_TRIGGER_CLASS}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tagOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select
          items={statusOptions}
          value={filters.status}
          onValueChange={(status) =>
            onFiltersChange({
              status: (status as StockStatusFilter | null) ?? "all",
            })
          }
        >
          <SelectTrigger
            aria-label={t("items.toolbar.statusLabel")}
            className={FILTER_SELECT_TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
