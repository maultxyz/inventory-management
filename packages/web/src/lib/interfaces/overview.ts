import type { ReactNode } from "react";

export interface OverviewSectionProps {
  heading: string;
  description?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  isOnCanvas?: boolean;
  children: ReactNode;
}
