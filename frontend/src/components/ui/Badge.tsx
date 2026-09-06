import { cn } from "@/utils/format";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "pending" | "reversed";
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        tone === "success" && "badge-success",
        tone === "warning" && "badge-warning",
        tone === "danger" && "badge-danger",
        tone === "pending" && "badge-pending",
        tone === "reversed" && "badge-reversed",
      )}
    >
      {children}
    </span>
  );
}
