import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state card">
      <h2 style={{ margin: "0 0 8px" }}>{title}</h2>
      <p className="muted" style={{ margin: "0 auto 16px", maxWidth: "42ch" }}>
        {description}
      </p>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state card" role="alert">
      <h2 style={{ margin: "0 0 8px" }}>{title}</h2>
      <p className="muted" style={{ margin: "0 auto 16px", maxWidth: "46ch" }}>
        {description}
      </p>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
