import type { CalloutVariant } from "@/lib/interfaces/callout";

export const CALLOUT_VARIANT_CLASS: Record<CalloutVariant, string> = {
  neutral: "border-border bg-foreground/4 text-foreground/70",
  info: "border-border bg-foreground/4 text-foreground",
  success: "border-border bg-foreground/4 text-foreground",
  warning: "border-border bg-foreground/4 text-foreground",
  error: "border-destructive-border bg-foreground/4 text-foreground",
};

export const CALLOUT_ICON_CLASS: Record<CalloutVariant, string> = {
  neutral: "text-foreground/70",
  info: "text-info-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  error: "text-destructive",
};
