import type { ComponentType, ReactNode } from "react";

export interface NavItemDef {
  to: string;
  icon: ComponentType<{ className?: string }>;
  labelKey:
    | "nav.overview"
    | "nav.scan"
    | "nav.items"
    | "nav.checklists"
    | "nav.activity";
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  children?: ReactNode;
  spansFullWidth?: boolean;
}
