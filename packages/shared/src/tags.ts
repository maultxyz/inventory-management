import type {
  BulkTagMode,
  InventoryItem,
} from "./interfaces/inventory.interface";

export function normalizeTags(tags: string[]): string[] {
  const seenTags = new Set<string>();
  const normalizedTags: string[] = [];
  for (const tag of tags) {
    const trimmedTag = tag.trim().replace(/\s+/g, " ");
    const tagKey = trimmedTag.toLowerCase();
    if (!trimmedTag || seenTags.has(tagKey)) continue;
    seenTags.add(tagKey);
    normalizedTags.push(trimmedTag);
  }
  return normalizedTags;
}

export function tagsOfItems(items: Pick<InventoryItem, "tags">[]): string[] {
  return normalizeTags(items.flatMap((item) => item.tags)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function hasTag(item: Pick<InventoryItem, "tags">, tag: string): boolean {
  const tagKey = tag.trim().toLowerCase();
  return item.tags.some((itemTag) => itemTag.toLowerCase() === tagKey);
}

export function tagsAfterBulkEdit(
  currentTags: string[],
  mode: BulkTagMode,
  tags: string[],
): string[] {
  if (mode === "add") return normalizeTags([...currentTags, ...tags]);
  return currentTags.filter((currentTag) => !hasTag({ tags }, currentTag));
}
