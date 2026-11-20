import { TAG_CHIP_CLASS } from "@/lib/constants/tags";
import type { TagListProps } from "@/lib/interfaces/tags";
import { cn } from "@/lib/utils";

export function TagList({ tags, label, className }: TagListProps) {
  if (tags.length === 0) return null;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <li key={tag} className={TAG_CHIP_CLASS}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
