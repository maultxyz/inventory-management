import { Input } from "@/components/ui/input";
import { TAG_CHIP_CLASS, TAG_SEPARATOR_KEYS } from "@/lib/constants/tags";
import type { TagInputProps } from "@/lib/interfaces/tags";
import { cn } from "@/lib/utils";
import {
  ITEM_TAG_MAX_LENGTH,
  ITEM_TAGS_MAX,
  hasTag,
  normalizeTags,
} from "@inventory/shared";
import { IconX } from "@tabler/icons-react";
import { useId, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

export function TagInput({
  id,
  value,
  onChange,
  onBlur,
  suggestions,
  placeholder,
  invalid,
  autoFocus,
}: TagInputProps) {
  const { t } = useTranslation("common");
  const [draftTag, setDraftTag] = useState("");
  const suggestionListId = useId();
  const unusedSuggestions = suggestions.filter(
    (suggestion) => !hasTag({ tags: value }, suggestion),
  );
  const isFull = value.length >= ITEM_TAGS_MAX;

  const addDraftTag = () => {
    if (!draftTag.trim()) return;
    onChange(normalizeTags([...value, draftTag]).slice(0, ITEM_TAGS_MAX));
    setDraftTag("");
  };

  const removeTag = (tagToRemove: string) =>
    onChange(value.filter((tag) => tag !== tagToRemove));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (TAG_SEPARATOR_KEYS.includes(event.key) && draftTag.trim()) {
      event.preventDefault();
      addDraftTag();
      return;
    }
    if (event.key === "Backspace" && draftTag === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <li key={tag} className={cn(TAG_CHIP_CLASS, "gap-0.5 pr-0.5")}>
              {tag}
              <button
                type="button"
                aria-label={t("tags.remove", { tag })}
                onClick={() => removeTag(tag)}
                className="flex size-4 items-center justify-center rounded-sm text-foreground/70 outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring max-md:size-6"
              >
                <IconX aria-hidden className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={draftTag}
        list={suggestionListId}
        maxLength={ITEM_TAG_MAX_LENGTH}
        placeholder={placeholder}
        disabled={isFull}
        autoCapitalize="words"
        aria-invalid={invalid}
        autoFocus={autoFocus}
        onChange={(event) => setDraftTag(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          addDraftTag();
          onBlur();
        }}
      />
      <datalist id={suggestionListId}>
        {unusedSuggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
}
