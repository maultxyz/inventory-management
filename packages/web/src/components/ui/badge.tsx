import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-1.5 py-0.5 text-2xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "border-border bg-foreground/10 text-foreground",
        secondary: "bg-foreground/6 text-foreground",
        destructive: "gap-1.5 border-transparent px-0 font-normal text-foreground before:size-1.5 before:shrink-0 before:rounded-full before:bg-destructive",
        outline:
          "border-border bg-card text-foreground dark:bg-border/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: "gap-1.5 border-transparent px-0 font-normal text-foreground before:size-1.5 before:shrink-0 before:rounded-full before:bg-success",
        warning: "gap-1.5 border-transparent px-0 font-normal text-foreground before:size-1.5 before:shrink-0 before:rounded-full before:bg-warning",
        info: "gap-1.5 border-transparent px-0 font-normal text-foreground before:size-1.5 before:shrink-0 before:rounded-full before:bg-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
